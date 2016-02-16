'use strict';

/**
 * Find helper class
 * - walkRecursively
 * - findRecursively
 */
class Find {
  /**
   * Traverse all nodes and apply callback function on each node
   * @param element
   * @param callback
   */
  static walkRecursively(element, callback) {
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
        callback(element);
        Find.walkRecursively(element, callback);
      });
    }
  }

  /**
   * Search and find recursively one node by ID
   * FIXME: manage to break properly the recursion (when not found)
   * @param parentElement
   * @param elementId
   * @param callback
   */
  static findRecursively(parentElement, elementId, callback) {
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
            Find.findRecursively(subElement, elementId, callback, parentElement);
          });
        } else {
          return;
        }
      } else {
        callback(element, parentElement, type);
      }
    }
  }
}

module.exports = Find;