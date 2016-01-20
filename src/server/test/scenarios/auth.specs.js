'use strict';

var fs = require('fs');
var assert = require('chai').assert;
var mongoose = require('mongoose');

var helpers = require('./../helpers');
var ontimeRequester = require('../../controllers/helpers/ontime');

module.exports = function (agent, url) {
  var tokenBearer, tokenOtBearer;

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
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 500);
            assert.strictEqual(result.messageCode, '-1');
            done();
          });
      });

      it('should get an internal error on sign-up (mongo fail)', function (done) {
        var sentData = {username: 'test_stage', password: 'test_stage'};
        var expectedData = require('./../fixtures/auth/signup');
        ontimeRequester.requestToken = function (authObject, cb) {
          /*jshint camelcase: false */
          expectedData.access_token += 'delta';
          /*jshint camelcase: true */
          cb(JSON.stringify(expectedData));
        };

        helpers.mockModel(mongoose.model('User'), 'findOne', function (stub) {
          agent
            .post(url + '/sign-up')
            .send(sentData)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              var result = res.body;
              assert.strictEqual(result.code, 500);
              assert.strictEqual(result.messageCode, '-1');
              assert.isDefined(result.error);
              stub.restore();
              done();
            });
        });
      });

      it('should get an internal error on the create (mongo fail)', function (done) {
        var sentData = {username: 'test_stage', password: 'test_stage'};
        var expectedData = require('./../fixtures/auth/signup');
        ontimeRequester.requestToken = function (authObject, cb) {
          /*jshint camelcase: false */
          expectedData.access_token += 'delta';
          /*jshint camelcase: true */
          cb(JSON.stringify(expectedData));
        };

        helpers.mockModel(mongoose.model('User'), 'update', function (stub) {
          agent
            .post(url + '/sign-up')
            .send(sentData)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              var result = res.body;
              assert.strictEqual(result.code, 500);
              assert.strictEqual(result.messageCode, '-1');
              assert.isDefined(result.error);
              stub.restore();
              done();
            });
        });
      });

      it('should sign-up new user the first time', function (done) {
        var sentData = {username: 'test_stage', password: 'test_stage'};
        var expectedData = require('./../fixtures/auth/signup');
        ontimeRequester.requestToken = function (authObject, cb) {
          /*jshint camelcase: false */
          expectedData.access_token += 'delta';
          /*jshint camelcase: true */
          cb(JSON.stringify(expectedData));
        };
        agent
          .post(url + '/sign-up')
          .send(sentData)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '1');
            assert.isDefined(result.user);
            assert.strictEqual(result.user.info.email, expectedData.data.email);
            /*jshint camelcase: false */
            assert.strictEqual(result.user.name.firstname, expectedData.data.first_name);
            assert.strictEqual(result.user.name.lastname, expectedData.data.last_name);
            assert.strictEqual(result.user.identity.ontimeToken, expectedData.access_token);
            /*jshint camelcase: true */
            assert.strictEqual(result.user.name.username, sentData.username);
            assert.isDefined(result.user.identity.token);
            tokenOtBearer = result.user.identity.ontimeToken;
            done();
          });
      });

      it('should get an internal error on sign-up same user the others times (mongo fail)', function (done) {
        var sentData = {username: 'test_stage', password: 'test_stage'};
        helpers.mockModel(mongoose.model('User'), 'update', function (stub) {
          agent
            .post(url + '/sign-up')
            .send(sentData)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              var result = res.body;
              assert.strictEqual(result.code, 500);
              assert.strictEqual(result.messageCode, '-1');
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
            if (err) {
              return done(err);
            }
            var result = res.body, expectedData = require('./../fixtures/auth/signup');
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '1');
            assert.isDefined(result.user);
            assert.strictEqual(result.user.info.email, expectedData.data.email);
            /*jshint camelcase: false */
            assert.strictEqual(result.user.name.firstname, expectedData.data.first_name);
            assert.strictEqual(result.user.name.lastname, expectedData.data.last_name);
            assert.strictEqual(result.user.identity.ontimeToken, expectedData.access_token);
            /*jshint camelcase: true */
            assert.strictEqual(result.user.name.username, sentData.username);
            assert.isDefined(result.user.identity.token);
            assert.notEqual(tokenOtBearer, result.user.identity.ontimeToken);
            // We set tokens for next tests
            global.tokenOtBearer = tokenOtBearer = result.user.identity.ontimeToken;
            global.tokenBearer = tokenBearer = result.user.identity.token;
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
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-3');
            done();
          });
      });

      it('should get an internal error on request information for logged user (mongo fail)', function (done) {
        helpers.mockModel(mongoose.model('User'), 'findOne', function (stub) {
          agent
            .get(url + '/me')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              var result = res.body;
              assert.strictEqual(result.code, 500);
              assert.isDefined(result.error);
              assert.strictEqual(result.messageCode, '-1');
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
            if (err) {
              return done(err);
            }
            var result = res.body, expectedData = require('./../fixtures/auth/signup');
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isDefined(result.user);
            assert.strictEqual(result.user.info.email, expectedData.data.email);
            /*jshint camelcase: false */
            assert.strictEqual(result.user.name.firstname, expectedData.data.first_name);
            assert.strictEqual(result.user.name.lastname, expectedData.data.last_name);
            /*jshint camelcase: true */
            assert.isDefined(result.user.name.username);
            assert.strictEqual(result.user.identity.ontimeToken, tokenOtBearer);
            assert.strictEqual(result.user.identity.token, tokenBearer);
            done();
          });
      });
    });
  });
};