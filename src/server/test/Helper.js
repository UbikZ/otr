'use strict';

const sinon = require('sinon');
var Promise = require('bluebird');

/**
 *  Helper methods with "mock"
 */
class Helper {
  /**
   *  Simulate invalid response from Ontime API
   */
  static invalidOntimeAPIResponse() {
    let callback;
    if (typeof (arguments[1]) === 'function') {
      callback = arguments[1];
    } else if (typeof (arguments[2]) === 'function') {
      callback = arguments[2];
    }
    callback(JSON.stringify(require('./fixtures/ontime/ko')));
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
      execAsync: () => new Promise((resolve, reject) => {
          if (empty === true) {
            resolve();
          } else {
            reject(new Error({error: 'error'}));
          }
        }
      ),
    }, callback);
  }
}

module.exports = Helper;