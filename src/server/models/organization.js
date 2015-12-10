'use strict';

var mongoose = require('mongoose');

module.exports = (function(){
  var schema = new mongoose.Schema({
    name: String,
    description: String,
    active: Boolean,
    logo: String,
    creation: {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      date: {type: Date, default: Date.now },
    },
    update: {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      date: {type: Date, default: Date.now },
    },
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}],
    settings: {type: mongoose.Schema.Types.ObjectId, ref: 'Setting'}
  });

  schema.index({name: 1}, {unique: true});

  return mongoose.model('Organization', schema);
})();