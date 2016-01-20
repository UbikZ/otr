'use strict';

var assert = require('chai').assert;
var mongoose = require('mongoose');

var helpers = require('./../helpers');
var ontimeRequester = require('../../controllers/helpers/ontime');
var OrganizationModel = require('../../models/organization');

module.exports = function (agent, url) {
  describe('> Item API', function () {
    var documentId, versionId, versionOtherId;
    before('should create new organization', function (done) {
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
          global.organizationId = result.organization._id;
          done();
        });
    });

    describe('# [POST] ' + url + '/item/create', function () {
      it('should get an error because no organization identifier given', function (done) {
        var sentData = {};
        agent
          .post(url + '/item/create')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-1');
            done();
          });
      });

      it('should get an error because bad organization identifier-type given', function (done) {
        var sentData = {organizationId: 'badIdea#joke'};
        agent
          .post(url + '/item/create')
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
            done();
          });
      });

      it('should get an error because bad (not known) organization identifier given', function (done) {
        var sentData = {organizationId: '569a498efd2e11a55a2822f4'};
        agent
          .post(url + '/item/create')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-5');
            done();
          });
      });

      it('should get an error because no "parentId" and no "project" type given', function (done) {
        var sentData = require('./../fixtures/item/create-ko-1');
        sentData.organizationId = global.organizationId;
        agent
          .post(url + '/item/create')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-7');
            done();
          });
      });

      it('should get an error because unknown parentId given', function (done) {
        var sentData = require('./../fixtures/item/create-ko-1');
        sentData.organizationId = global.organizationId;
        sentData.parentId = '56961966de7cbad8ba3be464';
        agent
          .post(url + '/item/create')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-7');
            done();
          });
      });

      it('should get an internal error (mongo fail)', function (done) {
        helpers.mockModel(mongoose.model('Organization'), 'update', function (stub) {
          var sentData = require('./../fixtures/item/create-ok-1');
          sentData.organizationId = global.organizationId;
          agent
            .post(url + '/item/create')
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

      it('should create a new project in the organization', function (done) {
        var sentData = require('./../fixtures/item/create-ok-1');
        sentData.organizationId = global.organizationId;
        agent
          .post(url + '/item/create')
          .send(sentData)
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
          });
      });

      it('should get an error because bad  "project" type given', function (done) {
        var sentData = require('./../fixtures/item/create-ko-1');
        sentData.organizationId = global.organizationId;
        sentData.parentId = global.projectId;
        agent
          .post(url + '/item/create')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-7');
            done();
          });
      });

      it('should create a new project in the only project of the organization', function (done) {
        var sentData = require('./../fixtures/item/create-ok-1');
        sentData.organizationId = global.organizationId;
        sentData.parentId = global.projectId;
        agent
          .post(url + '/item/create')
          .send(sentData)
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
          });
      });

      it('should create a new document in the subProject of the only project of the organization', function (done) {
        var sentData = require('./../fixtures/item/create-ok-2');
        sentData.organizationId = global.organizationId;
        sentData.parentId = global.projectId;
        agent
          .post(url + '/item/create')
          .send(sentData)
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
          });
      });

      it('should get an error because no "ontimeId" given (for version create)', function (done) {
        var sentData = require('./../fixtures/item/create-ko-1');
        sentData.organizationId = global.organizationId;
        sentData.parentId = documentId;
        sentData.type = 'version';
        agent
          .post(url + '/item/create')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-7');
            done();
          });
      });

      it('should get an error because ontimeRequester.items throw an error', function (done) {
        var sentData = Object.assign(
          require('./../fixtures/item/create-ok-3'),
          {organizationId: global.organizationId, parentId: documentId, ontimeId: 123}
        );
        ontimeRequester.items = function (token, ontimeId, cb) {
          cb(JSON.stringify(require('./../fixtures/ontime/ko')));
        };
        agent
          .post(url + '/item/create')
          .send(sentData)
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

      it('should get an error because ontimeRequester.items does nothing', function (done) {
        var sentData = Object.assign(
          require('./../fixtures/item/create-ok-3'),
          {organizationId: global.organizationId, parentId: documentId, ontimeId: 123}
        );
        ontimeRequester.items = function (token, ontimeId, cb) {
          cb(JSON.stringify({}));
        };
        agent
          .post(url + '/item/create')
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
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '-1');
            done();
          });
      });

      it('should create a new version in the document (with no settings)', function (done) {
        var sentData = Object.assign(
          require('./../fixtures/item/create-ok-3'),
          {organizationId: global.organizationId, parentId: documentId, ontimeId: 123}
        );
        var expectedData = require('./../fixtures/ontime/items');
        ontimeRequester.items = function (token, ontimeId, cb) {
          cb(JSON.stringify(expectedData));
        };
        agent
          .post(url + '/item/create')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '2');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
            var versions = result.organization.projects[0].projects[0].documents[0].versions;
            assert.strictEqual(versions.length, 1);
            assert.isArray(versions[0].entries);
            assert(versions[0].entries.length > 0);
            assert.isDefined(versions[0].setting._id);
            assert.isUndefined(versions[0].setting.contributorPrice);
            assert.isArray(result.item.entries);
            [result.item.entries, versions[0].entries].forEach(function (elements) {
              elements.forEach(function (element) {
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
          });
      });

      it('should create a new version in the document (with settings)', function (done) {
        var expectedData = require('./../fixtures/item/create-ok-4');
        var sentData = Object.assign(
          expectedData,
          {organizationId: global.organizationId, parentId: documentId, ontimeId: 123}
        );
        ontimeRequester.items = function (token, ontimeId, cb) {
          cb(JSON.stringify(require('./../fixtures/ontime/items')));
        };
        agent
          .post(url + '/item/create')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '2');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
            var versions = result.organization.projects[0].projects[0].documents[0].versions;
            assert.strictEqual(versions.length, 2);
            assert.isArray(versions[1].entries);
            assert(versions[1].entries.length > 0);
            assert.isDefined(versions[1].setting);
            assert.isArray(result.item.entries);
            assert(result.item.entries.length > 0);
            assert.isDefined(result.item.setting);
            [versions[1].setting, result.item.setting].forEach(function (element) {
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
          });
      });

      it('should create a new version in the document with lazy loading', function (done) {
        var expectedData = require('./../fixtures/item/create-ok-5');
        var sentData = Object.assign(
          expectedData,
          {organizationId: global.organizationId, parentId: documentId, ontimeId: 123, lazy: 1}
        );
        ontimeRequester.items = function (token, ontimeId, cb) {
          cb(JSON.stringify(require('./../fixtures/ontime/items')));
        };
        agent
          .post(url + '/item/create')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '2');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
            var versions = result.organization.projects[0].projects[0].documents[0].versions;
            assert.strictEqual(versions.length, 3);
            assert.isNull(versions[2].entries);
            assert.isNull(result.item.entries);
            assert.isDefined(result.item.setting._id);
            assert.isUndefined(result.item.setting.contributorPrice);
            OrganizationModel.walkRecursively(result.organization, function (element) {
              assert(element.entries === undefined || element.entries === null);
            });
            versionOtherId = result.item._id;
            done();
          });
      });
    });

    describe('# [UPDATE] ' + url + '/item/update', function () {
      it('should get an error because no organization identifier given', function (done) {
        var sentData = {};
        agent
          .post(url + '/item/update')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-1');
            done();
          });
      });

      it('should get an error because bad organization identifier-type given', function (done) {
        var sentData = {organizationId: 'badIdea#joke'};
        agent
          .post(url + '/item/update')
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
            done();
          });
      });

      it('should get an error because bad (not known) organization identifier given', function (done) {
        var sentData = {organizationId: '569a498efd2e11a55a2822f4'};
        agent
          .post(url + '/item/update')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-5');
            done();
          });
      });

      it('should get an error because bad not parentId / "project" type given', function (done) {
        var sentData = require('./../fixtures/item/update-ok-1');
        sentData.organizationId = global.organizationId;
        agent
          .post(url + '/item/update')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-8');
            done();
          });
      });

      it('should get an error because no "data._id" given', function (done) {
        var sentData = Object.assign(
          require('./../fixtures/item/update-ok-1'),
          {organizationId: global.organizationId}
        );
        agent
          .post(url + '/item/update')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-8');
            done();
          });
      });

      it('should get an error because bad "data._id" given', function (done) {
        var sentData = Object.assign(
          require('./../fixtures/item/update-ok-1'),
          {organizationId: global.organizationId, _id: '569a498efd2e22a55a2822f4'}
        );
        agent
          .post(url + '/item/update')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-8');
            done();
          });
      });

      it('should update an item (generic way for projects, documents and versions)', function (done) {
        var expectedData = require('./../fixtures/item/update-ok-1');
        var sentData = Object.assign(expectedData, {organizationId: global.organizationId, _id: documentId});
        agent
          .post(url + '/item/update')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '3');
            assert.isDefined(result.organization);
            assert.strictEqual(result.organization.projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects.length, 1);
            assert.strictEqual(result.organization.projects[0].projects[0].documents.length, 1);
            var document = result.organization.projects[0].projects[0].documents[0];
            assert.strictEqual(document.name, expectedData.name);
            assert.strictEqual(document.description, expectedData.description);
            assert.strictEqual(result.item.name, expectedData.name);
            assert.strictEqual(result.item.description, expectedData.description);
            done();
          });
      });

      it('should update a version with lazy', function (done) {
        var expectedData = require('./../fixtures/item/update-ok-1');
        var sentData = Object.assign(expectedData, {organizationId: global.organizationId, _id: versionId, lazy: 1});
        agent
          .post(url + '/item/update')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '3');
            assert.isDefined(result.organization);
            var version = result.organization.projects[0].projects[0].documents[0].versions[0];
            assert.isDefined(version);
            assert.isUndefined(version.entries);
            assert.strictEqual(result.item.name, expectedData.name);
            assert.strictEqual(result.item.description, expectedData.description);
            done();
          });
      });
    });

    describe('# [GET] ' + url + '/item', function () {
      it('should get an error because no organization identifier given', function (done) {
        agent
          .get(url + '/item?')
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
            assert.strictEqual(result.messageCode, '-5');
            done();
          });
      });

      it('should get an error because bad organization identifier-type given', function (done) {
        agent
          .get(url + '/item?organizationId=badIdea#joke')
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
            done();
          });
      });

      it('should get an error because bad (not known) organization identifier given', function (done) {
        agent
          .get(url + '/item?organizationId=569a498efd2e11a55a2822f4')
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
            assert.strictEqual(result.messageCode, '-5');
            done();
          });
      });

      it('should get an error because unknown item identifier given', function (done) {
        agent
          .get(url + '/item?organizationId=' + global.organizationId + '&itemId=badIdea#joke')
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
            assert.strictEqual(result.messageCode, '-6');
            done();
          });
      });

      it('should get an item (project)', function (done) {
        agent
          .get(url + '/item?organizationId=' + global.organizationId + '&itemId=' + global.projectId)
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
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.isUndefined(result.documentName);
            assert.isUndefined(result.organizationName);
            OrganizationModel.findDeepAttributeById(result.organization, global.projectId, function (element) {
              assert.isDefined(element);
            });
            done();
          });
      });

      it('should get an item (document)', function (done) {
        agent
          .get(url + '/item?organizationId=' + global.organizationId + '&itemId=' + documentId)
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
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.isUndefined(result.documentName);
            assert.isUndefined(result.organizationName);
            OrganizationModel.findDeepAttributeById(result.organization, documentId, function (element) {
              assert.isDefined(element);
            });
            done();
          });
      });

      it('should get an item (version)', function (done) {
        agent
          .get(url + '/item?organizationId=' + global.organizationId + '&itemId=' + versionId)
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
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.isDefined(result.item.entries);
            assert.isUndefined(result.documentName);
            assert.isUndefined(result.organizationName);
            OrganizationModel.findDeepAttributeById(result.organization, versionId, function (element) {
              assert.isDefined(element.entries);
            });
            done();
          });
      });

      it('should get an item (version) with modePreview', function (done) {
        agent
          .get(url + '/item?modePreview=1&organizationId=' + global.organizationId + '&itemId=' + versionId)
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
            assert.isUndefined(result.organization);
            assert.isDefined(result.item);
            assert.isDefined(result.item.entries);
            assert.isDefined(result.documentName);
            assert.isDefined(result.organizationName);
            done();
          });
      });

      it('should get an item (version) with lazy loading', function (done) {
        agent
          .get(url + '/item?lazy=1&organizationId=' + global.organizationId + '&itemId=' + versionId)
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
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.isUndefined(result.item.entries);
            assert.isUndefined(result.documentName);
            assert.isUndefined(result.organizationName);
            OrganizationModel.walkRecursively(result.organization, function (element) {
              assert.isUndefined(element.entries);
            });
            done();
          });
      });

      it('should get /organization for versions/entries (with lazy loading)', function (done) {
        agent
          .get(url + '/organization?lazyVersion=1&id=' + global.organizationId)
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
            assert.isDefined(result.organizations[0]);
            OrganizationModel.walkRecursively(result.organizations[0], function (element) {
              assert.isUndefined(element.entries);
            });
            done();
          });
      });
    });

    describe('# [DELETE] ' + url + '/item', function () {
      it('should get an error because no organization identifier given', function (done) {
        var sentData = {};
        agent
          .post(url + '/item/delete')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-1');
            done();
          });
      });

      it('should get an error because bad organization identifier-type given', function (done) {
        var sentData = {organizationId: 'badIdea#joke'};
        agent
          .post(url + '/item/delete')
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
            done();
          });
      });

      it('should get an error because bad (not known) organization identifier given', function (done) {
        var sentData = {organizationId: '569a498efd2e11a55a2822f4'};
        agent
          .post(url + '/item/delete')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-5');
            done();
          });
      });

      it('should get an error because no "data.itemId" given', function (done) {
        var sentData = {organizationId: global.organizationId};
        agent
          .post(url + '/item/delete')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-6');
            done();
          });
      });

      it('should get an error because bad "data.itemId" given', function (done) {
        var sentData = {organizationId: global.organizationId, itemId: '009a498efd2e22a55a2822f4'};
        agent
          .post(url + '/item/delete')
          .send(sentData)
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
            assert.strictEqual(result.messageCode, '-6');
            done();
          });
      });

      it('should delete an item (version) with lazy loading', function (done) {
        var sentData = {organizationId: global.organizationId, itemId: versionOtherId, lazy: 1};
        agent
          .post(url + '/item/delete')
          .send(sentData)
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
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.strictEqual(result.item._id, versionOtherId);
            OrganizationModel.findDeepAttributeById(result.organization, versionOtherId, function (element) {
              assert.isUndefined(element);
            });
            OrganizationModel.walkRecursively(result.organization, function (element) {
              assert(element.entries === undefined || element.entries === null);
            });
            done();
          });
      });

      it('should delete an item of version item', function (done) {
        var sentData = {organizationId: global.organizationId, itemId: versionId};
        agent
          .post(url + '/item/delete')
          .send(sentData)
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
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.strictEqual(result.item._id, versionId);
            OrganizationModel.findDeepAttributeById(result.organization, versionId, function (element) {
              assert.isUndefined(element);
            });
            done();
          });
      });

      it('should delete an item of document item', function (done) {
        var sentData = {organizationId: global.organizationId, itemId: documentId};
        agent
          .post(url + '/item/delete')
          .send(sentData)
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
            assert.isDefined(result.organization);
            assert.isDefined(result.item);
            assert.strictEqual(result.item._id, documentId);
            OrganizationModel.findDeepAttributeById(result.organization, documentId, function (element) {
              assert.isUndefined(element);
            });
            done();
          });
      });
    });
  });
};