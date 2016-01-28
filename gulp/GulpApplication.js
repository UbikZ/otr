'use strict';

// Base
import gulp from 'gulp';

// Plugins
import browserify from 'browserify';
import babelify from 'babelify';
import tsify from 'tsify';
import nodeResolve from 'resolve';
import source from 'vinyl-source-stream';
import streamify from 'gulp-streamify';
import del from 'del';
import mapStream from 'map-stream';

// Gulp plugins
import less from 'gulp-less';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import minifyCss from 'gulp-minify-css';
import minifyHtml from 'gulp-minify-html';
import rev from 'gulp-rev';
import buffer from 'gulp-buffer';
import gzip from 'gulp-gzip';
import jshint from 'gulp-jshint';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';
import coveralls from 'gulp-coveralls';
import angularProtractor from 'gulp-angular-protractor';
import angularTemplateCache from 'gulp-angular-templatecache';
import gulpIf from 'gulp-if';

// Tasks
import taskApp from './tasks/app';
import taskCss from './tasks/css';
import taskHtml from './tasks/html';
import taskJshint from './tasks/jshint';
import taskLessCompile from './tasks/less-compile';
import taskLessVariable from './tasks/less-variable';
import taskNodeCopy from './tasks/node-copy';
import taskPostClean from './tasks/post-clean';
import taskPreClean from './tasks/pre-clean';
import taskRevision from './tasks/revision';
import taskTestBack from './tasks/test-back';
import taskTestFront from './tasks/test-front';
import taskVendor from './tasks/vendor';

function createTask(closure, dependencies = []) {
  return {
    module: closure,
    requires: dependencies,
  }
}

/**
 *
 */
class GulpApplication {
  /**
   * @param config
   */
  constructor(config) {
    this.config = config;
    this.plugins = {};
    this.tasks = {};
    this.browserDependencies = [];
  }

  /**
   *
   */
  initialize() {
    this._defineTasks();
    this._defineDefaultTasks();
  }

  /**
   *
   * @private
   */
  _defineDefaultTasks() {
    gulp.task('install', ['revision'], this._getTask('post-clean'));
    gulp.task('default', ['install']);
  }

  /**
   *
   * @private
   */
  _registerPlugins() {
    this.plugins = {
      browserify, babelify, tsify, nodeResolve, source, streamify, del, mapStream, less, concat, uglify, minifyCss,
      minifyHtml, rev, buffer, gzip, jshint, istanbul, mocha, coveralls, angularProtractor, angularTemplateCache,
      gulpIf
    };

    // Plugin for production/staging mode
    this.plugins.ifProd = callback => this.plugins.gulpIf(!this.config.env.debug, callback);
  }

  /**
   *
   * @private
   */
  _registerTasks() {
    this.tasks = {
      'pre-clean': createTask(taskPreClean),
      'jshint': createTask(taskJshint),
      'node-copy': createTask(taskNodeCopy),
      'less-variable': createTask(taskLessVariable, ['node-copy']),
      'less-compile': createTask(taskLessCompile, ['less-variable']),
      'css': createTask(taskCss, ['less-compile']),
      'vendor': createTask(taskVendor),
      'html': createTask(taskHtml),
      'app': createTask(taskApp, ['html']),
      'revision': createTask(taskRevision, ['app', 'vendor', 'css']),
      'test-back': createTask(taskTestBack),
      'test-front': createTask(taskTestFront),
      'post-clean': createTask(taskPostClean),
    };
  }

  /**
   *
   * @private
   */
  _registerBrowserDependencies() {
    this.browserDependencies = [
      'angular', 'angular-gravatar', 'angular-ui-router', 'angular-ui-sortable', 'angular-ui-bootstrap',
      'angular-translate', 'bootstrap-ui', 'ngstorage', 'angular-tree-control', 'jquery', 'jquery-ui',
      'jquery-slimscroll', 'metismenu', 'oclazyload', 'pace', 'toastr', 'q'
    ];
  }

  /**
   *
   * @private
   */
  _defineTasks() {
    this._registerBrowserDependencies();
    this._registerPlugins();
    this._registerTasks();

    Object.keys(this.tasks).forEach(task => {
      gulp.task(task, this.tasks[task].requires, this._getTask(task));
    }, this.tasks);
  }

  /**
   *
   * @param taskName
   * @returns {*}
   * @private
   */
  _getTask(taskName) {
    return this.tasks[taskName].module(gulp, this.plugins, () => {
      var dependenciesObj = require('./../package.json').dependencies;

      return Object.keys(dependenciesObj).filter(element => ~this.browserDependencies.indexOf(element));
    }, this.config);
  }
}

export default GulpApplication;
