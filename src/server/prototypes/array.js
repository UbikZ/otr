'use strict';

// Can't use arrow notation ('this' scope...)
Object.defineProperty(Array.prototype, 'pluck', {
  value: function (key) {
    return this.map(object => object[key]);
  }
});

Array.prototype.id = function (elementId) {
  const result =
    this.filter(obj => {
      /*jshint eqeqeq: false */
      if (obj !== undefined && obj._id == elementId) {
        /*jshint eqeqeq: true */
        return obj;
      }
    }) || [];

  return result.length === 1 ? result[0] : undefined;
};
