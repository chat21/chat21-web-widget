import { Injectable } from '@angular/core';
import * as translations from '../utils/translations';

@Injectable()
export class TranslatorService {

  private defaultLanguage: string = "en"; // default language
  private language : string; // user language
  // contains the translation to the selected language
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
    //console.log("TranslatorService::getBrowserLanguage::browserLanguage:", browserLanguage);
  
    return !browserLanguage ? undefined : browserLanguage;
  }

   /**
    * Set the language in which to translate.
    * 
    * If it is provided a not valid language it will use the default language (en)
    * 
    * @param language the language
    */
  public setLanguage(language) {

    // set the user languge if it is valid.
    // if the user language is not valid, try to get the browser language.
    // if the browser language is not valid, it use the default language (en)
    if(!language) {
      // user language not valid
      if (this.getBrowserLanguage() !== undefined) {
         // browser language valid
        this.language = this.getBrowserLanguage();
      } else {
        // browser language not valid
        this.defaultLanguage;
      }
    } else {
      // user language valid
      this.language = language; 
    }

    // retrieve the translation
    this.getLanguageObject(this.language);

  }

  // retrieve the language object
  private getLanguageObject(language) {
    if (language === "en") {
      this.translations = translations.en;
    } else if (language === "it") {
      this.translations = translations.it;
    } else {
      // use the default language in any other case
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