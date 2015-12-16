'use strict';

function convertTreeView(parent) {
  var result = [];
  if (parent.projects != undefined) {
    parent.projects.forEach(function (project) {
      result.push({_id: project._id, name: project.name, type: 'project', children: convertTreeView(project)});
    });
  }
  if (parent.documents != undefined) {
    parent.documents.forEach(function (document) {
      result.push({_id: document._id, name: document.name, type: 'document'});
    });
  }

  return result;
}

function findRecursivelyById(parentElement, attributeName, elementId, getParent, cb, passFirstElement) {
  var elements = passFirstElement === true ? parentElement : parentElement[attributeName];
  elements.forEach(function (subElement) {
    if (subElement['_id'] != elementId) {
      findRecursivelyById(subElement, attributeName, elementId, getParent, cb);
    } else if (parentElement.length === undefined) {
      cb(getParent === true ? parentElement : subElement);
    } else {
      cb(getParent === true ? undefined : subElement);
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