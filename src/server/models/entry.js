'use strict';

var mongoose = require('mongoose');

var Entry = new mongoose.Schema();
Entry.add({
  name: {type: String, trim: true, require: true},
  ontime_id: {type: Number, index: true},
  path: [{type: String, trim: true}],
  size: {type: Number, min: 0},
  description: {type: String, trim: true},
  notes: {type: String, trim: true},
  estimate: {
    duration_minutes: {type: Number, min: 0},
    otr_low: {type: Number, min: 0},
    otr_high: {type: Number, min: 0},
    otr_isEstimated: Boolean,
  },
  children: [Entry],
});

module.exports = mongoose.model('Entry', Entry);