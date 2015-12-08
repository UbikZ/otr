'use strict';

var mongoose = require('mongoose');

module.exports = (function() {
  var schema = new mongoose.Schema({
    id: String,
    identity: {
      user_id: String,
    },
    name: {
      userName: String,
      firstName: String,
      lastName: String
    },
    info: {
      job: String,
      email: String,
      description: String,
    },
  });

  schema.statics.findOrCreate = function (profile, cb) {
    var model = this;

    model.find({"identity.user_id": profile.user_id}).exec(function (err, results) {
      if (results.length === 0) {
        model.create({
          "identity.user_id": profile.user_id,
          "name.userName": profile.nickname,
          "info.email": profile.email,
        }, cb);
      } else {
        cb(err, results[0]);
      }
    });
  };

  schema.statics.findByIdAndUpdate = function(profile, cb) {
    var model = this;

    model.findById(profile.id, function (err, user) {
      if (err) {
        cb(err);
      } else {
        if (profile.userName) {
          user.name.userName = profile.userName;
        }
        if (profile.firstName) {
          user.name.firstName = profile.firstName;
        }
        if (profile.lastName) {
          user.name.lastName = profile.lastName;
        }
        user.save(cb);
      }
    });
  };

  return mongoose.model('User', schema);
})();