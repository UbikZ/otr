'use strict';

import AbstractController from '../../AbstractController';

/**
 * Controller to manage the form in order to create/edit an organization
 */
class OrganizationsFormEditController extends AbstractController {
  constructor($rootScope, modalParameters, organizationService, $uibModalInstance) {
    super();
    this.$rootScope = $rootScope;
    this.modalParameters = modalParameters;
    this.organizationService = organizationService;
    this.$uibModalInstance = $uibModalInstance;
    this._init();
  }

  /**
   * Init the controller
   * @private
   */
  _init() {
    this.loading = false;
    this.organization = {};
    if (this.modalParameters.id !== undefined) {
      this.organizationService.get({id: this.modalParameters.id, lazy: 1}, (res) => {
        this.organization = res.organizations[0];
      });
    }
    this.$inject = ['$rootScope', 'modalParameters', 'organizationService', '$uibModalInstance'];
  }

  /**
   * @action Submit the changes of the organization to the organizationService
   * @param data
   */
  submitOrganization(data) {
    this.loading = true;
    if (this.modalParameters.id !== undefined) {
      data._id = this.modalParameters.id;
      data.lazy = 1;
    }
    this.organizationService.update(data, (res) => {
      this.loading = false;
      this.$uibModalInstance.close(res.organization);
    });
  }

  /**
   * @action Exit/Cancel the modal
   */
  exitModal() {
    this.$uibModalInstance.dismiss('cancel');
  }
}

export default OrganizationsFormEditController;