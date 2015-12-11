'use strict';

var mongoose = require('mongoose');
var Setting = require('./setting');

module.exports = (function(){
  var schema = new mongoose.Schema({
    name: String,
    description: String,
    priority: { type: Number, min: 0, max: 2 },
    creation: {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      date: Date
    },
    update: {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      date: {type: Date, default: Date.now },
    },
    // todo: add properties
    settings: Setting,
  });

  return mongoose.model('Document', schema);
})();