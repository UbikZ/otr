'use strict';

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');

const Setting = require('../models/setting');
const Organization = require('../models/organization');
// FIXME: clean it...
const mapping = require('../models/helpers/mapping');

const SettingNotFound = require('../errors/SettingNotFound');
const Success = require('../errors/Success');
const EmptyOrganizationError = require('../errors/EmptyOrganizationError');
const NotFoundItemError = require('../errors/NotFoundItemError');

/**
 * Setting Controller
 * - indexAction
 * - updateAction
 * - subIndexAction
 * - subUpdateAction
 */
class SettingController extends AbstractController {  
  /**
   * Index Action (for standalone / collection)
   * - Get ONE setting with filtering (only by id for now)
   * @param   request
   * @param   response
   * @method  GET
   */
  static indexAction(request, response) {
    const data = request.query;
    let criteria = {};
    Http.checkAuthorized(request, response)
      .then(() => {
        criteria = data.id ? { id: data.id } : {};

        return Setting.find(criteria).lean().execAsync();
      })
      .then(settings => {
        if (!settings) {
          throw new SettingNotFound();
        }
    
        Http.sendResponse(request, response, 200, { setting: settings[0] });
      })
      .catch(SettingNotFound, () => {
        Http.sendResponse(
          request, response, 404, {}, '-10', 'Error: settings is undefined (criteria = ' + criteria + ').'
        );
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: get setting', err);
      })
    ;
  }
  
  /**
   * Update Action (for standalone / collection)
   * @param   request
   * @param   resposne
   * @method  POST
   */
  static updateAction(request, response) {
    const data = request.body;
    let criteria = {}, user = {}, setting = {}, isNew = false;
    Http.checkAuthorized(request, response)
      .then(userData => {
        user = userData;
        criteria = data.id ? { id: data.id } : {};

        return Setting.findOne(criteria).lean().execAsync();
      })
      .then(settingData => {
        isNew = !settingData;
        setting = settingData ? mapping.settingDtoToDal(settingData, data) :
          new Setting(mapping.settingDtoToDal(undefined, data));
        setting.id = 42; // We force ONLY ONE setting on the collection (no need more at the moment)
        setting.update = { user: user._id, date: new Date() };

        return Setting.update({ _id: setting._id }, setting, { upsert: true }).lean().execAsync();
      })
      .then(() => {
        Http.sendResponse(request, response, 200, { setting }, isNew ? '8' : '9');
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: update setting (in collection)', err);
      })
    ;
  }
  
  /**
   * Get sub-setting (from organization, project, document or version)
   * @param   request
   * @param   response
   * @method  GET
   */
  static subIndexAction(request, response) {  
    const data = request.query, params = request.params;
    let organization = {}, setting = {};
    Http.checkAuthorized(request, response)
      .then(() => {
        return Organization.findById(params.organizationId).lean().execAsync();       
      })
      .then(orgData => {
        organization = orgData;
        if (!organization) {
          throw new EmptyOrganizationError();
        }
        
        /*jshint eqeqeq: false */
        if (data.lazy == 1) {
          /*jshint eqeqeq: true */
          Organization.walkRecursively(organization, element => {
            if (element.entries !== undefined) {
              delete element.entries;
            }
          });
        }

        if (data.itemId !== undefined && data.itemId !== params.organizationId) {
          return Organization.findDeepAttributeById(organization, data.itemId);
        } else {
          setting = organization.setting;
          Http.sendResponse(request, response, 200, { setting });
        }    
      })
      // Then from Organization.findDeepAttributeById
      .then(result => {
        setting = result.element;
        Http.sendResponse(request, response, 200, { setting });
      })
      .catch(EmptyOrganizationError, () => {
         Http.sendResponse(
           request, response, 404, {}, '-5', 'Error: organization with id (' + params.organizationId + ') not found.'
         );
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: get setting (in sub-element)', err);
      })
    ;
  }
 
  /**
   * Edit setting (as sub-element from organization, project, document or version)
   * @param   request
   * @param   response
   * @method  POST
   */
  static subUpdateAction(request, response) {
    const params = request.params, data = request.body;
    let user = {}, organization = {}, setting = {};
    Http.checkAuthorized(request, response)
      .then(userData => {
        user = userData;
        return Organization.findById(params.organizationId).populate('creation.user').lean().execAsync();
      })
      .then(orgData => {
        organization = orgData;
        if (!organization) {
          throw new EmptyOrganizationError();
        }

        if (data.itemId !== undefined && data.itemId !== params.organizationId) {
          return Organization.findDeepAttributeById(organization, data.itemId);
        } else {
          setting = mapping.settingDtoToDal(organization.setting, data);
          setting.update = {user: user._id, date: new Date()};
          organization.setting = setting;

          return Organization.persist(data, organization, setting, '10');
        }    
      })
      .then(result => {
        if (!result || !result.element) {
          throw new NotFoundItemError();
        }
        let element = result.element;
        
        setting = new Setting(mapping.settingDtoToDal(element.setting, data));
        setting.update = {user: user._id, date: new Date()};
        element.setting = setting;
        
        return Organization.persist(data, organization, setting, '10');
      })
      .catch(Success, successMsg => {
        const result = successMsg.result;
        Http.sendResponse(request, response, 200, result, result.returnCode);
      })
      .catch(NotFoundItemError, () => {
         Http.sendResponse(
           request, response, 404, {}, '-11', 'Error: setting not found (data.itemId = ' + data.itemId + ').'
         );
      })
      .catch(EmptyOrganizationError, () => {
         Http.sendResponse(
           request, response, 404, {}, '-5', 'Error: organization with id (' + params.organizationId + ') not found.'
         );
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: update setting (in sub-element)', err);
      })
    ;
  }
}

module.exports = SettingController;