'use strict';

function findRecursivelyById(parentElement, attributeName, elementId, cb) {
  parentElement[attributeName].forEach(function (subElement) {
    if (subElement['_id'] != elementId) {
      findRecursivelyById(subElement, attributeName, elementId, cb);
    } else {
      cb(subElement);
    }
  });
};

module.exports = {
  findRecursivelyById: findRecursivelyById,
};