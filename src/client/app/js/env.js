'use strict';

module.exports = {
  appName: 'otr',
  baseTemplateDir: '/views/',
  apiUrl: '/api/v1',

  templatePath: function (view) { return [this.baseTemplateDir, view].join(''); }
};