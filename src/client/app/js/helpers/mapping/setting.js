'use strict';

function dalToDTO(setting) {
  var result = {id: setting.id};

  if (setting.project_dev != undefined) {
    result.contributorPrice = setting.project_dev.contributor_price;
    result.contributorOccupation = setting.project_dev.contributor_occupation;
  }
  if (setting.project_management != undefined) {
    result.scrummasterPrice = setting.project_management.scrummaster_price;
    result.scrummasterOccupation = setting.project_management.scrummaster_occupation;
  }
  if (setting.billing != undefined) {
    result.rateMultiplier = setting.billing.rate_multiplier;
    result.showDev = setting.billing.show_dev_price;
    result.showManagement = setting.billing.show_management_price;
  }
  if (setting.unit != undefined) {
    result.estimateType = setting.unit.estimate_type;
    result.rangeEstimateUnit = setting.unit.range_estimate_unit;
    result.label = setting.unit.label;
  }
  if (setting.date != undefined) {
    result.showDate = setting.date.show;
  }
  if (setting.iteration != undefined) {
    result.contributorAvailable = setting.iteration.contributor_available;
    result.hourPerDay = setting.iteration.hour_per_day;
    result.dayPerWeek = setting.iteration.day_per_week;
    result.weekPerIteration = setting.iteration.week_per_iteration;
  }

  return result;
}

module.exports = {
  dalToDTO: dalToDTO,
};