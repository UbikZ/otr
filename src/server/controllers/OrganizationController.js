'use strict';

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');

const Organization = require('../models/OrganizationModel');

const EmptyOrganizationError = require('../errors/EmptyOrganizationError');

/**
 * Organization Controller
 * - indexAction
 * - editAction
 * - deleteAction
 */
class OrganizationController extends AbstractController {

  /**
   * Private method to process the get of organizations by criteria
   * @param  {Object} criteria Criteria for search on or several organizations
   * @param  {Object} request
   * @param  {Object} response
   */
  static _processGetOrganizations(criteria, request, response) {
    const data = Organization.parseQuery(request.query);
    let fields = {};

    Http.checkAuthorized(request, response)
      .then(() => {
        if (data.lazy === 1) {
          fields = { name: 1, description: 1, active: 1, url: 1, logo: 1, creation: 1 };
        }

        return Organization.model.find(criteria, fields).lean().populate('creation.user').execAsync();
      })
      .then(organizations => {
        if (!organizations) {
          throw new EmptyOrganizationError();
        }
        if (data.lazyVersion === 1) {
          Organization.cleanEntries(organizations);
        }
        Http.sendResponse(request, response, 200, { organizations });
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
   * Get organizations information
   * - use "id" as criteria (request ONE organization)
   * - use "lazy" as criteria (get only simple elements from organizations)
   * - use "lazyVersion" as criteria (get complex elements from organizations without no-need one: versions && entries)
   * @param   request
   * @param   response
   * @method  GET
   */
  static indexAction(request, response) {
    const parsedParams = Organization.parseParams(request.query);
    OrganizationController._processGetOrganizations(parsedParams, request, response);
  }

  /**
   * Get ONE organization from the application by his OID (Object ID)
   * @param  {Object} request
   * @param  {Object} response
   */
  static getByIdAction(request, response) {
    const parsedParams = Organization.parseParams(request.params);
    OrganizationController._processGetOrganizations(parsedParams, request, response);
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
    const criteria = Organization.parseParams(request.params);
    const query = Organization.parseQuery(request.query);
    const data = request.body;
    let userModel = {},
      fields = {},
      orgModel = {},
      isNew = false;

    if (query.lazy === 1) {
      fields = { name: 1, description: 1, active: 1, url: 1, logo: 1, creation: 1 };
    }

    Http.checkAuthorized(request, response)
      .then(user => {
        userModel = user;
        return Organization.model.findById(criteria._id, fields).lean().populate('creation.user').execAsync();
      })
      .then(organization => {
        isNew = !organization;
        orgModel = organization || new Organization.model();
        Organization.parseData(orgModel, data);
        orgModel.creation = { user: userModel._id, date: new Date() };
        orgModel.update = { user: userModel._id, date: new Date() };
        return Organization.model.update({ _id: orgModel._id }, orgModel, { upsert: true }).lean().execAsync();
      })
      .then(() => {
        Http.sendResponse(request, response, 200, { organization: orgModel }, isNew ? '5' : '6');
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
    const criteria = Organization.parseParams(request.params);
    Http.checkAuthorized(request, response)
      .then(() => {
        return Organization.model.findByIdAndRemove(criteria._id).lean().execAsync();
      })
      .then(() => {
        Http.sendResponse(request, response, 200, { id: criteria._id }, '7');
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: delete organization', error);
      });
  }
}

module.exports = OrganizationController;
