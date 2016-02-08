'use strict';

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const Ontime = require('./helpers/Ontime');

/**
 * Ontime controller (abstraction layer for Ontime Requests)
 * - meAction
 * - treeAction
 * - itemsAction
 */
class OnTimeController extends AbstractController {
  /**
   * Scope routes patterns
   * @returns {{controller: string, actions: {me: string, tree: string, items: string}}}
   */
  static get patterns() {
    return {
      controller: '/on-time',
      actions: {
        me: '/me',
        tree: '/tree',
        items: '/items',
      }
    };
  }

  /**
   * Get information about logged ontime user
   * @param   request
   * @param   response
   * @method  GET
   */
  meAction(request, response) {
    Http.checkAuthorized(request, response, () => {
      Ontime.me(request.ontimeToken, result => {
        result = JSON.parse(result);
        if (result.error) {
          /*jshint camelcase: false */
          Http.sendResponse(
            request, response, 403, {error: result}, '-3', 'Ontime Error: ' + result.error_description, result.error
          );
          /*jshint camelcase: true */
        } else if (result.data) {
          Http.sendResponse(request, response, 200, {ontimeUser: result.data});
        } else {
          Http.sendResponse(request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/me" request');
        }
      });
    });
  }

  /**
   * Get elements from projects or release from Ontime Requests
   * - Project: no idProject
   * - Release: one idProject
   * @param   request
   * @param   response
   * @method  GET
   */
  treeAction(request, response) {
    Http.checkAuthorized(request, response, () => {
      Ontime.tree(request.ontimeToken, request.query.idProject, result => {
        result = JSON.parse(result);
        if (result.error) {
          /*jshint camelcase: false */
          Http.sendResponse(
            request, response, 403, {error: result}, '-3', 'Ontime Error: ' + result.error_description, result.error
          );
          /*jshint camelcase: true */
        } else if (request.query.idProject !== undefined) {
          Http.sendResponse(request, response, 200, {tree: result.data || result});
        } else if (result.data) {
          Http.sendResponse(request, response, 200, {tree: result.data});
        } else {
          Http.sendResponse(request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/tree" request');
        }
      });
    });
  }

  /**
   * Get features from Ontime Request
   * @param   request
   * @param   response
   * @method  GET
   */
  itemsAction(request, response) {
    Http.checkAuthorized(request, response, () => {
      Ontime.items(request.ontimeToken, request.query.projectId, result => {
        result = JSON.parse(result);
        if (result.error) {
          /*jshint camelcase: false */
          Http.sendResponse(
            request, response, 403, {error: result}, '-3', 'Ontime Error: ' + result.error_description, result.error
          );
          /*jshint camelcase: true */
        } else if (result.data) {
          Http.sendResponse(request, response, 200, {items: result.data});
        } else {
          Http.sendResponse(request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/items" request');
        }
      });
    });
  }
}

module.exports = OnTimeController;