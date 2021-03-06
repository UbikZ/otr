'use strict';

const assert = require('chai').assert;
const mongoose = require('mongoose');

const helpers = require('./../helpers');
const ontimeRequester = require('../../controllers/helpers/ontime');

module.exports = (agent, url) => {
  let tokenBearer, tokenOtBearer;

  describe('> Authentication API', () => {
    describe('# [POST] ' + url + '/sign-up', () => {
      it('should get an error on sign-up for bad user data', done => {
        ontimeRequester.requestToken = (authObject, cb) => {
          cb(JSON.stringify({}));
        };
        agent
          .post(url + '/sign-up')
          .send({})
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 500);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err));
      });

      it('should get an internal error on sign-up (mongo fail)', done => {
        const sentData = { username: 'test_stage', password: 'test_stage' };
        const expectedData = require('./../fixtures/auth/signup');
        ontimeRequester.requestToken = (authObject, cb) => {
          /*jshint camelcase: false */
          expectedData.access_token += 'delta';
          /*jshint camelcase: true */
          cb(JSON.stringify(expectedData));
        };

        helpers.mockModel(mongoose.model('User'), 'findOne', stub => {
          agent
            .post(url + '/sign-up')
            .send(sentData)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 500);
              assert.strictEqual(result.messageCode, '-1');
              assert.isDefined(result.error);
              stub.restore();
              done();
            })
            .catch(err => done(err));
        });
      });

      it('should get an internal error on the create (mongo fail)', done => {
        const sentData = { username: 'test_stage', password: 'test_stage' };
        const expectedData = require('./../fixtures/auth/signup');
        ontimeRequester.requestToken = (authObject, cb) => {
          /*jshint camelcase: false */
          expectedData.access_token += 'delta';
          /*jshint camelcase: true */
          cb(JSON.stringify(expectedData));
        };

        helpers.mockModel(mongoose.model('User'), 'update', stub => {
          agent
            .post(url + '/sign-up')
            .send(sentData)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 500);
              assert.strictEqual(result.messageCode, '-1');
              assert.isDefined(result.error);
              stub.restore();
              done();
            })
            .catch(err => done(err));
        });
      });

      it('should sign-up new user the first time', done => {
        const sentData = { username: 'test_stage', password: 'test_stage' };
        const expectedData = require('./../fixtures/auth/signup');
        ontimeRequester.requestToken = (authObject, cb) => {
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
          .then(res => {
            const result = res.body;
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
          })
          .catch(err => done(err));
      });

      it('should get an internal error on sign-up same user the others times (mongo fail)', done => {
        const sentData = { username: 'test_stage', password: 'test_stage' };
        helpers.mockModel(mongoose.model('User'), 'update', stub => {
          agent
            .post(url + '/sign-up')
            .send(sentData)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 500);
              assert.strictEqual(result.messageCode, '-1');
              assert.isDefined(result.error);
              stub.restore();
              done();
            })
            .catch(err => done(err));
        });
      });

      it('should sign-up same user the others times', done => {
        const sentData = { username: 'test_stage', password: 'test_stage' };
        agent
          .post(url + '/sign-up')
          .send(sentData)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body,
              expectedData = require('./../fixtures/auth/signup');
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
          })
          .catch(err => done(err));
      });
    });

    describe('# [GET] ' + url + '/me', () => {
      it('should get error on request information for logged user (bad token)', done => {
        agent
          .get(url + '/me')
          .set('Authorization', 'Bearer bad_token ' + tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-3');
            done();
          })
          .catch(err => done(err));
      });

      it('should get an internal error on request information for logged user (mongo fail)', done => {
        helpers.mockModel(mongoose.model('User'), 'findOne', stub => {
          agent
            .get(url + '/me')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
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
            .catch(err => done(err));
        });
      });

      it('should request information for logged user', done => {
        agent
          .get(url + '/me')
          .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body,
              expectedData = require('./../fixtures/auth/signup');
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
          })
          .catch(err => done(err));
      });
    });
  });
};
