// import { Globals } from '../utils/globals';
import * as moment from 'moment/moment';


import { Injectable } from '@angular/core';
import * as translations from '../utils/translations';

@Injectable()
export class TranslatorService {

  private defaultLanguage = 'it'; // default language
  private language: string; // user language
  private translations: Object;

  constructor(
  ) {}

  /** */
  public translate(globals) {
    // set language
    this.setLanguage(globals.windowContext,  globals.lang);
    //globals.setParameter('lang', this.language);

    // translate
    globals.LABEL_PLACEHOLDER = this.translateForKey('LABEL_PLACEHOLDER');
    globals.LABEL_START_NW_CONV = this.translateForKey('LABEL_START_NW_CONV');
    globals.LABEL_FIRST_MSG = this.translateForKey('LABEL_FIRST_MSG');
    globals.LABEL_FIRST_MSG_NO_AGENTS = this.translateForKey('LABEL_FIRST_MSG_NO_AGENTS');
    globals.LABEL_SELECT_TOPIC = this.translateForKey('LABEL_SELECT_TOPIC');
    globals.LABEL_COMPLETE_FORM = this.translateForKey('LABEL_COMPLETE_FORM');
    globals.LABEL_FIELD_NAME = this.translateForKey('LABEL_FIELD_NAME');
    globals.LABEL_ERROR_FIELD_NAME = this.translateForKey('LABEL_ERROR_FIELD_NAME');
    globals.LABEL_FIELD_EMAIL = this.translateForKey('LABEL_FIELD_EMAIL');
    globals.LABEL_ERROR_FIELD_EMAIL = this.translateForKey('LABEL_ERROR_FIELD_EMAIL');
    globals.LABEL_WRITING = this.translateForKey('LABEL_WRITING');
    globals.AGENT_NOT_AVAILABLE = this.translateForKey('AGENT_NOT_AVAILABLE');
    globals.AGENT_AVAILABLE = this.translateForKey('AGENT_AVAILABLE');
    globals.GUEST_LABEL = this.translateForKey('GUEST_LABEL');
    globals.ALL_AGENTS_OFFLINE_LABEL = this.translateForKey('ALL_AGENTS_OFFLINE_LABEL');
    globals.CALLOUT_TITLE_PLACEHOLDER = this.translateForKey('CALLOUT_TITLE_PLACEHOLDER');
    globals.CALLOUT_MSG_PLACEHOLDER = this.translateForKey('CALLOUT_MSG_PLACEHOLDER');
    globals.ALERT_LEAVE_CHAT = this.translateForKey('ALERT_LEAVE_CHAT');
    globals.YES = this.translateForKey('YES');
    globals.NO = this.translateForKey('NO');
    globals.BUTTON_CLOSE_TO_ICON = this.translateForKey('BUTTON_CLOSE_TO_ICON');
    globals.BUTTON_EDIT_PROFILE = this.translateForKey('BUTTON_EDIT_PROFILE');
    globals.BUTTON_DOWNLOAD_TRANSCRIPT = this.translateForKey('BUTTON_DOWNLOAD_TRANSCRIPT');
    globals.RATE_CHAT = this.translateForKey('RATE_CHAT');
    globals.WELLCOME_TITLE = this.translateForKey('WELLCOME_TITLE');
    globals.WELLCOME_MSG = this.translateForKey('WELLCOME_MSG');
    globals.WELLCOME = this.translateForKey('WELLCOME');
    globals.OPTIONS = this.translateForKey('OPTIONS');
    globals.SOUND_ON = this.translateForKey('SOUND_ON');
    globals.SOUND_OFF = this.translateForKey('SOUND_OFF');
    globals.LOGOUT = this.translateForKey('LOGOUT');
    globals.CUSTOMER_SATISFACTION = this.translateForKey('CUSTOMER_SATISFACTION');
    globals.YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE = this.translateForKey('YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE');
    globals.DOWNLOAD_TRANSCRIPT = this.translateForKey('DOWNLOAD_TRANSCRIPT');
    globals.YOUR_RATING = this.translateForKey('YOUR_RATING');
    globals.WRITE_YOUR_OPINION = this.translateForKey('WRITE_YOUR_OPINION');
    globals.SUBMIT = this.translateForKey('SUBMIT');
    globals.THANK_YOU_FOR_YOUR_EVALUATION = this.translateForKey('THANK_YOU_FOR_YOUR_EVALUATION');
    globals.YOUR_RATING_HAS_BEEN_RECEIVED = this.translateForKey('YOUR_RATING_HAS_BEEN_RECEIVED');
    globals.CLOSE = this.translateForKey('CLOSE');
    globals.PREV_CONVERSATIONS = this.translateForKey('PREV_CONVERSATIONS');
    globals.YOU = this.translateForKey('YOU');
    globals.SHOW_ALL_CONV = this.translateForKey('SHOW_ALL_CONV');
    globals.START_A_CONVERSATION = this.translateForKey('START_A_CONVERSATION');
    globals.NO_CONVERSATION = this.translateForKey('NO_CONVERSATION');
    globals.SEE_PREVIOUS = this.translateForKey('SEE_PREVIOUS');
    globals.WAITING_TIME_FOUND = this.translateForKey('WAITING_TIME_FOUND');
    globals.WAITING_TIME_NOT_FOUND = this.translateForKey('WAITING_TIME_NOT_FOUND');

    if (!globals.wellcomeTitle) {
      globals.wellcomeTitle = globals.WELLCOME_TITLE;   /** Set the widget welcome message. Value type : string */
    }
    if (!globals.wellcomeMsg) {
      globals.wellcomeMsg = globals.WELLCOME_MSG;       /** Set the widget welcome message. Value type : string */
    }


}

  /**
   * Return the browser language if it is detected, an epty string otherwise
   * @returns the browser language
   */
  public getBrowserLanguage(windowContext) {
    // console.log('windowContext', windowContext);
    const browserLanguage = windowContext.navigator.language;
    return !browserLanguage ? undefined : browserLanguage;
  }

  /**
   * Set the language in which to translate.
   * If it is provided a not valid language it will use the default language (en)
   * @param language the language
   */
  public setLanguage(windowContext, language) {
    // console.log('windowContext-language', windowContext, language);
    // set the user languge if it is valid.
    // if the user language is not valid, try to get the browser language.
    // if the browser language is not valid, it use the default language (en)
    if (!language) {
      // user language not valid
      if (this.getBrowserLanguage(windowContext) !== undefined) {
        // browser language valid
        this.language = this.getBrowserLanguage(windowContext);
      } else {
        // browser language not valid
        this.language = this.defaultLanguage;
      }
    } else {
      // user language valid
      this.language = language;
    }
    this.language = this.language.substring(0, 2);
    // retrieve the translation
    // console.log('LINGUA IMPOSTATA: ', this.language);
    this.getLanguageObject(this.language);
  }

  // retrieve the language object
  private getLanguageObject(language) {
    if (language === 'en') {
      this.translations = translations.en;
    } else if (language === 'it') {
      this.translations = translations.it;
    } else {
      // use the default language in any other case
      this.translations = translations.en;
    }
  }

  /**
   * Translate a keyword to the language set with the method setLanguage(language)
   * @param keyword the keyword to translate
   * @returns the keyword translations
   */
  public translateForKey(keyword: string): string {
    // console.log('this.translations -> keyword: ', this.translations[keyword]);
    return !this.translations[keyword] ? '' : this.translations[keyword];
  }

  /**
   * Return the user language
   * @returns the user language
   */
  public getLanguage() {
    return this.language;
  }

  public getDefaultLanguage() {
    return this.defaultLanguage;
  }
}
