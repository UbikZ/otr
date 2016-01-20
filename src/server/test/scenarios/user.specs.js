'use strict';

var fs = require('fs');
var assert = require('chai').assert;
var mongoose = require('mongoose');

var helpers = require('./../helpers');

module.exports = function (agent, url) {
  describe('> User API', function () {
    describe('# [GET] ' + url + '/user', function () {
      it('should get an internal error (mongo fail)', function (done) {
        helpers.mockModel(mongoose.model('User'), 'find', function (stub) {
          agent
            .get(url + '/user')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
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

      it('should get an error (empty response)', function (done) {
        helpers.mockModel(mongoose.model('User'), 'find', function (stub) {
          agent
            .get(url + '/user')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              var result = res.body;
              assert.strictEqual(result.code, 404);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, '-12');
              stub.restore();
              done();
            });
        }, true);
      });

      it('should request list of all users', function (done) {
        agent
          .get(url + '/user')
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
            assert.isArray(result.users);
            assert.strictEqual(result.users.length, 1);
            done();
          });
      });
    });

    describe('# [POST] ' + url + '/user/update', function () {
      it('should get an internal error (findOne) for update current user (mongo fail)', function (done) {
        var sentData = require('./../fixtures/user/update');
        helpers.mockModel(mongoose.model('User'), 'findOne', function (stub) {
          agent
            .post(url + '/user/update')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
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

      it('should get an error (empty response) for update current user', function (done) {
        var sentData = require('./../fixtures/user/update');
        helpers.mockModel(mongoose.model('User'), 'findOne', function (stub) {
          agent
            .post(url + '/user/update')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              var result = res.body;
              assert.strictEqual(result.code, 404);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, '-12');
              stub.restore();
              done();
            });
        }, true);
      });

      it('should get an internal error (update) for update current user (mongo fail)', function (done) {
        var sentData = require('./../fixtures/user/update');
        helpers.mockModel(mongoose.model('User'), 'update', function (stub) {
          agent
            .post(url + '/user/update')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
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

      it('should update current user', function (done) {
        var sentData = require('./../fixtures/user/update');
        agent
          .post(url + '/user/update')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
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
            assert.strictEqual(result.messageCode, '11');
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
};