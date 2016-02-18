'use strict';

const mongoose = require('mongoose');

const Entry = new mongoose.Schema();
Entry.add({
  name: { type: String, trim: true, require: true },
  ontimeId: { type: Number, index: true },
  path: [{ type: String, trim: true }],
  size: { type: Number, min: 0 },
  description: { type: String, trim: true },
  notes: { type: String, trim: true },
  estimate: {
    durationMinutes: { type: Number, min: 0 },
    otrLow: { type: Number, min: 0 },
    otrHigh: { type: Number, min: 0 },
    otrIsEstimated: Boolean,
  },
  children: [Entry],
});

module.exports = mongoose.model('Entry', Entry);