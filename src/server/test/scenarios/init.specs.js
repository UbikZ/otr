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
  let tokenBearer, tokenOtBearer;

  describe('> Init API', () => {
    describe('# [GET] /', () => {
      it('returns index.html', done => {
        agent
          .get('/')
          .expect(200)
          .expect('Content-Type', 'text/html; charset=UTF-8')
          .then(res => {
            res.text.should.be.a('string');
            done();
          })
          .catch(err => done(err))
        ;
      });
    });

    describe('# [GET] /dist/*.gz', () => {
      const path = config.path.public + '/dist';
      let staticFiles = [];

      it('check public/dist exists', done => {
        assert.isTrue(fs.existsSync(path));
        staticFiles = fs.readdirSync(path).filter(file => ~file.indexOf('.gz.'));
        done();
      });

      it('returns *.gz compiled files', done => {
        let isDone = 0;
        staticFiles.forEach(staticFile => {
          let contentType;
          if (~staticFile.indexOf('.js')) {
            contentType = 'application/javascript';
          } else if (~staticFile.indexOf('.css')) {
            contentType = 'text/css; charset=UTF-8';
          }
          agent
            .get('/dist/' + staticFile)
            .expect(200)
            .expect('Content-Encoding', 'gzip')
            .expect('Content-Type', contentType)
            .then(res => {
              res.text.should.be.a('string');
              if (++isDone === staticFiles.length) {
                done();
              }
            })
            .catch(err => done(err))
          ;
        });
      });
    });

    describe('# [GET] ' + url + '/user (examples)', () => {
      it('returns a 403 (Not Allowed) error (without Bearer Token)', done => {
        agent
          .get(url + '/user')
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 403);
            assert.strictEqual(result.messageCode, '-3');
            done();
          })
          .catch(err => done(err))
        ;
      });

      it('returns an internal error (checkAuthorized fail)', done => {
        Helper.mockModel(mongoose.model('User'), 'findOne', stub => {
          agent
            .get(url + '/user')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
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
            .catch(err => done(err))
          ;
        });
      });

      it('returns an internal error (checkAuthorized with unknown token)', done => {
        agent
          .get(url + '/user')
          .set('Authorization', 'Bearer 569a498efd2e11a55a2822f4 ' + tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.strictEqual(result.messageCode, '-2');
            assert.isUndefined(result.error);
            done();
          })
          .catch(err => done(err))
        ;
      });
    });
  });
};