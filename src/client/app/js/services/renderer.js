'use strict';

var env = require('../env');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate', '$rootScope',
  function($http, $translate, $rootScope) {
    var baseUrl = env.apiUrl + '/renderer';

    return {
      renderPdf: function(data, success  , error) {
        callbacks.get(baseUrl, data, $http, $translate, $rootScope, success, error);
      },
    };
  }
];