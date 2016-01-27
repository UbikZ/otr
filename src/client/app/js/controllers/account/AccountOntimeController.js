'use strict';

import AbstractController from '../AbstractController';

/**
 * Controller to retrieve dirty data from Ontime SaaS
 */
class AccountOntimeController extends AbstractController {
  /**
   * @param $rootScope
   * @param ontimeService
   */
  constructor($rootScope, ontimeService) {
    super();
    this.$rootScope = $rootScope;
    this.ontimeService = ontimeService;
    this._init();
  }

  /**
   * Init the controller with ontime service call
   * - Get dirty data from Ontime
   * @private
   */
  _init() {
    this.loading = false;
    this.ontimeService.meOntime({}, (res) => {
      this.$rootScope.enableUi();
      this.json = JSON.stringify(res, null, 4);
      this.loading = false;
    });
    this.$inject = ['$rootScope', 'ontimeService'];
  }
}

export default AccountOntimeController;