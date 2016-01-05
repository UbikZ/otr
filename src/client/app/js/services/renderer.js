'use strict';

var angular = require('angular');
var env = require('../env');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function($http, $translate) {
    var baseUrl = env.apiUrl + '/renderer';

    return {
      renderPdf: function(data, success  , error) {
        callbacks.get(baseUrl, data, $http, $translate, success, error);
      },
    };
  }
];