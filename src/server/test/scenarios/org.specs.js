'use strict';

const assert = require('chai').assert;
const mongoose = require('mongoose');

const Helper = require('./../Helper');

/**
 * Organization Scenario
 * @param agent
 * @param url
 */
module.exports = (agent, url) => {
  describe('> Organization API', () => {
    let organizationId;

    describe('# [POST] ' + url + '/organization/edit', () => {
      it('should get an internal error on "findById" (mongo fail)', done => {
        Helper.mockModel(mongoose.model('Organization'), 'findById', stub => {
          agent
            .post(url + '/organization/edit')
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
            .catch(err => done(err))
          ;
        });
      });

      it('should get an internal error on create (mongo fail)', done => {
        const sentData = require('./../fixtures/organization/create');
        Helper.mockModel(mongoose.model('Organization'), 'update', stub => {
          agent
            .post(url + '/organization/edit')
            .send(sentData)
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
            .catch(err => done(err))
          ;
        });
      });

      it('should create new organization', done => {
        const sentData = require('./../fixtures/organization/create');
        agent
          .post(url + '/organization/edit')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .send(sentData)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
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
          })
          .catch(err => done(err))
        ;
      });

      it('should get an internal error on update (mongo fail)', done => {
        const sentData = require('./../fixtures/organization/update');
        sentData._id = organizationId;
        Helper.mockModel(mongoose.model('Organization'), 'update', stub => {
          agent
            .post(url + '/organization/edit')
            .send(sentData)
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

      it('should update organization', done => {
        const sentData = require('./../fixtures/organization/update');
        sentData._id = organizationId;
        agent
          .post(url + '/organization/edit')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .send(sentData)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
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
          })
          .catch(err => done(err))
        ;
      });

      it('should update organization (with lazy loading)', done => {
        const sentData = require('./../fixtures/organization/update');
        sentData._id = organizationId;
        sentData.lazy = 1;
        agent
          .post(url + '/organization/edit')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .send(sentData)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
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
          })
          .catch(err => done(err))
        ;
      });
    });

    describe('# [GET] ' + url + '/organization', () => {
      it('should get an internal error (mongo fail)', done => {
        Helper.mockModel(mongoose.model('Organization'), 'find', stub => {
          agent
            .get(url + '/organization')
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

      it('should get an empty array (unknown organizationId : not found)', done => {
        agent
          .get(url + '/organization?id=56961966de7cbad8ba3be46d')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isArray(result.organizations);
            assert.strictEqual(result.organizations.length, 0);
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error 404 not found (query issue)', done => {
        Helper.mockModel(mongoose.model('Organization'), 'find', stub => {
          agent
            .get(url + '/organization?id=' + organizationId)
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 404);
              assert.isDefined(result.error);
              assert.strictEqual(result.error.type, 'EmptyOrganizationError');
              assert.strictEqual(result.messageCode, '-9');
              stub.restore();
              done();
            })
            .catch(err => done(err))
          ;
        }, true);
      });

      it('should request one organization', done => {
        agent
          .get(url + '/organization?id=' + organizationId)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isArray(result.organizations);
            assert.strictEqual(result.organizations.length, 1);
            assert.isArray(result.organizations[0].projects);
            done();
          })
          .catch(err => done(err))
        ;
      });


      it('should request list of all organizations (without lazy loading)', done => {
        agent
          .get(url + '/organization?')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isArray(result.organizations);
            assert.strictEqual(result.organizations.length, 1);
            assert.isArray(result.organizations[0].projects);
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should request list of all organizations (with lazy loading)', done => {
        agent
          .get(url + '/organization?lazy=1')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isArray(result.organizations);
            assert.strictEqual(result.organizations.length, 1);
            assert.isUndefined(result.organizations[0].projects);
            done();
          })
          .catch(err => done(err))
        ;
      });
    });

    describe('# [DELETE] ' + url + '/organization/delete/:idOrganization', () => {
      it('should get 404 not found (missing parameter)', done => {
        const apiUrl = url + '/organization/delete';
        agent
          .delete(apiUrl)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'text/html; charset=utf-8')
          .then(res => {
            const result = res.text;
            assert.strictEqual(result, 'Cannot DELETE ' + apiUrl + '\n');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an internal error (mongo fail)', done => {
        Helper.mockModel(mongoose.model('Organization'), 'findByIdAndRemove', stub => {
          agent
            .delete(url + '/organization/delete/' + organizationId)
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

      it('should delete one organization', done => {
        agent
          .delete(url + '/organization/delete/' + organizationId)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '7');
            done();
          })
          .catch(err => done(err))
        ;
      });
    });
  });
};
