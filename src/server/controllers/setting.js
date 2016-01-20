'use strict';

var Setting = require('../models/setting');
var Organization = require('../models/organization');
var mapping = require('../models/helpers/mapping');
var merge = require('merge');
var http = require('./helpers/http');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/setting';

  /*
   * Get setting (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function () {
      var criteria = {};
      if (data.id) {
        criteria.id = data.id;
      }
      Setting.find(criteria).lean().exec(function (err, settings) {
        if (err) {
          http.log(req, 'Internal error: get setting', err);
          http.response(res, 500, {}, "-1", err);
        } else if (settings) {
          http.response(res, 200, {setting: settings[0]});
        } else {
          http.log(req, 'Error: settings is undefined (criteria = ' + criteria + ').');
          http.response(res, 404, {}, "-10");
        }
      });
    });
  });

  /*
   * Get sub setting from organization, project, document or version
   */
  app.get(prefix + '/sub', http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function () {
      if (data.organizationId != undefined) {
        Organization.findById(data.organizationId).lean().exec(function (err, organization) {
          if (err) {
            http.log(req, 'Internal error: get setting', err);
            http.response(res, 500, {}, "-1", err);
          } else if (organization) {
            var modelItem;
            if (data.itemId != undefined && data.itemId != data.organizationId) {
              Organization.findDeepAttributeById(organization, data.itemId, function (element) {
                modelItem = element.setting;
              });
            } else {
              modelItem = organization.setting;
            }

            if (modelItem != undefined && modelItem.label == "") {
              modelItem.label = null;
            }

            http.response(res, 200, {setting: modelItem});
          } else {
            http.log(req, 'Error: organization with id (' + data.organizationId + ') not found.');
            http.response(res, 404, {}, "-5");
          }
        });
      } else {
        http.log(req, 'Internal error: wrong parameters in "settings/sub"');
        http.response(res, 404, {}, "-1");
      }
    });
  });

  /*
   * Update Setting Collection
   */
  app.post(prefix + '/update', http.ensureAuthorized, function (req, res) {
    var data = req.body;
    http.checkAuthorized(req, res, function (user) {
      var criteria = {};
      if (data.id) {
        criteria.id = data.id;
      }
      Setting.findOne(criteria).lean().exec(function (err, setting) {
        if (err) {
          http.log(req, 'Internal error: update setting (in collection)', err);
          http.response(res, 500, {}, "-1", err);
        } else if (setting) {
          setting = mapping.settingDtoToDal(setting, data);
          setting.update = {user: user._id, date: new Date()};

          Setting.update({_id: setting._id}, setting, {}).lean().exec(function (err, raw) {
            if (err) {
              http.log(req, 'Internal error: update setting (in collection) -> save setting', err);
              http.response(res, 500, {}, "-1", err);
            } else {
              http.response(res, 200, {setting: setting}, "9");
            }
          });
        } else {
          var nSetting = new Setting(mapping.settingDtoToDal(undefined, data));
          nSetting.id = 42; // We force ONLY ONE setting on the collection
          Setting.update({_id: nSetting._id}, nSetting, {upsert: true}).lean().exec(function (err, raw) {
            if (err) {
              http.log(req, 'Internal error: create setting (in collection)', err);
              http.response(res, 500, {}, "-1", err);
            } else {
              http.response(res, 200, {setting: nSetting}, "8");
            }
          })
        }
      });
    });
  });

  /*
   * Edit Setting (as subdocument) from Organization document
   */
  app.post(prefix + '/edit', http.ensureAuthorized, function (req, res) {
    var data = req.body;
    http.checkAuthorized(req, res, function (user) {
      if (data.organizationId != undefined) {
        Organization.findById(data.organizationId).populate('creation.user').lean().exec(function (err, organization) {
          if (err) {
            http.log(req, 'Internal error: edit setting (in organization)', err);
            http.response(res, 500, {}, "-1", err);
          } else if (organization) {
            var modelItem;
            if (data.itemId != undefined && data.itemId != data.organizationId) {
              Organization.findDeepAttributeById(organization, data.itemId, function (element) {
                if (element != undefined) {
                  modelItem = new Setting(mapping.settingDtoToDal(element.setting, data));
                  modelItem.update = {user: user._id, date: new Date()};
                  element.setting = modelItem;
                } else {
                  http.log(req, 'Error: setting not found in organization (data.itemId = ' + data.itemId + ').');
                  http.response(res, 404, {}, "-11");
                }
              });
            } else {
              modelItem = mapping.settingDtoToDal(organization.setting, data);
              modelItem.update = {user: user._id, date: new Date()};
              organization.setting = modelItem;
            }

            Organization.update({_id: organization._id}, organization, {upsert: true}).lean().exec(function (err, raw) {
              if (err) {
                http.log(req, 'Internal error: edit setting (in organization) -> save organization', err);
                http.response(res, 500, {}, "-1", err);
              } else {
                var result = {};
                /*jshint eqeqeq: false */
                if (data.modePreview == 1) {
                /*jshint eqeqeq: true */
                  result.setting = modelItem;
                } else {
                  result.organization = organization;
                }
                http.response(res, 200, result, "10");
              }
            });
          } else {
            http.log(req, 'Error: organization with id (' + data.organizationId + ') not found.');
            http.response(res, 404, {}, "-5");
          }
        });
      } else {
        http.log(req, 'Internal error: wrong parameters in "setting/edit"');
        http.response(res, 404, {}, "-1");
      }
    });
  });
};
