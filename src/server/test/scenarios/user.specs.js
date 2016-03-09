'use strict';

const assert = require('chai').assert;
const mongoose = require('mongoose');

const Helper = require('./../Helper');

/**
 * User Scenario
 * @param agent
 * @param url
 */
module.exports = (agent, url) => {
  describe('> User API', () => {
    describe('# [GET] ' + url + '/user', () => {
      it('should get an internal error (mongo fail)', done => {
        Helper.mockModel(mongoose.model('User'), 'find', stub => {
          agent
            .get(url + '/user')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 500);
              assert.isDefined(result.error);
              assert.strictEqual(result.error.type, 'Error');
              assert.strictEqual(result.messageCode, '-1');
              stub.restore();
              done();
            })
            .catch(err => done(err));
        }, false);
      });

      it('should get an error (empty response)', done => {
        Helper.mockModel(mongoose.model('User'), 'find', stub => {
          agent
            .get(url + '/user')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 404);
              assert.isDefined(result.error);
              assert.strictEqual(result.error.type, 'EmptyUserError');
              assert.strictEqual(result.messageCode, '-12');
              stub.restore();
              done();
            })
            .catch(err => done(err));
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
          .catch(err => done(err));
      });

      it('should request list of users with specific email (found 1)', done => {
        const authUser = require('./../fixtures/auth/signup');
        agent
          .get(url + '/user?info.email=' + authUser.data.email)
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
          .catch(err => done(err));
      });

      it('should request list of users with specific email (found 0)', done => {
        agent
          .get(url + '/user?info.email=testBadEmail@test.com')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isArray(result.users);
            assert.strictEqual(result.users.length, 0);
            done();
          })
          .catch(err => done(err));
      });
      it('should request ONE user by his object ID (not found)', done => {
        agent
          .get(url + '/user/56961966de7cbad8ba3be46d')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isArray(result.users);
            assert.strictEqual(result.users.length, 0);
            done();
          })
          .catch(err => done(err));
      });

      it('should request ONE user by his object ID (found)', done => {
        agent
          .get(url + '/user/' + global.userId)
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
          .catch(err => done(err));
      });
    });

    describe('# [POST] ' + url + '/user/update', () => {
      it('should get 404 not found (missing parameter)', done => {
        const apiUrl = url + '/user/update';
        agent
          .post(apiUrl)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'text/html; charset=utf-8')
          .then(res => {
            const result = res.text;
            assert.strictEqual(result, 'Cannot POST ' + apiUrl + '\n');
            done();
          })
          .catch(err => done(err));
      });

      it('should get an internal error (findOne) for update current user (mongo fail)', done => {
        const sentData = require('./../fixtures/user/update');
        Helper.mockModel(mongoose.model('User'), 'findOne', stub => {
          agent
            .post(url + '/user/update/' + global.userId)
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 500);
              assert.isDefined(result.error);
              assert.strictEqual(result.error.type, 'Error');
              assert.strictEqual(result.messageCode, '-1');
              stub.restore();
              done();
            })
            .catch(err => done(err));
        }, false);
      });

      it('should get an error (empty response) for update current user', done => {
        const sentData = require('./../fixtures/user/update');
        Helper.mockModel(mongoose.model('User'), 'findOne', stub => {
          agent
            .post(url + '/user/update/' + global.userId)
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 404);
              assert.isDefined(result.error);
              assert.strictEqual(result.error.type, 'EmptyUserError');
              assert.strictEqual(result.messageCode, '-12');
              stub.restore();
              done();
            })
            .catch(err => done(err));
        }, true);
      });

      it('should get an internal error (update) for update current user (mongo fail)', done => {
        const sentData = require('./../fixtures/user/update');
        Helper.mockModel(mongoose.model('User'), 'update', stub => {
          agent
            .post(url + '/user/update/' + global.userId)
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 500);
              assert.isDefined(result.error);
              assert.strictEqual(result.error.type, 'Error');
              assert.strictEqual(result.messageCode, '-1');
              stub.restore();
              done();
            })
            .catch(err => done(err));
        }, false);
      });

      it('should update current user', done => {
        const sentData = require('./../fixtures/user/update');
        agent
          .post(url + '/user/update/' + global.userId)
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
            assert.strictEqual(result.user.name.firstname, sentData['name.firstname']);
            assert.strictEqual(result.user.name.lastname, sentData['name.lastname']);
            assert.strictEqual(result.user.info.skype, sentData['info.skype']);
            assert.strictEqual(result.user.info.job, sentData['info.job']);
            done();
          })
          .catch(err => done(err));
      });
    });
  });
};
