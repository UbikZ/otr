'use strict';

Array.prototype.id = function (elementId) {
  var result = this.filter(function (obj) {
    if (obj != undefined && obj._id == elementId) {
      return obj;
    }
  }) || [];

  return result.length == 1 ? result[0] : undefined;
};

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

function walkRecursively(element, cb) {
  var elements = [];
  if (element != undefined) {
    if (element.projects != undefined && element.projects.length > 0) {
      elements.push.apply(elements, element.projects);
    }
    if (element.documents != undefined && element.documents.length > 0) {
      elements.push.apply(elements, element.documents);
    }
    if (element.versions != undefined && element.versions.length > 0) {
      elements.push.apply(elements, element.versions);
    }

    if (elements.length == 0) {
      return;
    }
    elements.forEach(function (element) {
      cb(element);
      walkRecursively(element, cb);
    });
  }
}

function findSpecificRecursivelyById(parentElement, elementId, cb, prevEl) {
  var type;
  if (parentElement.projects != undefined) {
    var element = parentElement.projects.id(elementId);
    type = 'project';
    if (element == undefined && parentElement.documents !== undefined) {
      element = parentElement.documents.id(elementId);
      type = 'document';
      if (element == undefined) {
        parentElement.documents.forEach(function(document) {
          if (document.versions != undefined) {
            element = document.versions.id(elementId);
            type = 'version';
          }
        });
      }
    }
    if (element == undefined) {
      if (parentElement.projects != undefined && parentElement.projects.length > 0) {
        parentElement.projects.forEach(function (subElement) {
          findSpecificRecursivelyById(subElement, elementId, cb, parentElement);
        });
      } else {
        cb();
      }


    } else {
      cb(element, parentElement, type);
    }
  }
}

module.exports = {
  findRecursivelyById: findRecursivelyById,
  findSpecificRecursivelyById: findSpecificRecursivelyById,
  walkRecursively: walkRecursively,
};