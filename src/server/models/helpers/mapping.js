'use strict';

function settingDtoToDal(object, data) {
  var result = object || {};

  if (data != undefined) {
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
  }

  return result;
}

module.exports = {
  settingDtoToDal: settingDtoToDal,
}