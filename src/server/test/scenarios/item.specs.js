'use strict';

const assert = require('chai').assert;
const mongoose = require('mongoose');

const helpers = require('./../helpers');
//const ontimeRequester = require('../../controllers/helpers/ontime');
const OrganizationModel = require('../../models/organization');

module.exports = (agent, url) => {
  describe('> Item API', () => {
    let documentId/*, versionId, versionOtherId*/;
    before('should create new organization', done => {
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
          global.organizationId = result.organization._id;
          done();
        })
        .catch(err => done(err))
      ;
    });

    describe('# [POST] ' + url + '/item/create', () => {
      it('should get an error because no organization identifier given', done => {
        const sentData = {};
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because bad organization identifier-type given', done => {
        const sentData = {organizationId: 'badIdea#joke'};
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 500);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because bad (not known) organization identifier given', done => {
        const sentData = {organizationId: '569a498efd2e11a55a2822f4'};
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-5');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because no "parentId" and no "project" type given', done => {
        const sentData = require('./../fixtures/item/create-ko-1');
        sentData.organizationId = global.organizationId;
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-7');
            done();
          })
          .catch(err => done(err))
        ;
      });

      /*it('should get an error because unknown parentId given', done => {
        const sentData = require('./../fixtures/item/create-ko-1');
        sentData.organizationId = global.organizationId;
        sentData.parentId = '56961966de7cbad8ba3be464';
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-7');
            done();
          })
          .catch(err => done(err))
        ;
      });*/

      it('should get an internal error (mongo fail)', done => {
        helpers.mockModel(mongoose.model('Organization'), 'update', stub => {
          const sentData = require('./../fixtures/item/create-ok-1');
          sentData.organizationId = global.organizationId;
          agent
            .post(url + '/item/create')
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

      it('should create a new project in the organization', done => {
        const sentData = require('./../fixtures/item/create-ok-1');
        sentData.organizationId = global.organizationId;
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '2');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].name, sentData.name);
            assert.strictEqual(result.organization.projects[0].description, sentData.description);
            assert.isDefined(result.item);
            assert.strictEqual(result.item.name, sentData.name);
            assert.strictEqual(result.item.description, sentData.description);
            assert.isDefined(result.type);
            global.projectId = result.item._id;
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because bad  "project" type given', done => {
        const sentData = require('./../fixtures/item/create-ko-1');
        sentData.organizationId = global.organizationId;
        sentData.parentId = global.projectId;
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-7');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should create a new project in the only project of the organization', done => {
        const sentData = require('./../fixtures/item/create-ok-1');
        sentData.organizationId = global.organizationId;
        sentData.parentId = global.projectId;
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '2');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].name, sentData.name);
            assert.strictEqual(result.organization.projects[0].projects[0].description, sentData.description);
            assert.isDefined(result.item);
            assert.strictEqual(result.item.name, sentData.name);
            assert.strictEqual(result.item.description, sentData.description);
            assert.isDefined(result.type);
            global.projectId = result.item._id;
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should create a new document in the subProject of the only project of the organization', done => {
        const sentData = require('./../fixtures/item/create-ok-2');
        sentData.organizationId = global.organizationId;
        sentData.parentId = global.projectId;
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '2');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].documents[0].name, sentData.name);
            assert.strictEqual(
              result.organization.projects[0].projects[0].documents[0].description,
              sentData.description
            );
            assert.isDefined(result.item);
            assert.strictEqual(result.item.name, sentData.name);
            assert.strictEqual(result.item.description, sentData.description);
            assert.isDefined(result.type);
            documentId = result.item._id;
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because no "ontimeId" given (for version create)', done => {
        const sentData = require('./../fixtures/item/create-ko-1');
        sentData.organizationId = global.organizationId;
        sentData.parentId = documentId;
        sentData.type = 'version';
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-7');
            done();
          })
          .catch(err => done(err))
        ;
      });

      /*it('should get an error because ontimeRequester.items throw an error', done => {
        const sentData = Object.assign(
          require('./../fixtures/item/create-ok-3'),
          {organizationId: global.organizationId, parentId: documentId, ontimeId: 123}
        );
        ontimeRequester.items = (token, ontimeId, cb) => {
          cb(JSON.stringify(require('./../fixtures/ontime/ko')));
        };
        agent
          .post(url + '/item/create')
          .send(sentData)
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

      it('should get an error because ontimeRequester.items does nothing', done => {
        const sentData = Object.assign(
          require('./../fixtures/item/create-ok-3'),
          {organizationId: global.organizationId, parentId: documentId, ontimeId: 123}
        );
        ontimeRequester.items = (token, ontimeId, cb) => {
          cb(JSON.stringify({}));
        };
        agent
          .post(url + '/item/create')
          .send(sentData)
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

      it('should create a new version in the document (with no settings)', done => {
        const sentData = Object.assign(
          require('./../fixtures/item/create-ok-3'),
          {organizationId: global.organizationId, parentId: documentId, ontimeId: 123}
        );
        const expectedData = require('./../fixtures/ontime/items');
        ontimeRequester.items = (token, ontimeId, cb) => {
          cb(JSON.stringify(expectedData));
        };
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '2');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
            const versions = result.organization.projects[0].projects[0].documents[0].versions;
            assert.strictEqual(versions.length, 1);
            assert.isArray(versions[0].entries);
            assert(versions[0].entries.length > 0);
            assert.isDefined(versions[0].setting._id);
            assert.isUndefined(versions[0].setting.contributorPrice);
            assert.isArray(result.item.entries);
            [result.item.entries, versions[0].entries].forEach(elements => {
              elements.forEach(element => {
                assert.isArray(element.children);
                assert.strictEqual(element.children.length, 1);
                assert.isArray(element.children[0].children);
                assert.strictEqual(element.children[0].children.length, 2);
                assert.isArray(element.children[0].children[0].children);
                assert.strictEqual(element.children[0].children[0].children.length, 0);
                assert.isArray(element.children[0].children[1].children);
                assert.strictEqual(element.children[0].children[1].children.length, 1);
              });
            });
            assert(result.item.entries.length > 0);
            assert.isDefined(result.item.setting._id);
            assert.isUndefined(result.item.setting.contributorPrice);
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should create a new version in the document (with settings)', done => {
        const expectedData = require('./../fixtures/item/create-ok-4');
        const sentData = Object.assign(
          expectedData,
          {organizationId: global.organizationId, parentId: documentId, ontimeId: 123}
        );
        ontimeRequester.items = (token, ontimeId, cb) => {
          cb(JSON.stringify(require('./../fixtures/ontime/items')));
        };
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '2');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
            const versions = result.organization.projects[0].projects[0].documents[0].versions;
            assert.strictEqual(versions.length, 2);
            assert.isArray(versions[1].entries);
            assert(versions[1].entries.length > 0);
            assert.isDefined(versions[1].setting);
            assert.isArray(result.item.entries);
            assert(result.item.entries.length > 0);
            assert.isDefined(result.item.setting);
            [versions[1].setting, result.item.setting].forEach(element => {
              assert.strictEqual(element.projectDev.contributorPrice, expectedData.setting.contributorPrice);
              assert.strictEqual(
                element.projectDev.contributorOccupation,
                expectedData.setting.contributorOccupation
              );
              assert.strictEqual(
                element.projectManagement.scrummasterPrice,
                expectedData.setting.scrummasterPrice
              );
              assert.strictEqual(
                element.projectManagement.scrummasterOccupation,
                expectedData.setting.scrummasterOccupation
              );
              assert.strictEqual(element.billing.showDevPrice, expectedData.setting.showDev);
              assert.strictEqual(element.billing.rateMultiplier, expectedData.setting.rateMultiplier);
              assert.strictEqual(element.billing.showManagementPrice, expectedData.setting.showManagement);
              assert.strictEqual(element.unit.estimateType, expectedData.setting.estimateType);
              assert.strictEqual(element.unit.rangeEstimateUnit, expectedData.setting.rangeEstimateUnit);
              assert.strictEqual(element.unit.label, expectedData.setting.label);
              assert.strictEqual(element.date.show, expectedData.setting.showDate);
              assert.strictEqual(element.iteration.contributorAvailable, expectedData.setting.contributorAvailable);
              assert.strictEqual(element.iteration.hourPerDay, expectedData.setting.hourPerDay);
              assert.strictEqual(element.iteration.dayPerWeek, expectedData.setting.dayPerWeek);
              assert.strictEqual(element.iteration.weekPerIteration, expectedData.setting.weekPerIteration);
            });
            versionId = result.item._id;
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should create a new version in the document with lazy loading', done => {
        const expectedData = require('./../fixtures/item/create-ok-5');
        const sentData = Object.assign(
          expectedData,
          {organizationId: global.organizationId, parentId: documentId, ontimeId: 123, lazy: 1}
        );
        ontimeRequester.items = (token, ontimeId, cb) => {
          cb(JSON.stringify(require('./../fixtures/ontime/items')));
        };
        agent
          .post(url + '/item/create')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '2');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
            const versions = result.organization.projects[0].projects[0].documents[0].versions;
            assert.strictEqual(versions.length, 3);
            assert.isNull(versions[2].entries);
            assert.isNull(result.item.entries);
            assert.isDefined(result.item.setting._id);
            assert.isUndefined(result.item.setting.contributorPrice);
            OrganizationModel.walkRecursively(result.organization, element => {
              assert(element.entries === undefined || element.entries === null);
            });
            versionOtherId = result.item._id;
            done();
          })
          .catch(err => done(err))
        ;
      });*/
    });

    describe('# [UPDATE] ' + url + '/item/update', () => {
      it('should get an error because no organization identifier given', done => {
        const sentData = {};
        agent
          .post(url + '/item/update')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because bad organization identifier-type given', done => {
        const sentData = {organizationId: 'badIdea#joke'};
        agent
          .post(url + '/item/update')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 500);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because bad (not known) organization identifier given', done => {
        const sentData = {organizationId: '569a498efd2e11a55a2822f4'};
        agent
          .post(url + '/item/update')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-5');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because bad not parentId / "project" type given', done => {
        const sentData = require('./../fixtures/item/update-ok-1');
        sentData.organizationId = global.organizationId;
        agent
          .post(url + '/item/update')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-8');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because no "data._id" given', done => {
        const sentData = Object.assign(
          require('./../fixtures/item/update-ok-1'),
          {organizationId: global.organizationId}
        );
        agent
          .post(url + '/item/update')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-8');
            done();
          })
          .catch(err => done(err))
        ;
      });

      /*it('should get an error because bad "data._id" given', done => {
        const sentData = Object.assign(
          require('./../fixtures/item/update-ok-1'),
          {organizationId: global.organizationId, _id: '569a498efd2e22a55a2822f4'}
        );
        agent
          .post(url + '/item/update')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-8');
            done();
          })
          .catch(err => done(err))
        ;
      });*/

      it('should update an item (generic way for projects, documents and versions)', done => {
        const expectedData = require('./../fixtures/item/update-ok-1');
        const sentData = Object.assign(expectedData, {organizationId: global.organizationId, _id: documentId});
        agent
          .post(url + '/item/update')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '3');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
            const document = result.organization.projects[0].projects[0].documents[0];
            assert.strictEqual(document.name, expectedData.name);
            assert.strictEqual(document.description, expectedData.description);
            assert.strictEqual(result.item.name, expectedData.name);
            assert.strictEqual(result.item.description, expectedData.description);
            done();
          })
          .catch(err => done(err))
        ;
      });

      /*it('should update a version with lazy', done => {
        const expectedData = require('./../fixtures/item/update-ok-1');
        const sentData = Object.assign(expectedData, {organizationId: global.organizationId, _id: versionId, lazy: 1});
        agent
          .post(url + '/item/update')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '3');
            assert.isDefined(result.organization);
            const version = result.organization.projects[0].projects[0].documents[0].versions[0];
            assert.isDefined(version);
            assert.isUndefined(version.entries);
            assert.strictEqual(result.item.name, expectedData.name);
            assert.strictEqual(result.item.description, expectedData.description);
            done();
          })
          .catch(err => done(err))
        ;
      });*/
    });

    describe('# [GET] ' + url + '/item', () => {
      it('should get an error because no organization identifier given', done => {
        agent
          .get(url + '/item?')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-5');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because bad organization identifier-type given', done => {
        agent
          .get(url + '/item?organizationId=badIdea#joke')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 500);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because bad (not known) organization identifier given', done => {
        agent
          .get(url + '/item?organizationId=569a498efd2e11a55a2822f4')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-5');
            done();
          })
          .catch(err => done(err))
        ;
      });

      /*it('should get an error because unknown item identifier given', done => {
        agent
          .get(url + '/item?organizationId=' + global.organizationId + '&itemId=badIdea#joke')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-6');
            done();
          })
          .catch(err => done(err))
        ;
      });*/

      it('should get an item (project)', done => {
        agent
          .get(url + '/item?organizationId=' + global.organizationId + '&itemId=' + global.projectId)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.isUndefined(result.documentName);
            assert.isUndefined(result.organizationName);
            OrganizationModel.findDeepAttributeById(result.organization, global.projectId, element => {
              assert.isDefined(element);
            });
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an item (document)', done => {
        agent
          .get(url + '/item?organizationId=' + global.organizationId + '&itemId=' + documentId)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.isUndefined(result.documentName);
            assert.isUndefined(result.organizationName);
            OrganizationModel.findDeepAttributeById(result.organization, documentId, element => {
              assert.isDefined(element);
            });
            done();
          })
          .catch(err => done(err))
        ;
      });

      /*it('should get an item (version)', done => {
        agent
          .get(url + '/item?organizationId=' + global.organizationId + '&itemId=' + versionId)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.isDefined(result.item.entries);
            assert.isUndefined(result.documentName);
            assert.isUndefined(result.organizationName);
            OrganizationModel.findDeepAttributeById(result.organization, versionId, element => {
              assert.isDefined(element.entries);
            });
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an item (version) with modePreview', done => {
        agent
          .get(url + '/item?modePreview=1&organizationId=' + global.organizationId + '&itemId=' + versionId)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.organization);
            assert.isDefined(result.item);
            assert.isDefined(result.item.entries);
            assert.isDefined(result.documentName);
            assert.isDefined(result.organizationName);
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an item (version) with lazy loading', done => {
        agent
          .get(url + '/item?lazy=1&organizationId=' + global.organizationId + '&itemId=' + versionId)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.isUndefined(result.item.entries);
            assert.isUndefined(result.documentName);
            assert.isUndefined(result.organizationName);
            OrganizationModel.walkRecursively(result.organization, element => {
              assert.isUndefined(element.entries);
            });
            done();
          })
          .catch(err => done(err))
        ;
      });*/

      it('should get /organization for versions/entries (with lazy loading)', done => {
        agent
          .get(url + '/organization?lazyVersion=1&id=' + global.organizationId)
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
            assert.isDefined(result.organizations[0]);
            OrganizationModel.walkRecursively(result.organizations[0], element => {
              assert.isUndefined(element.entries);
            });
            done();
          })
          .catch(err => done(err))
        ;
      });
    });

    describe('# [DELETE] ' + url + '/item', () => {
      it('should get an error because no organization identifier given', done => {
        const sentData = {};
        agent
          .post(url + '/item/delete')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because bad organization identifier-type given', done => {
        const sentData = {organizationId: 'badIdea#joke'};
        agent
          .post(url + '/item/delete')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(500)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 500);
            assert.isDefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because bad (not known) organization identifier given', done => {
        const sentData = {organizationId: '569a498efd2e11a55a2822f4'};
        agent
          .post(url + '/item/delete')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-5');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an error because no "data.itemId" given', done => {
        const sentData = {organizationId: global.organizationId};
        agent
          .post(url + '/item/delete')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-6');
            done();
          })
          .catch(err => done(err))
        ;
      });

      /*it('should get an error because bad "data.itemId" given', done => {
        const sentData = {organizationId: global.organizationId, itemId: '009a498efd2e22a55a2822f4'};
        agent
          .post(url + '/item/delete')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-6');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should delete an item (version) with lazy loading', done => {
        const sentData = {organizationId: global.organizationId, itemId: versionOtherId, lazy: 1};
        agent
          .post(url + '/item/delete')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.strictEqual(result.item._id, versionOtherId);
            OrganizationModel.findDeepAttributeById(result.organization, versionOtherId, element => {
              assert.isUndefined(element);
            });
            OrganizationModel.walkRecursively(result.organization, element => {
              assert(element.entries === undefined || element.entries === null);
            });
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should delete an item of version item', done => {
        const sentData = {organizationId: global.organizationId, itemId: versionId};
        agent
          .post(url + '/item/delete')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.strictEqual(result.item._id, versionId);
            OrganizationModel.findDeepAttributeById(result.organization, versionId, element => {
              assert.isUndefined(element);
            });
            done();
          })
          .catch(err => done(err))
        ;
      });*/

      it('should delete an item of document item', done => {
        const sentData = {organizationId: global.organizationId, itemId: documentId};
        agent
          .post(url + '/item/delete')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.strictEqual(result.item._id, documentId);
            OrganizationModel.findDeepAttributeById(result.organization, documentId, element => {
              assert.isUndefined(element);
            });
            done();
          })
          .catch(err => done(err))
        ;
      });
    });
  });
};