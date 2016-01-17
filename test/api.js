'use strict';

var request = require('supertest');
var mongoose = require('mongoose');
var should = require('chai').should();
var assert = require('chai').assert;
var config = require('../config');
var moment = require('moment');
var ontimeRequester = require('../src/server/controllers/helpers/ontime');

// Mock external API
function invalidRequestToken(authObject, cb) {
  cb(JSON.stringify({}));
}

function validRequestToken(authObject, cb) {
  var data = require('./fixtures/auth/signup');
  data.access_token += 'delta';
  cb(JSON.stringify(data));
}

// Start tests
module.exports = function (app) {
  var agent = request.agent(app);
  var url = '/api/v' + config.api.version;

  var tokenBearer, tokenOtBearer;

  describe('> Application', function () {
    it('# should exist', function (done) {
      should.exist(app);
      done();
    });

    describe('> Init API', function () {
      describe('# [GET] /', function () {
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

      describe('# [GET] ' + url + '/user (examples) without Bearer Token', function () {
        it('returns a 403 (Not Allowed) error', function (done) {
          agent
            .get(url + '/user')
            .expect(403)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 403);
              assert.strictEqual(result.messageCode, "-3");
              done();
            });
        });
      });
    });

    describe('> Authentication API', function () {
      describe('# [POST] ' + url + '/sign-up', function () {
        it('should error on sign-up for bad user data', function (done) {
          ontimeRequester.requestToken = invalidRequestToken;
          agent
            .post(url + '/sign-up')
            .send({})
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 500);
              assert.strictEqual(result.messageCode, "-1");
              done();
            });
        });

        it('should sign-up new user the first time', function (done) {
          ontimeRequester.requestToken = validRequestToken;
          var sentData = {username: 'test_stage', password: 'test_stage'};
          agent
            .post(url + '/sign-up')
            .send(sentData)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body, expectedData = require('./fixtures/auth/signup');
              assert.strictEqual(result.code, 200);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, "1");
              assert.isDefined(result.user);
              assert.strictEqual(result.user.info.email, expectedData.data.email);
              assert.strictEqual(result.user.name.firstname, expectedData.data.first_name);
              assert.strictEqual(result.user.name.lastname, expectedData.data.last_name);
              assert.strictEqual(result.user.name.username, sentData.username);
              assert.strictEqual(result.user.identity.ontime_token, expectedData.access_token);
              assert.isDefined(result.user.identity.token);
              tokenOtBearer = result.user.identity.ontime_token;
              done();
            });
        });

        it('should sign-up same user the others times', function (done) {
          var sentData = {username: 'test_stage', password: 'test_stage'};
          agent
            .post(url + '/sign-up')
            .send(sentData)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body, expectedData = require('./fixtures/auth/signup');
              assert.strictEqual(result.code, 200);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, "1");
              assert.isDefined(result.user);
              assert.strictEqual(result.user.info.email, expectedData.data.email);
              assert.strictEqual(result.user.name.firstname, expectedData.data.first_name);
              assert.strictEqual(result.user.name.lastname, expectedData.data.last_name);
              assert.strictEqual(result.user.name.username, sentData.username);
              assert.strictEqual(result.user.identity.ontime_token, expectedData.access_token);
              assert.isDefined(result.user.identity.token);
              assert.notEqual(tokenOtBearer, result.user.identity.ontime_token);
              // We set tokens for next tests
              tokenOtBearer = result.user.identity.ontime_token;
              tokenBearer = result.user.identity.token;
              done();
            });
        });
      });

      describe('# [GET] ' + url + '/me', function () {
        it('should get error on request information for logged user (bad token)', function (done) {
          agent
            .get(url + '/me')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body, expectedData = require('./fixtures/auth/signup');
              assert.strictEqual(result.code, 200);
              assert.isUndefined(result.error);
              assert.isUndefined(result.messageCode);
              assert.isDefined(result.user);
              assert.strictEqual(result.user.info.email, expectedData.data.email);
              assert.strictEqual(result.user.name.firstname, expectedData.data.first_name);
              assert.strictEqual(result.user.name.lastname, expectedData.data.last_name);
              assert.isDefined(result.user.name.username);
              assert.strictEqual(result.user.identity.ontime_token, tokenOtBearer);
              assert.strictEqual(result.user.identity.token, tokenBearer);
              done();
            });
        });

        it('should request information for logged user', function (done) {
          agent
            .get(url + '/me')
            .set('Authorization', 'Bearer bad_token ' + tokenOtBearer)
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 404);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, "-3");
              done();
            });
        });
      });
    });

    describe('> User API', function () {
      describe('# [GET] ' + url + '/user', function () {
        it('should request list of all users', function (done) {
          agent
            .get(url + '/user')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.isArray(result.users);
              assert.strictEqual(result.users.length, 1);
              done();
            });
        });
      });

      describe('# [POST] ' + url + '/user/update', function () {
        it('should update current user', function (done) {
          var sentData = require('./fixtures/user/update');
          agent
            .post(url + '/user/update')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .send(sentData)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 200);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, "11");
              assert.isDefined(result.user);
              assert.strictEqual(result.user.name.firstname, sentData.firstname);
              assert.strictEqual(result.user.name.lastname, sentData.lastname);
              assert.strictEqual(result.user.info.skype, sentData.skype);
              assert.strictEqual(result.user.info.job, sentData.job);
              done();
            });
        });
      });
    });

    describe('> Organization API', function () {
      var organizationId;
      describe('# [POST] ' + url + '/organization/edit', function () {
        it('should create new organization', function (done) {
          var sentData = require('./fixtures/organization/create');
          agent
            .post(url + '/organization/edit')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .send(sentData)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 200);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, "5");
              assert.isDefined(result.organization);
              assert.strictEqual(result.organization.name, sentData.name);
              assert.strictEqual(result.organization.description, sentData.description);
              assert.strictEqual(result.organization.active, sentData.active);
              assert.strictEqual(result.organization.logo, sentData.logo);
              assert.strictEqual(result.organization.url, sentData.url);
              assert.isDefined(result.organization.creation);
              assert.isDefined(result.organization.creation.user);
              assert.isDefined(result.organization.update);
              assert.isDefined(result.organization.update.user);
              organizationId = result.organization._id;
              done();
            });
        });
      });

      describe('# [GET] ' + url + '/organization', function () {
        it('should request list of all organizations (not lazy)', function (done) {
          agent
            .get(url + '/user')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.isArray(result.users);
              assert.strictEqual(result.users.length, 1);
              done();
            });
        });
      });
    });


    after('# should drop database', function (done) {
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

