'use strict';

var request = require('request');
var qs = require('querystring');
var ontimeConfig = require('../../config/ontime.json');
var logger = require('../../logger');

function req(url, cb) {
  request(url, function (error, response, body) {
    logger.info('# Ontime Call : ' + url);
    if (error && response.statusCode != 200) {
      logger.error('Error while requesting (' + url + ').');
    }
    cb(body);
  });
}

function requestToken(authObject, cb) {
  var url = ontimeConfig.ontime_url + '/api/oauth2/token?' +
    qs.stringify({
      'grant_type': 'password',
      'username': authObject.username,
      'password': authObject.password,
      'client_id': ontimeConfig.client_id,
      'client_secret': ontimeConfig.client_secret,
      'scope': ontimeConfig.scope,
    });

  req(url, cb);
}

function me(accessToken, cb) {
  var url = ontimeConfig.ontime_url + '/api/v5/me?' +
    qs.stringify({
      'access_token': accessToken,
    });

  req(url, cb);
}

function tree(accessToken, cb) {
  var url = ontimeConfig.ontime_url + '/api/v5/projects?' +
    qs.stringify({
      'access_token': accessToken,
    });

  req(url, cb);
}

function project(accessToken, projectId, cb) {
  var url = ontimeConfig.ontime_url + '/api/v5/projects/' + projectId + '?' +
    qs.stringify({
      'access_token': accessToken,
    });

  req(url, cb);
}

function items(accessToken, projectId, cb) {
  var url = ontimeConfig.ontime_url + '/api/v5/features/?' +
    qs.stringify({
      'access_token': accessToken,
      'project_id': projectId,
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
    });
  req(url, cb);
}



module.exports = {
  requestToken: requestToken,
  me: me,
  tree: tree,
  project: project,
  items: items,
};