'use strict';

class TranslateController {
  constructor($translate, $localStorage) {
    this.$translate = $translate;
    this.$localStorage = $localStorage;

    this._defineLanguages();
    this._getDefaultLanguage();
    this.$inject = ['$translate', '$localStorage'];
  }

  changeLanguage(languageKey) {
    this.currentLanguage = languageKey;
    this.$translate.use(languageKey);
    this._persist();
  }

  _defineLanguages() {
    this.languages = [{locale: 'fr'}, {locale: 'gb'}];
  }

  _getDefaultLanguage() {
    this.currentLanguage = this.languages[0].locale;
    if (this.$localStorage.currentLanguage !== undefined) {
      this.currentLanguage = this.$localStorage.currentLanguage;
    } else {
      this._persist();
    }
    this.$translate.use(this.$localStorage.currentLanguage);
  }

  _persist() {
    this.$localStorage.currentLanguage = this.currentLanguage;
  }
}

export default TranslateController;