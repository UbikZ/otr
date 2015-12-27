'use strict';

function findRecursivelyById(parentElement, attributeName, elementId, cb) {
  if (parentElement[attributeName] != undefined) {
    var element = parentElement[attributeName].id(elementId);
    if (element == undefined) {
      parentElement[attributeName].forEach(function (subElement) {
        findRecursivelyById(subElement, attributeName, elementId, cb);
      });
    } else {
      cb(element);
    }
  }
}

function findSpecificRecursivelyById(parentElement, elementId, cb) {
  if (parentElement.projects != undefined) {
    var element = parentElement.projects.id(elementId);
    if (element == undefined && parentElement.documents !== undefined) {
      element = parentElement.documents.id(elementId);
    }
    if (element == undefined && parentElement.versions !== undefined) {
      element = parentElement.versions.id(elementId);
    }
    if (element == undefined) {
      parentElement.projects.forEach(function (subElement) {
        findSpecificRecursivelyById(subElement, elementId, cb);
      });
    } else {
      cb(element);
    }
  }
}

module.exports = {
  findRecursivelyById: findRecursivelyById,
  findSpecificRecursivelyById: findSpecificRecursivelyById,
};