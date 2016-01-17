'use strict';

var request = require('supertest');
var mongoose = require('mongoose');
var should = require('chai').should();
var assert = require('chai').assert;
var config = require('../config');
var moment = require('moment');
var ontimeRequester = require('../src/server/controllers/helpers/ontime');

// Generic mock method
function invalidOntimeAPIResponse(token, cb) {
  cb(JSON.stringify(require('./fixtures/ontime/ko')));
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
          ontimeRequester.requestToken = function (authObject, cb) {
            cb(JSON.stringify({}));
          };
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
          var sentData = {username: 'test_stage', password: 'test_stage'};
          var expectedData = require('./fixtures/auth/signup');
          ontimeRequester.requestToken = function (authObject, cb) {
            expectedData.access_token += 'delta';
            cb(JSON.stringify(expectedData));
          };
          agent
            .post(url + '/sign-up')
            .send(sentData)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
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

        it('should update organization', function (done) {
          var sentData = require('./fixtures/organization/update');
          sentData._id = organizationId;
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
              assert.strictEqual(result.messageCode, "6");
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
              done();
            });
        });
      });

      describe('# [GET] ' + url + '/organization', function () {
        it('should request list of all organizations (without lazy loading)', function (done) {
          agent
            .get(url + '/organization?')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.isArray(result.organizations);
              assert.strictEqual(result.organizations.length, 1);
              assert.isArray(result.organizations[0].projects);
              done();
            });
        });

        it('should request list of all organizations (with lazy loading)', function (done) {
          agent
            .get(url + '/organization?lazy=1')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.isArray(result.organizations);
              assert.strictEqual(result.organizations.length, 1);
              assert.isUndefined(result.organizations[0].projects);
              done();
            });
        });
      });

      describe('# [DELETE] ' + url + '/organization/delete', function () {
        it('should delete one organization', function (done) {
          agent
            .post(url + '/organization/delete')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 200);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, "7");
              done();
            });
        });
      });
    });

    describe('> Ontime API', function () {
      describe('# [POST] Request token generic error', function () {
        it('should get an error for request token', function (done) {
          ontimeRequester.requestToken = invalidOntimeAPIResponse;
          agent
            .post(url + '/sign-up')
            .send({})
            .expect(403)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 403);
              assert.isDefined(result.error);
              assert.strictEqual(result.messageCode, "-3");
              done();
            });
        });
      });

      describe('# [GET] ' + url + '/ontime/me', function () {
        it('should get an error with token', function (done) {
          ontimeRequester.me = invalidOntimeAPIResponse;
          agent
            .get(url + '/ontime/me')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(403)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 403);
              assert.isDefined(result.error);
              assert.strictEqual(result.messageCode, "-3");
              done();
            });
        });

        it('should get ontime user information', function (done) {
          var expectedData = require('./fixtures/ontime/me');
          ontimeRequester.me = function(token, cb) {
            cb(JSON.stringify(expectedData));
          };
          agent
            .get(url + '/ontime/me')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 200);
              assert.isUndefined(result.error);
              assert.isUndefined(result.messageCode);
              assert.isDefined(result.ontime_user);
              ['id', 'login_id', 'is_active', 'is_locked', 'last_login_date_time', 'created_date_time',
                'culture_info', 'first_name', 'last_name', 'email', 'is_admin']
                .forEach(function (item) {
                  assert.strictEqual(result.ontime_user[item], expectedData.data[item]);
                });
              done();
            });
        });
      });

      describe('# [GET] ' + url + '/ontime/tree', function () {
        it('should get an error with token', function (done) {
          ontimeRequester.tree = invalidOntimeAPIResponse;
          agent
            .get(url + '/ontime/tree')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(403)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 403);
              assert.isDefined(result.error);
              assert.strictEqual(result.messageCode, "-3");
              done();
            });
        });

        it('should get ontime tree items', function (done) {
          var expectedData = require('./fixtures/ontime/tree');
          ontimeRequester.tree = function(token, cb) {
            cb(JSON.stringify(expectedData));
          };
          agent
            .get(url + '/ontime/tree')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              var result = res.body;
              assert.strictEqual(result.code, 200);
              assert.isUndefined(result.error);
              assert.isUndefined(result.messageCode);
              assert.isArray(result.tree);
              assert.strictEqual(result.tree[0].id, expectedData.data[0].id);
              assert.strictEqual(result.tree[0].name, expectedData.data[0].name);
              assert.isArray(result.tree[2].children);
              assert.strictEqual(result.tree[2].children[0].id, expectedData.data[2].children[0].id);
              assert.strictEqual(result.tree[2].children[0].name, expectedData.data[2].children[0].name);
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

