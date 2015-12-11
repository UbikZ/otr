'use strict';

function findRecursivelyById(parentElement, attributeName, elementId, cb) {
  var element = parentElement[attributeName].id(elementId);
  if (element == undefined) {
    parentElement[attributeName].forEach(function (subElement) {
      findRecursivelyById(subElement, attributeName, elementId, cb);
    });
  } else {
    cb(element);
  }
};

module.exports = {
  findRecursively: findRecursivelyById,
};