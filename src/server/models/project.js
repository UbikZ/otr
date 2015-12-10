'use strict';

var mongoose = require('mongoose');

module.exports = (function(){
  var schema = new mongoose.Schema({
    name: String,
    priority: { type: Number, min: 0, max: 2 },
    creation: {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      date: Date
    },
    update: {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      date: {type: Date, default: Date.now },
    },
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}],
    settings: {type: mongoose.Schema.Types.ObjectId, ref: 'Setting'}
  });

  return mongoose.model('Project', schema);
})();