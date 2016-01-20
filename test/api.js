'use strict';

var request = require('supertest');
var mongoose = require('mongoose');
var should = require('chai').should();
var assert = require('chai').assert;
var config = require('../config');
var moment = require('moment');
var fs = require('fs');
var OrganizationModel = require('../src/server/models/organization');
var ontimeRequester = require('../src/server/controllers/helpers/ontime');
var sinon = require('sinon');

// Generic mocks methods
function invalidOntimeAPIResponse() {
  var cb;
  if (typeof (arguments[1]) == 'function') {
    cb = arguments[1];
  } else if (typeof (arguments[2]) == 'function') {
    cb = arguments[2];
  }
  cb(JSON.stringify(require('./fixtures/ontime/ko')));
}

function internalErrorOntimeAPIResponse() {
  var cb;
  if (typeof (arguments[1]) == 'function') {
    cb = arguments[1];
  } else if (typeof (arguments[2]) == 'function') {
    cb = arguments[2];
  }
  cb(JSON.stringify({}));
}

// Mock Stub
function mock(object, method, returns, callback) {
  callback(sinon.stub(object, method).returns(returns));
}

function mockModel(model, method, callback, empty) {
  mock(model, method, {
    populate: function () {
      return this;
    },
    lean: function () {
      return this;
    },
    exec: function (cb) {
      cb(empty == true ? null : {error: 'error'});
    },
  }, callback);
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

        describe('# [GET] /dist/*.gz', function () {
          var path = config.path.public + '/dist';
          var staticFiles = [];

          it ('check public/dist exists', function (done) {
            assert.isTrue(fs.existsSync(path));
            staticFiles = fs.readdirSync(path).filter(function (file) {
                return ~file.indexOf('.gz.');
              });
            done();
          });
          
          staticFiles.forEach(function (staticFile) {
            it('returns *.gz compiled files', function (done) {
              var contentType = undefined;
              if (~staticFile.indexOf('.js')) {
                contentType = 'application/javascript';
              } else if (~staticFile.indexOf('.css')) {
                contentType = 'text/css; charset=UTF-8';
              }
              agent
                .get('/dist/' + staticFile)
                .expect(200)
                .expect('Content-Encoding', 'gzip')
                .expect('Content-Type', contentType)
                .end(function (err, res) {
                  if (err) return done(err);
                  res.text.should.be.a('string');
                  done();
                });
            });
          });
        });

        describe('# [GET] ' + url + '/user (examples)', function () {
          it('returns a 403 (Not Allowed) error (without Bearer Token)', function (done) {
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

          it('returns an internal error (checkAuthorized fail)', function (done) {
            mockModel(mongoose.model('User'), 'findOne', function (stub) {
              agent
                .get(url + '/user')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.strictEqual(result.messageCode, "-1");
                  assert.isDefined(result.error);
                  stub.restore();
                  done();
                });
            });
          });

          it('returns an internal error (checkAuthorized with unknown token)', function (done) {
            agent
              .get(url + '/user')
              .set('Authorization', 'Bearer 569a498efd2e11a55a2822f4 ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.strictEqual(result.messageCode, "-2");
                assert.isUndefined(result.error);
                done();
              });
          });
        });
      });

      describe('> Authentication API', function () {
        describe('# [POST] ' + url + '/sign-up', function () {
          it('should get an error on sign-up for bad user data', function (done) {
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

          it('should get an internal error on sign-up (mongo fail)', function (done) {
            var sentData = {username: 'test_stage', password: 'test_stage'};
            var expectedData = require('./fixtures/auth/signup');
            ontimeRequester.requestToken = function (authObject, cb) {
              expectedData.access_token += 'delta';
              cb(JSON.stringify(expectedData));
            };

            mockModel(mongoose.model('User'), "findOne", function (stub) {
              agent
                .post(url + '/sign-up')
                .send(sentData)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.strictEqual(result.messageCode, "-1");
                  assert.isDefined(result.error);
                  stub.restore();
                  done();
                });
            });
          });

          it('should get an internal error on the create (mongo fail)', function (done) {
            var sentData = {username: 'test_stage', password: 'test_stage'};
            var expectedData = require('./fixtures/auth/signup');
            ontimeRequester.requestToken = function (authObject, cb) {
              expectedData.access_token += 'delta';
              cb(JSON.stringify(expectedData));
            };

            mockModel(mongoose.model('User'), "update", function (stub) {
              agent
                .post(url + '/sign-up')
                .send(sentData)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.strictEqual(result.messageCode, "-1");
                  assert.isDefined(result.error);
                  stub.restore();
                  done();
                });
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
                assert.strictEqual(result.user.identity.ontimeToken, expectedData.access_token);
                assert.isDefined(result.user.identity.token);
                tokenOtBearer = result.user.identity.ontimeToken;
                done();
              });
          });

          it('should get an internal error on sign-up same user the others times (mongo fail)', function (done) {
            var sentData = {username: 'test_stage', password: 'test_stage'};
            mockModel(mongoose.model('User'), 'update', function (stub) {
              agent
                .post(url + '/sign-up')
                .send(sentData)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.strictEqual(result.messageCode, "-1");
                  assert.isDefined(result.error);
                  stub.restore();
                  done();
                });
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
                assert.strictEqual(result.user.identity.ontimeToken, expectedData.access_token);
                assert.isDefined(result.user.identity.token);
                assert.notEqual(tokenOtBearer, result.user.identity.ontimeToken);
                // We set tokens for next tests
                tokenOtBearer = result.user.identity.ontimeToken;
                tokenBearer = result.user.identity.token;
                done();
              });
          });
        });

        describe('# [GET] ' + url + '/me', function () {
          it('should get error on request information for logged user (bad token)', function (done) {
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

          it('should get an internal error on request information for logged user (mongo fail)', function (done) {
            mockModel(mongoose.model('User'), 'findOne', function (stub) {
              agent
                .get(url + '/me')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.isDefined(result.error);
                  assert.strictEqual(result.messageCode, "-1");
                  stub.restore();
                  done();
                });
            });
          });

          it('should request information for logged user', function (done) {
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
                assert.strictEqual(result.user.identity.ontimeToken, tokenOtBearer);
                assert.strictEqual(result.user.identity.token, tokenBearer);
                done();
              });
          });
        });
      });

      describe('> User API', function () {
        describe('# [GET] ' + url + '/user', function () {
          it('should get an internal error (mongo fail)', function (done) {
            mockModel(mongoose.model('User'), 'find', function (stub) {
              agent
                .get(url + '/user')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.isDefined(result.error);
                  assert.strictEqual(result.messageCode, "-1");
                  stub.restore();
                  done();
                });
            });
          });

          it('should get an error (empty response)', function (done) {
            mockModel(mongoose.model('User'), 'find', function (stub) {
              agent
                .get(url + '/user')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 404);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, "-12");
                  stub.restore();
                  done();
                });
            }, true);
          });

          it('should request list of all users', function (done) {
            agent
              .get(url + '/user')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isUndefined(result.messageCode);
                assert.isArray(result.users);
                assert.strictEqual(result.users.length, 1);
                done();
              });
          });
        });

        describe('# [POST] ' + url + '/user/update', function () {
          it('should get an internal error (findOne) for update current user (mongo fail)', function (done) {
            var sentData = require('./fixtures/user/update');
            mockModel(mongoose.model('User'), 'findOne', function (stub) {
              agent
                .post(url + '/user/update')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .send(sentData)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.isDefined(result.error);
                  assert.strictEqual(result.messageCode, "-1");
                  stub.restore();
                  done();
                });
            });
          });

          it('should get an error (empty response) for update current user', function (done) {
            var sentData = require('./fixtures/user/update');
            mockModel(mongoose.model('User'), 'findOne', function (stub) {
              agent
                .post(url + '/user/update')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .send(sentData)
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 404);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, "-12");
                  stub.restore();
                  done();
                });
            }, true);
          });

          it('should get an internal error (update) for update current user (mongo fail)', function (done) {
            var sentData = require('./fixtures/user/update');
            mockModel(mongoose.model('User'), 'update', function (stub) {
              agent
                .post(url + '/user/update')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .send(sentData)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.isDefined(result.error);
                  assert.strictEqual(result.messageCode, "-1");
                  stub.restore();
                  done();
                });
            });
          });

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
          it('should get an internal error on "findById" (mongo fail)', function (done) {
            mockModel(mongoose.model('Organization'), 'findById', function (stub) {
              agent
                .post(url + '/organization/edit')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.isDefined(result.error);
                  assert.strictEqual(result.messageCode, "-1");
                  stub.restore();
                  done();
                });
            });
          });

          it('should get an internal error on create (mongo fail)', function (done) {
            var sentData = require('./fixtures/organization/create');
            mockModel(mongoose.model('Organization'), 'update', function (stub) {
              agent
                .post(url + '/organization/edit')
                .send(sentData)
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.isDefined(result.error);
                  assert.strictEqual(result.messageCode, "-1");
                  stub.restore();
                  done();
                });
            });
          });

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

          it('should get an internal error on update (mongo fail)', function (done) {
            var sentData = require('./fixtures/organization/update');
            sentData._id = organizationId;
            mockModel(mongoose.model('Organization'), 'update', function (stub) {
              agent
                .post(url + '/organization/edit')
                .send(sentData)
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.isDefined(result.error);
                  assert.strictEqual(result.messageCode, "-1");
                  stub.restore();
                  done();
                });
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
                assert.isArray(result.organization.projects);
                assert.strictEqual(result.organization.url, sentData.url);
                assert.isDefined(result.organization.creation);
                assert.isDefined(result.organization.creation.user);
                assert.isDefined(result.organization.update);
                assert.isDefined(result.organization.update.user);
                done();
              });
          });

          it('should update organization (with lazy loading)', function (done) {
            var sentData = require('./fixtures/organization/update');
            sentData._id = organizationId;
            sentData.lazy = 1;
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
                assert.isUndefined(result.organization.projects);
                done();
              });
          });
        });

        describe('# [GET] ' + url + '/organization', function () {
          it('should get an internal error (mongo fail)', function (done) {
            mockModel(mongoose.model('Organization'), 'find', function (stub) {
              agent
                .get(url + '/organization')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.isDefined(result.error);
                  assert.strictEqual(result.messageCode, "-1");
                  stub.restore();
                  done();
                });
            });
          });

          it('should get an empty array (unknown organizationId : not found)', function (done) {
            agent
              .get(url + '/organization?id=56961966de7cbad8ba3be46d')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isUndefined(result.messageCode);
                assert.isArray(result.organizations);
                assert.strictEqual(result.organizations.length, 0);
                done();
              });
          });

          it('should get an error 404 not found (query issue)', function (done) {
            mockModel(mongoose.model('Organization'), 'find', function (stub) {
              agent
                .get(url + '/organization?id=' + organizationId)
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 404);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, "-9");
                  stub.restore();
                  done();
                });
            }, true);
          });

          it('should request one organization', function (done) {
            agent
              .get(url + '/organization?id=' + organizationId)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isUndefined(result.messageCode);
                assert.isArray(result.organizations);
                assert.strictEqual(result.organizations.length, 1);
                assert.isArray(result.organizations[0].projects);
                done();
              });
          });


          it('should request list of all organizations (without lazy loading)', function (done) {
            agent
              .get(url + '/organization?')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isUndefined(result.messageCode);
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
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isUndefined(result.messageCode);
                assert.isArray(result.organizations);
                assert.strictEqual(result.organizations.length, 1);
                assert.isUndefined(result.organizations[0].projects);
                done();
              });
          });
        });

        describe('# [DELETE] ' + url + '/organization/delete', function () {
          it('should get an internal error (mongo fail)', function (done) {
            mockModel(mongoose.model('Organization'), 'findByIdAndRemove', function (stub) {
              agent
                .post(url + '/organization/delete')
                .send({id: organizationId})
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.isDefined(result.error);
                  assert.strictEqual(result.messageCode, "-1");
                  stub.restore();
                  done();
                });
            });
          });

          it('should delete one organization', function (done) {
            agent
              .post(url + '/organization/delete')
              .send({id: organizationId})
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
            ontimeRequester.me = internalErrorOntimeAPIResponse;
            agent
              .get(url + '/ontime/me')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(500)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 500);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should get an internal error', function (done) {
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
            ontimeRequester.me = function (token, cb) {
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
                assert.isDefined(result.ontimeUser);
                ['id', 'login_id', 'is_active', 'is_locked', 'last_login_date_time', 'created_date_time',
                  'culture_info', 'first_name', 'last_name', 'email', 'is_admin']
                  .forEach(function (item) {
                    assert.strictEqual(result.ontimeUser[item], expectedData.data[item]);
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

          it('should get an error with token', function (done) {
            ontimeRequester.tree = internalErrorOntimeAPIResponse;
            agent
              .get(url + '/ontime/tree')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(500)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 500);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should get ontime tree items', function (done) {
            var expectedData = require('./fixtures/ontime/tree');
            ontimeRequester.tree = function (token, cb) {
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

        describe('# [GET] ' + url + '/ontime/items', function () {
          it('should get an error with token', function (done) {
            ontimeRequester.items = invalidOntimeAPIResponse;
            agent
              .get(url + '/ontime/items')
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

          it('should get an error with token', function (done) {
            ontimeRequester.items = internalErrorOntimeAPIResponse;
            agent
              .get(url + '/ontime/items')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(500)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 500);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should get ontime tree items', function (done) {
            var expectedData = require('./fixtures/ontime/items');
            ontimeRequester.items = function (token, projectId, cb) {
              cb(JSON.stringify(expectedData));
            };
            agent
              .get(url + '/ontime/items')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isUndefined(result.messageCode);
                assert.isArray(result.items);
                assert.strictEqual(result.items.length, 3);
                result.items.forEach(function (item, index) {
                  assert.strictEqual(item.parent.id, expectedData.data[index].parent.id);
                  assert.strictEqual(item.parent_project.id, expectedData.data[index].parent_project.id);
                  assert.strictEqual(item.parent_project.name, expectedData.data[index].parent_project.name);
                  assert.strictEqual(item.parent_project.path, expectedData.data[index].parent_project.path);
                  assert.strictEqual(item.name, expectedData.data[index].name);
                  assert.strictEqual(item.description, expectedData.data[index].description);
                  assert.strictEqual(item.notes, expectedData.data[index].notes);
                });
                done();
              });
          });
        });
      });

      describe('> Item API', function () {
        var organizationId, projectId, documentId, versionId, versionOtherId;
        before('should create new organization', function (done) {
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

        describe('# [POST] ' + url + '/item/create', function () {
          it('should get an error because no organization identifier given', function (done) {
            var sentData = {};
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should get an error because bad organization identifier-type given', function (done) {
            var sentData = {organizationId: 'badIdea#joke'};
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(500)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 500);
                assert.isDefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should get an error because bad (not known) organization identifier given', function (done) {
            var sentData = {organizationId: '569a498efd2e11a55a2822f4'};
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-5");
                done();
              });
          });

          it('should get an error because no "parentId" and no "project" type given', function (done) {
            var sentData = require('./fixtures/item/create-ko-1');
            sentData.organizationId = organizationId;
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-7");
                done();
              });
          });

          it('should get an error because unknown parentId given', function (done) {
            var sentData = require('./fixtures/item/create-ko-1');
            sentData.organizationId = organizationId;
            sentData.parentId = '56961966de7cbad8ba3be464';
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-7");
                done();
              });
          });

          it('should get an internal error (mongo fail)', function (done) {
            mockModel(mongoose.model('Organization'), 'update', function (stub) {
              var sentData = require('./fixtures/item/create-ok-1');
              sentData.organizationId = organizationId;
              agent
                .post(url + '/item/create')
                .send(sentData)
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(500)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 500);
                  assert.isDefined(result.error);
                  assert.strictEqual(result.messageCode, "-1");
                  stub.restore();
                  done();
                });
            });
          });

          it('should create a new project in the organization', function (done) {
            var sentData = require('./fixtures/item/create-ok-1');
            sentData.organizationId = organizationId;
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "2");
                assert.isDefined(result.organization);
                assert.strictEqual(result.organization.projects.length, 1);
                assert.strictEqual(result.organization.projects[0].name, sentData.name);
                assert.strictEqual(result.organization.projects[0].description, sentData.description);
                assert.isDefined(result.item);
                assert.strictEqual(result.item.name, sentData.name);
                assert.strictEqual(result.item.description, sentData.description);
                assert.isDefined(result.type);
                projectId = result.item._id;
                done();
              });
          });

          it('should get an error because bad  "project" type given', function (done) {
            var sentData = require('./fixtures/item/create-ko-1');
            sentData.organizationId = organizationId;
            sentData.parentId = projectId;
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-7");
                done();
              });
          });

          it('should create a new project in the only project of the organization', function (done) {
            var sentData = require('./fixtures/item/create-ok-1');
            sentData.organizationId = organizationId;
            sentData.parentId = projectId;
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "2");
                assert.isDefined(result.organization);
                assert.strictEqual(result.organization.projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects[0].name, sentData.name);
                assert.strictEqual(result.organization.projects[0].projects[0].description, sentData.description);
                assert.isDefined(result.item);
                assert.strictEqual(result.item.name, sentData.name);
                assert.strictEqual(result.item.description, sentData.description);
                assert.isDefined(result.type);
                projectId = result.item._id;
                done();
              });
          });

          it('should create a new document in the subProject of the only project of the organization', function (done) {
            var sentData = require('./fixtures/item/create-ok-2');
            sentData.organizationId = organizationId;
            sentData.parentId = projectId;
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "2");
                assert.isDefined(result.organization);
                assert.strictEqual(result.organization.projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
                assert.strictEqual(result.organization.projects[0].projects[0].documents[0].name, sentData.name);
                assert.strictEqual(result.organization.projects[0].projects[0].documents[0].description, sentData.description);
                assert.isDefined(result.item);
                assert.strictEqual(result.item.name, sentData.name);
                assert.strictEqual(result.item.description, sentData.description);
                assert.isDefined(result.type);
                documentId = result.item._id;
                done();
              });
          });

          it('should get an error because no "ontimeId" given (for version create)', function (done) {
            var sentData = require('./fixtures/item/create-ko-1');
            sentData.organizationId = organizationId;
            sentData.parentId = documentId;
            sentData.type = 'version';
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-7");
                done();
              });
          });

          it('should get an error because ontimeRequester.items throw an error', function (done) {
            var sentData = Object.assign(
              require('./fixtures/item/create-ok-3'),
              {organizationId: organizationId, parentId: documentId, ontimeId: 123}
            );
            ontimeRequester.items = function (token, ontimeId, cb) {
              cb(JSON.stringify(require('./fixtures/ontime/ko')));
            };
            agent
              .post(url + '/item/create')
              .send(sentData)
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

          it('should get an error because ontimeRequester.items does nothing', function (done) {
            var sentData = Object.assign(
              require('./fixtures/item/create-ok-3'),
              {organizationId: organizationId, parentId: documentId, ontimeId: 123}
            );
            ontimeRequester.items = function (token, ontimeId, cb) {
              cb(JSON.stringify({}));
            };
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(500)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 500);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should create a new version in the document (with no settings)', function (done) {
            var sentData = Object.assign(
              require('./fixtures/item/create-ok-3'),
              {organizationId: organizationId, parentId: documentId, ontimeId: 123}
            );
            var expectedData = require('./fixtures/ontime/items');
            ontimeRequester.items = function (token, ontimeId, cb) {
              cb(JSON.stringify(expectedData));
            };
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "2");
                assert.isDefined(result.organization);
                assert.strictEqual(result.organization.projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
                var versions = result.organization.projects[0].projects[0].documents[0].versions;
                assert.strictEqual(versions.length, 1);
                assert.isArray(versions[0].entries);
                assert(versions[0].entries.length > 0);
                assert.isDefined(versions[0].setting._id);
                assert.isUndefined(versions[0].setting.contributorPrice);
                assert.isArray(result.item.entries);
                [result.item.entries, versions[0].entries].forEach(function (elements) {
                  elements.forEach(function (element) {
                    assert.isArray(element.children);
                    assert.strictEqual(element.children.length, 1);
                    assert.isArray(element.children[0].children);
                    assert.strictEqual(element.children[0].children.length, 2);
                    assert.isArray(element.children[0].children[0].children);
                    assert.strictEqual(element.children[0].children[0].children.length, 0);
                    assert.isArray(element.children[0].children[1].children);
                    assert.strictEqual(element.children[0].children[1].children.length, 1);
                  });
                });
                assert(result.item.entries.length > 0);
                assert.isDefined(result.item.setting._id);
                assert.isUndefined(result.item.setting.contributorPrice);
                done();
              });
          });

          it('should create a new version in the document (with settings)', function (done) {
            var expectedData = require('./fixtures/item/create-ok-4');
            var sentData = Object.assign(
              expectedData,
              {organizationId: organizationId, parentId: documentId, ontimeId: 123}
            );
            ontimeRequester.items = function (token, ontimeId, cb) {
              cb(JSON.stringify(require('./fixtures/ontime/items')));
            };
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "2");
                assert.isDefined(result.organization);
                assert.strictEqual(result.organization.projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
                var versions = result.organization.projects[0].projects[0].documents[0].versions;
                assert.strictEqual(versions.length, 2);
                assert.isArray(versions[1].entries);
                assert(versions[1].entries.length > 0);
                assert.isDefined(versions[1].setting);
                assert.isArray(result.item.entries);
                assert(result.item.entries.length > 0);
                assert.isDefined(result.item.setting);
                [versions[1].setting, result.item.setting].forEach(function (element) {
                  assert.strictEqual(element.projectDev.contributorPrice, expectedData.setting.contributorPrice);
                  assert.strictEqual(element.projectDev.contributorOccupation, expectedData.setting.contributorOccupation);
                  assert.strictEqual(element.projectManagement.scrummasterPrice, expectedData.setting.scrummasterPrice);
                  assert.strictEqual(element.projectManagement.scrummasterOccupation, expectedData.setting.scrummasterOccupation);
                  assert.strictEqual(element.billing.showDevPrice, expectedData.setting.showDev);
                  assert.strictEqual(element.billing.rateMultiplier, expectedData.setting.rateMultiplier);
                  assert.strictEqual(element.billing.showManagementPrice, expectedData.setting.showManagement);
                  assert.strictEqual(element.unit.estimateType, expectedData.setting.estimateType);
                  assert.strictEqual(element.unit.rangeEstimateUnit, expectedData.setting.rangeEstimateUnit);
                  assert.strictEqual(element.unit.label, expectedData.setting.label);
                  assert.strictEqual(element.date.show, expectedData.setting.showDate);
                  assert.strictEqual(element.iteration.contributorAvailable, expectedData.setting.contributorAvailable);
                  assert.strictEqual(element.iteration.hourPerDay, expectedData.setting.hourPerDay);
                  assert.strictEqual(element.iteration.dayPerWeek, expectedData.setting.dayPerWeek);
                  assert.strictEqual(element.iteration.weekPerIteration, expectedData.setting.weekPerIteration);
                });
                versionId = result.item._id;
                done();
              });
          });

          it('should create a new version in the document with lazy loading', function (done) {
            var expectedData = require('./fixtures/item/create-ok-5');
            var sentData = Object.assign(
              expectedData,
              {organizationId: organizationId, parentId: documentId, ontimeId: 123, lazy: 1}
            );
            ontimeRequester.items = function (token, ontimeId, cb) {
              cb(JSON.stringify(require('./fixtures/ontime/items')));
            };
            agent
              .post(url + '/item/create')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "2");
                assert.isDefined(result.organization);
                assert.strictEqual(result.organization.projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
                var versions = result.organization.projects[0].projects[0].documents[0].versions;
                assert.strictEqual(versions.length, 3);
                assert.isNull(versions[2].entries);
                assert.isNull(result.item.entries);
                assert.isDefined(result.item.setting._id);
                assert.isUndefined(result.item.setting.contributorPrice);
                OrganizationModel.walkRecursively(result.organization, function (element) {
                  assert(element.entries == undefined || element.entries == null);
                });
                versionOtherId = result.item._id;
                done();
              });
          });
        });

        describe('# [UPDATE] ' + url + '/item/update', function () {
          it('should get an error because no organization identifier given', function (done) {
            var sentData = {};
            agent
              .post(url + '/item/update')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should get an error because bad organization identifier-type given', function (done) {
            var sentData = {organizationId: 'badIdea#joke'};
            agent
              .post(url + '/item/update')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(500)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 500);
                assert.isDefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should get an error because bad (not known) organization identifier given', function (done) {
            var sentData = {organizationId: '569a498efd2e11a55a2822f4'};
            agent
              .post(url + '/item/update')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-5");
                done();
              });
          });

          it('should get an error because bad not parentId / "project" type given', function (done) {
            var sentData = require('./fixtures/item/update-ok-1');
            sentData.organizationId = organizationId;
            agent
              .post(url + '/item/update')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-8");
                done();
              });
          });

          it('should get an error because no "data._id" given', function (done) {
            var sentData = Object.assign(require('./fixtures/item/update-ok-1'), {organizationId: organizationId});
            agent
              .post(url + '/item/update')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-8");
                done();
              });
          });

          it('should get an error because bad "data._id" given', function (done) {
            var sentData = Object.assign(
              require('./fixtures/item/update-ok-1'),
              {organizationId: organizationId, _id: '569a498efd2e22a55a2822f4'}
            );
            agent
              .post(url + '/item/update')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-8");
                done();
              });
          });

          it('should update an item (generic way for projects, documents and versions)', function (done) {
            var expectedData = require('./fixtures/item/update-ok-1');
            var sentData = Object.assign(expectedData, {organizationId: organizationId, _id: documentId});
            agent
              .post(url + '/item/update')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "3");
                assert.isDefined(result.organization);
                assert.strictEqual(result.organization.projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects.length, 1);
                assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
                var document = result.organization.projects[0].projects[0].documents[0];
                assert.strictEqual(document.name, expectedData.name);
                assert.strictEqual(document.description, expectedData.description);
                assert.strictEqual(result.item.name, expectedData.name);
                assert.strictEqual(result.item.description, expectedData.description);
                done();
              });
          });

          it('should update a version with lazy', function (done) {
            var expectedData = require('./fixtures/item/update-ok-1');
            var sentData = Object.assign(expectedData, {organizationId: organizationId, _id: versionId, lazy: 1});
            agent
              .post(url + '/item/update')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "3");
                assert.isDefined(result.organization);
                var version = result.organization.projects[0].projects[0].documents[0].versions[0];
                assert.isDefined(version);
                assert.isUndefined(version.entries);
                assert.strictEqual(result.item.name, expectedData.name);
                assert.strictEqual(result.item.description, expectedData.description);
                done();
              });
          });
        });

        describe('# [GET] ' + url + '/item', function () {
          it('should get an error because no organization identifier given', function (done) {
            agent
              .get(url + '/item?')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-5");
                done();
              });
          });

          it('should get an error because bad organization identifier-type given', function (done) {
            agent
              .get(url + '/item?organizationId=badIdea#joke')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(500)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 500);
                assert.isDefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should get an error because bad (not known) organization identifier given', function (done) {
            agent
              .get(url + '/item?organizationId=569a498efd2e11a55a2822f4')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-5");
                done();
              });
          });

          it('should get an error because unknown item identifier given', function (done) {
            agent
              .get(url + '/item?organizationId=' + organizationId + '&itemId=badIdea#joke')
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-6");
                done();
              });
          });

          it('should get an item (project)', function (done) {
            agent
              .get(url + '/item?organizationId=' + organizationId + '&itemId=' + projectId)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isDefined(result.organization);
                assert.isDefined(result.item);
                assert.isUndefined(result.documentName);
                assert.isUndefined(result.organizationName);
                OrganizationModel.findDeepAttributeById(result.organization, projectId, function (element) {
                  assert.isDefined(element);
                });
                done();
              });
          });

          it('should get an item (document)', function (done) {
            agent
              .get(url + '/item?organizationId=' + organizationId + '&itemId=' + documentId)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isDefined(result.organization);
                assert.isDefined(result.item);
                assert.isUndefined(result.documentName);
                assert.isUndefined(result.organizationName);
                OrganizationModel.findDeepAttributeById(result.organization, documentId, function (element) {
                  assert.isDefined(element);
                });
                done();
              });
          });

          it('should get an item (version)', function (done) {
            agent
              .get(url + '/item?organizationId=' + organizationId + '&itemId=' + versionId)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isDefined(result.organization);
                assert.isDefined(result.item);
                assert.isDefined(result.item.entries);
                assert.isUndefined(result.documentName);
                assert.isUndefined(result.organizationName);
                OrganizationModel.findDeepAttributeById(result.organization, versionId, function (element) {
                  assert.isDefined(element.entries);
                });
                done();
              });
          });

          it('should get an item (version) with modePreview', function (done) {
            agent
              .get(url + '/item?modePreview=1&organizationId=' + organizationId + '&itemId=' + versionId)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isUndefined(result.organization);
                assert.isDefined(result.item);
                assert.isDefined(result.item.entries);
                assert.isDefined(result.documentName);
                assert.isDefined(result.organizationName);
                done();
              });
          });

          it('should get an item (version) with lazy loading', function (done) {
            agent
              .get(url + '/item?lazy=1&organizationId=' + organizationId + '&itemId=' + versionId)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isDefined(result.organization);
                assert.isDefined(result.item);
                assert.isUndefined(result.item.entries);
                assert.isUndefined(result.documentName);
                assert.isUndefined(result.organizationName);
                OrganizationModel.walkRecursively(result.organization, function (element) {
                  assert.isUndefined(element.entries);
                });
                done();
              });
          });

          it('should get /organization for versions/entries (with lazy loading)', function (done) {
            agent
              .get(url + '/organization?lazyVersion=1&id=' + organizationId)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isUndefined(result.messageCode);
                assert.isArray(result.organizations);
                assert.strictEqual(result.organizations.length, 1);
                assert.isDefined(result.organizations[0]);
                OrganizationModel.walkRecursively(result.organizations[0], function (element) {
                  assert.isUndefined(element.entries);
                });
                done();
              });
          });
        });

        describe('# [DELETE] ' + url + '/item', function () {
          it('should get an error because no organization identifier given', function (done) {
            var sentData = {};
            agent
              .post(url + '/item/delete')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should get an error because bad organization identifier-type given', function (done) {
            var sentData = {organizationId: 'badIdea#joke'};
            agent
              .post(url + '/item/delete')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(500)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 500);
                assert.isDefined(result.error);
                assert.strictEqual(result.messageCode, "-1");
                done();
              });
          });

          it('should get an error because bad (not known) organization identifier given', function (done) {
            var sentData = {organizationId: '569a498efd2e11a55a2822f4'};
            agent
              .post(url + '/item/delete')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-5");
                done();
              });
          });

          it('should get an error because no "data.itemId" given', function (done) {
            var sentData = {organizationId: organizationId};
            agent
              .post(url + '/item/delete')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-6");
                done();
              });
          });

          it('should get an error because bad "data.itemId" given', function (done) {
            var sentData = {organizationId: organizationId, itemId: '009a498efd2e22a55a2822f4'};
            agent
              .post(url + '/item/delete')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, "-6");
                done();
              });
          });

          it('should delete an item (version) with lazy loading', function (done) {
            var sentData = {organizationId: organizationId, itemId: versionOtherId, lazy: 1};
            agent
              .post(url + '/item/delete')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isDefined(result.organization);
                assert.isDefined(result.item);
                assert.strictEqual(result.item._id, versionOtherId);
                OrganizationModel.findDeepAttributeById(result.organization, versionOtherId, function (element) {
                  assert.isUndefined(element);
                });
                OrganizationModel.walkRecursively(result.organization, function (element) {
                  assert(element.entries == undefined || element.entries == null);
                });
                done();
              });
          });

          it('should delete an item of version item', function (done) {
            var sentData = {organizationId: organizationId, itemId: versionId};
            agent
              .post(url + '/item/delete')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isDefined(result.organization);
                assert.isDefined(result.item);
                assert.strictEqual(result.item._id, versionId);
                OrganizationModel.findDeepAttributeById(result.organization, versionId, function (element) {
                  assert.isUndefined(element);
                });
                done();
              });
          });

          it('should delete an item of document item', function (done) {
            var sentData = {organizationId: organizationId, itemId: documentId};
            agent
              .post(url + '/item/delete')
              .send(sentData)
              .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
              .expect(200)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .end(function (err, res) {
                if (err) return done(err);
                var result = res.body;
                assert.strictEqual(result.code, 200);
                assert.isUndefined(result.error);
                assert.isDefined(result.organization);
                assert.isDefined(result.item);
                assert.strictEqual(result.item._id, documentId);
                OrganizationModel.findDeepAttributeById(result.organization, documentId, function (element) {
                  assert.isUndefined(element);
                });
                done();
              });
          });
        });

        describe('> Setting API', function () {
          var settingStandaloneId, settingSubItemId;
          describe('# [POST] ~standalone' + url + '/setting/update', function () {
            it('should get an internal error (findOne) on create a standalone setting (mongo fail)', function (done) {
              var sentData = require('./fixtures/setting/create-ok-1');
              mockModel(mongoose.model('Setting'), 'findOne', function (stub) {
                agent
                  .post(url + '/setting/update')
                  .send(sentData)
                  .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                  .expect(500)
                  .expect('Content-Type', 'application/json; charset=utf-8')
                  .end(function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    assert.strictEqual(result.code, 500);
                    assert.isDefined(result.error);
                    assert.strictEqual(result.messageCode, "-1");
                    stub.restore();
                    done();
                  });
              });
            });

            it('should get an internal error (update) on create a standalone setting (mongo fail)', function (done) {
              var sentData = require('./fixtures/setting/create-ok-1');
              mockModel(mongoose.model('Setting'), 'update', function (stub) {
                agent
                  .post(url + '/setting/update')
                  .send(sentData)
                  .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                  .expect(500)
                  .expect('Content-Type', 'application/json; charset=utf-8')
                  .end(function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    assert.strictEqual(result.code, 500);
                    assert.isDefined(result.error);
                    assert.strictEqual(result.messageCode, "-1");
                    stub.restore();
                    done();
                  });
              });
            });

            it('should create a standalone setting', function (done) {
              var sentData = require('./fixtures/setting/create-ok-1');
              agent
                .post(url + '/setting/update')
                .send(sentData)
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 200);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, "8");
                  assert.isDefined(result.setting);
                  assert.strictEqual(result.setting.projectDev.contributorPrice, sentData.contributorPrice);
                  assert.strictEqual(result.setting.projectDev.contributorOccupation, sentData.contributorOccupation);
                  assert.strictEqual(result.setting.projectManagement.scrummasterPrice, sentData.scrummasterPrice);
                  assert.strictEqual(result.setting.projectManagement.scrummasterOccupation, sentData.scrummasterOccupation);
                  assert.strictEqual(result.setting.billing.showDevPrice, sentData.showDev);
                  assert.strictEqual(result.setting.billing.rateMultiplier, sentData.rateMultiplier);
                  assert.strictEqual(result.setting.billing.showManagementPrice, sentData.showManagement);
                  assert.strictEqual(result.setting.unit.estimateType, sentData.estimateType);
                  assert.strictEqual(result.setting.unit.rangeEstimateUnit, sentData.rangeEstimateUnit);
                  assert.strictEqual(result.setting.unit.label, sentData.label);
                  assert.strictEqual(result.setting.date.show, sentData.showDate);
                  assert.strictEqual(result.setting.iteration.contributorAvailable, sentData.contributorAvailable);
                  assert.strictEqual(result.setting.iteration.hourPerDay, sentData.hourPerDay);
                  assert.strictEqual(result.setting.iteration.dayPerWeek, sentData.dayPerWeek);
                  assert.strictEqual(result.setting.iteration.weekPerIteration, sentData.weekPerIteration);
                  assert.strictEqual(result.setting.id, 42);
                  settingStandaloneId = result.setting._id;
                  done();
                });
            });

            it('should get an internal error (update) on update a standalone setting (mongo fail)', function (done) {
              var sentData = require('./fixtures/setting/create-ok-1');
              sentData.id = 42;
              mockModel(mongoose.model('Setting'), 'update', function (stub) {
                agent
                  .post(url + '/setting/update')
                  .send(sentData)
                  .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                  .expect(500)
                  .expect('Content-Type', 'application/json; charset=utf-8')
                  .end(function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    assert.strictEqual(result.code, 500);
                    assert.isDefined(result.error);
                    assert.strictEqual(result.messageCode, "-1");
                    stub.restore();
                    done();
                  });
              });
            });

            it('should update a standalone setting', function (done) {
              var sentData = require('./fixtures/setting/update-ok-1');
              sentData.id = 42;
              agent
                .post(url + '/setting/update')
                .send(sentData)
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 200);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, "9");
                  assert.isDefined(result.setting);
                  assert.strictEqual(result.setting.projectDev.contributorPrice, sentData.contributorPrice);
                  assert.strictEqual(result.setting.projectDev.contributorOccupation, sentData.contributorOccupation);
                  assert.strictEqual(result.setting.projectManagement.scrummasterPrice, sentData.scrummasterPrice);
                  assert.strictEqual(result.setting.projectManagement.scrummasterOccupation, sentData.scrummasterOccupation);
                  assert.strictEqual(result.setting.billing.showDevPrice, sentData.showDev);
                  assert.strictEqual(result.setting.billing.rateMultiplier, sentData.rateMultiplier);
                  assert.strictEqual(result.setting.billing.showManagementPrice, sentData.showManagement);
                  assert.strictEqual(result.setting.unit.estimateType, sentData.estimateType);
                  assert.strictEqual(result.setting.unit.label, sentData.label);
                  assert.strictEqual(result.setting.date.show, sentData.showDate);
                  assert.strictEqual(result.setting.iteration.contributorAvailable, sentData.contributorAvailable);
                  assert.strictEqual(result.setting.iteration.hourPerDay, sentData.hourPerDay);
                  assert.strictEqual(result.setting.iteration.dayPerWeek, sentData.dayPerWeek);
                  assert.strictEqual(result.setting.iteration.weekPerIteration, sentData.weekPerIteration);
                  assert.strictEqual(result.setting.id, 42);
                  settingStandaloneId = result.setting._id;
                  done();
                });
            });
          });

          describe('# [GET] ~standalone' + url + '/setting', function () {
            it('should get an internal error (find) for request a standalone setting (mongo fail)', function (done) {
              mockModel(mongoose.model('Setting'), 'find', function (stub) {
                agent
                  .get(url + '/setting?id=42')
                  .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                  .expect(500)
                  .expect('Content-Type', 'application/json; charset=utf-8')
                  .end(function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    assert.strictEqual(result.code, 500);
                    assert.isDefined(result.error);
                    assert.strictEqual(result.messageCode, '-1');
                    stub.restore();
                    done();
                  });
              });
            });

            it('should get an internal error (find) for request a standalone setting (empty response)', function (done) {
              mockModel(mongoose.model('Setting'), 'find', function (stub) {
                agent
                  .get(url + '/setting?id=42')
                  .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                  .expect(404)
                  .expect('Content-Type', 'application/json; charset=utf-8')
                  .end(function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    assert.strictEqual(result.code, 404);
                    assert.isUndefined(result.error);
                    assert.strictEqual(result.messageCode, '-10');
                    stub.restore();
                    done();
                  });
              }, true);
            });

            it('should request a standalone setting', function (done) {
              agent
                .get(url + '/setting?id=42')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 200);
                  assert.isUndefined(result.error);
                  assert.isUndefined(result.messageCode);
                  assert.isDefined(result.setting);
                  done();
                });
            });
          });

          describe('# [POST] ~sub-item' + url + '/setting/update', function () {
            it('should get an error request (not found because no organizationId given) a sub-item setting', function (done) {
              agent
                .post(url + '/setting/edit')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 404);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, '-1');
                  done();
                });
            });

            it('should get an internal error request (findById) a sub-item setting (mongo fail)', function (done) {
              mockModel(mongoose.model('Organization'), 'findById', function (stub) {
                agent
                  .post(url + '/setting/edit')
                  .send({organizationId: organizationId})
                  .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                  .expect(500)
                  .expect('Content-Type', 'application/json; charset=utf-8')
                  .end(function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    assert.strictEqual(result.code, 500);
                    assert.isDefined(result.error);
                    assert.strictEqual(result.messageCode, '-1');
                    stub.restore();
                    done();
                  });
              });
            });

            it('should get an error request (unknown organizationId) a sub-item setting', function (done) {
              agent
                .post(url + '/setting/edit')
                .send({organizationId: '56961966de7cbad8ba3be467'})
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 404);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, '-5');
                  done();
                });
            });

            it('should get an internal error (update) for create a sub-item setting in organization (mongo fail)', function (done) {
              var sentData = require('./fixtures/setting/create-ok-1');
              sentData.organizationId = organizationId;
              mockModel(mongoose.model('Organization'), 'update', function (stub) {
                agent
                  .post(url + '/setting/edit')
                  .send(sentData)
                  .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                  .expect(500)
                  .expect('Content-Type', 'application/json; charset=utf-8')
                  .end(function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    assert.strictEqual(result.code, 500);
                    assert.isDefined(result.error);
                    assert.strictEqual(result.messageCode, '-1');
                    stub.restore();
                    done();
                  });
              });
            });

            it('should create a sub-item setting in organization', function (done) {
              var sentData = require('./fixtures/setting/create-ok-1');
              sentData.organizationId = organizationId;
              agent
                .post(url + '/setting/edit')
                .send(sentData)
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 200);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, '10');
                  assert.isDefined(result.organization);
                  assert.isDefined(result.organization.setting);
                  assert.isUndefined(result.setting);
                  assert.strictEqual(result.organization.setting.projectDev.contributorPrice, sentData.contributorPrice);
                  assert.strictEqual(result.organization.setting.projectDev.contributorOccupation, sentData.contributorOccupation);
                  assert.strictEqual(result.organization.setting.projectManagement.scrummasterPrice, sentData.scrummasterPrice);
                  assert.strictEqual(result.organization.setting.projectManagement.scrummasterOccupation, sentData.scrummasterOccupation);
                  assert.strictEqual(result.organization.setting.billing.showDevPrice, sentData.showDev);
                  assert.strictEqual(result.organization.setting.billing.rateMultiplier, sentData.rateMultiplier);
                  assert.strictEqual(result.organization.setting.billing.showManagementPrice, sentData.showManagement);
                  assert.strictEqual(result.organization.setting.unit.estimateType, sentData.estimateType);
                  assert.strictEqual(result.organization.setting.unit.rangeEstimateUnit, sentData.rangeEstimateUnit);
                  assert.strictEqual(result.organization.setting.unit.label, sentData.label);
                  assert.strictEqual(result.organization.setting.date.show, sentData.showDate);
                  assert.strictEqual(result.organization.setting.iteration.contributorAvailable, sentData.contributorAvailable);
                  assert.strictEqual(result.organization.setting.iteration.hourPerDay, sentData.hourPerDay);
                  assert.strictEqual(result.organization.setting.iteration.dayPerWeek, sentData.dayPerWeek);
                  assert.strictEqual(result.organization.setting.iteration.weekPerIteration, sentData.weekPerIteration);
                  done();
                });
            });

            it('should create a sub-item setting in organization (with previewMode enabled)', function (done) {
              var sentData = require('./fixtures/setting/update-ok-1');
              sentData.organizationId = organizationId;
              sentData.modePreview = 1;
              agent
                .post(url + '/setting/edit')
                .send(sentData)
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 200);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, '10');
                  assert.isUndefined(result.organization);
                  assert.isDefined(result.setting);
                  assert.strictEqual(result.setting.projectDev.contributorPrice, sentData.contributorPrice);
                  assert.strictEqual(result.setting.projectDev.contributorOccupation, sentData.contributorOccupation);
                  assert.strictEqual(result.setting.projectManagement.scrummasterPrice, sentData.scrummasterPrice);
                  assert.strictEqual(result.setting.projectManagement.scrummasterOccupation, sentData.scrummasterOccupation);
                  assert.strictEqual(result.setting.billing.showDevPrice, sentData.showDev);
                  assert.strictEqual(result.setting.billing.rateMultiplier, sentData.rateMultiplier);
                  assert.strictEqual(result.setting.billing.showManagementPrice, sentData.showManagement);
                  assert.strictEqual(result.setting.unit.estimateType, sentData.estimateType);
                  assert.strictEqual(result.setting.unit.label, sentData.label);
                  assert.strictEqual(result.setting.date.show, sentData.showDate);
                  assert.strictEqual(result.setting.iteration.contributorAvailable, sentData.contributorAvailable);
                  assert.strictEqual(result.setting.iteration.hourPerDay, sentData.hourPerDay);
                  assert.strictEqual(result.setting.iteration.dayPerWeek, sentData.dayPerWeek);
                  assert.strictEqual(result.setting.iteration.weekPerIteration, sentData.weekPerIteration);
                  done();
                });
            });

            it('should get an internal error (update) for create a sub-item setting in organization (mongo fail)', function (done) {
              var sentData = require('./fixtures/setting/create-ok-1');
              sentData.organizationId = organizationId;
              sentData.itemId = '56961966de7cbad8ba3be467';
              agent
                .post(url + '/setting/edit')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .send(sentData)
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 404);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, '-11');
                  done();
                });
            });

            it('should get an internal error (update) for create a sub-item setting in organization (mongo fail)', function (done) {
              var sentData = require('./fixtures/setting/create-ok-1');
              sentData.organizationId = organizationId;
              sentData.itemId = projectId;
              agent
                .post(url + '/setting/edit')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .send(sentData)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 200);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, '10');
                  assert.isDefined(result.organization);
                  OrganizationModel.findDeepAttributeById(result.organization, projectId, function (element) {
                    assert.isDefined(element);
                    assert.isDefined(element.setting);
                    assert.strictEqual(element.setting.projectDev.contributorPrice, sentData.contributorPrice);
                    assert.strictEqual(element.setting.projectDev.contributorOccupation, sentData.contributorOccupation);
                    assert.strictEqual(element.setting.projectManagement.scrummasterPrice, sentData.scrummasterPrice);
                    assert.strictEqual(element.setting.projectManagement.scrummasterOccupation, sentData.scrummasterOccupation);
                    assert.strictEqual(element.setting.billing.showDevPrice, sentData.showDev);
                    assert.strictEqual(element.setting.billing.rateMultiplier, sentData.rateMultiplier);
                    assert.strictEqual(element.setting.billing.showManagementPrice, sentData.showManagement);
                    assert.strictEqual(element.setting.unit.estimateType, sentData.estimateType);
                    assert.strictEqual(element.setting.unit.label, sentData.label);
                    assert.strictEqual(element.setting.date.show, sentData.showDate);
                    assert.strictEqual(element.setting.iteration.contributorAvailable, sentData.contributorAvailable);
                    assert.strictEqual(element.setting.iteration.hourPerDay, sentData.hourPerDay);
                    assert.strictEqual(element.setting.iteration.dayPerWeek, sentData.dayPerWeek);
                    assert.strictEqual(element.setting.iteration.weekPerIteration, sentData.weekPerIteration);
                  });
                  done();
                });
            });
          });

          describe('# [GET] ~sub-item' + url + '/setting/sub', function () {
            it('should get an error request (not found because no organizationId given) a sub-item setting', function (done) {
              agent
                .get(url + '/setting/sub')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 404);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, '-1');
                  done();
                });
            });

            it('should get an internal error request (findById) a sub-item setting (mongo fail)', function (done) {
              mockModel(mongoose.model('Organization'), 'findById', function (stub) {
                agent
                  .get(url + '/setting/sub?organizationId=' + organizationId)
                  .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                  .expect(500)
                  .expect('Content-Type', 'application/json; charset=utf-8')
                  .end(function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    assert.strictEqual(result.code, 500);
                    assert.isDefined(result.error);
                    assert.strictEqual(result.messageCode, '-1');
                    stub.restore();
                    done();
                  });
              });
            });

            it('should get an error request (unknown organizationId) a sub-item setting', function (done) {
              agent
                .get(url + '/setting/sub?organizationId=56961966de7cbad8ba3be467')
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(404)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 404);
                  assert.isUndefined(result.error);
                  assert.strictEqual(result.messageCode, '-5');
                  done();
                });
            });

            it('should get a sub-item setting', function (done) {
              agent
                .get(url + '/setting/sub?organizationId=' + organizationId)
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 200);
                  assert.isUndefined(result.error);
                  assert.isUndefined(result.messageCode);
                  assert.isDefined(result.setting);
                  done();
                });
            });

            it('should get a sub-item setting', function (done) {
              agent
                .get(url + '/setting/sub?organizationId=' + organizationId + '&itemId=' + projectId)
                .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                  if (err) return done(err);
                  var result = res.body;
                  assert.strictEqual(result.code, 200);
                  assert.isUndefined(result.error);
                  assert.isUndefined(result.messageCode);
                  assert.isDefined(result.setting);
                  done();
                });
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
    }
  );
};

