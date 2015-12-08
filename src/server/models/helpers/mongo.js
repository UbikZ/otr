'use strict';

var mongoose = require('mongoose');

module.exports = {
  getObjectId: function(id) {
    var ObjectId = mongoose.Types.ObjectId;

    return new ObjectId(id);
  }
};