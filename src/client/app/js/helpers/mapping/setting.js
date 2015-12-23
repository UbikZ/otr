'use strict';

function check(item, cb) {
  if (item != undefined) {
    cb(item);
  }
}

// Overkill callbacks
function dalToDTO(item) {
  var result = {};

  check(item, function(setting) {
    result.id = setting.id;

    check(setting.project_dev, function(project_dev) {
      check(project_dev.contributor_price, function(contributor_price) {
        result.contributorPrice = contributor_price;
      });
      check(project_dev.contributor_occupation, function(contributor_occupation) {
        result.contributorOccupation = contributor_occupation;
      });
    });
    check(setting.project_management, function(project_management) {
      check(project_management.scrummaster_price, function(scrummaster_price) {
        result.scrummasterPrice = scrummaster_price;
      });
      check(project_management.scrummaster_occupation, function(scrummaster_occupation) {
        result.scrummasterOccupation = scrummaster_occupation;
      });
    });
    check(setting.billing, function(billing) {
      check(billing.rate_multiplier, function(rate_multiplier) {
        result.rateMultiplier = rate_multiplier;
      });
      check(billing.show_dev_price, function(show_dev_price) {
        result.showDev = show_dev_price;
      });
      check(billing.show_management_price, function(show_management_price) {
        result.showManagement = show_management_price;
      });
    });
    check(setting.unit, function(unit) {
      check(unit.estimate_type, function(estimate_type) {
        result.estimateType = estimate_type;
      });
      check(unit.range_estimate_unit, function(range_estimate_unit) {
        result.rangeEstimateUnit = range_estimate_unit;
      });
      check(unit.label, function(label) {
        result.label = label;
      });
    });
    check(setting.date, function(date) {
      check(date.show, function(show) {
        result.showDate = show;
      });
    });
    check(setting.iteration, function(iteration) {
      check(iteration.contributor_available, function(contributor_available) {
        result.contributorAvailable = contributor_available;
      });
      check(iteration.hour_per_day, function(hour_per_day) {
        result.hourPerDay = hour_per_day;
      });
      check(iteration.day_per_week, function(day_per_week) {
        result.dayPerWeek = day_per_week;
      });
      check(iteration.week_per_iteration, function(week_per_iteration) {
        result.weekPerIteration = week_per_iteration;
      });
    });
  });

  return result;
}

module.exports = {
  dalToDTO: dalToDTO,
};