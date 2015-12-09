'use strict';

module.exports = {
  appName: 'otr',
  baseTemplateDir: '/views/',
  apiUrl: 'http://localhost:3000/api/v1',

  templatePath: function (view) { return [this.baseTemplateDir, view].join(''); }
};