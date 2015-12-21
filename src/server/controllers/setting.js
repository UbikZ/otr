'use strict';

var Setting = require('../models/setting');
var http = require('./helpers/http');
var jwt = require("jsonwebtoken");
var merge = require('merge');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/setting';

  /*
   * Get setting (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    var data = req.body;
    http.checkAuthorized(req, res, function() {
      var criteria = {};
      if (data.id) {
        criteria.id = data.id;
      }
      Setting.find(criteria, function (err, settings) {
        if (err) {
          http.response(res, 500, "An error occurred.", err);
        } else if (settings) {
          http.response(res, 200, {setting: settings[0]});
        } else {
          http.response(res, 404, {}, "User not found.", err);
        }
      });
    });
  });

  /*
   * Update user
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
          http.response(res, 500, "An error occurred.", err);
        } else if (setting) {
          setting = parseData(setting, data);
          setting.update = {user: user._id, date: new Date()};

          setting.save(function (err, newSetting) {
            if (err) {
              http.response(res, 500, {}, "An error occurred.", err);
            } else {
              http.response(res, 200, {setting: newSetting});
            }
          });
        } else {
          var newSetting = new Setting(parseData(undefined, data));
          newSetting.id = 42; // We force ONLY ONE setting on the collection
          newSetting.save(function (err, setting) {
            if (err) {
              http.response(res, 500, {}, "An error occurred.", err);
            } else {
              http.response(res, 200, {setting: setting});
            }
          })
        }
      });
    });
  });

  function parseData(object, data) {
    var result = object || {};
    
    if (data.contributorPrice != undefined) {
      result.project_dev = result.project_dev || {};
      result.project_dev.contributor_price = data.contributorPrice;
    }
    if (data.contributorOccupation != undefined) {
      result.project_dev = result.project_dev || {};
      result.project_dev.contributor_occupation = data.contributorOccupation;
    }
    if (data.scrummasterPrice != undefined) {
      result.project_management = result.project_management || {};
      result.project_management.scrummaster_price = data.scrummasterPrice;
    }
    if (data.scrummasterOccupation != undefined) {
      result.project_management = result.project_management || {};
      result.project_management.scrummaster_occupation = data.scrummasterOccupation;
    }
    if (data.showDev != undefined) {
      result.billing = result.billing || {};
      result.billing.show_dev_price = data.showDev;
    }
    if (data.rateMultiplier != undefined) {
      result.billing = result.billing || {};
      result.billing.rate_multiplier = data.rateMultiplier;
    }
    if (data.showManagement != undefined) {
      result.billing = result.billing || {};
      result.billing.show_management_price = data.showManagement;
    }
    if (data.estimateType != undefined) {
      result.unit = result.unit || {};
      result.unit.estimate_type = data.estimateType;
    }
    if (data.rangeEstimateUnit != undefined) {
      result.unit = result.unit || {};
      result.unit.range_estimate_unit = data.rangeEstimateUnit;
    }
    if (data.label != undefined) {
      result.unit = result.unit || {};
      result.unit.label = data.label;
    }
    if (data.showDate != undefined) {
      result.date = result.date || {};
      result.date.show = data.showDate;
    }
    if (data.contributorAvailable != undefined) {
      result.iteration = result.iteration || {};
      result.iteration.contributor_available = data.contributorAvailable;
    }
    if (data.hourPerDay != undefined) {
      result.iteration = result.iteration || {};
      result.iteration.hour_per_day = data.hourPerDay;
    }
    if (data.dayPerWeek != undefined) {
      result.iteration = result.iteration || {};
      result.iteration.day_per_week = data.dayPerWeek;
    }
    if (data.weekPerIteration != undefined) {
      result.iteration = result.iteration || {};
      result.iteration.week_per_iteration = data.weekPerIteration;
    }

    return result;
  }
};
