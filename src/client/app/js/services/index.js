'use strict';

var app = require('angular').module('otr.services', []);

app.factory('authService', require('./auth'));
