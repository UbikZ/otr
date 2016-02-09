'use strict';

const promise = require('bluebird');
const mongoose = require('mongoose');

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const Ontime = require('./helpers/Ontime');
const User = require('../models/user');
const Organization = require('../models/organization');

const EmptyOrganizationError = require('../errors/EmptyOrganizationError');

/**
 * Organization Controller
 * - indexAction
 * - editAction
 * - deleteAction
 */
class OrganizationController extends AbstractController {
  /**
   * Scoped routes patterns
   * @returns {{controller: string, actions: {index: string, edit: string, delete: string}}}
   */
  static get patterns() {
    return {
      controller: '/organization',
      actions: {
        index: '/',
        edit: '/edit',
        'delete': '/delete',
      }
    };
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
  indexAction(request, response) {
    const data = request.query;
    let criteria = {};

    Http.checkAuthorized(request, response)
      .then(() => {
        let fields = {};

        if (data.id) {
          criteria = {_id: new mongoose.Types.ObjectId(data.id)};
        }
        /*jshint eqeqeq: false */
        if (data.lazy == 1) {
          /*jshint eqeqeq: true */
          fields = {name: 1, description: 1, active: 1, url: 1, logo: 1, creation: 1};
        }

        return Organization.find(criteria, fields).lean().populate('creation.user').execAsync();
      })
      .then(organizations => {
        if (!organizations) {
          console.log('throw EmptyOrganizationError');
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
        Http.sendResponse(request, response, 200, {organizations: organizations});
      })
      .catch(EmptyOrganizationError, () => {
        console.log('catch EmptyOrganizationError');
        Http.sendResponse(
          request, response, 404, {}, '-9', 'Error: organizations is undefined (criteria = ' + criteria + ').'
        );
      })
      .catch(err => {
        console.log('catch Error');
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: get organizations.', err);
      })
    ;
  }

  /**
   * Edit one organizaiton
   * - create
   * - update (if not found: "upsert")
   * @param   request
   * @param   response
   * @method  POST
   */
  editAction(request, response) {
    const data = request.body;
    let userModel = {}, fields = {}, orgModel = {}, isNew = false;

    /*jshint eqeqeq: false */
    if (data.lazy == 1) {
      /*jshint eqeqeq: true */
      fields = {name: 1, description: 1, active: 1, url: 1, logo: 1, creation: 1};
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
        orgModel.creation = {user: userModel._id, date: new Date()};
        orgModel.update = {user: userModel._id, date: new Date()};

        return Organization.update({_id: orgModel._id}, orgModel, {upsert: true}).lean().execAsync();
      })
      .then(() => {
        Http.sendResponse(request, response, 200, {organization: orgModel}, isNew ? '5' : '6');
      })
      .catch(EmptyOrganizationError, () => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: edit -> save organization');
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: edit organization', err);
      })
    ;
  }

  /**
   * Delete one organization
   * @param   request
   * @param   response
   * @method  POST (FIXME: change to GET -> /:id)
   */
  deleteAction(request, response) {
    const data = request.body;

    Http.checkAuthorized(request, response)
      .then(() => {
        return Organization.findByIdAndRemove(data.id).lean().execAsync();
      })
      .then(() => {
        Http.sendResponse(request, response, 200, {id: data.id}, '7');
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: delete organization', err);
      })
    ;
  }
}

module.exports = OrganizationController;