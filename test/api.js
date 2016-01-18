'use strict';

var request = require('supertest');
var mongoose = require('mongoose');
var should = require('chai').should();
var assert = require('chai').assert;
var config = require('../config');
var moment = require('moment');
var ontimeRequester = require('../src/server/controllers/helpers/ontime');

// Generic mock method
function invalidOntimeAPIResponse() {
  var cb;
  if (typeof (arguments[1]) == 'function') {
    cb = arguments[1];
  } else if (typeof (arguments[2]) == 'function') {
    cb = arguments[2];
  }
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
              assert.strictEqual(result.items.length, 2);
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
      var organizationId, projectId, documentId;
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

        it('should get an error because bad not parentId / "project" type given', function (done) {
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
              [versions[1].setting, result.item.setting].forEach(function(element) {
                  assert.strictEqual(element.project_dev.contributor_price, expectedData.setting.contributorPrice);
                  assert.strictEqual(element.project_dev.contributor_occupation, expectedData.setting.contributorOccupation);
                  assert.strictEqual(element.project_management.scrummaster_price, expectedData.setting.scrummasterPrice);
                  assert.strictEqual(element.project_management.scrummaster_occupation, expectedData.setting.scrummasterOccupation);
                  assert.strictEqual(element.billing.show_dev_price, expectedData.setting.showDev);
                  assert.strictEqual(element.billing.rate_multiplier, expectedData.setting.rateMultiplier);
                  assert.strictEqual(element.billing.show_management_price, expectedData.setting.showManagement);
                  assert.strictEqual(element.unit.estimate_type, expectedData.setting.estimateType);
                  assert.strictEqual(element.unit.range_estimate_unit, expectedData.setting.rangeEstimateUnit);
                  assert.strictEqual(element.unit.label, expectedData.setting.label);
                  assert.strictEqual(element.date.show, expectedData.setting.showDate);
                  assert.strictEqual(element.iteration.contributor_available, expectedData.setting.contributorAvailable);
                  assert.strictEqual(element.iteration.hour_per_day, expectedData.setting.hourPerDay);
                  assert.strictEqual(element.iteration.day_per_week, expectedData.setting.dayPerWeek);
                  assert.strictEqual(element.iteration.week_per_iteration, expectedData.setting.weekPerIteration);
                });
              done();
            });
        });
      });

      describe('# [POST] ' + url + '/item/update', function () {
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

