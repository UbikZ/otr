'use strict';

const request = require('request-promise');
const Promise = require('bluebird');
const qs = require('querystring');

const ontimeConfig = require('../../config/ontime.json');
const logger = require('../../logger');

/**
 *  TODO: use full promises
 */
class Ontime {
  /**
   *
   * @param url
   * @param callback
   */
  static execRequest(url, callback) {
    logger.info('# Ontime Call : ' + url);
    request({uri: url, method: 'GET', resolveWithFullResponse: true})
      .then(response => {
        if (response.statusCode !== 200) {
          throw new Error({});
        }
        callback(body);
      })
      .catch(err => {
        logger.error('Error while requesting (' + url + ').');
        logger.error('Error detail :' + err);
        callback({});
      })
    ;
  }

  /**
   *
   * @param authObject
   * @param callback
   */
  static requestToken(authObject, callback) {
    const url = ontimeConfig.ontimeUrl + '/api/oauth2/token?' +
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

    Ontime.execRequest(url, callback);
  }

  static me(accessToken, callback) {
    const url = ontimeConfig.ontimeUrl + '/api/v5/me?' +
      qs.stringify({
        /*jshint camelcase: false */
        'access_token': accessToken,
        /*jshint camelcase: true */
      });

    Ontime.execRequest(url, callback);
  }

  static tree(accessToken, idProject, callback) {
    const requestUrl = idProject === undefined ? 'projects' : 'releases';
    /*jshint camelcase: false */
    const params = {'access_token': accessToken};
    if (idProject !== undefined) {
      params.filter_by_project_id = idProject ? idProject : 0;
    }
    /*jshint camelcase: true */
    const url = ontimeConfig.ontimeUrl.concat('/api/v5/', requestUrl, '?', qs.stringify(params));

    Ontime.execRequest(url, callback);
  }

  static items(accessToken, ids, callback) {
    const params = {
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
    const url = ontimeConfig.ontimeUrl + '/api/v5/features/?' + qs.stringify(params);

    Ontime.execRequest(url, callback);
  }
}

module.exports = Ontime;
