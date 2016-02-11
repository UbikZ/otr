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
   * Get information about logged ontime user
   * @param   request
   * @param   response
   * @method  GET
   */
  static meAction(request, response) {
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
        const error = err.message;
        /*jshint camelcase: false */
        Http.sendResponse(
          request, response, 403, {error: error}, '-3', 'Ontime Error: ' + error.error_description, error.error
        );
        /*jshint camelcase: true */
      })
      .catch(() => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/me" request');
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
  static treeAction(request, response) {
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
        const error = err.message;
        /*jshint camelcase: false */
        Http.sendResponse(
          request, response, 403, {error: error}, '-3', 'Ontime Error: ' + error.error_description, error.error
        );
        /*jshint camelcase: true */
      })
      .catch(() => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/tree" request');
      })
    ;
  }

  /**
   * Get features from Ontime Request
   * @param   request
   * @param   response
   * @method  GET
   */
  static itemsAction(request, response) {
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
        const error = err.message;
        /*jshint camelcase: false */
        Http.sendResponse(
          request, response, 403, {error: error}, '-3', 'Ontime Error: ' + error.error_description, error.error
        );
        /*jshint camelcase: true */
      })
      .catch(() => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/items" request');
      })
    ;
  }
}

module.exports = OnTimeController;