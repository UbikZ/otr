'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: {type: String, trim: true, require: true},
  ontime_id: {type: Number, index: true},
  estimate: {
    duration_minutes: {type: Number, min: 0},
    otr_low: {type: Number, min: 0},
    otr_high: {type: Number, min: 0},
    otr_isEstimated: Boolean,
  },
});

module.exports = mongoose.model('Entry', schema);