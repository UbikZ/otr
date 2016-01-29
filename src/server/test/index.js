'use strict';

var should = require('chai').should();
var mongoose = require('mongoose');
var config = require('../../../config');
var request = require('supertest');

var app = require('../../../app');

if (process.env.NODE_ENV !== 'staging') {
  process.exit(1);
}

describe('> Application', function () {
  var agent = request.agent(app);
  var url = '/api/v' + config.api.version;

  //
  it('# should exist', function (done) {
    should.exist(app);
    done();
  });

  ['init', 'auth', 'user', 'org', 'ot', 'item', 'setting'].forEach(function (spec) {
    require('./scenarios/'.concat(spec, '.specs'))(agent, url, config);
  });

  //
  after('# should drop database', function (done) {
    mongoose.connection.db.dropDatabase(function (err) {
      if (err) {
        throw err;
      }
      done();
    });
  });
});