'use strict';

var fs = require('fs');
var assert = require('chai').assert;
var mongoose = require('mongoose');

var helpers = require('./../helpers');
var ontimeRequester = require('../../controllers/helpers/ontime');

module.exports = function (agent, url) {
  describe('> Ontime API', function () {
    describe('# [POST] Request token generic error', function () {
      it('should get an error for request token', function (done) {
        ontimeRequester.requestToken = helpers.invalidOntimeAPIResponse;
        agent
          .post(url + '/sign-up')
          .send({})
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 403);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-3');
            done();
          });
      });
    });

    describe('# [GET] ' + url + '/ontime/me', function () {
      it('should get an error with token', function (done) {
        ontimeRequester.me = helpers.internalErrorOntimeAPIResponse;
        agent
          .get(url + '/ontime/me')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 500);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          });
      });

      it('should get an internal error', function (done) {
        ontimeRequester.me = helpers.invalidOntimeAPIResponse;
        agent
          .get(url + '/ontime/me')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 403);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-3');
            done();
          });
      });

      it('should get ontime user information', function (done) {
        var expectedData = require('./../fixtures/ontime/me');
        ontimeRequester.me = function (token, cb) {
          cb(JSON.stringify(expectedData));
        };
        agent
          .get(url + '/ontime/me')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
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
        ontimeRequester.tree = helpers.invalidOntimeAPIResponse;
        agent
          .get(url + '/ontime/tree')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 403);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-3');
            done();
          });
      });

      it('should get an error with token', function (done) {
        ontimeRequester.tree = helpers.internalErrorOntimeAPIResponse;
        agent
          .get(url + '/ontime/tree')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 500);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          });
      });

      it('should get ontime tree items', function (done) {
        var expectedData = require('./../fixtures/ontime/tree');
        ontimeRequester.tree = function (token, cb) {
          cb(JSON.stringify(expectedData));
        };
        agent
          .get(url + '/ontime/tree')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
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
        ontimeRequester.items = helpers.invalidOntimeAPIResponse;
        agent
          .get(url + '/ontime/items')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 403);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-3');
            done();
          });
      });

      it('should get an error with token', function (done) {
        ontimeRequester.items = helpers.internalErrorOntimeAPIResponse;
        agent
          .get(url + '/ontime/items')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 500);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          });
      });

      it('should get ontime tree items', function (done) {
        var expectedData = require('./../fixtures/ontime/items');
        ontimeRequester.items = function (token, projectId, cb) {
          cb(JSON.stringify(expectedData));
        };
        agent
          .get(url + '/ontime/items')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isArray(result.items);
            assert.strictEqual(result.items.length, 3);
            result.items.forEach(function (item, index) {
              assert.strictEqual(item.parent.id, expectedData.data[index].parent.id);
              /*jshint camelcase: false */
              assert.strictEqual(item.parent_project.id, expectedData.data[index].parent_project.id);
              assert.strictEqual(item.parent_project.name, expectedData.data[index].parent_project.name);
              assert.strictEqual(item.parent_project.path, expectedData.data[index].parent_project.path);
              /*jshint camelcase: true */
              assert.strictEqual(item.name, expectedData.data[index].name);
              assert.strictEqual(item.description, expectedData.data[index].description);
              assert.strictEqual(item.notes, expectedData.data[index].notes);
            });
            done();
          });
      });
    });
  });
};