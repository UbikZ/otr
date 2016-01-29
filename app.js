'use strict';

const config = require('./config.json');
const ApplicationClass = require(config.path.server.root + '/Application');

let Application = new ApplicationClass(config);
Application.run();