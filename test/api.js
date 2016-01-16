'use strict';

var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var should = require('chai').should();
var config = require('../config.json');
var ontimeRequester = require('../src/server/controllers/helpers/ontime');

// Mock external API
ontimeRequester.requestToken = function (authObject, cb) {
  cb(JSON.stringify(require('./fixtures/ot_signup.json')));
};

// Start tests
module.exports = function (app) {
  var agent = request.agent(app);
  var url = '/api/v' + config.api.version;

  describe(' - Application - ', function () {
    it('should exist', function (done) {
      should.exist(app);
      done();
    });

    describe(' - Index - ', function () {
      describe('[GET] /', function () {
        it('returns index.html', function (done) {
          agent
            .get('/')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=UTF-8')
            .end(function (err, res) {
              if (err) return done(err);
              res.text.should.be.a('string');
              done();
            });
        });
      });
    });

    describe(' - Authentication - ', function () {
      describe('[POST] ' + url + '/sign-up', function () {
        it('when create new user', function (done) {
          agent
            .post(url + '/sign-up')
            .send({username: 'test_stage', password: 'test_stage'})
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err, res) {
              if (err) return done(err);
              console.log(res.body.user);
              done();
            });
        });
      });
    });

    after('should drop database', function (done) {
      if (process.env.node == 'staging') {
        mongoose.connection.db.dropDatabase(function (err) {
          if (err) throw err;
          done();
        });
      } else {
        done();
      }
    });
  });
};

