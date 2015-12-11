'use strict';

var mongoose = require('mongoose');

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
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}],
    documents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Document'}],
    settings: {type: mongoose.Schema.Types.ObjectId, ref: 'Setting'}
  });

  return mongoose.model('Project', schema);
})();