'use strict';

var app = require('angular').module('otr.controllers', []);

// Global controllers
app.controller('main.controller', require('./main'));
app.controller('login.controller', require('./login'));
app.controller('home.controller', require('./home'));
app.controller('translate.controller', require('./translate'));

// Organizations
app.controller('organization.controller', require('./organizations/list'));
app.controller('organization-detail.controller', require('./organizations/detail'));
app.controller('form.organization.controller', require('./organizations/forms/edit'));

// Filesystem
app.controller('filesystem.controller', require('./filesystem/tree'));
app.controller('form.item.controller', require('./filesystem/forms/item'));

// Users
app.controller('user.controller', require('./users/list'));

// Account
app.controller('ontime.controller', require('./account/ontime'));
app.controller('form.profile.controller', require('./account/forms/edit'));

// Settings
app.controller('form.setting.controller', require('./setting/forms/edit'));
app.controller('form.light-setting.controller', require('./setting/forms/light-edit'));

