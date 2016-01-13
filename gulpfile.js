'use strict';

var gulp = require('gulp');
var config = require('./config.json');
var argv = require('yargs').argv;

var plugins = {};
plugins.uglify = require('gulp-uglify');
plugins.browserify = require('browserify');
plugins.nodeResolve = require('resolve');
plugins.source = require('vinyl-source-stream');
plugins.streamify = require('gulp-streamify');
plugins.del = require('del');
plugins.less = require('gulp-less');
plugins.concat = require('gulp-concat');
plugins.minifyCss = require('gulp-minify-css');
plugins.minifyHtml = require('gulp-minify-html');
plugins.angularTemplateCache = require('gulp-angular-templatecache');

var tasksMapper = {
  'pre-clean': [],
  'post-clean': [],
  'vendor': [],
  'app': [],
  'node-copy': [],
  'less-variable': ['node-copy'],
  'less-compile': ['less-variable'],
  'css': ['less-compile'],
  'html': [],
};

var browserDependencies = [
  'angular',
  'angular-gravatar',
  'angular-ui-router',
  'angular-ui-sortable',
  'angular-ui-bootstrap',
  'angular-translate',
  'bootstrap-ui',
  'ngstorage',
  'angular-tree-control',
  'jquery',
  'jquery-ui',
  'jquery-slimscroll',
  'metismenu',
  'oclazyload',
  'pace',
  'toastr',
];

config.env.current = process.env.NODE_ENV || argv.env;
config.env.debug = (config.env.current !== 'production');

// Bind tasks
Object.keys(tasksMapper).forEach(function(task) {
  gulp.task(task, this[task] || [], getTask(task));
}, tasksMapper);

// Build tasks
gulp.task('javascript', ['vendor', 'app']);
gulp.task('install', ['html', 'javascript', 'css'], getTask('post-clean'));
gulp.task('default', ['install']);

function getTask(task) {
  return require('./gulp-tasks/' + task)(gulp, plugins, function() {
    var dependenciesObj = require('./package.json').dependencies;

    return Object.keys(dependenciesObj).filter(function(element) {
      return browserDependencies.indexOf(element) != -1;
    });
  }, config);
}
