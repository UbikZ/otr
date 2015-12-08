'use strict';

module.exports = function($translateProvider) {
  $translateProvider.translations('en', require('./en.json'));
  $translateProvider.translations('fr', require('./fr.json'));

  $translateProvider.preferredLanguage('en');
};

