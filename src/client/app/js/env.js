'use strict';

module.exports = {
  appName: 'otr',
  baseTemplateDir: '/views/',

  templatePath: function (view) { return [this.baseTemplateDir, view].join(''); }
};