'use strict';

const BPromise = require('bluebird');
const mongoose = require('mongoose');

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const Ontime = require('./helpers/Ontime');

const User = require('../models/user');
const Organization = require('../models/organization');
const SettingModel = require('../models/setting');
const ProjectModel = require('../models/project');
const DocumentModel = require('../models/document');
const VersionModel = require('../models/version');
const EntryModel = require('../models/entry');
const mapping = require('../models/helpers/mapping');

const EmptyOrganizationError = require('../errors/EmptyOrganizationError');
const UndefinedItemError = require('../errors/UndefinedItemError');
const UndefinedOrganizationIdItemError = require('../errors/UndefinedOrganizationIdItemError');
const NotFoundOrganizationIdItemError = require('../errors/NotFoundOrganizationIdItemError');
const UndefinedParentIdOrTypeItemError = require('../errors/UndefinedParentIdOrTypeItemError');
const NotFoundItemError = require('../errors/NotFoundItemError');
const InvalidTypeItemError = require('../errors/InvalidTypeItemError');
const UndefinedOnTimeIdVersionError = require('../errors/UndefinedOnTimeIdVersionError');
const OnTimeError = require('../errors/OnTimeError');

/**
 * Item Controller
 * - indexAction
 * - createAction
 */
class ItemController extends AbstractController {
  /**
   * Generic save method
   * - update organization
   * - "lazy" for delete entries
   * @param request
   * @param response
   * @param data
   * @param organization
   * @param modelItem
   * @param returnCode
   * @returns {*}
   * @private
   */
  static _save(request, response, data, organization, modelItem, returnCode) {
    return Organization.update({_id: organization._id}, organization, {}).lean().execAsync()
      .then(() => {
        /*jshint eqeqeq: false */
        if (data.lazy == 1) {
          /*jshint eqeqeq: true */
          Organization.walkRecursively(organization, element => {
            if (element.entries !== undefined) {
              delete element.entries;
              if (element.entries !== undefined) {
                element.entries = null;
              }
            }
          });
          delete modelItem.entries;
          if (modelItem.entries !== undefined) {
            modelItem.entries = null;
          }
        }
        Http.sendResponse(
          // FIXME: do something for ugly type stuff
          request, response, 200, {organization: organization, item: modelItem, type: data.type + 's'}, returnCode
        );
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: create item -> save organization', err);
      })
      ;
  }

  /**
   * Get ONE item from Organization (potential parents: organization, project, document, version, entry)
   * - "lazy": delete useless stuff (like entries)
   * - "modePreview": for PDF render (send differents objects)
   * @param   request
   * @param   response
   * @method  GET
   */
  static indexAction(request, response) {
    const data = request.query;

    Organization.findById(data.organizationId).lean().execAsync()
      .then(organization => {
        if (!organization) {
          throw new EmptyOrganizationError();
        }
        /*jshint eqeqeq: false */
        if (data.lazy == 1) {
          /*jshint eqeqeq: true */
          Organization.walkRecursively(organization, element => {
            if (element.entries !== undefined) {
              delete element.entries;
            }
          });
        }

        // FIXME: implement native promises on 'Organization.findDeepAttributeById'
        return BPromise.promisify(Organization.findDeepAttributeById(organization, data.itemId));
      })
      .then((element, parentElement) => {
        const result = {};

        if (element === undefined) {
          throw new UndefinedItemError();
        }
        /*jshint eqeqeq: false */
        if (data.modePreview == 1) {
          /*jshint eqeqeq: true */
          result.item = element;
          result.documentName = parentElement.name;
          result.organizationName = organization.name;
        } else {
          result.item = element;
          /*jshint eqeqeq: false */
          if (data.lazy == 1) {
            /*jshint eqeqeq: true */
            delete result.item.entries;
          }
          result.organization = organization;
        }
        Http.sendResponse(request, response, 200, result);
      })
      .catch(UndefinedItemError, () => {
        Http.sendResponse(
          request, response, 404, {}, '-6', 'Error: item with id (' + data.itemId + ') for "get request" not found.'
        );
      })
      .catch(EmptyOrganizationError, () => {
        Http.sendResponse(
          request, response, 404, {}, '-5', 'Error: organization with id (' + data.organizationId + ') not found.'
        );
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: get organization', err);
      })
    ;
  }

  /**
   *
   * @param items
   * @returns {Array}
   * @private
   */
  static _createEntries(items) {
    let entries = [];

    items.forEach(function (item) {
      /* jshint camelcase: false */
      var indexOfParentProject = entries.pluck('ontimeId').indexOf(item.parent_project.id);
      if (indexOfParentProject === -1) {
        entries.push(new EntryModel({
          name: item.parent_project.name,
          ontimeId: item.parent_project.id,
          path: item.parent_project.path ? item.parent_project.path.split('\\') : [],
          children: [],
        }));
        indexOfParentProject = entries.length - 1;
      }

      var indexOfProject =
        entries[indexOfParentProject].children.pluck('ontimeId').indexOf(item.project.id);
      if (indexOfProject === -1) {
        entries[indexOfParentProject].children.push(new EntryModel({
          name: item.project.name,
          ontimeId: item.project.id,
          path: item.project.path ? item.project.path.split('\\') : [],
          children: [],
        }));
        indexOfProject = entries[indexOfParentProject].children.length - 1;
      }

      var indexOfEntry =
        entries[indexOfParentProject].children[indexOfProject].children.pluck('ontimeId')
          .indexOf(item.parent.id);

      if (indexOfEntry === -1) {
        entries[indexOfParentProject].children[indexOfProject].children.push(new EntryModel({
          name: item.name,
          description: item.description,
          notes: item.notes,
          ontimeId: item.id,
          estimate: {
            durationMinutes: item.estimated_duration.duration_minutes,
            otrLow: item.custom_fields !== undefined ? item.custom_fields.custom_257 : null,
            otrHigh: item.custom_fields !== undefined ? item.custom_fields.custom_259 : null,
            otrIsEstimated: item.custom_fields !== undefined ? item.custom_fields.custom_262 : null,
          },
        }));
      } else {
        entries[indexOfParentProject]
          .children[indexOfProject].children[indexOfEntry].children.push(new EntryModel({
            name: item.name,
            description: item.description,
            notes: item.notes,
            ontimeId: item.id,
            estimate: {
              durationMinutes: item.estimated_duration.duration_minutes,
              otrLow: item.custom_fields !== undefined ? item.custom_fields.custom_257 : null,
              otrHigh: item.custom_fields !== undefined ? item.custom_fields.custom_259 : null,
              otrIsEstimated: item.custom_fields !== undefined ? item.custom_fields.custom_262 : null,
            },
          }));
      }

      // Count
      if (entries[indexOfParentProject].size === undefined) {
        entries[indexOfParentProject].size = 0;
      }
      entries[indexOfParentProject].size++;
      if (entries[indexOfParentProject].children[indexOfProject].size === undefined) {
        entries[indexOfParentProject].children[indexOfProject].size = 0;
      }
      entries[indexOfParentProject].children[indexOfProject].size++;
      if (indexOfEntry !== -1) {
        if (entries[indexOfParentProject]
            .children[indexOfProject].children[indexOfEntry].size === undefined) {
          entries[indexOfParentProject].children[indexOfProject]
            .children[indexOfEntry].size = 0;
        }
        entries[indexOfParentProject].children[indexOfProject].children[indexOfEntry].size++;
      }

      // Sum of parent project entries
      if (entries[indexOfParentProject].estimate.durationMinutes === undefined) {
        entries[indexOfParentProject].estimate.durationMinutes = 0;
      }
      entries[indexOfParentProject].estimate.durationMinutes +=
        item.estimated_duration.duration_minutes;
      if (entries[indexOfParentProject].estimate.otrLow === undefined) {
        entries[indexOfParentProject].estimate.otrLow = 0;
      }
      entries[indexOfParentProject].estimate.otrLow +=
        item.custom_fields !== undefined ? item.custom_fields.custom_257 : 0;
      if (entries[indexOfParentProject].estimate.otrHigh === undefined) {
        entries[indexOfParentProject].estimate.otrHigh = 0;
      }
      entries[indexOfParentProject].estimate.otrHigh +=
        item.custom_fields !== undefined ? item.custom_fields.custom_259 : 0;

      // Sum of parent project entries
      if (entries[indexOfParentProject]
          .children[indexOfProject].estimate.durationMinutes === undefined) {
        entries[indexOfParentProject].children[indexOfProject].estimate.durationMinutes = 0;
      }
      entries[indexOfParentProject].children[indexOfProject].estimate.durationMinutes +=
        item.estimated_duration.duration_minutes;
      if (entries[indexOfParentProject]
          .children[indexOfProject].estimate.otrLow === undefined) {
        entries[indexOfParentProject].children[indexOfProject].estimate.otrLow = 0;
      }
      entries[indexOfParentProject].children[indexOfProject].estimate.otrLow +=
        item.custom_fields !== undefined ? item.custom_fields.custom_257 : 0;
      if (entries[indexOfParentProject]
          .children[indexOfProject].estimate.otrHigh === undefined) {
        entries[indexOfParentProject].children[indexOfProject].estimate.otrHigh = 0;
      }
      entries[indexOfParentProject].children[indexOfProject].estimate.otrHigh +=
        item.custom_fields !== undefined ? item.custom_fields.custom_259 : 0;
    });
    /* jshint camelcase: true */

    return entries;
  }

  /**
   *
   * @param request
   * @param response
   */
  static createAction(request, response) {
    const data = request.body;
    let modelItem = {}, user = {};

    Http.checkAuthorized(request, response)
      .then(userData => {
        user = userData;
        if (!data.organizationId) {
          throw new UndefinedOrganizationIdItemError();
        }

        return Organization.findById(data.organizationId).lean().populate('creation.user').execAsync();
      })
      .then(organization => {
        modelItem = {
          name: data.name,
          description: data.description,
          update: {user: user._id, date: new Date()},
          creation: {user: user._id, date: new Date()},
        };

        if (!organization) {
          throw new NotFoundOrganizationIdItemError();
        } else if (data.parentId === undefined && data.type !== 'project') {
          throw new UndefinedParentIdOrTypeItemError();
        } else if (data.parentId === undefined && data.type === 'project') {
          modelItem = new ProjectModel(modelItem);
          organization.projects.push(modelItem);

          return ItemController._save(request, response, data, organization, modelItem, '2');
        }

        return BPromise.promisify(Organization.findDeepAttributeById(organization, data.parentId));
      })
      .then(element => {
        if (element === undefined) {
          throw new NotFoundItemError();
        }

        // Switch-like
        const cases = {
          project: () => {
            modelItem = new ProjectModel(item);
            element.projects.push(modelItem);

            return ItemController._save(request, response, data, organization, modelItem, '2');
          },
          document: () => {
            modelItem = new DocumentModel(item);
            element.documents.push(modelItem);

            return ItemController._save(request, response, data, organization, modelItem, '2');
          },
          version: () => {
            if (data.projectOntimeId !== undefined || data.releaseOntimeId !== undefined) {
              return Ontime.items(
                request.ontimeToken,
                {projectId: data.projectOntimeId, releaseId: data.releaseOntimeId}
              );
            } else {
              throw new UndefinedOnTimeIdVersionError();
            }
          }
        };

        if (cases[data.type]) {
          return cases[data.type]();
        } else {
          throw new InvalidTypeItemError();
        }
      })
      .then(result => {
        modelItem = new VersionModel(item);
        modelItem.update = modelItem.creation = {user: user._id, date: new Date()};
        modelItem.setting = new SettingModel(mapping.settingDtoToDal(undefined, data.setting));
        modelItem.entries = this._createEntries(result.data);

        return ItemController._save(request, response, data, organization, modelItem, '2');
      })
      .catch(OnTimeError, err => {
        const error = err.message;
        Http.sendResponse(
          /* jshint camelcase: false */
          request, response, 403, {error: error}, '-3', 'Ontime Error: ' + error.error_description, error.error
          /* jshint camelcase: true */
        );
      })
      .catch(UndefinedOnTimeIdVersionError, () => {
        Http.sendResponse(
          request, response, 404, {}, '-7', 'Error: item creation (version one) failed (data.ontimeId is undefined).'
        );
      })
      .catch(InvalidTypeItemError, () => {
        Http.sendResponse(
          request, response, 404, {}, '-7', 'Error: item creation failed (data.type is undefined or invalid).'
        );
      })
      .catch(NotFoundItemError, () => {
        Http.sendResponse(
          request, response, 404, {}, '-7', 'Error: project not found (data.parentId = ' + data.parentId + ').'
        );
      })
      .catch(UndefinedParentIdOrTypeItemError, () => {
        Http.sendResponse(
          request, response, 404, {}, '-7', 'Error: item creation failed (data.parentId / type is undefined).'
        );
      })
      .catch(NotFoundOrganizationIdItemError, () => {
        Http.sendResponse(
          request, response, 404, {}, '-5', 'Error: organization with id (' + data.organizationId + ') not found.'
        );
      })
      .catch(UndefinedOrganizationIdItemError, () => {
        Http.sendResponse(request, response, 404, {}, '-1', 'Internal error: wrong parameters in "items/create"');
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: create item', err);
      })
    ;
  }
}

module.exports = ItemController;