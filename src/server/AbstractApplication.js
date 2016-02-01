'use strict';

const promise = require('bluebird');
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const mongoose = promise.promisifyAll(require('mongoose'));
const morgan = require('morgan');

/**
 *
 */
class AbstractApplication {
  /**
   * @param config
   */
  constructor(config) {
    config.env.debug = !~['staging', 'production'].indexOf(process.env.NODE_ENV);
    this.app = express();
    this.port = config.env[process.env.NODE_ENV].port;
    this.config = config;
    // we need to keep mongoose promised by bluebird
    this.mongoose = mongoose;
    /*if (!new.target) {
      throw 'Can\'t instantiate Abstract Class';
    }*/

    this._registerLogger();

    this._checkSettings();
    this._registerHttpMiddleware();
    this._registerDatabasse();
    this._loadModels();
    this._loadControllers();
    this._loadHelpers();
  }

  run() {
    this.app.listen(this.port, () => {
      this.logger.info('NodeJS server started on port ' + this.port);
    });
  }

  _checkSettings() {
    if (process.env.NODE_ENV === undefined) {
      throw 'NODE_ENV is undefined';
    }
  }

  _registerLogger() {
    this.logger = require('./logger');
    this.app.use(morgan('combined', {stream: this.logger.stream}));
  }

  _registerHttpMiddleware() {
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(bodyParser.json());

    this.app.use((req, res, next) => {
      // For staging/production test (nginx will deliver statics files with specific rule)
      if (!this.config.env.debug && ~req.url.indexOf('.gz.')) {
        res.setHeader('Content-Encoding', 'gzip');
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-tType, Authorization');
      next();
    });

    this.app.use(express.static(this.config.path.public));

    // Hack to avoid muti-send issue
    this.app.use((req, res, next) => {
      var _send = res.send;
      var sent = false;
      res.send = (data) => {
        if (sent) {
          return;
        }
        _send.bind(res)(data);
        sent = true;
      };
      next();
    });
  }

  _registerDatabasse() {
    this.mongoose.connect(this.config.env[process.env.NODE_ENV].mongo.uri);

    const database = this.mongoose.connection;
    database.on('error', console.error.bind(console, 'Connection error:'));
    database.once('open', () => {
      this.logger.info('Mongo connection is ok');
    });
  }

  _loadModels() {
    fs.readdirSync(this.config.path.server.model).forEach(file => {
      if (file.substr(-3) === '.js') {
        require('./models/' + file);
      }
    });
  }

  _loadControllers() {
    fs.readdirSync(this.config.path.server.controller).forEach(file => {
      if (file.substr(-3) === '.js') {
        require('./controllers/' + file).controller(this.app, this.config);
      }
    });
  }

  _loadHelpers() {
    fs.readdirSync(this.config.path.server.prototype).forEach(file => {
      if (file.substr(-3) === '.js') {
        require('./prototypes/' + file);
      }
    });
  }
}

module.exports = AbstractApplication;