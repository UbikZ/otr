'use strict';

const fs = require('fs');
const assert = require('chai').assert;
const mongoose = require('mongoose');

const Helper = require('./../Helper');

/**
 * Initiate Scenario
 * @param agent
 * @param url
 * @param config
 */
module.exports = (agent, url, config) => {
  describe('> Pdf API', () => {
    describe('# [GET] /pdf/render', () => {
      const apiUrl = url + '/pdf/render';
      
      it('should get an error because no url given', done => {
        agent
          .get(apiUrl)
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
      
      it('should get an error because no name given', done => {
        agent
          .get(apiUrl)
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
      
      it('should get an error because no pdf file created', done => {
        agent
          .get(apiUrl + '?url=http://abcd&name=test')
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
    });
  });
};