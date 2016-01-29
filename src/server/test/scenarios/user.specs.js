'use strict';

const assert = require('chai').assert;
const mongoose = require('mongoose');

const helpers = require('./../helpers');

module.exports = (agent, url) => {
  describe('> User API', () => {
    describe('# [GET] ' + url + '/user', () => {
      it('should get an internal error (mongo fail)', done => {
        helpers.mockModel(mongoose.model('User'), 'find', stub => {
          agent
            .get(url + '/user')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 500);
              assert.isDefined(result.error);
              assert.strictEqual(result.messageCode, '-1');
              stub.restore();
              done();
            })
            .catch(err => done(err))
          ;
        });
      });

      it('should get an error (empty response)', done => {
        helpers.mockModel(mongoose.model('User'), 'find', stub => {
          agent
            .get(url + '/user')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 404);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, '-12');
              stub.restore();
              done();
            })
            .catch(err => done(err))
          ;
        }, true);
      });

      it('should request list of all users', done => {
        agent
          .get(url + '/user')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isArray(result.users);
            assert.strictEqual(result.users.length, 1);
            done();
          })
          .catch(err => done(err))
        ;
      });
    });

    describe('# [POST] ' + url + '/user/update', () => {
      it('should get an internal error (findOne) for update current user (mongo fail)', done => {
        const sentData = require('./../fixtures/user/update');
        helpers.mockModel(mongoose.model('User'), 'findOne', stub => {
          agent
            .post(url + '/user/update')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 500);
              assert.isDefined(result.error);
              assert.strictEqual(result.messageCode, '-1');
              stub.restore();
              done();
            })
            .catch(err => done(err))
          ;
        });
      });

      it('should get an error (empty response) for update current user', done => {
        const sentData = require('./../fixtures/user/update');
        helpers.mockModel(mongoose.model('User'), 'findOne', stub => {
          agent
            .post(url + '/user/update')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 404);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, '-12');
              stub.restore();
              done();
            })
            .catch(err => done(err))
          ;
        }, true);
      });

      it('should get an internal error (update) for update current user (mongo fail)', done => {
        const sentData = require('./../fixtures/user/update');
        helpers.mockModel(mongoose.model('User'), 'update', stub => {
          agent
            .post(url + '/user/update')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 500);
              assert.isDefined(result.error);
              assert.strictEqual(result.messageCode, '-1');
              stub.restore();
              done();
            })
            .catch(err => done(err))
          ;
        });
      });

      it('should update current user', done => {
        const sentData = require('./../fixtures/user/update');
        agent
          .post(url + '/user/update')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .send(sentData)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '11');
            assert.isDefined(result.user);
            assert.strictEqual(result.user.name.firstname, sentData.firstname);
            assert.strictEqual(result.user.name.lastname, sentData.lastname);
            assert.strictEqual(result.user.info.skype, sentData.skype);
            assert.strictEqual(result.user.info.job, sentData.job);
            done();
          })
          .catch(err => done(err))
        ;
      });
    });
  });
};