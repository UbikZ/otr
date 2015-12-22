'use strict';

function dalToDTO(setting) {
  return {
    id: setting.id,
    contributorPrice: setting.project_dev.contributor_price,
    contributorOccupation: setting.project_dev.contributor_occupation,
    scrummasterPrice: setting.project_management.scrummaster_price,
    scrummasterOccupation: setting.project_management.scrummaster_occupation,
    rateMultiplier: setting.billing.rate_multiplier,
    showDev: setting.billing.show_dev_price,
    showManagement: setting.billing.show_management_price,
    estimateType: setting.unit.estimate_type,
    rangeEstimateUnit: setting.unit.range_estimate_unit,
    label: setting.unit.label,
    showDate: setting.date.show,
    contributorAvailable: setting.iteration.contributor_available,
    hourPerDay: setting.iteration.hour_per_day,
    dayPerWeek: setting.iteration.day_per_week,
    weekPerIteration: setting.iteration.week_per_iteration,
  };
}

module.exports = {
  dalToDTO: dalToDTO,
};