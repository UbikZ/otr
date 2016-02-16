'use strict';

/**
 * Success class (hack: interrupt promise chaining)
 */
/*jshint unused: true */
class Success extends Error {
  constructor(object) {
    super();
    this.result = object;
  }
}
/*jshint unused: false */

module.exports = Success;