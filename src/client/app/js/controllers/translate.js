'use strict';

module.exports = ['$scope', '$translate',
  function($scope, $translate) {
    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey);
    };
  }
];