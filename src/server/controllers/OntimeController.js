'use strict';

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const Ontime = require('./helpers/Ontime');

const OnTimeError = require('../errors/OnTimeError');

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
    let userModel = {};
    Http.checkAuthorized(request, response)
      .then(user => {
        userModel = user;
        return Ontime.me(request.ontimeToken);
      })
      .then(result => {
        Http.sendResponse(request, response, 200, {ontimeUser: result.data});
      })
      .catch(OnTimeError, err => {
        /*jshint camelcase: false */
        Http.sendResponse(
          request, response, 403, {error: result}, '-3', 'Ontime Error: ' + err.error_description, err.error
        );
        /*jshint camelcase: true */
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/me" request', err);
      })
    ;
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
    let userModel = {};
    Http.checkAuthorized(request, response)
      .then(user => {
        userModel = user;
        return Ontime.tree(request.ontimeToken, request.query.idProject);
      })
      .then(result => {
        const returnObj = request.query.idProject !== undefined ? {tree: result.data || result} : {tree: result.data};
        Http.sendResponse(request, response, 200, returnObj);
      })
      .catch(OnTimeError, err => {
        /*jshint camelcase: false */
        Http.sendResponse(
          request, response, 403, {error: result}, '-3', 'Ontime Error: ' + err.error_description, err.error
        );
        /*jshint camelcase: true */
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/tree" request', err);
      })
    ;
  }

  /**
   * Get features from Ontime Request
   * @param   request
   * @param   response
   * @method  GET
   */
  itemsAction(request, response) {
    let userModel = {};
    Http.checkAuthorized(request, response)
      .then(user => {
        userModel = user;
        return Ontime.items(request.ontimeToken, request.query.projectId);
      })
      .then(result => {
        Http.sendResponse(request, response, 200, {items: result.data});
      })
      .catch(OnTimeError, err => {
        /*jshint camelcase: false */
        Http.sendResponse(
          request, response, 403, {error: result}, '-3', 'Ontime Error: ' + err.error_description, err.error
        );
        /*jshint camelcase: true */
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/items" request', err);
      })
    ;
  }
}

module.exports = OnTimeController;