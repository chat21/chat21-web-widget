import { Injectable } from '@angular/core';
import * as translations from '../utils/translations';

@Injectable()
export class TranslatorService {

  private defaultLanguage : string = "en";
  private language : string;
  private translations : Object;

  constructor() {
    this.language = this.defaultLanguage;
  }

  /**
   * Return the browser language if it is detected, an epty string otherwise
   * 
   * @returns the browser language
   */
  public getBrowserLanguage() {
    var browserLanguage = window.navigator.language;
    console.log("TranslatorService::getBrowserLanguage::browserLanguage:", browserLanguage);
  
    return !browserLanguage ? "" : browserLanguage;
  }

   /**
    * Set the language in which to translate.
    * 
    * If it is provided a not valid language it will use the default language (en)
    * 
    * @param language the language
    */
  public setLanguage(language) {
    // sets the user language if it is valid, the default language otherwise
    this.language = !language ? this.defaultLanguage : language;
    this.getLanguageObject(language);
  }

  // retrieve the language object
  private getLanguageObject(language) {
    if (language === "en") {
      this.translations = translations.en;
    } else if (language === "it") {
      this.translations = translations.it;
    } else {
      this.translations = translations.en;
    }
  }

  /**
   * Translate a keyword to the language set with the method setLanguage(language)
   * 
   * @param keyword the keyword to translate
   * @returns the keyword translations
   */
  public translate(keyword) : string {
    return !this.translations[keyword] ? "" : this.translations[keyword];
  }

  /**
   * Return the user language
   * 
   * @returns the user language
   */
  public getLanguage() {
    return this.language;
  }

  public getDefaultLanguage() {
    return this.defaultLanguage;
  }
}