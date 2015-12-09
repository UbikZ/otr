'use strict';

var app = require('angular').module('otr.controllers', []);

// Classic controllers
app.controller('main.controller', require('./main'));
app.controller('login.controller', require('./login'));
app.controller('home.controller', require('./home'));
app.controller('translate.controller', require('./translate'));

// Form controllers
app.controller('form.profile.controller', require('./forms/profile'));
