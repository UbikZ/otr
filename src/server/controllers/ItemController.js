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

const EmptyOrganizationError = require('../errors/EmptyOrganizationError');
const UndefinedItemError = require('../errors/UndefinedItemError');

/**
 * Item Controller
 */
class ItemController extends AbstractController {
  /**
   *
   * @returns {{controller: string, actions: {index: string}}}
   */
  static get patterns() {
    return {
      controller: '/item',
      actions: {
        index: '/',
      }
    };
  }

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
   * @private
   */
  _save(request, response, data, organization, modelItem, returnCode) {
    Organization.update({_id: organization._id}, organization, {}).lean().execAsync()
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
  indexAction(request, response) {
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
}

module.exports = ItemController;