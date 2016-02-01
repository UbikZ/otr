'use strict';

const sinon = require('sinon');
const promise = require('bluebird');

// Generic mocks methods
function invalidOntimeAPIResponse() {
  let cb;
  if (typeof (arguments[1]) === 'function') {
    cb = arguments[1];
  } else if (typeof (arguments[2]) === 'function') {
    cb = arguments[2];
  }
  cb(JSON.stringify(require('./fixtures/ontime/ko')));
}

function internalErrorOntimeAPIResponse() {
  let cb;
  if (typeof (arguments[1]) === 'function') {
    cb = arguments[1];
  } else if (typeof (arguments[2]) === 'function') {
    cb = arguments[2];
  }
  cb(JSON.stringify({}));
}

// Mock Stub
function mock(object, method, returns, callback) {
  callback(sinon.stub(object, method).returns(returns));
}

function mockModel(model, method, callback, empty) {
  mock(model, method, {
    populate: function () {
      return this;
    },
    lean: function () {
      return this;
    },
    exec: function (cb) {
      cb(empty === true ? null : {error: 'error'});
    },
    execAsync: () => promise.reject({error: 'error'}),
  }, callback);
}

module.exports = {
  invalidOntimeAPIResponse: invalidOntimeAPIResponse,
  internalErrorOntimeAPIResponse: internalErrorOntimeAPIResponse,
  mock: mock,
  mockModel: mockModel,
};