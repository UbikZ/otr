'use strict';

var Promise = require('bluebird');
const request = require('request-promise');
const qs = require('querystring');

const ontimeConfig = require('../../config/ontime.json');
const logger = require('../../logger');

const OnTimeError = require('../../errors/OnTimeError');

/**
 *  Ontime Helper
 */
class Ontime {
  /**
   * Execute ontime requests
   * @param url
   * @returns {*}
   */
  static execRequest(url) {
    logger.info('# Ontime Call : ' + url);
    return request({uri: url, method: 'GET', resolveWithFullResponse: true})
      .then(response => {
        const result = JSON.parse(response.body);
        if (response.statusCode !== 200) {
          throw new Error({error : 'StatusCode = ' + response.statusCode});
        }
        return new Promise((resolve, reject) => {
          if (result.error) {
            reject(new OnTimeError(result));
          } else if (!result.data) {
            reject(new Error());
          } else {
            resolve(result);
          }
        });
      })
      .catch(err => {
        logger.error('Error while requesting (' + url + ').');
        logger.error('Error detail :' + err);
        return new Promise((resolve, reject) => {
          reject(new Error(err));
        });
      })
    ;
  }

  /**
   *
   * @param authObject
   * @returns {*}
   */
  static requestToken(authObject) {
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

    return Ontime.execRequest(url);
  }

  /**
   *
   * @param accessToken
   * @returns {*}
   */
  static me(accessToken) {
    const url = ontimeConfig.ontimeUrl + '/api/v5/me?' +
      qs.stringify({
        /*jshint camelcase: false */
        'access_token': accessToken,
        /*jshint camelcase: true */
      });

    return Ontime.execRequest(url);
  }

  /**
   *
   * @param accessToken
   * @param idProject
   * @returns {*}
   */
  static tree(accessToken, idProject) {
    const requestUrl = idProject === undefined ? 'projects' : 'releases';
    /*jshint camelcase: false */
    const params = {'access_token': accessToken};
    if (idProject !== undefined) {
      params.filter_by_project_id = idProject ? idProject : 0;
    }
    /*jshint camelcase: true */
    const url = ontimeConfig.ontimeUrl.concat('/api/v5/', requestUrl, '?', qs.stringify(params));

    return Ontime.execRequest(url);
  }

  /**
   *
   * @param accessToken
   * @param ids
   * @returns {*}
   */
  static items(accessToken, ids) {
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

    return Ontime.execRequest(url);
  }
}

module.exports = Ontime;
