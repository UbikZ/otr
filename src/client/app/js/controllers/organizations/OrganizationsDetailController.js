'use strict';

import AbstractOrganizationsController from 'AbstractOrganizationsController';

/**
 *  Controller for detail of selected organization
 */
class OrganizationsDetailController extends AbstractOrganizationsController {
  /**
   * @param $scope
   * @param $rootScope
   * @param $stateParams
   * @param organizationService
   * @param $uibModal
   * @param $location
   */
  constructor($scope, $rootScope, $stateParams, organizationService, $uibModal, $location) {
    super($uibModal);
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$stateParams = $stateParams;
    this.$location = $location;
    this.organizationService = organizationService;
    this._init();
  }

  /**
   * Init the controller with organization service call
   * - Get ONE organization from "id"
   * @private
   */
  _init() {
    this.organizationService.get({id: this.$stateParams.id, lazyVersion: 1}, (res) => {
      if (res.organizations.length === 0) {
        this.$location.path('/');
      } else {
        this.$rootScope.enableUi();
        this.organization = res.organizations[0];
        this.$scope.$broadcast('load-organization', {organization: this.organization});
      }
    });
    this.$inject = ['$scope', '$rootScope', '$stateParams', 'organizationService', '$uibModal', '$location'];
  }

  /**
   * @action Edit one organization (calling modal)
   * @param objectId
   */
  editDetail(objectId) {
    this._edit(objectId).result.then((organization) => {
      this.organization = organization;
    });
  }
}

export default OrganizationsDetailController;