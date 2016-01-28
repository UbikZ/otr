'use strict';

import AbstractController from '../AbstractController';

/**
 * Abstract Class for Organizations Controller
 */
class AbstractOrganizationsController extends AbstractController {
  /**
   * @param $uibModal
   */
  constructor($uibModal) {
    super();
    // Disable instance create from AbstractOrganizationsController
    if (new.target === AbstractOrganizationsController) {
      throw new TypeError('AbstractOrganizationsController can\'t not be constructed');
    }
    this.$uibModal = $uibModal;
  }

  /**
   * @param objectId
   * @returns {*}
   * @private
   */
  _edit(objectId) {
    return this.$uibModal.open({
      animation: true,
      templateUrl: 'organizations/form/modal-edit.html',
      controller: 'form.organization.controller',
      controllerAs: 'ctrl',
      resolve: {
        modalParameters: () => {
          return {id: objectId};
        },
      }
    });
  }
}

export default AbstractOrganizationsController;