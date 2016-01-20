'use strict';

var fs = require('fs');
var assert = require('chai').assert;
var mongoose = require('mongoose');

var helpers = require('./../helpers');

module.exports = function (agent, url) {
  describe('> Organization API', function () {
    var organizationId;
    describe('# [POST] ' + url + '/organization/edit', function () {
      it('should get an internal error on "findById" (mongo fail)', function (done) {
        helpers.mockModel(mongoose.model('Organization'), 'findById', function (stub) {
          agent
            .post(url + '/organization/edit')
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

      it('should get an internal error on create (mongo fail)', function (done) {
        var sentData = require('./../fixtures/organization/create');
        helpers.mockModel(mongoose.model('Organization'), 'update', function (stub) {
          agent
            .post(url + '/organization/edit')
            .send(sentData)
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

      it('should create new organization', function (done) {
        var sentData = require('./../fixtures/organization/create');
        agent
          .post(url + '/organization/edit')
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
            assert.strictEqual(result.messageCode, '5');
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
        var sentData = require('./../fixtures/organization/update');
        sentData._id = organizationId;
        helpers.mockModel(mongoose.model('Organization'), 'update', function (stub) {
          agent
            .post(url + '/organization/edit')
            .send(sentData)
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

      it('should update organization', function (done) {
        var sentData = require('./../fixtures/organization/update');
        sentData._id = organizationId;
        agent
          .post(url + '/organization/edit')
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
            assert.strictEqual(result.messageCode, '6');
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
        var sentData = require('./../fixtures/organization/update');
        sentData._id = organizationId;
        sentData.lazy = 1;
        agent
          .post(url + '/organization/edit')
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
            assert.strictEqual(result.messageCode, '6');
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
        helpers.mockModel(mongoose.model('Organization'), 'find', function (stub) {
          agent
            .get(url + '/organization')
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

      it('should get an empty array (unknown organizationId : not found)', function (done) {
        agent
          .get(url + '/organization?id=56961966de7cbad8ba3be46d')
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
            assert.isArray(result.organizations);
            assert.strictEqual(result.organizations.length, 0);
            done();
          });
      });

      it('should get an error 404 not found (query issue)', function (done) {
        helpers.mockModel(mongoose.model('Organization'), 'find', function (stub) {
          agent
            .get(url + '/organization?id=' + organizationId)
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
              assert.strictEqual(result.messageCode, '-9');
              stub.restore();
              done();
            });
        }, true);
      });

      it('should request one organization', function (done) {
        agent
          .get(url + '/organization?id=' + organizationId)
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
            assert.isArray(result.organizations);
            assert.strictEqual(result.organizations.length, 1);
            assert.isArray(result.organizations[0].projects);
            done();
          });
      });


      it('should request list of all organizations (without lazy loading)', function (done) {
        agent
          .get(url + '/organization?')
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
            assert.isArray(result.organizations);
            assert.strictEqual(result.organizations.length, 1);
            assert.isArray(result.organizations[0].projects);
            done();
          });
      });

      it('should request list of all organizations (with lazy loading)', function (done) {
        agent
          .get(url + '/organization?lazy=1')
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
            assert.isArray(result.organizations);
            assert.strictEqual(result.organizations.length, 1);
            assert.isUndefined(result.organizations[0].projects);
            done();
          });
      });
    });

    describe('# [DELETE] ' + url + '/organization/delete', function () {
      it('should get an internal error (mongo fail)', function (done) {
        helpers.mockModel(mongoose.model('Organization'), 'findByIdAndRemove', function (stub) {
          agent
            .post(url + '/organization/delete')
            .send({id: organizationId})
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

      it('should delete one organization', function (done) {
        agent
          .post(url + '/organization/delete')
          .send({id: organizationId})
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
            assert.strictEqual(result.messageCode, '7');
            done();
          });
      });
    });
  });
};