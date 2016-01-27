'use strict';

/**
 * Abstract controller for Organizations
 */
import AbstractOrganizationsController from './AbstractOrganizationsController';

/**
 *  Controller for list organizations
 */
class OrganizationsListController extends AbstractOrganizationsController {
  /**
   * @param $rootScope
   * @param organizationService
   * @param $uibModal
   */
  constructor($rootScope, organizationService, $uibModal) {
    super($uibModal);
    this.$rootScope = $rootScope;
    this.organizationService = organizationService;
    this._init();
  }

  /**
   * Init the controller with organization service call
   * - Get all organizations
   * @private
   */
  _init() {
    this.loading = false;
    this.organizationService.get({lazy: 1}, (res) => {
      this.$rootScope.enableUi();
      this.loading = false;
      this.organizations = res.organizations;
    });
    this.$inject = ['$rootScope', 'organizationService', '$uibModal'];
  }

  /**
   * @action Edit one organization (calling modal)
   * @param objectId
   */
  editOrganization(objectId) {
    this._edit(objectId).result.then((organization) => {
      if (objectId) {
        this.organizations.forEach((org, index) => {
          if (org._id === organization._id) {
            this.organizations[index] = organization;
          }
        });
      } else {
        this.organizations.push(organization);
      }
    });
  }

  /**
   * @action Delete one organization (calling organizationService)
   * @param objectId
   */
  deleteOrganization(objectId) {
    this.deleteLoading = true;
    this.organizationService.delete({id: objectId}, (res) => {
      this.organizations.forEach((org, index) => {
        if (org._id === res.id) {
          this.organizations.splice(index, 1);
        }
      });
      this.deleteLoading = false;
    });
  }
}

export default OrganizationsListController;