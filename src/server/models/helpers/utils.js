'use strict';

Array.prototype.id = function (elementId) {
  var result =
    this.filter(function (obj) {
      /*jshint eqeqeq: false */
      if (obj !== undefined && obj._id == elementId) {
        /*jshint eqeqeq: true */
        return obj;
      }
    }) || [];

  return result.length === 1 ? result[0] : undefined;
};

function walkRecursively(element, cb) {
  var elements = [];
  if (element !== undefined) {
    if (element.projects !== undefined && element.projects.length > 0) {
      elements.push.apply(elements, element.projects);
    }
    if (element.documents !== undefined && element.documents.length > 0) {
      elements.push.apply(elements, element.documents);
    }
    if (element.versions !== undefined && element.versions.length > 0) {
      elements.push.apply(elements, element.versions);
    }

    if (elements.length === 0) {
      return;
    }
    elements.forEach(function (element) {
      cb(element);
      walkRecursively(element, cb);
    });
  }
}

function findSpecificRecursivelyById(parentElement, elementId, cb) {
  var type;
  if (parentElement.projects !== undefined) {
    var element = parentElement.projects.id(elementId);
    type = 'project';
    if ((element === undefined || element === null) && parentElement.documents !== undefined) {
      element = parentElement.documents.id(elementId);
      type = 'document';
      if (element === undefined || element === null) {
        parentElement.documents.forEach(function (document) {
          if (document.versions !== undefined) {
            element = document.versions.id(elementId);
            type = 'version';
          }
        });
      }
    }
    if (element === undefined || element === null) {
      if (parentElement.projects !== undefined && parentElement.projects.length > 0) {
        parentElement.projects.forEach(function (subElement) {
          findSpecificRecursivelyById(subElement, elementId, cb, parentElement);
        });
      } else {
        return;
      }
    } else {
      cb(element, parentElement, type);
    }
  }
}

module.exports = {
  findSpecificRecursivelyById: findSpecificRecursivelyById,
  walkRecursively: walkRecursively,
};