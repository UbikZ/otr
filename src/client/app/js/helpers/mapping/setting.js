'use strict';

function check(item) {
  if (item !== undefined) {
    return item;
  }
}

// Overkill callbacks
function dalToDTO(item) {
  var result = {};

  check(item, function(setting) {
    result._id = setting._id;

    check(setting.projectDev, function(projectDev) {
      check(projectDev.contributorPrice, function(contributorPrice) {
        result.contributorPrice = contributorPrice;
      });
      check(projectDev.contributorOccupation, function(contributorOccupation) {
        result.contributorOccupation = contributorOccupation;
      });
    });
    check(setting.projectManagement, function(projectManagement) {
      check(projectManagement.scrummasterPrice, function(scrummasterPrice) {
        result.scrummasterPrice = scrummasterPrice;
      });
      check(projectManagement.scrummasterOccupation, function(scrummasterOccupation) {
        result.scrummasterOccupation = scrummasterOccupation;
      });
    });
    check(setting.billing, function(billing) {
      check(billing.rateMultiplier, function(rateMultiplier) {
        result.rateMultiplier = rateMultiplier;
      });
      check(billing.showDevPrice, function(showDevPrice) {
        result.showDev = showDevPrice;
      });
      check(billing.showManagementPrice, function(showManagementPrice) {
        result.showManagement = showManagementPrice;
      });
    });
    check(setting.unit, function(unit) {
      check(unit.estimateType, function(estimateType) {
        result.estimateType = estimateType;
      });
      check(unit.rangeEstimateUnit, function(rangeEstimateUnit) {
        result.rangeEstimateUnit = rangeEstimateUnit;
      });
      check(unit.label, function(label) {
        if (label !== '') {
          result.label = label;
        }
      });
    });
    check(setting.date, function(date) {
      check(date.show, function(show) {
        result.showDate = show;
      });
    });
    check(setting.iteration, function(iteration) {
      check(iteration.contributorAvailable, function(contributorAvailable) {
        result.contributorAvailable = contributorAvailable;
      });
      check(iteration.hourPerDay, function(hourPerDay) {
        result.hourPerDay = hourPerDay;
      });
      check(iteration.dayPerWeek, function(dayPerWeek) {
        result.dayPerWeek = dayPerWeek;
      });
      check(iteration.weekPerIteration, function(weekPerIteration) {
        result.weekPerIteration = weekPerIteration;
      });
    });
  });

  return result;
}

module.exports = {
  dalToDTO: dalToDTO,
};