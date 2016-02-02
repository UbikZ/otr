'use strict';

const IndexControllerClass = require('./IndexController');
const AuthenticationControllerClass = require('./AuthenticationController');

/**
 * Router
 * @param Application
 */
module.exports = (Application) => {
  const config = Application.config;
  const app = Application.app;
  const apiUrl = Application.apiUrl;

  // Instantiate controllers
  const IndexController = new IndexControllerClass(config);
  const AuthenticationController = new AuthenticationControllerClass(config);

  app.get(apiUrl + '/', IndexController.indexAction);
  app.post(apiUrl + '/sign-up', AuthenticationController.signUpAction);
  app.get(apiUrl + '/me', AuthenticationController.meAction);
};