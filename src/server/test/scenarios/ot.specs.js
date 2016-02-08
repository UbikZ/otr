'use strict';

const assert = require('chai').assert;

const Helper = require('./../Helper');
const Ontime = require('../../controllers/helpers/Ontime');

/**
 * OnTime Scenario
 * @param agent
 * @param url
 */
module.exports = (agent, url) => {
  const apiUrl = url;

  url += '/on-time';

  describe('> Ontime API', () => {
    describe('# [POST] Request token generic error', () => {
      it('should get an error for request token', done => {
        Ontime.requestToken = Helper.invalidOntimeAPIResponse;
        agent
          .post(apiUrl + '/authentication/sign-up')
          .send({})
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 403);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-3');
            done();
          })
          .catch(err => done(err))
        ;
      });
    });

    describe('# [GET] ' + url + '/me', () => {
      it('should get an error with token', done => {
        Ontime.me = Helper.internalErrorOntimeAPIResponse;
        agent
          .get(url + '/me')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 500);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an internal error', done => {
        Ontime.me = Helper.invalidOntimeAPIResponse;
        agent
          .get(url + '/me')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 403);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-3');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get ontime user information', done => {
        const expectedData = require('./../fixtures/ontime/me');
        Ontime.me = (token, cb) => {
          cb(JSON.stringify(expectedData));
        };
        agent
          .get(url + '/me')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isDefined(result.ontimeUser);
            ['id', 'login_id', 'is_active', 'is_locked', 'last_login_date_time', 'created_date_time',
              'culture_info', 'first_name', 'last_name', 'email', 'is_admin']
              .forEach(item => {
                assert.strictEqual(result.ontimeUser[item], expectedData.data[item]);
              });
            done();
          })
          .catch(err => done(err))
        ;
      });
    });

    describe('# [GET] ' + url + '/tree', () => {
      it('should get an error with token', done => {
        Ontime.tree = Helper.invalidOntimeAPIResponse;
        agent
          .get(url + '/tree')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 403);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-3');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error with token', done => {
        Ontime.tree = Helper.internalErrorOntimeAPIResponse;
        agent
          .get(url + '/tree')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 500);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get ontime tree items', done => {
        const expectedData = require('./../fixtures/ontime/tree');
        Ontime.tree = (token, id, cb) => {
          cb(JSON.stringify(expectedData));
        };
        agent
          .get(url + '/tree')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
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
          })
          .catch(err => done(err))
        ;
      });
    });

    describe('# [GET] ' + url + '/items', () => {
      it('should get an error with token', done => {
        Ontime.items = Helper.invalidOntimeAPIResponse;
        agent
          .get(url + '/items')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 403);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-3');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error with token', done => {
        Ontime.items = Helper.internalErrorOntimeAPIResponse;
        agent
          .get(url + '/items')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 500);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get ontime tree items', done => {
        const expectedData = require('./../fixtures/ontime/items');
        Ontime.items = (token, projectId, cb) => {
          cb(JSON.stringify(expectedData));
        };
        agent
          .get(url + '/items')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isArray(result.items);
            assert.strictEqual(result.items.length, 3);
            result.items.forEach((item, index) => {
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
          })
          .catch(err => done(err))
        ;
      });
    });
  });
};