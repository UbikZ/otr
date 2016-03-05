'use strict';

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const Ontime = require('./helpers/Ontime');

const Organization = require('../models/OrganizationModel').model;
const SettingModel = require('../models/SettingModel').model;
const ProjectModel = require('../models/ProjectModel').model;
const DocumentModel = require('../models/DocumentModel').model;
const VersionModel = require('../models/VersionModel').model;
const EntryModel = require('../models/EntryModel').model;

const mapping = require('../models/helpers/mapping');

const EmptyOrganizationError = require('../errors/EmptyOrganizationError');
const UndefinedItemError = require('../errors/UndefinedItemError');
const UndefinedIdItemError = require('../errors/UndefinedIdItemError');
const UndefinedOrganizationIdItemError = require('../errors/UndefinedOrganizationIdItemError');
const NotFoundOrganizationIdItemError = require('../errors/NotFoundOrganizationIdItemError');
const UndefinedParentIdOrTypeItemError = require('../errors/UndefinedParentIdOrTypeItemError');
const NotFoundItemError = require('../errors/NotFoundItemError');
const InvalidTypeItemError = require('../errors/InvalidTypeItemError');
const UndefinedOnTimeIdVersionError = require('../errors/UndefinedOnTimeIdVersionError');
const OnTimeError = require('../errors/OnTimeError');
const Success = require('../errors/Success');

/**
 * Item Controller
 * - indexAction
 * - createAction
 * - updateAction
 * - deleteAction
 */
class ItemController extends AbstractController {
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
    let organization = {};

    if (data.organizationId) {
      Organization.findById(data.organizationId).lean().execAsync()
        .then(org => {
          organization = org;
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

          return Organization.findDeepAttributeById(organization, data.itemId);
        })
        .then(item => {
          const element = item.element;
          const parentElement = item.parentElement;
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
        .catch(UndefinedItemError, error => {
          Http.sendResponse(
            request, response, 404, {}, '-6', 'Error: item (' + data.itemId + ') for "get request" not found.', error
          );
        })
        .catch(EmptyOrganizationError, error => {
          Http.sendResponse(
            request, response, 404, {}, '-5', 'Error: organization (' + data.organizationId + ') not found.', error
          );
        })
        .catch(error => {
          Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: get organization', error);
        });
    } else {
      Http.sendResponse(
        request, response, 404, {}, '-5', 'Error: organization with id (' + data.organizationId + ') not found.'
      );
    }
  }

  /**
   * Create entries for ONE version
   * - "items" from Ontime Service call
   * - generate a tree nodes
   * - each node get:
   *    > count number of children
   *    > sum of all estimates from children
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
   * Create Method
   * - create projects of organization
   * - create projects of n-project
   * - create documents of n-project
   * - create versions of n-project
   * - create entries of version (check: _createEntries method)
   * @param   request
   * @param   response
   * @method  POST
   */
  static createAction(request, response) {
    const data = request.body;
    let modelItem = {},
      user = {},
      organization = {},
      element = {};

    Http.checkAuthorized(request, response)
      // Result of checkAuthorize
      .then(userData => {
        user = userData;
        if (!data.organizationId) {
          throw new UndefinedOrganizationIdItemError();
        }

        return Organization.findById(data.organizationId).lean().populate('creation.user').execAsync();
      })
      // Result of Organization.findById
      .then(org => {
        organization = org;
        modelItem = {
          name: data.name,
          description: data.description,
          update: {
            user: user._id,
            date: new Date()
          },
          creation: {
            user: user._id,
            date: new Date()
          },
        };

        if (!organization) {
          throw new NotFoundOrganizationIdItemError();
        } else if (data.parentId !== undefined) {
          return Organization.findDeepAttributeById(organization, data.parentId);
        } else if (data.type === 'project') {
          modelItem = new ProjectModel(modelItem);
          organization.projects.push(modelItem);

          return Organization.persist(data, organization, modelItem, '2');
        } else {
          throw new UndefinedParentIdOrTypeItemError();
        }
      })
      // Result of Organization.findDeepAttributeById
      .then(result => {
        if (!result || !result.element) {
          throw new NotFoundItemError();
        }
        element = result.element;

        // Switch-like
        const cases = {
          project: () => {
            modelItem = new ProjectModel(modelItem);
            element.projects.push(modelItem);

            return Organization.persist(data, organization, modelItem, '2');
          },
          document: () => {
            modelItem = new DocumentModel(modelItem);
            element.documents.push(modelItem);

            return Organization.persist(data, organization, modelItem, '2');
          },
          version: () => {
            if (data.projectOntimeId !== undefined || data.releaseOntimeId !== undefined) {
              return Ontime.items(request.ontimeToken, {
                projectId: data.projectOntimeId,
                releaseId: data.releaseOntimeId
              });
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
      // Result of Ontime.items
      .then(result => {
        modelItem = new VersionModel(modelItem);
        modelItem.update = modelItem.creation = { user: user._id, date: new Date() };
        modelItem.setting = new SettingModel(mapping.settingDtoToDal(undefined, data.setting));
        modelItem.entries = ItemController._createEntries(result.data);
        element.versions.push(modelItem);

        return Organization.persist(data, organization, modelItem, '2');
      })
      // Promise-chaining Success (200)
      .catch(Success, successMsg => {
        const result = successMsg.result;
        Http.sendResponse(request, response, 200, result, result.returnCode);
      })
      // Promise-chaining Errors/Exceptions (!200)
      .catch(OnTimeError, error => {
        Http.sendResponse(
          /* jshint camelcase: false */
          request, response, 403, { error: error }, '-3', 'Ontime Error', error
          /* jshint camelcase: true */
        );
      })
      .catch(UndefinedOnTimeIdVersionError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-7',
          'Error: item creation (version one) failed (data.ontimeId is undefined).', error
        );
      })
      .catch(InvalidTypeItemError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-7', 'Error: item creation failed (data.type is undefined or invalid).', error
        );
      })
      .catch(NotFoundItemError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-7', 'Error: project not found (data.parentId = ' + data.parentId + ').', error
        );
      })
      .catch(UndefinedParentIdOrTypeItemError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-7', 'Error: item creation failed (data.parentId / type is undefined).', error
        );
      })
      .catch(NotFoundOrganizationIdItemError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-5', 'Error: org with id (' + data.organizationId + ') not found.', error
        );
      })
      .catch(UndefinedOrganizationIdItemError, error => {
        Http.sendResponse(request, response, 404, {}, '-1', 'Internal error: wrong params in "items/create"', error);
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: create item', error);
      });
  }

  /**
   * Update method
   * - can only update basics stuff (name / description etc.)
   * @param   request
   * @param   response
   * @method  POST
   */
  static updateAction(request, response) {
    const data = request.body;
    let modelItem = {},
      user = {},
      organization = {};

    Http.checkAuthorized(request, response)
      .then(userData => {
        user = userData;
        if (!data.organizationId) {
          throw new UndefinedOrganizationIdItemError();
        }

        return Organization.findById(data.organizationId).lean().populate('creation.user').execAsync();
      })
      .then(org => {
        organization = org;
        if (!organization) {
          throw new NotFoundOrganizationIdItemError();
        }
        if (!data._id) {
          throw new UndefinedIdItemError();
        }

        return Organization.findDeepAttributeById(organization, data._id);
      })
      .then(result => {
        let element = result.element;
        if (!result || !result.element) {
          throw new NotFoundItemError();
        }

        modelItem.name = data.name ? data.name : modelItem.name;
        modelItem.description = data.description ? data.description : modelItem.description;
        modelItem.update = { user: user._id, date: new Date() };
        element = Object.assign(element, modelItem);
        data.type = element.projects === undefined ? 'document' : 'project';

        return Organization.persist(data, organization, element, '3');
      })
      // Promise-chaining Success (200)
      .catch(Success, successMsg => {
        const result = successMsg.result;
        Http.sendResponse(request, response, 200, result, result.returnCode);
      })
      .catch(NotFoundItemError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-8', 'Error: item not found (data._id = ' + data._id + ').', error
        );
      })
      .catch(UndefinedIdItemError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-8', 'Error: item to update not found (data._id = undefined).', error
        );
      })
      .catch(NotFoundOrganizationIdItemError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-5', 'Error: org with id (' + data.organizationId + ') not found.', error
        );
      })
      .catch(UndefinedOrganizationIdItemError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Internal error: wrong parameters in "items/update"', error
        );
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: update item', error);
      });
  }

  /**
   * Delete ONE specific item from another
   * - project from organization
   * - project from n-project
   * - document from n-project
   * - version from n-project
   * @param   request
   * @param   response
   * @method  DELETE
   */
  static deleteAction(request, response) {
    const params = request.params,
      lazy = request.query.lazy;
    let organization = {};

    Http.checkAuthorized(request, response)
      // Result of checkAuthorize
      .then(() => {
        return Organization.findById(params.organizationId).populate('creation.user').execAsync();
      })
      .then(org => {
        organization = org;
        if (!organization) {
          throw new NotFoundOrganizationIdItemError();
        }

        return Organization.findDeepAttributeById(organization, params.itemId);
      })
      .then(result => {
        let element = result.element,
          data = params;
        const item = element;
        if (!result || !result.element) {
          throw new NotFoundItemError();
        }

        data.lazy = lazy;
        data.type = result.type;
        element.remove();

        return Organization.persist(data, organization, item, '4');
      })
      // Promise-chaining Success (200)
      .catch(Success, successMsg => {
        const result = successMsg.result;
        Http.sendResponse(request, response, 200, result, result.returnCode);
      })
      .catch(NotFoundItemError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-6', 'Error: item to del not found (data.itemId = ' + params.itemId + ').', error
        );
      })
      .catch(NotFoundOrganizationIdItemError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-5', 'Error: org with id (' + params.organizationId + ') not found.', error
        );
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: delete item', error);
      });
  }
}

module.exports = ItemController;
