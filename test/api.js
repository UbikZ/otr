'use strict';

var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var should = require('chai').should();

module.exports = function (app) {
  var agent = request.agent(app);

  describe('GET /', function () {
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
};

