'use strict';

class LoginController {
  constructor($rootScope, authService, $location, $localStorage) {
    $rootScope.enableUi();
    this.loading = false;
    this.authService = authService;
    this.$location = $location;
    this.$localStorage = $localStorage;
    this.$rootScope = $rootScope;
    this.$inject = ['$rootScope', 'authService', '$location', '$localStorage'];
  }

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