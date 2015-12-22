'use strict';

function convertTreeView(parent) {
  var result = [];
  if (parent.projects != undefined) {
    parent.projects.forEach(function (project) {
      result.push({_id: project._id, name: project.name, setting: project.setting, type: 'project', children: convertTreeView(project)});
    });
  }
  if (parent.documents != undefined) {
    parent.documents.forEach(function (document) {
      result.push({_id: document._id, name: document.name, setting: document.setting, type: 'document'});
    });
  }

  return result;
}

function findRecursivelyById(parentElement, attributeName, elementId, getParent, cb, passFirstElement) {
  var elements = passFirstElement === true ? parentElement : parentElement[attributeName];
  if (elements != undefined) {
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
}

function findSpecificRecursivelyById(parentElement, elementId, cb, passFirstElement) {
  var elements = [];
  if (passFirstElement === true) {
    elements = parentElement;
  } else {
    elements = parentElement.projects;
    if (elements == undefined) {
      if (parentElement._id == elementId) {
        cb(parentElement);
      }
    } else if (parentElement.documents != undefined) {
      elements = elements.concat(parentElement.documents);
    }
  }
  if (elements != undefined) {
    elements.forEach(function (subElement) {
      if (subElement._id != elementId) {
        findSpecificRecursivelyById(subElement, elementId, cb);
      } else {
        cb(subElement);
      }
    });
  }
}

function findPathRecursivelyById(elements, elementId, attributeName) {
  var sub, index;

  function slice(object, properties) {
    var result = {}, props = properties || [];

    props.forEach(function(property) {
      result[property] = object[property];
    });

    return result;
  }

  if (elements != undefined) {
    for (index = 0; index < elements.length ; index++) {
      if (elements[index]._id === elementId) {
        return [slice(elements[index], ['_id', 'name', 'setting'])];
      } else if (sub = findPathRecursivelyById(elements[index][attributeName], elementId, attributeName)) {
        return [slice(elements[index], ['_id', 'name', 'setting'])].concat(sub);
      }
    }
  }
}

function walkTreeRecursively(element, attributeName, type, cb) {
  if (element.type != type || element[attributeName] == undefined || element[attributeName].length == 0) {
    return;
  }
  element[attributeName].forEach(function (child) {
    cb(element);
    walkTreeRecursively(child, attributeName, type, cb);
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
  findSpecificRecursivelyById: findSpecificRecursivelyById,
  removeRecursivelyById: removeRecursivelyById,
  walkTreeRecursively: walkTreeRecursively,
  findPathRecursivelyById: findPathRecursivelyById,
};