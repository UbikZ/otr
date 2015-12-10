'use strict';

var app = require('angular').module('otr.controllers', []);

// Classic controllers
app.controller('main.controller', require('./main'));
app.controller('login.controller', require('./login'));
app.controller('home.controller', require('./home'));
app.controller('translate.controller', require('./translate'));
app.controller('ontime.controller', require('./ontime'));
app.controller('user.controller', require('./user'));
app.controller('organization.controller', require('./organization'));

// Form controllers
app.controller('form.profile.controller', require('./forms/profile'));
