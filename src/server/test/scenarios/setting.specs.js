'use strict';

const assert = require('chai').assert;
const mongoose = require('mongoose');

const helpers = require('./../helpers');
const OrganizationModel = require('../../models/organization');

module.exports = (agent, url) => {
  describe('> Setting API', () => {
    let settingStandaloneId;
    describe('# [POST] ~standalone' + url + '/setting/update', () => {
      it('should get an internal error (findOne) on create a standalone setting (mongo fail)', done => {
        const sentData = require('./../fixtures/setting/create-ok-1');
        helpers.mockModel(mongoose.model('Setting'), 'findOne', stub => {
          agent
            .post(url + '/setting/update')
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

      it('should get an internal error (update) on create a standalone setting (mongo fail)', done => {
        const sentData = require('./../fixtures/setting/create-ok-1');
        helpers.mockModel(mongoose.model('Setting'), 'update', stub => {
          agent
            .post(url + '/setting/update')
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

      it('should create a standalone setting', done => {
        const sentData = require('./../fixtures/setting/create-ok-1');
        agent
          .post(url + '/setting/update')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '8');
            assert.isDefined(result.setting);
            assert.strictEqual(result.setting.projectDev.contributorPrice, sentData.contributorPrice);
            assert.strictEqual(result.setting.projectDev.contributorOccupation, sentData.contributorOccupation);
            assert.strictEqual(result.setting.projectManagement.scrummasterPrice, sentData.scrummasterPrice);
            assert.strictEqual(
              result.setting.projectManagement.scrummasterOccupation,
              sentData.scrummasterOccupation
            );
            assert.strictEqual(result.setting.billing.showDevPrice, sentData.showDev);
            assert.strictEqual(result.setting.billing.rateMultiplier, sentData.rateMultiplier);
            assert.strictEqual(result.setting.billing.showManagementPrice, sentData.showManagement);
            assert.strictEqual(result.setting.unit.estimateType, sentData.estimateType);
            assert.strictEqual(result.setting.unit.rangeEstimateUnit, sentData.rangeEstimateUnit);
            assert.strictEqual(result.setting.unit.label, sentData.label);
            assert.strictEqual(result.setting.date.show, sentData.showDate);
            assert.strictEqual(result.setting.iteration.contributorAvailable, sentData.contributorAvailable);
            assert.strictEqual(result.setting.iteration.hourPerDay, sentData.hourPerDay);
            assert.strictEqual(result.setting.iteration.dayPerWeek, sentData.dayPerWeek);
            assert.strictEqual(result.setting.iteration.weekPerIteration, sentData.weekPerIteration);
            assert.strictEqual(result.setting.id, 42);
            settingStandaloneId = result.setting._id;
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get an internal error (update) on update a standalone setting (mongo fail)', done => {
        const sentData = require('./../fixtures/setting/create-ok-1');
        sentData.id = 42;
        helpers.mockModel(mongoose.model('Setting'), 'update', stub => {
          agent
            .post(url + '/setting/update')
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

      it('should update a standalone setting', done => {
        const sentData = require('./../fixtures/setting/update-ok-1');
        sentData.id = 42;
        agent
          .post(url + '/setting/update')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '9');
            assert.isDefined(result.setting);
            assert.strictEqual(result.setting.projectDev.contributorPrice, sentData.contributorPrice);
            assert.strictEqual(result.setting.projectDev.contributorOccupation, sentData.contributorOccupation);
            assert.strictEqual(result.setting.projectManagement.scrummasterPrice, sentData.scrummasterPrice);
            assert.strictEqual(
              result.setting.projectManagement.scrummasterOccupation,
              sentData.scrummasterOccupation
            );
            assert.strictEqual(result.setting.billing.showDevPrice, sentData.showDev);
            assert.strictEqual(result.setting.billing.rateMultiplier, sentData.rateMultiplier);
            assert.strictEqual(result.setting.billing.showManagementPrice, sentData.showManagement);
            assert.strictEqual(result.setting.unit.estimateType, sentData.estimateType);
            assert.strictEqual(result.setting.unit.label, sentData.label);
            assert.strictEqual(result.setting.date.show, sentData.showDate);
            assert.strictEqual(result.setting.iteration.contributorAvailable, sentData.contributorAvailable);
            assert.strictEqual(result.setting.iteration.hourPerDay, sentData.hourPerDay);
            assert.strictEqual(result.setting.iteration.dayPerWeek, sentData.dayPerWeek);
            assert.strictEqual(result.setting.iteration.weekPerIteration, sentData.weekPerIteration);
            assert.strictEqual(result.setting.id, 42);
            settingStandaloneId = result.setting._id;
            done();
          })
          .catch(err => done(err))
        ;
      });
    });

    describe('# [GET] ~standalone' + url + '/setting', () => {
      it('should get an internal error (find) for request a standalone setting (mongo fail)', done => {
        helpers.mockModel(mongoose.model('Setting'), 'find', stub => {
          agent
            .get(url + '/setting?id=42')
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

      it('should get an internal error (find) for request a standalone setting (empty response)',
        done => {
          helpers.mockModel(mongoose.model('Setting'), 'find', stub => {
            agent
              .get(url + '/setting?id=42')
              .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
              .expect(404)
              .expect('Content-Type', 'application/json; charset=utf-8')
              .then(res => {
                const result = res.body;
                assert.strictEqual(result.code, 404);
                assert.isUndefined(result.error);
                assert.strictEqual(result.messageCode, '-10');
                stub.restore();
                done();
              })
              .catch(err => done(err))
            ;
          }, true);
        })
      ;

      it('should request a standalone setting', done => {
        agent
          .get(url + '/setting?id=42')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isDefined(result.setting);
            done();
          })
          .catch(err => done(err))
        ;
      });
    });

    describe('# [POST] ~sub-item' + url + '/setting/update', () => {
      it('should get an error request (not found because no organizationId given) a sub-item setting',
        done => {
          agent
            .post(url + '/setting/edit')
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
        })
      ;

      it('should get an internal error request (findById) a sub-item setting (mongo fail)', done => {
        helpers.mockModel(mongoose.model('Organization'), 'findById', stub => {
          agent
            .post(url + '/setting/edit')
            .send({organizationId: global.organizationId})
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

      it('should get an error request (unknown organizationId) a sub-item setting', done => {
        agent
          .post(url + '/setting/edit')
          .send({organizationId: '56961966de7cbad8ba3be467'})
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

      /*it('should get an internal error (update) for create a sub-item setting in organization (mongo fail)',
        done => {
          const sentData = require('./../fixtures/setting/create-ok-1');
          sentData.organizationId = global.organizationId;
          helpers.mockModel(mongoose.model('Organization'), 'update', stub => {
            agent
              .post(url + '/setting/edit')
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
        })
      ;*/

      it('should create a sub-item setting in organization', done => {
        const sentData = require('./../fixtures/setting/create-ok-1');
        sentData.organizationId = global.organizationId;
        agent
          .post(url + '/setting/edit')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '10');
            assert.isDefined(result.organization);
            assert.isDefined(result.organization.setting);
            assert.isUndefined(result.setting);
            const org = result.organization;
            assert.strictEqual(org.setting.projectDev.contributorPrice, sentData.contributorPrice);
            assert.strictEqual(org.setting.projectDev.contributorOccupation, sentData.contributorOccupation);
            assert.strictEqual(org.setting.projectManagement.scrummasterPrice, sentData.scrummasterPrice);
            assert.strictEqual(
              org.setting.projectManagement.scrummasterOccupation,
              sentData.scrummasterOccupation
            );
            assert.strictEqual(org.setting.billing.showDevPrice, sentData.showDev);
            assert.strictEqual(org.setting.billing.rateMultiplier, sentData.rateMultiplier);
            assert.strictEqual(org.setting.billing.showManagementPrice, sentData.showManagement);
            assert.strictEqual(org.setting.unit.estimateType, sentData.estimateType);
            assert.strictEqual(org.setting.unit.rangeEstimateUnit, sentData.rangeEstimateUnit);
            assert.strictEqual(org.setting.unit.label, sentData.label);
            assert.strictEqual(org.setting.date.show, sentData.showDate);
            assert.strictEqual(org.setting.iteration.contributorAvailable, sentData.contributorAvailable);
            assert.strictEqual(org.setting.iteration.hourPerDay, sentData.hourPerDay);
            assert.strictEqual(org.setting.iteration.dayPerWeek, sentData.dayPerWeek);
            assert.strictEqual(org.setting.iteration.weekPerIteration, sentData.weekPerIteration);
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should create a sub-item setting in organization (with previewMode enabled)', done => {
        const sentData = require('./../fixtures/setting/update-ok-1');
        sentData.organizationId = global.organizationId;
        sentData.modePreview = 1;
        agent
          .post(url + '/setting/edit')
          .send(sentData)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.strictEqual(result.messageCode, '10');
            assert.isUndefined(result.organization);
            assert.isDefined(result.setting);
            const sett = result.setting;
            assert.strictEqual(sett.projectDev.contributorPrice, sentData.contributorPrice);
            assert.strictEqual(sett.projectDev.contributorOccupation, sentData.contributorOccupation);
            assert.strictEqual(sett.projectManagement.scrummasterPrice, sentData.scrummasterPrice);
            assert.strictEqual(sett.projectManagement.scrummasterOccupation, sentData.scrummasterOccupation);
            assert.strictEqual(sett.billing.showDevPrice, sentData.showDev);
            assert.strictEqual(sett.billing.rateMultiplier, sentData.rateMultiplier);
            assert.strictEqual(sett.billing.showManagementPrice, sentData.showManagement);
            assert.strictEqual(sett.unit.estimateType, sentData.estimateType);
            assert.strictEqual(sett.unit.label, sentData.label);
            assert.strictEqual(sett.date.show, sentData.showDate);
            assert.strictEqual(sett.iteration.contributorAvailable, sentData.contributorAvailable);
            assert.strictEqual(sett.iteration.hourPerDay, sentData.hourPerDay);
            assert.strictEqual(sett.iteration.dayPerWeek, sentData.dayPerWeek);
            assert.strictEqual(sett.iteration.weekPerIteration, sentData.weekPerIteration);
            done();
          })
          .catch(err => done(err))
        ;
      });

      /*it('should get an internal error (update) for create a sub-item setting in organization (mongo fail)',
        done => {
          const sentData = require('./../fixtures/setting/create-ok-1');
          sentData.organizationId = global.organizationId;
          sentData.itemId = '56961966de7cbad8ba3be467';
          agent
            .post(url + '/setting/edit')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
            .expect(404)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 404);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, '-11');
              done();
            })
            .catch(err => done(err))
          ;
        })
      ;*/

      it('should get an internal error (update) for create a sub-item setting in organization (mongo fail)',
        done => {
          const sentData = require('./../fixtures/setting/create-ok-1');
          sentData.organizationId = global.organizationId;
          sentData.itemId = global.projectId;
          agent
            .post(url + '/setting/edit')
            .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
            .send(sentData)
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
              const result = res.body;
              assert.strictEqual(result.code, 200);
              assert.isUndefined(result.error);
              assert.strictEqual(result.messageCode, '10');
              assert.isDefined(result.organization);
              OrganizationModel.findDeepAttributeById(result.organization, global.projectId, function (element) {
                assert.isDefined(element);
                assert.isDefined(element.setting);
                const sett = element.setting;
                assert.strictEqual(sett.projectDev.contributorPrice, sentData.contributorPrice);
                assert.strictEqual(sett.projectDev.contributorOccupation, sentData.contributorOccupation);
                assert.strictEqual(sett.projectManagement.scrummasterPrice, sentData.scrummasterPrice);
                assert.strictEqual(sett.projectManagement.scrummasterOccupation, sentData.scrummasterOccupation);
                assert.strictEqual(sett.billing.showDevPrice, sentData.showDev);
                assert.strictEqual(sett.billing.rateMultiplier, sentData.rateMultiplier);
                assert.strictEqual(sett.billing.showManagementPrice, sentData.showManagement);
                assert.strictEqual(sett.unit.estimateType, sentData.estimateType);
                assert.strictEqual(sett.unit.label, sentData.label);
                assert.strictEqual(sett.date.show, sentData.showDate);
                assert.strictEqual(sett.iteration.contributorAvailable, sentData.contributorAvailable);
                assert.strictEqual(sett.iteration.hourPerDay, sentData.hourPerDay);
                assert.strictEqual(sett.iteration.dayPerWeek, sentData.dayPerWeek);
                assert.strictEqual(sett.iteration.weekPerIteration, sentData.weekPerIteration);
              });
              done();
            })
            .catch(err => done(err))
          ;
        })
      ;
    });

    describe('# [GET] ~sub-item' + url + '/setting/sub', () => {
      it('should get an error request (not found because no organizationId given) a sub-item setting',
        done => {
          agent
            .get(url + '/setting/sub')
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
        })
      ;

      it('should get an internal error request (findById) a sub-item setting (mongo fail)', done => {
        helpers.mockModel(mongoose.model('Organization'), 'findById', stub => {
          agent
            .get(url + '/setting/sub?organizationId=' + global.organizationId)
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

      it('should get an error request (unknown organizationId) a sub-item setting', done => {
        agent
          .get(url + '/setting/sub?organizationId=56961966de7cbad8ba3be467')
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

      it('should get a sub-item setting for organization', done => {
        agent
          .get(url + '/setting/sub?organizationId=' + global.organizationId)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isDefined(result.setting);
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get a sub-item setting for organization (with lazy)', done => {
        agent
          .get(url + '/setting/sub?lazy=1&organizationId=' + global.organizationId)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isDefined(result.setting);
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('should get a sub-item setting for item', done => {
        agent
          .get(url + '/setting/sub?organizationId=' + global.organizationId + '&itemId=' + global.projectId)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isUndefined(result.messageCode);
            assert.isDefined(result.setting);
            done();
          })
          .catch(err => done(err))
        ;
      });
    });
  });
};