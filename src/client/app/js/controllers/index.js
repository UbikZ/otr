'use strict';

import MainController from './MainController';
import LoginController from './LoginController';
import HomeController from './HomeController';
import TranslateController from './TranslateController';
import OrganizationsListController from './organizations/OrganizationsListController';
import OrganizationsDetailController from './organizations/OrganizationsDetailController';
import OrganizationsFormEditController from './organizations/forms/OrganizationsFormEditController';
import UsersListController from './users/UsersListController';
import AccountOntimeController from './account/AccountOntimeController';

module.exports = function(app) {
// Global controllers
  app.controller('main.controller', MainController);
  app.controller('login.controller', LoginController);
  app.controller('HomeController', HomeController);
  app.controller('translate.controller', TranslateController);

// Organizations
  app.controller('organization.controller', OrganizationsListController);
  app.controller('organization-detail.controller', OrganizationsDetailController);
  app.controller('form.organization.controller', OrganizationsFormEditController);

// Filesystem
  app.controller('filesystem.controller', require('./filesystem/tree'));
  app.controller('form.item.controller', require('./filesystem/forms/item'));

// Users
  app.controller('user.controller', UsersListController);

// Account
  app.controller('ontime.controller', AccountOntimeController);
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




