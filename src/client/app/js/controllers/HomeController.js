'use strict';

import AbstractController from './AbstractController';

/**
 * Controller for Home page (nothing here for now)
 */
class HomeController extends AbstractController {
  /**
   * @param $rootScope
   */
  constructor($rootScope) {
    super();
    this.$rootScope = $rootScope;
    this._init();
  }

  /**
   * Init the controller
   * @private
   */
  _init() {
    this.$rootScope.enableUi();
    this.$inject = ['$rootScope'];
  }
}

export default HomeController;