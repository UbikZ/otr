'use strict';

var app = require('angular').module('corpnet.controllers', ['corpnet.socket-io']);

// Classic controllers
app.controller('main.controller', require('./main'));
app.controller('login.controller', require('./login'));
app.controller('home.controller', require('./home'));
app.controller('translate.controller', require('./translate'));
app.controller('chat.controller', require('./chat'));


// Form controllers
app.controller('form.profile.controller', require('./forms/profile'));
