'use strict';

var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var should = require('chai').should();
var config = require('../config.json');
var ontimeRequester = require('../src/server/controllers/helpers/ontime');

// Mockery
ontimeRequester.requestToken = function(authObject, cb) {
  cb('{"access_token": "xxxxx"}');
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
            .send({username: 'test', password: 'test'})
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


  });
};

