'use strict';

var request = require('request');
var qs = require('querystring');
var ontimeConfig = require('../../config/ontime.json');
var logger = require('../../logger');

function req(url, cb) {
  request(url, function (error, response, body) {
    logger.info('# Ontime Call : ' + url);
    if (error && response.statusCode !== 200) {
      logger.error('Error while requesting (' + url + ').');
    }
    cb(body);
  });
}

function requestToken(authObject, cb) {
  var url = ontimeConfig.ontimeUrl + '/api/oauth2/token?' +
    qs.stringify({
      /*jshint camelcase: false */
      'grant_type': 'password',
      'username': authObject.username,
      'password': authObject.password,
      'client_id': ontimeConfig.client_id,
      'client_secret': ontimeConfig.client_secret,
      'scope': ontimeConfig.scope,
      /*jshint camelcase: true */
    });

  req(url, cb);
}

function me(accessToken, cb) {
  var url = ontimeConfig.ontimeUrl + '/api/v5/me?' +
    qs.stringify({
      /*jshint camelcase: false */
      'access_token': accessToken,
      /*jshint camelcase: true */
    });

  req(url, cb);
}

function tree(accessToken, idProject, cb) {
  var requestUrl = idProject === undefined ? 'projects' : 'releases';
  /*jshint camelcase: false */
  var params = { 'access_token': accessToken };
  if (idProject !== undefined) {
    params.filter_by_project_id = idProject ? idProject : 0;
  }
  /*jshint camelcase: true */
  var url = ontimeConfig.ontimeUrl.concat('/api/v5/', requestUrl, '?', qs.stringify(params));

  req(url, cb);
}

function items(accessToken, ids, cb) {
  var params = {
    /*jshint camelcase: false */
    'access_token': accessToken,
    'sort_fields': 'id',
    'columns': [
      'parent',
      'parent_project',
      'project',
      'name',
      'description',
      'notes',
      'estimated_duration',
      'custom_fields.custom_263', // OTR_ParentId
      'custom_fields.custom_256', // OTR_EstimateBase
      'custom_fields.custom_257', // OTR_EstimateLow
      'custom_fields.custom_259', // OTR_EstimateHigh
      'custom_fields.custom_262', // OTR_IsEstimated
      'custom_fields.custom_260', // OTR_ValidatedDev
      'custom_fields.custom_261', // OTR_ValidatedShipping
      'custom_fields.custom_296', // Devis Gescom
      'item_type',
      'subitems',
      'parent',
    ].join(','),
    'include_sub_projects_items': true,
    'include_archived': false,
    'page': 1,
    'page_size': 1000,
    /*jshint camelcase: false */
  };
  if (ids.projectId !== undefined) {
    /*jshint camelcase: false */
    params.project_id = ids.projectId;
    /*jshint camelcase: true */
  }
  if (ids.releaseId !== undefined) {
    /*jshint camelcase: false */
    params.release_id = ids.releaseId;
    /*jshint camelcase: true */
  }
  var url = ontimeConfig.ontimeUrl.concat('/api/v5/features/?', qs.stringify(params));

  req(url, cb);
}

module.exports = {
  requestToken: requestToken,
  me: me,
  tree: tree,
  items: items,
};
