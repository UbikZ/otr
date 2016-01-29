'use strict';

Object.defineProperty(Array.prototype, 'pluck', {
  value: function (key) {
    return this.map(function (object) {
      return object[key];
    });
  }
});