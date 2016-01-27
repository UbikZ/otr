'use strict';

module.exports = function($translateProvider) {
  $translateProvider.translations('gb', require('./gb'));
  $translateProvider.translations('fr', require('./fr'));

  $translateProvider.preferredLanguage('fr');
};

