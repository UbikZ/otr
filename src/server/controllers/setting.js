'use strict';

var Setting = require('../models/setting');
var Organization = require('../models/organization');
var http = require('./helpers/http');
var jwt = require("jsonwebtoken");
var merge = require('merge');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/setting';

  /*
   * Get setting (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function() {
      var criteria = {};
      if (data.id) {
        criteria.id = data.id;
      }
      Setting.find(criteria, function (err, settings) {
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
   * Get sub setting from organization, project or document
   */
  app.get(prefix + '/sub', http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function () {
      if (data.organizationId != undefined) {
        Organization.findById(data.organizationId, function (err, organization) {
          if (err) {
            http.log(req, 'Internal error: get setting', err);
            http.response(res, 500, {}, "-1", err);
          } else if (organization) {
            var modelItem;
            if (data.itemId != undefined && data.itemId != data.organizationId) {
              organization.findDeepAttributeById(data.itemId, function (element) {
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
    http.checkAuthorized(req, res, function(user) {
      var criteria = {};
      if (data.id) {
        criteria.id = data.id;
      }
      Setting.findOne(criteria, function (err, setting) {
        if (err) {
          http.log(req, 'Internal error: update setting (in collection)', err);
          http.response(res, 500, {}, "-1", err);
        } else if (setting) {
          setting = parseData(setting, data);
          setting.update = {user: user._id, date: new Date()};

          setting.save(function (err, newSetting) {
            if (err) {
              http.log(req, 'Internal error: update setting (in collection) -> save setting', err);
              http.response(res, 500, {}, "-1", err);
            } else {
              http.response(res, 200, {setting: newSetting}, "9");
            }
          });
        } else {
          var newSetting = new Setting(parseData(undefined, data));
          newSetting.id = 42; // We force ONLY ONE setting on the collection
          newSetting.save(function (err, setting) {
            if (err) {
              http.log(req, 'Internal error: create setting (in collection)', err);
              http.response(res, 500, {}, "-1", err);
            } else {
              http.response(res, 200, {setting: setting}, "8");
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
        Organization.findById(data.organizationId, function (err, organization) {
          if (err) {
            http.log(req, 'Internal error: edit setting (in organization)', err);
            http.response(res, 500, {}, "-1", err);
          } else if (organization) {
            var modelItem;
            if (data.itemId != undefined && data.itemId != data.organizationId) {
              organization.findDeepAttributeById(data.itemId, function (element) {
                if (element != undefined) {
                  modelItem = new Setting(parseData(element.setting, data));
                  modelItem.update = {user: user._id, date: new Date()};
                  element.setting = modelItem;
                } else {
                  http.log(req, 'Error: setting not found in organization (data.itemId = ' + data.itemId + ').');
                  http.response(res, 404, {}, "-11");
                }
              });
            } else {
              modelItem = parseData(organization.setting, data);
              modelItem.update = {user: user._id, date: new Date()};
              organization.setting = modelItem;
            }

            organization.save(function (err, newOrganization) {
              if (err) {
                http.log(req, 'Internal error: edit setting (in organization) -> save organization', err);
                http.response(res, 500, {}, "-1", err);
              } else {
                newOrganization.populate('creation.user', function (err, newOrg) {
                  http.response(res, 200, {organization: newOrg, setting: modelItem}, "10");
                });
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

  function parseData(object, data) {
    var result = object || {};

    if (typeof data.contributorPrice != 'undefined') {
      result.project_dev = result.project_dev || {};
      result.project_dev.contributor_price = data.contributorPrice;
    }
    if (typeof data.contributorOccupation != 'undefined') {
      result.project_dev = result.project_dev || {};
      result.project_dev.contributor_occupation = data.contributorOccupation;
    }
    if (typeof data.scrummasterPrice != 'undefined') {
      result.project_management = result.project_management || {};
      result.project_management.scrummaster_price = data.scrummasterPrice;
    }
    if (typeof data.scrummasterOccupation != 'undefined') {
      result.project_management = result.project_management || {};
      result.project_management.scrummaster_occupation = data.scrummasterOccupation;
    }
    if (typeof data.showDev != 'undefined') {
      result.billing = result.billing || {};
      result.billing.show_dev_price = data.showDev;
    }
    if (typeof data.rateMultiplier != 'undefined') {
      result.billing = result.billing || {};
      result.billing.rate_multiplier = data.rateMultiplier;
    }
    if (typeof data.showManagement != 'undefined') {
      result.billing = result.billing || {};
      result.billing.show_management_price = data.showManagement;
    }
    if (typeof data.estimateType != 'undefined') {
      result.unit = result.unit || {};
      result.unit.estimate_type = data.estimateType;
    }
    if (typeof data.rangeEstimateUnit != 'undefined') {
      result.unit = result.unit || {};
      result.unit.range_estimate_unit = data.rangeEstimateUnit;
    }
    if (typeof data.label != 'undefined') {
      result.unit = result.unit || {};
      result.unit.label = data.label == "" ? null : data.label;
    }
    if (typeof data.showDate != 'undefined') {
      result.date = result.date || {};
      result.date.show = data.showDate;
    }
    if (typeof data.contributorAvailable != 'undefined') {
      result.iteration = result.iteration || {};
      result.iteration.contributor_available = data.contributorAvailable;
    }
    if (typeof data.hourPerDay != 'undefined') {
      result.iteration = result.iteration || {};
      result.iteration.hour_per_day = data.hourPerDay;
    }
    if (typeof data.dayPerWeek != 'undefined') {
      result.iteration = result.iteration || {};
      result.iteration.day_per_week = data.dayPerWeek;
    }
    if (typeof data.weekPerIteration != 'undefined') {
      result.iteration = result.iteration || {};
      result.iteration.week_per_iteration = data.weekPerIteration;
    }

    return result;
  }
};
