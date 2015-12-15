'use strict';

function convertTreeView(parent) {
  var result = [];
  if (parent.projects != undefined) {
    parent.projects.forEach(function (project) {
      result.push({id: project._id, name: project.name, type: 'project', children: convertTreeView(project)});
    });
  }
  if (parent.documents != undefined) {
    parent.documents.forEach(function (document) {
      result.push({id: document._id, name: document.name, type: 'document'});
    });
  }

  return result;
}

function findRecursivelyById(parentElement, attributeName, elementId, cb) {
  parentElement[attributeName].forEach(function (subElement) {
    if (subElement['_id'] != elementId) {
      findRecursivelyById(subElement, attributeName, elementId, cb);
    } else {
      cb(subElement);
    }
  });
}

function removeRecursivelyById(parentElement, attributeName, elementId, cb) {
  var indexToRemove;
  parentElement[attributeName].forEach(function (subElement, index) {
    if (subElement['_id'] != elementId) {
      removeRecursivelyById(subElement, attributeName, elementId, cb);
    } else {
      indexToRemove = index;
    }
  });

  if (indexToRemove != undefined) {
    delete parentElement[attributeName].splice(indexToRemove, 1);
    cb(parentElement[attributeName]);
  }
}

module.exports = {
  convertTreeView: convertTreeView,
  findRecursivelyById: findRecursivelyById,
  removeRecursivelyById: removeRecursivelyById,
};