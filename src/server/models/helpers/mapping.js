'use strict';

function settingDtoToDal(object, data) {
  var result = object || {};

  if (data !== undefined) {
    if (typeof data.contributorPrice !== 'undefined') {
      result.projectDev = result.projectDev || {};
      result.projectDev.contributorPrice = data.contributorPrice;
    }
    if (typeof data.contributorOccupation !== 'undefined') {
      result.projectDev = result.projectDev || {};
      result.projectDev.contributorOccupation = data.contributorOccupation;
    }
    if (typeof data.scrummasterPrice !== 'undefined') {
      result.projectManagement = result.projectManagement || {};
      result.projectManagement.scrummasterPrice = data.scrummasterPrice;
    }
    if (typeof data.scrummasterOccupation !== 'undefined') {
      result.projectManagement = result.projectManagement || {};
      result.projectManagement.scrummasterOccupation = data.scrummasterOccupation;
    }
    if (typeof data.showDev !== 'undefined') {
      result.billing = result.billing || {};
      result.billing.showDevPrice = data.showDev;
    }
    if (typeof data.rateMultiplier !== 'undefined') {
      result.billing = result.billing || {};
      result.billing.rateMultiplier = data.rateMultiplier;
    }
    if (typeof data.showManagement !== 'undefined') {
      result.billing = result.billing || {};
      result.billing.showManagementPrice = data.showManagement;
    }
    if (typeof data.estimateType !== 'undefined') {
      result.unit = result.unit || {};
      result.unit.estimateType = data.estimateType;
    }
    if (typeof data.rangeEstimateUnit !== 'undefined') {
      result.unit = result.unit || {};
      result.unit.rangeEstimateUnit = data.rangeEstimateUnit;
    }
    if (typeof data.label !== 'undefined') {
      result.unit = result.unit || {};
      result.unit.label = data.label === '' ? null : data.label;
    }
    if (typeof data.showDate !== 'undefined') {
      result.date = result.date || {};
      result.date.show = data.showDate;
    }
    if (typeof data.contributorAvailable !== 'undefined') {
      result.iteration = result.iteration || {};
      result.iteration.contributorAvailable = data.contributorAvailable;
    }
    if (typeof data.hourPerDay !== 'undefined') {
      result.iteration = result.iteration || {};
      result.iteration.hourPerDay = data.hourPerDay;
    }
    if (typeof data.dayPerWeek !== 'undefined') {
      result.iteration = result.iteration || {};
      result.iteration.dayPerWeek = data.dayPerWeek;
    }
    if (typeof data.weekPerIteration !== 'undefined') {
      result.iteration = result.iteration || {};
      result.iteration.weekPerIteration = data.weekPerIteration;
    }
  }

  return result;
}

module.exports = {
  settingDtoToDal: settingDtoToDal,
};