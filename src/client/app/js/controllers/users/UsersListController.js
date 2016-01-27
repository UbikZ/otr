'use strict';

import AbstractController from '../AbstractController';

/**
 * Controller to display all users
 */
class UsersListController extends AbstractController {
  constructor($rootScope, userService) {
    super();
    this.$rootScope = $rootScope;
    this.userService = userService;
    this._init();
  }

  /**
   * Init the controller with userService call
   * - Get all the users
   * @private
   */
  _init() {
    this.loading = false;
    this.userService.get({}, (res) => {
      this.$rootScope.enableUi();
      this.users = res.users;
      this.loading = false;
    });
    this.$inject = ['$rootScope', 'userService'];
  }
}

export default UsersListController;