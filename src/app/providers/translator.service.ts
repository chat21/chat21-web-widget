
import { Injectable } from '@angular/core';
// import * as translations from '../utils/translations';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';

import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Globals } from '../utils/globals';

import { AppConfigService } from './app-config.service';

@Injectable()
export class TranslatorService {

  private defaultLanguage = 'en'; // default language
  private language: string; // user language
  // private translations: Object;

  translated_string: any;
  baseLocation: string;
  remoteTranslationsUrl: string;

  constructor(
    private _translate: TranslateService,
    public http: Http,
    public g: Globals,
    public appConfigService: AppConfigService
  ) {

    let windowContext = window;
    if (window.frameElement && window.frameElement.getAttribute('tiledesk_context') === 'parent') {
      windowContext = window.parent;
    }

    if (windowContext['tiledesk']) {
      this.baseLocation = windowContext['tiledesk'].getBaseLocation();
      // console.log(`»»»» initI18n baseLocation`, this.baseLocation);
    }

  }

  /**
   *
   * Return the browser language
   * used by humanWaitingTime in list-conversation
   *
   * @returns
   */
  public getLanguage() {
    // return this.language;
    return this._translate.getBrowserLang();
  }


  getTranslationFileUrl(browserLang) {
    this.remoteTranslationsUrl = environment.remoteTranslationsUrl;
    // console.log(`»»»» initI18n remoteTranslationsUrl`, this.remoteTranslationsUrl);
    const remoteTranslationsUrl = this.appConfigService.getConfig().remoteTranslationsUrl;
    if (remoteTranslationsUrl) {
      this.remoteTranslationsUrl = remoteTranslationsUrl;
    }
    // console.log(`»»»» initI18n remoteTranslationsUrl2`, this.appConfigService.getConfig());
    this.g.wdLog([' constructor conversation component ']);

    // console.log(`»»»» getTranslationFileUrl `, this.remoteTranslationsUrl);
    if (environment.loadRemoteTranslations) {
      return this.remoteTranslationsUrl + this.g.projectid + '/labels/' + browserLang.toUpperCase();
    } else {
      return this.baseLocation + `/assets/i18n/${browserLang}.json`;
    }
  }

  // https://github.com/ngx-translate/core/issues/282
  initI18n(): Promise<any> {
    this._translate.addLangs(['en', 'it']);
    // console.log(`»»»» initI18n getLangs '`, this._translate.getLangs());

    // Set the default language for translation strings.
    const defaultLanguage = 'en';
    this._translate.setDefaultLang(defaultLanguage);
    // Detect user language.
    let browserLang = this._translate.getBrowserLang();
    if (this.g.lang && this.g.lang !== '') {
      browserLang = this.g.lang;
    } else {
      this.g.lang = browserLang;
    }



    // const languageUrl = this.getTranslationFileUrl(browserLang);
    // console.log(`»»»» browserLang `, browserLang, this.g.lang);


    // Try to load the I18N JSON file for the detected language
    return new Promise((resolve, reject) => {
      const that = this;
      this.http.get(this.getTranslationFileUrl(browserLang))

      .catch((error: any) => {
        // I18N File failed to load, fall back to default language
        // console.log(`»»»» initI18n !!! Problem with '${browserLang}' language initialization from URL `, error.url, ` - ERROR: `, error);
        this._translate.use(defaultLanguage);
        this.http.get(this.getTranslationFileUrl(defaultLanguage)).subscribe((data) => {
          this.translateWithBrowserLang(data['_body'], defaultLanguage);
        }, (er) => {
          // failed to load  default language from remote - fall back to local default language
          console.log(`»»»» initI18n Get default language - ERROR `, er);
          console.log(`»»»» initI18n - »»» loadRemoteTranslations IN ERROR ?`, environment.loadRemoteTranslations);
        }, () => {
          resolve(true);
          // console.log('»»»» initI18n Get default language * COMPLETE *');
        });
        return Observable.throw(error);
      })

      .subscribe((data) => {
        // I18N File loaded successfully, we can proceed
        // console.log(`»»»» Successfully initialized '${browserLang}' language.'`, data);
        // console.log(`»»»» initI18n Successfully initialized '${browserLang}' language from URL'`, data.url);
        if (!data._body || data._body === undefined || data._body === '') {
          browserLang = defaultLanguage;
          this.g.lang = defaultLanguage;
          this._translate.use(defaultLanguage);
          // console.log('»»»» translateWithBrowserLang ', this.getTranslationFileUrl(defaultLanguage));
          this.http.get(this.getTranslationFileUrl(defaultLanguage)).subscribe((defaultdata) => {
            // console.log(`»»»» Successfully initialized '${browserLang}' language.'`, defaultdata);
            this.translateWithBrowserLang(defaultdata['_body'], browserLang);
          });
        } else {
          // console.log(`»»»» translateWithBrowserLang '${browserLang}' language.'`);
          this.translateWithBrowserLang(data._body, browserLang);
        }
      }, (error) => {
        console.log(`»»»» initI18n Get '${browserLang}' language - ERROR `, error);
      }, () => {
        resolve(true);
        // console.log(`»»»» initI18n Get '${browserLang}' language - COMPLETE`);
      });

    });
  }


  private translateWithBrowserLang(body: any, lang: string) {
    this._translate.use(lang);
    // console.log(`»»»» initI18n - »»» loadRemoteTranslations ?`, environment.loadRemoteTranslations);
    if (environment.loadRemoteTranslations) {
      const remote_translation_res = JSON.parse(body);
      // console.log(`»»»» initI18n - »»» remote translation response`, remote_translation_res);
      // console.log(`»»»» initI18n - »»» remote translation `, remote_translation_res.data);
      this._translate.setTranslation(lang, remote_translation_res.data);
    } else {
      this._translate.setTranslation(lang, JSON.parse(body));
    }
  }

  /** */
  public translate(globals) {
    // set language

    // this.setLanguage(globals.windowContext, globals.lang);

    const labels: string[] = [
      'LABEL_PLACEHOLDER',
      'LABEL_START_NW_CONV',
      'LABEL_FIRST_MSG',
      'LABEL_FIRST_MSG_NO_AGENTS',
      'LABEL_SELECT_TOPIC',
      'LABEL_COMPLETE_FORM',
      'LABEL_FIELD_NAME',
      'LABEL_ERROR_FIELD_NAME',
      'LABEL_FIELD_EMAIL',
      'LABEL_ERROR_FIELD_EMAIL',
      'LABEL_WRITING',
      'AGENT_NOT_AVAILABLE',
      'AGENT_AVAILABLE',
      'GUEST_LABEL',
      'ALL_AGENTS_OFFLINE_LABEL',
      'CALLOUT_TITLE_PLACEHOLDER',
      'CALLOUT_MSG_PLACEHOLDER',
      'ALERT_LEAVE_CHAT',
      'YES',
      'NO',
      'BUTTON_CLOSE_TO_ICON',
      'BUTTON_EDIT_PROFILE',
      'DOWNLOAD_TRANSCRIPT',
      'RATE_CHAT',
      'WELLCOME_TITLE',
      'WELLCOME_MSG',
      'OPTIONS',
      'SOUND_ON',
      'SOUND_OFF',
      'LOGOUT',
      'CUSTOMER_SATISFACTION',
      'YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE',
      'YOUR_RATING',
      'WRITE_YOUR_OPINION',
      'SUBMIT',
      'THANK_YOU_FOR_YOUR_EVALUATION',
      'YOUR_RATING_HAS_BEEN_RECEIVED',
      'CLOSE',
      'PREV_CONVERSATIONS',
      'YOU',
      'SHOW_ALL_CONV',
      'START_A_CONVERSATION',
      'NO_CONVERSATION',
      'SEE_PREVIOUS',
      'WAITING_TIME_FOUND',
      'WAITING_TIME_NOT_FOUND',
      'CLOSED'
    ];


    this._translate.get(labels).subscribe(res => {
      // console.log('»»»» initI18n »»»»»» »»»»»» GET TRANSLATED LABELS RES ', res);
      globals.LABEL_PLACEHOLDER = res['LABEL_PLACEHOLDER']
      globals.LABEL_START_NW_CONV = res['LABEL_START_NW_CONV'];
      globals.LABEL_FIRST_MSG = res['LABEL_FIRST_MSG'];
      globals.LABEL_FIRST_MSG_NO_AGENTS = res['LABEL_FIRST_MSG_NO_AGENTS'];
      globals.LABEL_SELECT_TOPIC = res['LABEL_SELECT_TOPIC'];
      globals.LABEL_COMPLETE_FORM = res['LABEL_COMPLETE_FORM'];
      globals.LABEL_FIELD_NAME = res['LABEL_FIELD_NAME'];
      globals.LABEL_ERROR_FIELD_NAME = res['LABEL_ERROR_FIELD_NAME'];
      globals.LABEL_FIELD_EMAIL = res['LABEL_FIELD_EMAIL'];
      globals.LABEL_ERROR_FIELD_EMAIL = res['LABEL_ERROR_FIELD_EMAIL'];
      globals.LABEL_WRITING = res['LABEL_WRITING'];
      globals.AGENT_NOT_AVAILABLE = res['AGENT_NOT_AVAILABLE']; // is used ??
      globals.AGENT_AVAILABLE = res['AGENT_AVAILABLE'];
      globals.GUEST_LABEL = res['GUEST_LABEL'];
      globals.ALL_AGENTS_OFFLINE_LABEL = res['ALL_AGENTS_OFFLINE_LABEL'];
      globals.CALLOUT_TITLE_PLACEHOLDER = res['CALLOUT_TITLE_PLACEHOLDER'];
      globals.CALLOUT_MSG_PLACEHOLDER = res['CALLOUT_MSG_PLACEHOLDER'];
      globals.ALERT_LEAVE_CHAT = res['ALERT_LEAVE_CHAT'];  // is used ??
      globals.YES = res['YES']; // is used ??
      globals.NO = res['NO']; // is used ??
      globals.BUTTON_CLOSE_TO_ICON = res['BUTTON_CLOSE_TO_ICON'];
      globals.BUTTON_EDIT_PROFILE = res['BUTTON_EDIT_PROFILE']; // is used ??
      globals.DOWNLOAD_TRANSCRIPT = res['DOWNLOAD_TRANSCRIPT'];
      globals.RATE_CHAT = res['RATE_CHAT']; // is used ??
      globals.WELLCOME_TITLE = res['WELLCOME_TITLE'];
      globals.WELLCOME_MSG = res['WELLCOME_MSG'];
      globals.OPTIONS = res['OPTIONS'];
      globals.SOUND_ON = res['SOUND_ON'];
      globals.SOUND_OFF = res['SOUND_OFF'];
      globals.LOGOUT = res['LOGOUT'];
      globals.CUSTOMER_SATISFACTION = res['CUSTOMER_SATISFACTION'];
      globals.YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE = res['YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE'];
      globals.YOUR_RATING = res['YOUR_RATING']; // is used ??
      globals.WRITE_YOUR_OPINION = res['WRITE_YOUR_OPINION'];
      globals.SUBMIT = res['SUBMIT']; // se nn si carica la traduzione nn viene visualizzato il testo e si riname bloccati
      globals.THANK_YOU_FOR_YOUR_EVALUATION = res['THANK_YOU_FOR_YOUR_EVALUATION'];
      globals.YOUR_RATING_HAS_BEEN_RECEIVED = res['YOUR_RATING_HAS_BEEN_RECEIVED'];
      globals.CLOSE = res['CLOSE']; // se nn si carica la traduzione nn viene visualizzato il testo e si riname bloccati
      globals.PREV_CONVERSATIONS = res['PREV_CONVERSATIONS'];
      globals.YOU = res['YOU'];
      globals.SHOW_ALL_CONV = res['SHOW_ALL_CONV'];
      globals.START_A_CONVERSATION = res['START_A_CONVERSATION']; // is used ??
      globals.NO_CONVERSATION = res['NO_CONVERSATION'];
      globals.SEE_PREVIOUS = res['SEE_PREVIOUS']; // is used ??
      globals.WAITING_TIME_FOUND = res['WAITING_TIME_FOUND'];
      globals.WAITING_TIME_NOT_FOUND = res['WAITING_TIME_NOT_FOUND'];
      globals.CLOSED = res['CLOSED'];

      if (!globals.welcomeTitle) {
        globals.welcomeTitle = globals.WELLCOME_TITLE;   /** Set the widget welcome message. Value type : string */
      }
      if (!globals.welcomeMsg) {
        globals.welcomeMsg = globals.WELLCOME_MSG;       /** Set the widget welcome message. Value type : string */
      }

    }, (error) => {
      console.log('»»»»»» »»»»»» GET TRANSLATED LABELS - ERROR ', error);

    }, () => {
      // console.log('»»»»»» »»»»»» GET TRANSLATED LABELS * COMPLETE *');
    });



    // globals.setParameter('lang', this.language);

    // translate

    // console.log('»»»»» globals', globals)
    // globals.LABEL_PLACEHOLDER = this.translateForKey('LABEL_PLACEHOLDER') // done
    // globals.LABEL_START_NW_CONV = this.translateForKey('LABEL_START_NW_CONV'); // done
    // globals.LABEL_FIRST_MSG = this.translateForKey('LABEL_FIRST_MSG'); // done
    // globals.LABEL_FIRST_MSG_NO_AGENTS = this.translateForKey('LABEL_FIRST_MSG_NO_AGENTS'); // done
    // globals.LABEL_SELECT_TOPIC = this.translateForKey('LABEL_SELECT_TOPIC'); // done
    // globals.LABEL_COMPLETE_FORM = this.translateForKey('LABEL_COMPLETE_FORM'); // done
    // globals.LABEL_FIELD_NAME = this.translateForKey('LABEL_FIELD_NAME'); // done
    // globals.LABEL_ERROR_FIELD_NAME = this.translateForKey('LABEL_ERROR_FIELD_NAME'); // done
    // globals.LABEL_FIELD_EMAIL = this.translateForKey('LABEL_FIELD_EMAIL'); // done
    // globals.LABEL_ERROR_FIELD_EMAIL = this.translateForKey('LABEL_ERROR_FIELD_EMAIL'); // done
    // globals.LABEL_WRITING = this.translateForKey('LABEL_WRITING'); // done
    // globals.AGENT_NOT_AVAILABLE = this.translateForKey('AGENT_NOT_AVAILABLE'); // done
    // globals.AGENT_AVAILABLE = this.translateForKey('AGENT_AVAILABLE'); // done
    // globals.GUEST_LABEL = this.translateForKey('GUEST_LABEL'); // done
    // globals.ALL_AGENTS_OFFLINE_LABEL = this.translateForKey('ALL_AGENTS_OFFLINE_LABEL'); // done
    // globals.CALLOUT_TITLE_PLACEHOLDER = this.translateForKey('CALLOUT_TITLE_PLACEHOLDER'); // done
    // globals.CALLOUT_MSG_PLACEHOLDER = this.translateForKey('CALLOUT_MSG_PLACEHOLDER');  // done
    // globals.ALERT_LEAVE_CHAT = this.translateForKey('ALERT_LEAVE_CHAT'); // done
    // globals.YES = this.translateForKey('YES');  // done
    // globals.NO = this.translateForKey('NO'); // done
    // globals.BUTTON_CLOSE_TO_ICON = this.translateForKey('BUTTON_CLOSE_TO_ICON');  // done
    // globals.BUTTON_EDIT_PROFILE = this.translateForKey('BUTTON_EDIT_PROFILE');   // done
    // globals.DOWNLOAD_TRANSCRIPT = this.translateForKey('DOWNLOAD_TRANSCRIPT'); // done
    // globals.RATE_CHAT = this.translateForKey('RATE_CHAT'); // done
    // globals.WELLCOME_TITLE = this.translateForKey('WELLCOME_TITLE');  // done
    // globals.WELLCOME_MSG = this.translateForKey('WELLCOME_MSG'); // done
    // globals.WELLCOME = this.translateForKey('WELLCOME'); // done
    // globals.OPTIONS = this.translateForKey('OPTIONS'); // done
    // globals.SOUND_ON = this.translateForKey('SOUND_ON'); // done
    // globals.SOUND_OFF = this.translateForKey('SOUND_OFF'); // done
    // globals.LOGOUT = this.translateForKey('LOGOUT'); // done
    // globals.CUSTOMER_SATISFACTION = this.translateForKey('CUSTOMER_SATISFACTION'); // done
    // globals.YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE = this.translateForKey('YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE'); // done
    // globals.DOWNLOAD_TRANSCRIPT = this.translateForKey('DOWNLOAD_TRANSCRIPT'); // done
    // globals.YOUR_RATING = this.translateForKey('YOUR_RATING'); // done
    // globals.WRITE_YOUR_OPINION = this.translateForKey('WRITE_YOUR_OPINION'); // done
    // globals.SUBMIT = this.translateForKey('SUBMIT'); // done
    // globals.THANK_YOU_FOR_YOUR_EVALUATION = this.translateForKey('THANK_YOU_FOR_YOUR_EVALUATION'); // done
    // globals.YOUR_RATING_HAS_BEEN_RECEIVED = this.translateForKey('YOUR_RATING_HAS_BEEN_RECEIVED'); // done
    // globals.CLOSE = this.translateForKey('CLOSE'); // done
    // globals.PREV_CONVERSATIONS = this.translateForKey('PREV_CONVERSATIONS'); // done
    // globals.YOU = this.translateForKey('YOU'); // done
    // globals.SHOW_ALL_CONV = this.translateForKey('SHOW_ALL_CONV'); // done
    // globals.START_A_CONVERSATION = this.translateForKey('START_A_CONVERSATION'); // done
    // globals.NO_CONVERSATION = this.translateForKey('NO_CONVERSATION'); // done
    // globals.SEE_PREVIOUS = this.translateForKey('SEE_PREVIOUS'); // done
    // globals.WAITING_TIME_FOUND = this.translateForKey('WAITING_TIME_FOUND'); // done
    // globals.WAITING_TIME_NOT_FOUND = this.translateForKey('WAITING_TIME_NOT_FOUND'); // done
    // globals.CLOSED = this.translateForKey('CLOSED');

    // if (!globals.wellcomeTitle) {
    //   globals.wellcomeTitle = globals.WELLCOME_TITLE;   /** Set the widget welcome message. Value type : string */
    // }
    // if (!globals.wellcomeMsg) {
    //   globals.wellcomeMsg = globals.WELLCOME_MSG;       /** Set the widget welcome message. Value type : string */
    // }


  }


  /**
  * Return the browser language if it is detected, an epty string otherwise
  * @returns the browser language
  */
  // public getBrowserLanguage(windowContext) {
  //   // console.log('windowContext', windowContext);
  //   const browserLanguage = windowContext.navigator.language;
  //   return !browserLanguage ? undefined : browserLanguage;
  // }

  /**
   * Set the language in which to translate.
   * If it is provided a not valid language it will use the default language (en)
   * @param language the language
   */
  // public setLanguage(windowContext, language) {
  //   // console.log('windowContext-language', windowContext, language);
  //   // set the user languge if it is valid.
  //   // if the user language is not valid, try to get the browser language.
  //   // if the browser language is not valid, it use the default language (en)
  //   if (!language) {
  //     // user language not valid
  //     if (this.getBrowserLanguage(windowContext) !== undefined) {
  //       // browser language valid
  //       this.language = this.getBrowserLanguage(windowContext);
  //     } else {
  //       // browser language not valid
  //       this.language = this.defaultLanguage;
  //     }
  //   } else {
  //     // user language valid
  //     this.language = language;
  //   }
  //   this.language = this.language.substring(0, 2);
  //   // retrieve the translation
  //   // console.log('LINGUA IMPOSTATA: ', this.language);
  //   this.getLanguageObject(this.language);
  // }

  // retrieve the language object
  // private getLanguageObject(language) {
  //   if (language === 'en') {
  //     this.translations = translations.en;
  //   } else if (language === 'it') {
  //     this.translations = translations.it;
  //   } else {
  //     // use the default language in any other case
  //     this.translations = translations.en;
  //   }
  // }

  /**
   * Translate a keyword to the language set with the method setLanguage(language)
   * @param keyword the keyword to translate
   * @returns the keyword translations
   */
  // public translateForKey(keyword: string): string {
  //   // console.log('this.translations -> keyword: ', this.translations[keyword]);
  //   return !this.translations[keyword] ? '' : this.translations[keyword];
  // }



  // public getDefaultLanguage() {
  //   return this.defaultLanguage;
  // }
}
