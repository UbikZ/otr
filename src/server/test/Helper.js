'use strict';

const sinon = require('sinon');
const promise = require('bluebird');

/**
 *  Helper methods with "mock"
 */
class Helper {
  /**
   *  Simulate invalid response from Ontime API
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
   *  Simulate internal error response from Ontime API
   */
  static internalErrorOntimeAPIResponse() {
    let callback;
    if (typeof (arguments[1]) === 'function') {
      callback = arguments[1];
    } else if (typeof (arguments[2]) === 'function') {
      callback = arguments[2];
    }
    callback(JSON.stringify({}));
  }

  /**
   *  Generic Mock method
   *  - use Sinon Library
   * @param object
   * @param method
   * @param returns
   * @param callback
   */
  static mock(object, method, returns, callback) {
    callback(sinon.stub(object, method).returns(returns));
  }

  /**
   *  Specific mock model method
   *  - use generic one
   *  - use sinon
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
      execAsync: () => {
        return (empty === true)
          ? promise.resolve()
          : promise.reject(new Error({error: 'error'}));
      }
    }, callback);
  }
}

module.exports = Helper;