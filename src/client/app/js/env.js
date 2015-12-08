'use strict';

module.exports = {
  appName: 'CorpNet',
  baseTemplateDir: '/views/',

  templatePath: function (view) { return [this.baseTemplateDir, view].join(''); }
};