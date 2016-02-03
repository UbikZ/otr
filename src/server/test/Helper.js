'use strict';

const sinon = require('sinon');
const promise = require('bluebird');

/**
 *
 */
class Helper {
  /**
   *
   */
  static invalidOntimeAPIResponse() {
    let cb;
    if (typeof (arguments[1]) === 'function') {
      cb = arguments[1];
    } else if (typeof (arguments[2]) === 'function') {
      cb = arguments[2];
    }
    cb(JSON.stringify(require('./fixtures/ontime/ko')));
  }

  /**
   *
   */
  static internalErrorOntimeAPIResponse() {
    let cb;
    if (typeof (arguments[1]) === 'function') {
      cb = arguments[1];
    } else if (typeof (arguments[2]) === 'function') {
      cb = arguments[2];
    }
    cb(JSON.stringify({}));
  }

  static mock(object, method, returns, callback) {
    callback(sinon.stub(object, method).returns(returns));
  }

  /**
   *
   * @param model
   * @param method
   * @param callback
   * @param empty
   */
  static mockModel(model, method, callback, empty) {
    Helper.mock(model, method, {
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
}

module.exports = Helper;