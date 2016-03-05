'use strict';

const mongoose = require('mongoose');

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');

const Organization = require('../models/OrganizationModel').model;

const EmptyOrganizationError = require('../errors/EmptyOrganizationError');

/**
 * Organization Controller
 * - indexAction
 * - editAction
 * - deleteAction
 */
class OrganizationController extends AbstractController {
  /**
   * Get organizations information
   * - use "id" as criteria (request ONE organization)
   * - use "lazy" as criteria (get only simple elements from organizations)
   * - use "lazyVersion" as criteria (get complex elements from organizations without no-need one: versions && entries)
   * @param   request
   * @param   response
   * @method  GET
   */
  static indexAction(request, response) {
    const data = request.query;
    let criteria = {};

    Http.checkAuthorized(request, response)
      .then(() => {
        let fields = {};

        if (data.id) {
          criteria = {
            _id: new mongoose.Types.ObjectId(data.id),
          };
        }
        /*jshint eqeqeq: false */
        if (data.lazy == 1) {
          /*jshint eqeqeq: true */
          fields = {
            name: 1,
            description: 1,
            active: 1,
            url: 1,
            logo: 1,
            creation: 1
          };
        }

        return Organization.find(criteria, fields).lean().populate('creation.user').execAsync();
      })
      .then(organizations => {
        if (!organizations) {
          throw new EmptyOrganizationError();
        }
        /*jshint eqeqeq: false */
        if (data.lazyVersion == 1) {
          /*jshint eqeqeq: true */
          organizations.forEach(organization => {
            Organization.walkRecursively(organization, element => {
              if (element.entries !== undefined) {
                delete element.entries;
              }
            });
          });
        }
        Http.sendResponse(request, response, 200, {
          organizations: organizations
        });
      })
      .catch(EmptyOrganizationError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-9', 'Error: organizations is undefined (criteria = ' + criteria + ').', error
        );
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: get organizations.', error);
      });
  }

  /**
   * Edit one organizaiton
   * - create
   * - update (if not found: "upsert")
   * @param   request
   * @param   response
   * @method  POST
   */
  static editAction(request, response) {
    const data = request.body;
    let userModel = {},
      fields = {},
      orgModel = {},
      isNew = false;

    /*jshint eqeqeq: false */
    if (data.lazy == 1) {
      /*jshint eqeqeq: true */
      fields = {
        name: 1,
        description: 1,
        active: 1,
        url: 1,
        logo: 1,
        creation: 1
      };
    }

    Http.checkAuthorized(request, response)
      .then(user => {
        userModel = user;
        return Organization.findById(data._id, fields).lean().populate('creation.user').execAsync();
      })
      .then(organization => {
        isNew = !organization;
        orgModel = organization || new Organization();

        orgModel.name = data.name || orgModel.name;
        orgModel.description = data.description || orgModel.description;
        orgModel.active = data.active !== undefined ? data.active : orgModel.active;
        orgModel.logo = data.logo || orgModel.logo;
        orgModel.url = data.url || orgModel.url;
        orgModel.creation = {
          user: userModel._id,
          date: new Date()
        };
        orgModel.update = {
          user: userModel._id,
          date: new Date()
        };

        return Organization.update({
          _id: orgModel._id
        }, orgModel, {
          upsert: true
        }).lean().execAsync();
      })
      .then(() => {
        Http.sendResponse(request, response, 200, {
          organization: orgModel
        }, isNew ? '5' : '6');
      })
      .catch(EmptyOrganizationError, error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: edit -> save organization', error);
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: edit organization', error);
      });
  }

  /**
   * Delete one organization
   * @param   request
   * @param   response
   * @method  DELETE
   */
  static deleteAction(request, response) {
    const params = request.params;
    Http.checkAuthorized(request, response)
      .then(() => {
        return Organization.findByIdAndRemove(params.organizationId).lean().execAsync();
      })
      .then(() => {
        Http.sendResponse(request, response, 200, {
          id: params.organizationId
        }, '7');
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: delete organization', error);
      });
  }
}

module.exports = OrganizationController;
