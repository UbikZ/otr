'use strict';

function walkRecursively(element, cb) {
  const elements = [];
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
    elements.forEach(element => {
      cb(element);
      walkRecursively(element, cb);
    });
  }
}

function findSpecificRecursivelyById(parentElement, elementId, cb) {
  let type;
  if (parentElement.projects !== undefined) {
    let element = parentElement.projects.id(elementId);
    type = 'project';
    if ((element === undefined || element === null) && parentElement.documents !== undefined) {
      element = parentElement.documents.id(elementId);
      type = 'document';
      if (element === undefined || element === null) {
        parentElement.documents.forEach(document => {
          if (document.versions !== undefined) {
            element = document.versions.id(elementId);
            type = 'version';
          }
        });
      }
    }
    if (element === undefined || element === null) {
      if (parentElement.projects !== undefined && parentElement.projects.length > 0) {
        parentElement.projects.forEach(subElement => {
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