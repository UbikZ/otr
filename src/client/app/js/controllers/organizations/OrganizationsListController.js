'use strict';

class OrganizationsListController {
  constructor($rootScope, organizationService, $uibModal) {
    this.$rootScope = $rootScope;
    this.organizationService = organizationService;
    this.$uibModal = $uibModal;
    this._init();
    this.$inject = ['$rootScope', 'organizationService', '$uibModal'];
  }

  _init() {
    this.loading = false;
    this.organizationService.get({lazy: 1}, (res) => {
      this.$rootScope.enableUi();
      this.loading = false;
      this.organizations = res.organizations;
    });
  }

  editOrganization(objectId) {
    var modalInstance = this.$uibModal.open({
      animation: true,
      templateUrl: 'partials/modal-organization.html',
      controller: 'form.organization.controller',
      resolve: {
        identifier: () => objectId,
      }
    });

    modalInstance.result.then((organization) => {
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