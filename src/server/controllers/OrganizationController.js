'use strict';

const promise = require('bluebird');
var mongoose = require('mongoose');

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const Ontime = require('./helpers/Ontime');
const User = require('../models/user');
var Organization = require('../models/organization');

const EmptyOrganizationError = require('./../errors/EmptyOrganizationError');

/**
 * Organization Controller
 * - indexAction
 */
class OrganizationController extends AbstractController {
  /**
   * Get organizations information
   * - use "id" as criteria (request ONE organization)
   * - use "lazy" as criteria (get only simple elements from organizations)
   * - use "lazyVersion" as criteria (get complex elements from organizations without no-need one: versions && entries)
   * @param request
   * @param response
   */
  indexAction(request, response) {
    const data = request.query;
    Http.checkAuthorized(request, response, () => {
      let criteria = {}, fields = {};
      if (data.id) {
        criteria = {_id: new mongoose.Types.ObjectId(data.id)};
      }
      /*jshint eqeqeq: false */
      if (data.lazy == 1) {
        /*jshint eqeqeq: true */
        fields = {name: 1, description: 1, active: 1, url: 1, logo: 1, creation: 1};
      }

      Organization.find(criteria, fields).lean().populate('creation.user').execAsync()
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
          Http.sendResponse(request, response, 200, {organizations: organizations});

        })
        .catch(EmptyOrganizationError, () => {
          Http.sendResponse(
            request, response, 404, {}, '-9', 'Error: organizations is undefined (criteria = ' + criteria + ').'
          );
        })
        .catch(err => {
          Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: get organizations.', err);
        })
      ;
    });
  }

  /**
   * Controller Name
   * @returns {string}
   */
  static get patternUrl() {
    return '/organization';
  }
}

module.exports = OrganizationController;