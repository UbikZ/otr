'use strict';

class HomeController {
  constructor($rootScope) {
    $rootScope.enableUi();
    this.$inject = ['$rootScope'];
  }
}

export default HomeController;