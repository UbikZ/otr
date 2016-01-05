'use strict';

var app = require('angular').module('otr.services', []);

app.factory('authService', require('./auth'));
app.factory('ontimeService', require('./ontime'));
app.factory('userService', require('./user'));
app.factory('organizationService', require('./organization'));
app.factory('itemService', require('./item'));
app.factory('settingService', require('./setting'));
app.factory('settingService', require('./setting'));
app.factory('rendererService', require('./renderer'));