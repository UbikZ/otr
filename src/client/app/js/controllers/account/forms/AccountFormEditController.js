'use strict';

import AbstractController from '../../AbstractController';

/**
 * Controller to edit information about logged account
 */
class AccountFormEditController extends AbstractController {
  /**
   * @param $rootScope
   * @param $localStorage
   * @param userService
   */
  constructor($rootScope, $localStorage, userService) {
    super();
    this.$rootScope = $rootScope;
    this.$localStorage = $localStorage;
    this.userService = userService;
    this._init();
  }

  /**
   * Init the controller
   * - Fill $rootScope.user data with current profile model
   * @private
   */
  _init() {
    this.loading = false;
    this.profile = {
      firstname: this.$rootScope.user.name.firstname,
      lastname: this.$rootScope.user.name.lastname,
      job: this.$rootScope.user.info.job,
      skype: this.$rootScope.user.info.skype,
      location: this.$rootScope.user.info.location,
    };
    this.$rootScope.enableUi();
    this.$inject = ['$rootScope', '$localStorage', 'userService'];
  }

  /**
   * @action Update account data on database and store result in local storage
   * @param data
   */
  updateAccount(data) {
    this.loading = true;
    this.userService.update(data, (res) => {
      this.$rootScope.user = res.user;
      this.$localStorage.user = JSON.stringify(this.$rootScope.user);
      this.loading = false;
    });
  }
}

export default AccountFormEditController;