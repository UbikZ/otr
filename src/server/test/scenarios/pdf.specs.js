'use strict';

const assert = require('chai').assert;

/**
 * Initiate Scenario
 * @param agent
 * @param url
 */
module.exports = (agent, url) => {
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
            assert.strictEqual(result.error.type, 'UndefinedUrl');
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err));
      });

      it('should get an error because no name given', done => {
        agent
          .get(apiUrl + '?url=/')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.strictEqual(result.error.type, 'UndefinedName');
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err));
      });

      it('should get an pdf file', function (done) {
        this.timeout(10000);
        agent
          .get(apiUrl + '?url=/&name=test')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 200);
            assert.isUndefined(result.error);
            assert.isTrue(Boolean(~result.fileName.indexOf('test')));
            done();
          })
          .catch(err => done(err));
      });
    });

    describe('# [GET] /pdf/render', () => {
      const apiUrl = url + '/pdf/download';

      it('should get an error because no fileName given', done => {
        agent
          .get(apiUrl)
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.strictEqual(result.error.type, 'UndefinedDownloadFile');
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err));
      });

      it('should get an error because no pdf file created', function (done) {
        this.timeout(10000);
        agent
          .get(apiUrl + '?fileName=test')
          .set('Authorization', 'Bearer ' + global.tokenBearer + ' ' + global.tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .then(res => {
            const result = res.body;
            assert.strictEqual(result.code, 404);
            assert.strictEqual(result.error.type, 'NotFoundPdfFile');
            assert.strictEqual(result.messageCode, '-1');
            done();
          })
          .catch(err => done(err));
      });
    });
  });
};
