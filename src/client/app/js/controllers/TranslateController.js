'use strict';

import AbstractController from 'AbstractController';

/**
 * Controller to manage translations
 */
class TranslateController extends AbstractController {
  /**
   * @param $translate
   * @param $localStorage
   */
  constructor($translate, $localStorage) {
    super();
    this.$translate = $translate;
    this.$localStorage = $localStorage;
    this._init();
  }

  /**
   * Init the controller
   * @private
   */
  _init() {
    this._defineLanguages();
    this._getDefaultLanguage();
    this.$inject = ['$translate', '$localStorage'];
  }

  /**
   * Define languages to use
   * @private
   */
  _defineLanguages() {
    this.languages = [{locale: 'fr'}, {locale: 'gb'}];
  }

  /**
   * Set default language at the loading of the controller
   * - Use localStorage to store selected language
   * @private
   */
  _getDefaultLanguage() {
    this.currentLanguage = this.languages[0].locale;
    if (this.$localStorage.currentLanguage !== undefined) {
      this.currentLanguage = this.$localStorage.currentLanguage;
    } else {
      this._persist();
    }
    this.$translate.use(this.$localStorage.currentLanguage);
  }

  /**
   * Persist method to store the language in localStorage
   * @private
   */
  _persist() {
    this.$localStorage.currentLanguage = this.currentLanguage;
  }

  /**
   * @action Method to change the language
   * @param languageKey
   */
  changeLanguage(languageKey) {
    this.currentLanguage = languageKey;
    this.$translate.use(languageKey);
    this._persist();
  }
}

export default TranslateController;