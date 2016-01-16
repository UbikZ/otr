'use strict';

var request = require('supertest');
var mongoose = require('mongoose');
var should = require('chai').should();
var assert = require('chai').assert;
var config = require('../config.json');
var ontimeRequester = require('../src/server/controllers/helpers/ontime');

// Mock external API
ontimeRequester.requestToken = function (authObject, cb) {
  cb(JSON.stringify(require('./fixtures/ot_signup.json')));
};

// Start tests
module.exports = function (app) {
  var agent = request.agent(app);
  var url = '/api/v' + config.api.version;

  describe('> Application - ', function () {
    it('   # should exist', function (done) {
      should.exist(app);
      done();
    });

    describe('> Index - ', function () {
      describe('   # [GET] /', function () {
        it('returns index.html', function (done) {
          agent
            .get('/')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=UTF-8')
            .end(function (err, res) {
              if (err) return done(err);
              res.text.should.be.a('string');
              done();
            });
        });
      });
    });

    describe('> Authentication - ', function () {
      describe('   # [POST] ' + url + '/sign-up', function () {
        it('when create new user', function (done) {
          var sentData = {username: 'test_stage', password: 'test_stage'};
          agent
            .post(url + '/sign-up')
            .send(sentData)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body, expectedData = require('./fixtures/ot_signup.json');
              assert.strictEqual(result.code, 200);
              assert.strictEqual(result.error, undefined);
              assert.strictEqual(result.messageCode, "1");
              assert.isDefined(result.user);
              assert.strictEqual(result.user.info.email, expectedData.data.email);
              assert.strictEqual(result.user.name.firstname, expectedData.data.first_name);
              assert.strictEqual(result.user.name.lastname, expectedData.data.last_name);
              assert.strictEqual(result.user.name.username, sentData.username);
              assert.strictEqual(result.user.identity.ontime_token, expectedData.access_token);
              assert.isDefined(result.user.identity.token);
              done();
            });
        });
      });
    });

    after('   # should drop database', function (done) {
      if (process.env.NODE_ENV == 'staging') {
        mongoose.connection.db.dropDatabase(function (err) {
          if (err) throw err;
          done();
        });
      } else {
        done();
      }
    });
  });
};

