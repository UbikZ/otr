'use strict';

const sinon = require('sinon');
const BPromise = require('bluebird');

const OnTimeError = require('../errors/OnTimeError');

/**
 *  Helper methods with "mock"
 */
class Helper {
  /**
   *  Simulate internal error response from Ontime API
   *  - to use with wrap function (ex: () => mockOnTimeAPIResponse(data))
   */
  static mockOnTimeAPIResponse(result) {
    return new BPromise((resolve, reject) => {
      if (result.error) {
        reject(new OnTimeError(result));
      } else if (!result.data) {
        reject(new Error());
      } else {
        resolve(result);
      }
    });
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
      execAsync: () => new BPromise((resolve, reject) => {
        if (empty === true) {
          resolve();
        } else {
          reject(new Error({ error: 'error' }));
        }
      }
        ),
    }, callback);
  }
}

module.exports = Helper;