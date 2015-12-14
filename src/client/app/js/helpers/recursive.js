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

function removeRecursivelyById(parentElement, attributeName, elementId, cb) {
  var indexToRemove;
  parentElement[attributeName].forEach(function (subElement, index) {
    if (subElement['_id'] != elementId) {
      findRecursivelyById(subElement, attributeName, elementId, cb);
    } else {
      indexToRemove = index;
    }
  });

  if (indexToRemove != undefined) {
    delete parentElement[attributeName].splice(indexToRemove, 1);
    cb(parentElement[attributeName]);
  }
};



module.exports = {
  findRecursivelyById: findRecursivelyById,
  removeRecursivelyById: removeRecursivelyById,
};