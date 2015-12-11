'use strict';

var mongoose = require('mongoose');
var Project = require('./project');
var Setting = require('./setting');

module.exports = (function(){
  var schema = new mongoose.Schema({
    name: String,
    description: String,
    active: Boolean,
    url: String,
    logo: String,
    creation: {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      date: {type: Date, default: Date.now },
    },
    update: {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      date: {type: Date, default: Date.now },
    },
    projects: [Project],
    settings: Setting,
  });

  schema.index({name: 1}, {unique: true});

  return mongoose.model('Organization', schema);
})();