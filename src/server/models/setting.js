'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  project_dev: {
    contributor_price: {type: Number, min: 0},
    contributor_occupation: {type: Number, min: 0, max: 100},
  },
  project_management: {
    scrummaster_price: {type: Number, min: 0},
    scrummaster_occupation: {type: Number, min: 0, max: 100},
  },
  billing: {
    show: Boolean,
    show_dev_price: Boolean,
    show_management_price: Boolean,
    rate_multiplier: {type: Number, min: 0},
    final_estimate: Boolean,
  },
  unit: {
    label: String,
    type: {type: Number, min: 0, max: 2}, // 0: minutes | 1: hours | 2: days
  },
  date: {
    show: Boolean,
    format: String,
    start_date: {type: Date, default: Date.now},
  },
  iteration: {
    contributor_available: {type: Number, min: 0},
    hour_per_day: {type: Number, min: 0},
    day_per_week: {type: Number, min: 0},
    week_per_iteration: {type: Number, min: 0},
  }
});

module.exports = mongoose.model('Setting', schema);
