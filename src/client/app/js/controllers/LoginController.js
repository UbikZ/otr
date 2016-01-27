'use strict';

import AbstractController from 'AbstractController';

/**
 * Login controller
 */
class LoginController extends AbstractController {
  /**
   * @param $rootScope
   * @param authService
   * @param $location
   * @param $localStorage
   */
  constructor($rootScope, authService, $location, $localStorage) {
    super();
    this.authService = authService;
    this.$location = $location;
    this.$localStorage = $localStorage;
    this.$rootScope = $rootScope;
    this._init();
  }

  /**
   * Init the controller
   * @private
   */
  _init() {
    this.loading = false;
    this.$rootScope.enableUi();
    this.$inject = ['$rootScope', 'authService', '$location', '$localStorage'];
  }

  /**
   * Login user with authService call
   * @param user
   */
  login(user) {
    this.loading = true;
    this.authService.login(user, (res) => {
      this.loading = false;
      this.$localStorage.token = res.user.identity.token;
      this.$localStorage.ontimeToken = res.user.identity.ontimeToken;
      this.$rootScope.user = res.user;
      this.$rootScope.isAuthenticated = true;
      this.$location.path('/');
    }, () => {
      this.loading = false;
    });
  }
}

export default LoginController;