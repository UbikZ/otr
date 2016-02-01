'use strict';

const http = require('./helpers/http');
const ontimeRequester = require('./helpers/ontime');

/**
 * Ontime controller
 * - Abstraction layer for Ontime Requests
 * @param app
 * @param config
 */
module.exports.controller = (app, config) => {

  const prefix = '/api/v' + config.api.version + '/ontime';

  /**
   * Get information about logged ontime user
   */
  app.get(prefix + '/me', http.ensureAuthorized, (req, res) => { 
    http.checkAuthorized(req, res, () => { 
      ontimeRequester.me(req.ontimeToken, result => {
        result = JSON.parse(result);
        if (result.error) {
          /*jshint camelcase: false */
          http.log(req, 'Ontime Error: ' + result.error_description);
          /*jshint camelcase: true */
          http.response(res, 403, {error: result}, '-3', result.error);
        } else if (result.data) {
          http.response(res, 200, {ontimeUser: result.data});
        } else {
          http.log(req, 'Ontime Error: issue during OnTime "/me" request');
          http.response(res, 500, {}, '-1');
        }
      });
    });
  });

  /**
   * Get elements from projects or release from Ontime Requests
   * - Project: no idProject
   * - Release: one idProject
   */
  app.get(prefix + '/tree', http.ensureAuthorized, (req, res) => { 
    http.checkAuthorized(req, res, () => { 
      ontimeRequester.tree(req.ontimeToken, req.query.idProject, result => {
        result = JSON.parse(result);
        if (result.error) {
          /*jshint camelcase: false */
          http.log(req, 'Ontime Error: ' + result.error_description);
          /*jshint camelcase: true */
          http.response(res, 403, {error: result}, '-3', result.error);
        } else if (req.query.idProject !== undefined) {
          http.response(res, 200, {tree: result.data || result});
        } else if (result.data) {
          http.response(res, 200, {tree: result.data});
        } else {
          http.log(req, 'Ontime Error: issue during OnTime "/tree" request');
          http.response(res, 500, {}, '-1');
        }
      });
    });
  });

  /**
   * Get features from Ontime Request
   */
  app.get(prefix + '/items', http.ensureAuthorized, (req, res) => { 
    http.checkAuthorized(req, res, () => { 
      ontimeRequester.items(req.ontimeToken, req.query.projectId, result => {
        result = JSON.parse(result);
        if (result.error) {
          /*jshint camelcase: false */
          http.log(req, 'Ontime Error: ' + result.error_description);
          /*jshint camelcase: true */
          http.response(res, 403, {error: result}, '-3', result.error);
        } else if (result.data) {
          http.response(res, 200, {items: result.data});
        } else {
          http.log(req, 'Ontime Error: issue during OnTime "/items" request');
          http.response(res, 500, {}, '-1');
        }
      });
    });
  });
};
