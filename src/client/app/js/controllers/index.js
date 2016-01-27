'use strict';

import MainController from './MainController';
import LoginController from './LoginController';
import HomeController from './HomeController';
import TranslateController from './TranslateController';

module.exports = function(app) {
// Global controllers
  app.controller('main.controller', MainController);
  app.controller('login.controller', LoginController);
  app.controller('home.controller', HomeController);
  app.controller('translate.controller', TranslateController);

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

// Versions
  app.controller('version-preview.controller', require('./versions/preview'));
};

/*export default [
  MainController,
  LoginController,
  HomeController
];*/




