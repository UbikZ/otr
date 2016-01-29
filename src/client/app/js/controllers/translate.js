'use strict';

module.exports = ['$scope', '$translate',
  function ($scope, $translate) {
    $scope.changeLanguage = function (langKey) {
      $scope.currentLanguage = langKey;
      $translate.use(langKey);
    };
  }
];