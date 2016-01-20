'use strict';

var fs = require('fs');
var assert = require('chai').assert;
var mongoose = require('mongoose');

var helpers = require('./../helpers');

module.exports = function (agent, url, config) {
  var tokenBearer, tokenOtBearer;

  describe('> Init API', function () {
    describe('# [GET] /', function () {
      it('returns index.html', function (done) {
        agent
          .get('/')
          .expect(200)
          .expect('Content-Type', 'text/html; charset=UTF-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            res.text.should.be.a('string');
            done();
          });
      });
    });

    describe('# [GET] /dist/*.gz', function () {
      var path = config.path.public + '/dist';
      var staticFiles = [];

      it('check public/dist exists', function (done) {
        assert.isTrue(fs.existsSync(path));
        staticFiles = fs.readdirSync(path).filter(function (file) {
          return ~file.indexOf('.gz.');
        });
        done();
      });


      it('returns *.gz compiled files', function (done) {
        var isDone = 0;
        staticFiles.forEach(function (staticFile) {
          var contentType;
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
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              res.text.should.be.a('string');
              if (++isDone === staticFiles.length) {
                done();
              }
            });
        });
      });
    });

    describe('# [GET] ' + url + '/user (examples)', function () {
      it('returns a 403 (Not Allowed) error (without Bearer Token)', function (done) {
        agent
          .get(url + '/user')
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 403);
            assert.strictEqual(result.messageCode, '-3');
            done();
          });
      });

      it('returns an internal error (checkAuthorized fail)', function (done) {
        helpers.mockModel(mongoose.model('User'), 'findOne', function (stub) {
          agent
            .get(url + '/user')
            .set('Authorization', 'Bearer ' + tokenBearer + ' ' + tokenOtBearer)
            .expect(500)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) {
                return done(err);
              }
              var result = res.body;
              assert.strictEqual(result.code, 500);
              assert.strictEqual(result.messageCode, '-1');
              assert.isDefined(result.error);
              stub.restore();
              done();
            });
        });
      });

      it('returns an internal error (checkAuthorized with unknown token)', function (done) {
        agent
          .get(url + '/user')
          .set('Authorization', 'Bearer 569a498efd2e11a55a2822f4 ' + tokenOtBearer)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function (err, res) {
            if (err) {
              return done(err);
            }
            var result = res.body;
            assert.strictEqual(result.code, 404);
            assert.strictEqual(result.messageCode, '-2');
            assert.isUndefined(result.error);
            done();
          });
      });
    });
  });
};