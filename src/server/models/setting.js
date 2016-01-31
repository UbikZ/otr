'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: {type: Number, index: true},
  update: {
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now},
  },
  projectDev: {
    contributorPrice: {type: Number, min: 0},
    contributorOccupation: {type: Number, min: 0, max: 100},
  },
  projectManagement: {
    scrummasterPrice: {type: Number, min: 0},
    scrummasterOccupation: {type: Number, min: 0, max: 100},
  },
  billing: {
    showDevPrice: Boolean,
    showManagementPrice: Boolean,
    rateMultiplier: {type: Number, min: 0},
  },
  unit: {
    estimateType: {type: String, enum: ['final', 'range']},
    rangeEstimateUnit: {type: String, enum: ['minute', 'hour', 'day']},
    label: {type: String, trim: true},
  },
  date: {
    show: Boolean,
    startDate: {type: Date, default: Date.now},
  },
  iteration: {
    contributorAvailable: {type: Number, min: 0},
    hourPerDay: {type: Number, min: 0},
    dayPerWeek: {type: Number, min: 0},
    weekPerIteration: {type: Number, min: 0},
  }
});

module.exports = mongoose.model('Setting', schema);
