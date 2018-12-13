import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../environments/environment';
import { TranslatorService } from '../providers/translator.service';
import { CURR_VER_DEV, CURR_VER_PROD } from '../../../current_version';
import { DepartmentModel } from '../../models/department';
import { User } from '../../models/User';
import { convertColorToRGBA, getParameterByName } from '../utils/utils';

import { CHANNEL_TYPE_GROUP } from '../utils/constants';
import { TemplateBindingParseResult } from '@angular/compiler';

@Injectable()
export class Globals {


  // ========= begin:: sottoscrizioni ======= //
  // subscriptions: Subscription[] = []; /** */
  // ========= end:: sottoscrizioni ======= //

  // ============ BEGIN: SET FUNCTION BY UTILS ==============//
  getParameterByName = getParameterByName;

  // ============ BEGIN: SET INTERNAL PARAMETERS ==============//
  senderId;
  tenant;
  channelType;
  default_settings;
  isMobile;
  isLogged;
  isSoundActive;
  isLogoutEnabled;
  BUILD_VERSION;
  filterSystemMsg = true; /** se è true i messaggi inviati da system non vengono visualizzati */
  baseLocation: string;
  availableAgents: Array<User> = [];

  attributes: any;
  token: string;
  lang: string;
  conversationsBadge: number;
  activeConversation: string;
  isOpenStartRating: boolean;
  departments: DepartmentModel[];
  departmentSelected: DepartmentModel;
  departmentDefault: DepartmentModel;
  isOpenMenuOptions: boolean;
  isOpenPrechatForm: boolean;

  areAgentsAvailable = false;
  areAgentsAvailableText: string;
  availableAgentsStatus = false; // indica quando è impostato lo stato degli agenti nel subscribe
  signInWithCustomToken: boolean;
  displayEyeCatcherCard: string;

  // ============ BEGIN: LABELS ==============//
  LABEL_PLACEHOLDER: string;
  LABEL_START_NW_CONV: string;
  LABEL_FIRST_MSG: string;
  LABEL_FIRST_MSG_NO_AGENTS: string;
  LABEL_SELECT_TOPIC: string;
  LABEL_COMPLETE_FORM: string;
  LABEL_FIELD_NAME: string;
  LABEL_ERROR_FIELD_NAME: string;
  LABEL_FIELD_EMAIL: string;
  LABEL_ERROR_FIELD_EMAIL: string;
  LABEL_WRITING: string;
  AGENT_NOT_AVAILABLE: string;
  AGENT_AVAILABLE: string;
  GUEST_LABEL: string;
  ALL_AGENTS_OFFLINE_LABEL: string;
  CALLOUT_TITLE_PLACEHOLDER: string;
  CALLOUT_MSG_PLACEHOLDER: string;
  ALERT_LEAVE_CHAT: string;
  YES: string;
  NO: string;
  BUTTON_CLOSE_TO_ICON: string;
  BUTTON_EDIT_PROFILE: string;
  BUTTON_DOWNLOAD_TRANSCRIPT: string;
  RATE_CHAT: string;
  WELLCOME_TITLE: string;
  WELLCOME_MSG: string;
  WELLCOME: string;
  OPTIONS: string;
  SOUND_ON: string;
  SOUND_OFF: string;
  LOGOUT: string;
  CUSTOMER_SATISFACTION: string;
  YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE: string;
  DOWNLOAD_TRANSCRIPT: string;
  YOUR_RATING: string;
  WRITE_YOUR_OPINION: string;
  SUBMIT: string;
  THANK_YOU_FOR_YOUR_EVALUATION: string;
  YOUR_RATING_HAS_BEEN_RECEIVED: string;
  CLOSE: string;
  PREV_CONVERSATIONS: string;
  YOU: string;
  SHOW_ALL_CONV: string;
  START_A_CONVERSATION: string;
  NO_CONVERSATION: string;
  SEE_PREVIOUS: string;




  // ============ BEGIN: EXTERNAL PARAMETERS ==============//
  autoStart;
  isShown;
  isOpen;
  startFromHome;
  projectid;
  preChatForm;
  align;
  calloutTimer;
  calloutTitle;
  calloutMsg;
  userFullname;
  userEmail;
  widgetTitle;
  fullscreenMode;
  hideHeaderCloseButton;
  themeColor;
  themeForegroundColor;
  showWidgetNameInConversation;
  allowTranscriptDownload;
  poweredBy;
  logoChat;
  wellcomeTitle;
  wellcomeMsg;
  recipientId;
  userId;
  userPassword;
  userToken;
  marginX;
  marginY;
  isLogEnabled;
  filterByRequester;


  constructor(
    private translatorService: TranslatorService
  ) {
  }


  initialize(el) {
     this.wdLog([' ---------------- START INIZIALIZE  ---------------- ']);
    // ============ BEGIN: SET INTERNAL PARAMETERS ==============//
    // for retrocompatibility 0.9 (without tiledesk.js)
     this.wdLog([' ---------------- 1: baseLocation ---------------- ']);
    this.baseLocation = 'https://widget.tiledesk.com/v2';
    if (window['tiledesk']) {
      this.baseLocation = window['tiledesk'].getBaseLocation();
    }

     this.wdLog([' ---------------- 2: set lang ---------------- ']);
    // this.lang = 'en';
    // if the lang is passed as parameter use it, otherwise use a default language ("en")
    this.translatorService.setLanguage(!this.lang ? 'en' : this.lang);

     this.wdLog([' ---------------- 3: translate ---------------- ']);
    this.translate();

     this.wdLog([' ---------------- 4: initParameters ---------------- ']);
    this.initParameters();

     this.wdLog([' ---------------- 5: getVariablesFromAttributeHtml ---------------- ']);
    this.getVariablesFromAttributeHtml(el);

     this.wdLog([' ---------------- 6: getVariablesFromSettings ---------------- ']);
    this.getVariablesFromSettings();

     this.wdLog([' ---------------- 7: getVariableUrlParameters ---------------- ']);
    this.getVariableUrlParameters();

     this.wdLog([' ---------------- 8: setDefaultSettings ---------------- ']);
    this.setDefaultSettings();

     this.wdLog([' ---------------- 9: setAttributes ---------------- ']);
    this.attributes = this.setAttributes();

  }

  /**
   * 3: translate
   */
  translate() {
    this.LABEL_PLACEHOLDER = this.translatorService.translate('LABEL_PLACEHOLDER');
    this.LABEL_START_NW_CONV = this.translatorService.translate('LABEL_START_NW_CONV');
    this.LABEL_FIRST_MSG = this.translatorService.translate('LABEL_FIRST_MSG');
    this.LABEL_FIRST_MSG_NO_AGENTS = this.translatorService.translate('LABEL_FIRST_MSG_NO_AGENTS');
    this.LABEL_SELECT_TOPIC = this.translatorService.translate('LABEL_SELECT_TOPIC');
    this.LABEL_COMPLETE_FORM = this.translatorService.translate('LABEL_COMPLETE_FORM');
    this.LABEL_FIELD_NAME = this.translatorService.translate('LABEL_FIELD_NAME');
    this.LABEL_ERROR_FIELD_NAME = this.translatorService.translate('LABEL_ERROR_FIELD_NAME');
    this.LABEL_FIELD_EMAIL = this.translatorService.translate('LABEL_FIELD_EMAIL');
    this.LABEL_ERROR_FIELD_EMAIL = this.translatorService.translate('LABEL_ERROR_FIELD_EMAIL');
    this.LABEL_WRITING = this.translatorService.translate('LABEL_WRITING');
    this.AGENT_NOT_AVAILABLE = this.translatorService.translate('AGENT_NOT_AVAILABLE');
    this.AGENT_AVAILABLE = this.translatorService.translate('AGENT_AVAILABLE');
    this.GUEST_LABEL = this.translatorService.translate('GUEST_LABEL');
    this.ALL_AGENTS_OFFLINE_LABEL = this.translatorService.translate('ALL_AGENTS_OFFLINE_LABEL');
    this.CALLOUT_TITLE_PLACEHOLDER = this.translatorService.translate('CALLOUT_TITLE_PLACEHOLDER');
    this.CALLOUT_MSG_PLACEHOLDER = this.translatorService.translate('CALLOUT_MSG_PLACEHOLDER');
    this.ALERT_LEAVE_CHAT = this.translatorService.translate('ALERT_LEAVE_CHAT');
    this.YES = this.translatorService.translate('YES');
    this.NO = this.translatorService.translate('NO');
    this.BUTTON_CLOSE_TO_ICON = this.translatorService.translate('BUTTON_CLOSE_TO_ICON');
    this.BUTTON_EDIT_PROFILE = this.translatorService.translate('BUTTON_EDIT_PROFILE');
    this.BUTTON_DOWNLOAD_TRANSCRIPT = this.translatorService.translate('BUTTON_DOWNLOAD_TRANSCRIPT');
    this.RATE_CHAT = this.translatorService.translate('RATE_CHAT');
    this.WELLCOME_TITLE = this.translatorService.translate('WELLCOME_TITLE');
    this.WELLCOME_MSG = this.translatorService.translate('WELLCOME_MSG');
    this.WELLCOME = this.translatorService.translate('WELLCOME');
    this.OPTIONS = this.translatorService.translate('OPTIONS');
    this.SOUND_ON = this.translatorService.translate('SOUND_ON');
    this.SOUND_OFF = this.translatorService.translate('SOUND_OFF');
    this.LOGOUT = this.translatorService.translate('LOGOUT');

    this.CUSTOMER_SATISFACTION = this.translatorService.translate('CUSTOMER_SATISFACTION');
    this.YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE = this.translatorService.translate('YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE');
    this.DOWNLOAD_TRANSCRIPT = this.translatorService.translate('DOWNLOAD_TRANSCRIPT');
    this.YOUR_RATING = this.translatorService.translate('YOUR_RATING');
    this.WRITE_YOUR_OPINION = this.translatorService.translate('WRITE_YOUR_OPINION');
    this.SUBMIT = this.translatorService.translate('SUBMIT');

    this.THANK_YOU_FOR_YOUR_EVALUATION = this.translatorService.translate('THANK_YOU_FOR_YOUR_EVALUATION');
    this.YOUR_RATING_HAS_BEEN_RECEIVED = this.translatorService.translate('YOUR_RATING_HAS_BEEN_RECEIVED');
    this.CLOSE = this.translatorService.translate('CLOSE');
    this.PREV_CONVERSATIONS = this.translatorService.translate('PREV_CONVERSATIONS');
    this.YOU = this.translatorService.translate('YOU');
    this.SHOW_ALL_CONV = this.translatorService.translate('SHOW_ALL_CONV');
    this.START_A_CONVERSATION = this.translatorService.translate('START_A_CONVERSATION');
    this.NO_CONVERSATION = this.translatorService.translate('NO_CONVERSATION');
    this.SEE_PREVIOUS = this.translatorService.translate('SEE_PREVIOUS');
  }

  /**
   * 4: initParameters
   */
  initParameters() {
    // ============ BEGIN: SET EXTERNAL PARAMETERS ==============//
    this.autoStart = true;                              /** start Authentication and startUI */
    this.isShown = true;                                /** show/hide all widget -> js call: showAllWidget */
    this.isOpen = false;                                /** show/hide window widget -> js call: hideAllWidget */
    this.startFromHome = true;                          /** start from Home or Conversation */

    this.isOpenPrechatForm = false;                     /** check open/close modal prechatform if g.preChatForm is true  */

    this.isOpenStartRating = false;                     /** show/hide all rating chat */
    // tslint:disable-next-line:max-line-length
    this.projectid = '';                                /** The TileDesk project id. Find your TileDesk ProjectID in the TileDesk Dashboard under the Widget menu. */

    // tslint:disable-next-line:max-line-length
    this.preChatForm = false;                           /** You can require customers to enter information like name and email before sending a chat message by enabling the Pre-Chat form. Permitted values: true, false. The default value is false. */

    // tslint:disable-next-line:max-line-length
    this.align = 'right';                               /** if it is true, the chat window is automatically open when the widget is loaded. Permitted values: true, false. Default value : false */

    // tslint:disable-next-line:max-line-length
    this.calloutTimer = -1;                             /** Proactively open the chat windows to increase the customer engagement. Permitted values: -1 (Disabled), 0 (Immediatly) or a positive integer value. For exmaple: 5 (After 5 seconds), 10 (After 10 seconds). */

    this.calloutTitle = '';                             /** title box callout */
    this.calloutMsg = '';                               /** message box callout */

    // tslint:disable-next-line:max-line-length
    this.userFullname = '';                     /** userFullname: Current user fullname. Set this parameter to specify the visitor fullname. */
    this.userEmail = '';                        /** Current user email address. Set this parameter to specify the visitor email address.  */

    // tslint:disable-next-line:max-line-length
    this.widgetTitle = 'TileDesk';              /** Set the widget title label shown in the widget header. Value type : string. The default value is Tiledesk. */

    // tslint:disable-next-line:max-line-length
    this.hideHeaderCloseButton = false;         /** Hide the close button in the widget header. Permitted values: true, false. The default value is false. */

    // tslint:disable-next-line:max-line-length
    this.fullscreenMode = false;                /** if it is true, the chat window is open in fullscreen mode. Permitted values: true, false. Default value : false */

    // tslint:disable-next-line:max-line-length
    this.themeColor = convertColorToRGBA('#2a6ac1', 100);               /** allows you to change the main widget's color (color of the header, color of the launcher button, other minor elements). Permitted values: Hex color codes, e.g. #87BC65 and RGB color codes, e.g. rgb(135,188,101) */

    // tslint:disable-next-line:max-line-length
    this.themeForegroundColor = convertColorToRGBA('#ffffff', 100);    /** allows you to change text and icons' color. Permitted values: Hex color codes, e.g. #425635 and RGB color codes, e.g. rgb(66,86,53) */

    // tslint:disable-next-line:max-line-length
    this.showWidgetNameInConversation = false;  /** If you want to display the widget title in the conversations, set the showWidgetNameInConversation field to true. It is advisable if you need to manage multiple projects. Value type : boolean. The default value is false. */
    // tslint:disable-next-line:max-line-length
    this.allowTranscriptDownload = false;       /** allows the user to download the chat transcript. The download button appears when the chat is closed by the operator. Permitter values: true, false. Default value: false */

    // tslint:disable-next-line:max-line-length
    this.poweredBy = '<a target="_blank" href="http://www.tiledesk.com/">Powered by <b>TileDesk</b></a>'; // da aggiungere!!!! /** link nel footer widget */

    this.logoChat = this.baseLocation + '/assets/images/tiledesk_logo_white_small.png'; /** url img logo */
    this.wellcomeTitle = this.WELLCOME_TITLE;   /** Set the widget welcome message. Value type : string */
    this.wellcomeMsg = this.WELLCOME_MSG;       /** Set the widget welcome message. Value type : string */

    this.marginX = '20px';                      /** set margin left or rigth widget  */
    this.marginY = '20px';                      /** set margin bottom widget */
    this.isLogEnabled = false;
    this.filterByRequester = false;             /** show conversations with conversation.attributes.requester_id == user.uid */
    // ============ END: SET EXTERNAL PARAMETERS ==============//


    // ============ BEGIN: SET INTERNAL PARAMETERS ==============//
    this.tenant = environment.tenant;           /** name tenant ex: tilechat */
    this.channelType = CHANNEL_TYPE_GROUP;      /** channelType: group/direct  */
    this.default_settings = {};                 /** settings for pass variables to js */
    this.isMobile = false;                      /** detect is mobile : detectIfIsMobile() */
    this.isLogged = false;                      /** detect is logged */
    this.isLogoutEnabled = true;                /** enable/disable button logout in menu options */
    this.BUILD_VERSION = 'v.' + CURR_VER_PROD + ' b.' + CURR_VER_DEV; // 'b.0.5';
    this.filterSystemMsg = true; /** ???? scolpito in MessagingService. se è true i messaggi inviati da system non vengono visualizzati */
    this.isSoundActive = true;
    // tslint:disable-next-line:max-line-length
    if (localStorage.getItem('isSoundActive')) {
      this.isSoundActive = localStorage.getItem('isSoundActive');
    }
    this.conversationsBadge = 0;
    this.activeConversation = '';
    this.isOpenMenuOptions = false;             /** open/close menu options  */
    this.signInWithCustomToken = false;
    this.displayEyeCatcherCard = 'none';
    // ============ END: SET INTERNAL PARAMETERS ==============//

  }


  /**
   * 5: getVariablesFromAttributeHtml
   *
   */
  getVariablesFromAttributeHtml(el) {
    // https://stackoverflow.com/questions/45732346/externally-pass-values-to-an-angular-application
    let TEMP;
    TEMP = el.nativeElement.getAttribute('tenant');
     this.wdLog([' TEMP: tenant ', TEMP]);
    if (TEMP !== null) {
      this.tenant = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('recipientId');
    if (TEMP !== null) {
      this.recipientId = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('projectid');
    if (TEMP !== null) {
      this.projectid = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('widgetTitle');
    if (TEMP !== null) {
      this.widgetTitle = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('poweredBy');
    if (TEMP !== null) {
      this.poweredBy = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('userId');
    if (TEMP !== null) {
      this.userId = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('userEmail');
    if (TEMP !== null) {
      this.userEmail = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('userPassword');
    if (TEMP !== null) {
      this.userPassword = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('userFullname');
    if (TEMP !== null) {
      this.userFullname = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('preChatForm');
    if (TEMP !== null) {
      this.preChatForm = (TEMP === true) ? true : false;
    }
    TEMP = el.nativeElement.getAttribute('isOpen');
    if (TEMP !== null) {
      this.isOpen = (TEMP === true) ? true : false;
    }
    TEMP = el.nativeElement.getAttribute('channelType');
    if (TEMP !== null) {
      this.channelType = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('lang');
    if (TEMP !== null) {
      this.lang = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('align');
    if (TEMP !== null) {
      this.align = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('marginX');
    if (TEMP !== null) {
      this.marginX = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('marginY');
    if (TEMP !== null) {
      this.marginY = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('calloutTimer');
    if (TEMP !== null) {
      this.calloutTimer = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('wellcomeMsg');
    if (TEMP !== null) {
      this.wellcomeMsg = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('calloutTitle');
    if (TEMP !== null) {
      this.calloutTitle = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('calloutMsg');
    if (TEMP !== null) {
      this.calloutMsg = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('startFromHome');
    if (TEMP !== null) {
      this.startFromHome = (TEMP === true) ? true : false;
    }
    TEMP = el.nativeElement.getAttribute('logoChat');
    if (TEMP !== null) {
      this.logoChat = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('wellcomeTitle');
    if (TEMP !== null) {
      this.wellcomeTitle = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('autoStart');
    if (TEMP !== null) {
      this.autoStart = (TEMP === true) ? true : false;
    }
    TEMP = el.nativeElement.getAttribute('isShown');
    if (TEMP !== null) {
      this.isShown = (TEMP === true) ? true : false;
    }

    TEMP = el.nativeElement.getAttribute('isLogoutEnabled');
    if (TEMP !== null) {
      this.isLogoutEnabled = (TEMP === true) ? true : false;
    }
    TEMP = el.nativeElement.getAttribute('isLogEnabled');
    if (TEMP !== null) {
      this.isLogEnabled = (TEMP === true) ? true : false;
    }
    TEMP = el.nativeElement.getAttribute('filterByRequester');
    if (TEMP !== null) {
      this.filterByRequester = (TEMP === true) ? true : false;
    }

  }

  /**
   * 6: getVariablesFromSettings
  */
  getVariablesFromSettings() {
    // https://stackoverflow.com/questions/45732346/externally-pass-values-to-an-angular-application
    if (!window['tiledesk']) {
      return 0;
    }
    let TEMP;
    TEMP = window['tiledeskSettings']['tenant'];

    if (TEMP !== undefined) {
      this.tenant = TEMP;
    }
    TEMP = window['tiledeskSettings']['recipientId'];
    if (TEMP !== undefined) {
      this.recipientId = TEMP;
    }
    TEMP = window['tiledeskSettings']['projectid'];
    if (TEMP !== undefined) {
      this.projectid = TEMP;
    }
    TEMP = window['tiledeskSettings']['widgetTitle'];
    if (TEMP !== undefined) {
      this.widgetTitle = TEMP;
    }
    TEMP = window['tiledeskSettings']['poweredBy'];
    if (TEMP !== undefined) {
      this.poweredBy = TEMP;
    }
    TEMP = window['tiledeskSettings']['userId'];
    if (TEMP !== undefined) {
      this.userId = TEMP;
    }
    TEMP = window['tiledeskSettings']['userEmail'];
    if (TEMP !== undefined) {
      this.userEmail = TEMP;
    }
    TEMP = window['tiledeskSettings']['userPassword'];
    if (TEMP !== undefined) {
      this.userPassword = TEMP;
    }
    TEMP = window['tiledeskSettings']['userFullname'];
    if (TEMP !== undefined) {
      this.userFullname = TEMP;
    }
    TEMP = window['tiledeskSettings']['preChatForm'];
    if (TEMP !== undefined) {
      this.preChatForm = (TEMP === false) ? false : true;
    }
    TEMP = window['tiledeskSettings']['isOpen'];
    if (TEMP !== undefined) {
      this.isOpen = (TEMP === false) ? false : true;
    }
    TEMP = window['tiledeskSettings']['channelType'];
    if (TEMP !== undefined) {
      this.channelType = TEMP;
    }
    TEMP = window['tiledeskSettings']['lang'];
    if (TemplateBindingParseResult) {
      this.lang = TEMP;
    }
    TEMP = window['tiledeskSettings']['align'];
    if (TEMP !== undefined) {
      this.align = TEMP;
    }
    TEMP = window['tiledeskSettings']['marginX'];
    if (TEMP !== undefined) {
      this.marginX = TEMP;
    }
    TEMP = window['tiledeskSettings']['marginY'];
    if (TEMP !== undefined) {
      this.marginY = TEMP;
    }
    TEMP = window['tiledeskSettings']['calloutTimer'];
    if (TEMP !== undefined) {
      this.calloutTimer = TEMP;
    }
    TEMP = window['tiledeskSettings']['wellcomeMsg'];
    if (TEMP !== undefined) {
      this.wellcomeMsg = TEMP;
    }
    TEMP = window['tiledeskSettings']['calloutTitle'];
    if (TEMP !== undefined) {
      this.calloutTitle = TEMP;
    }
    TEMP = window['tiledeskSettings']['calloutMsg'];
    if (TEMP !== undefined) {
      this.calloutMsg = TEMP;
    }
    TEMP = window['tiledeskSettings']['fullscreenMode'];
    if (TEMP !== undefined) {
      this.fullscreenMode = TEMP;
    }
    TEMP = window['tiledeskSettings']['hideHeaderCloseButton'];
    if (TEMP !== undefined) {
      this.hideHeaderCloseButton = TEMP;
    }
    TEMP = window['tiledeskSettings']['themeColor'];
    if (TEMP !== undefined) {
      this.themeColor = convertColorToRGBA(TEMP, 100);
    }
    TEMP = window['tiledeskSettings']['themeForegroundColor'];
    if (TEMP !== undefined) {
      this.themeForegroundColor = convertColorToRGBA(TEMP, 100);
    }
    TEMP = window['tiledeskSettings']['allowTranscriptDownload'];
    if (TEMP !== undefined) {
      this.allowTranscriptDownload = TEMP;
    }
    TEMP = window['tiledeskSettings']['userToken'];
    if (TEMP !== undefined) {
      this.userToken = TEMP;
    }
    TEMP = window['tiledeskSettings']['startFromHome'];
    if (TEMP !== undefined) {
      this.startFromHome = (TEMP === false) ? false : true;
    }
    TEMP = window['tiledeskSettings']['logoChat'];
    if (TEMP !== undefined) {
      this.logoChat = TEMP;
    }
    TEMP = window['tiledeskSettings']['wellcomeTitle'];
    if (TEMP !== undefined) {
      this.wellcomeTitle = TEMP;
    }
    TEMP = window['tiledeskSettings']['wellcomeMsg'];
    if (TEMP !== undefined) {
      this.wellcomeMsg = TEMP;
    }
    TEMP = window['tiledeskSettings']['autoStart'];
     this.wdLog([' autoStart::: ', TEMP]);
    if (TEMP !== undefined) {
      this.autoStart = (TEMP === false) ? false : true;
    }
    TEMP = window['tiledeskSettings']['isShown'];
    if (TEMP !== undefined) {
      this.isShown = (TEMP === false) ? false : true;
    }
    TEMP = window['tiledeskSettings']['isLogoutEnabled'];
    if (TEMP !== undefined) {
      this.isLogoutEnabled = (TEMP === false) ? false : true;
    }
    TEMP = window['tiledeskSettings']['isLogEnabled'];
    if (TEMP !== undefined) {
      this.isLogEnabled = (TEMP === false) ? false : true;
    }
    TEMP = window['tiledeskSettings']['filterByRequester'];
    if (TEMP !== undefined) {
      this.filterByRequester = (TEMP === false) ? false : true;
    }

  }



  /**
   * 7: getVariableUrlParameters
   */
  getVariableUrlParameters() {
    if (this.getParameterByName('tiledesk_tenant')) {
      this.tenant = this.getParameterByName('tiledesk_tenant');
    }
    if (this.getParameterByName('tiledesk_recipientid')) {
      this.recipientId = this.getParameterByName('tiledesk_recipientid');
    }
    if (this.getParameterByName('tiledesk_projectid')) {
      this.projectid = this.getParameterByName('tiledesk_projectid');
    }
    if (this.getParameterByName('tiledesk_widgetTitle')) {
      this.widgetTitle = this.getParameterByName('tiledesk_widgetTitle');
    }
    if (this.getParameterByName('tiledesk_poweredby')) {
      this.poweredBy = this.getParameterByName('tiledesk_poweredby');
    }
    if (this.getParameterByName('tiledesk_userid')) {
      this.userId = this.getParameterByName('tiledesk_userid');
    }
    if (this.getParameterByName('tiledesk_useremail')) {
      this.userEmail = this.getParameterByName('tiledesk_useremail');
    }
    if (this.getParameterByName('tiledesk_userpassword')) {
      this.userPassword = this.getParameterByName('tiledesk_userpassword');
    }
    if (this.getParameterByName('tiledesk_userfullname')) {
      this.userFullname = this.getParameterByName('tiledesk_userfullname');
    }
    if (this.getParameterByName('tiledesk_prechatform')) {
      this.preChatForm = true;
    }
    if (this.getParameterByName('tiledesk_isopen')) {
      this.isOpen = true;
    }
    if (this.getParameterByName('tiledesk_channeltype')) {
      this.channelType = this.getParameterByName('tiledesk_channeltype');
    }
    if (this.getParameterByName('tiledesk_lang')) {
      this.lang = this.getParameterByName('tiledesk_lang');
    }
    const cotAsString = this.getParameterByName('tiledesk_callouttimer');
    if (cotAsString) {
      this.calloutTimer = Number(cotAsString);
    }
    if (this.getParameterByName('tiledesk_align')) {
      this.align = this.getParameterByName('tiledesk_align');
    }
    if (this.getParameterByName('tiledesk_marginX')) {
      this.marginX = this.getParameterByName('tiledesk_marginX');
    }
    if (this.getParameterByName('tiledesk_marginY')) {
      this.marginY = this.getParameterByName('tiledesk_marginY');
    }
    if (this.getParameterByName('tiledesk_wellcomemsg')) {
      this.wellcomeMsg = this.getParameterByName('tiledesk_wellcomemsg');
    }
    if (this.getParameterByName('tiledesk_callouttitle')) {
      this.calloutTitle = this.getParameterByName('tiledesk_callouttitle');
    }
    if (this.getParameterByName('tiledesk_calloutmsg')) {
      this.calloutMsg = this.getParameterByName('tiledesk_calloutmsg');
    }
    if (this.getParameterByName('tiledesk_fullscreenMode')) {
      this.fullscreenMode = true;
    }
    if (this.getParameterByName('tiledesk_hideHeaderCloseButton')) {
      this.hideHeaderCloseButton = (this.getParameterByName('tiledesk_hideHeaderCloseButton') === 'true');
    }
    if (this.getParameterByName('tiledesk_themecolor')) {
      const TEMP = this.getParameterByName('tiledesk_themecolor');
      this.themeColor = convertColorToRGBA(TEMP, 100);
    }
    if (this.getParameterByName('tiledesk_themeforegroundcolor')) {
      const TEMP = this.getParameterByName('tiledesk_themeforegroundcolor');
      this.themeForegroundColor = convertColorToRGBA(TEMP, 100);
    }
    if (this.getParameterByName('tiledesk_allowtranscriptdownload')) {
      this.allowTranscriptDownload = true;
    }
    if (this.getParameterByName('tiledesk_showWidgetNameInConversation')) {
      this.showWidgetNameInConversation = true;
    }
    if (this.getParameterByName('tiledesk_startFromHome')) {
      this.startFromHome = true;
    }
    if (this.getParameterByName('tiledesk_logoChat')) {
      this.logoChat = this.getParameterByName('tiledesk_logoChat');
    }
    if (this.getParameterByName('tiledesk_wellcomeTitle')) {
      this.wellcomeTitle = this.getParameterByName('tiledesk_wellcomeTitle');
    }
    if (this.getParameterByName('tiledesk_autoStart')) {
      this.wellcomeTitle = this.getParameterByName('tiledesk_autoStart');
    }
    if (this.getParameterByName('tiledesk_isShown')) {
      this.isShown = true;
    }
    if (this.getParameterByName('tiledesk_isLogoutEnabled')) {
      this.isLogoutEnabled = true;
    }
    if (this.getParameterByName('tiledesk_isLogEnabled')) {
      this.isLogEnabled = true;
    }
    if (this.getParameterByName('tiledesk_filterByRequester')) {
      this.filterByRequester = true;
    }

  }


  /**
   * 8: setDefaultSettings
   */
  setDefaultSettings() {
    this.default_settings = {
      'tenant': this.tenant, 'recipientId': this.recipientId,
      'projectid': this.projectid, 'widgetTitle': this.widgetTitle,
      'poweredBy': this.poweredBy, 'userId': this.userId,
      'userEmail': this.userEmail, 'userPassword': this.userPassword,
      'userFullname': this.userFullname, 'preChatForm': this.preChatForm,
      'isOpen': this.isOpen, 'channelType': this.channelType,
      'lang': this.lang, 'calloutTimer': this.calloutTimer,
      'align': this.align, 'showWidgetNameInConversation': this.showWidgetNameInConversation,
      'wellcomeMsg': this.wellcomeMsg, 'calloutTitle': this.calloutTitle,
      'calloutMsg': this.calloutMsg, 'fullscreenMode': this.fullscreenMode, 'hideHeaderCloseButton': this.hideHeaderCloseButton,
      'themeColor': this.themeColor, 'themeForegroundColor': this.themeForegroundColor,
      'allowTranscriptDownload': this.allowTranscriptDownload, 'userToken': this.userToken,
      'autoStart': this.autoStart, 'isShown': this.isShown,
      'startFromHome': this.startFromHome, 'logoChat': this.logoChat,
      'wellcomeTitle': this.wellcomeTitle, 'isLogoutEnabled': this.isLogoutEnabled,
      'marginX': this.marginX, 'marginY': this.marginY, 'isLogEnabled': this.isLogEnabled,
      'filterByRequester': this.filterByRequester
    };
  }


  /**
   * 9: setAttributes
   */
  private setAttributes(): any {
    const CLIENT_BROWSER = navigator.userAgent;
    let attributes: any = JSON.parse(localStorage.getItem('attributes'));
    if (!attributes || attributes === 'undefined') {
      attributes = {
        client: CLIENT_BROWSER,
        sourcePage: location.href,
        projectId: this.projectid
        // departmentId: '',
        // departmentName: '',
        // departmentId: this.departmentSelected._id,
        // departmentName: this.departmentSelected.name,
        // userEmail: this.userEmail,
        // userName: this.userFullname
      };
      if (this.userEmail) {
        attributes['userEmail'] = this.userEmail;
      }
      if (this.userFullname) {
        attributes['userFullname'] = this.userFullname;
      }
      localStorage.setItem('attributes', JSON.stringify(attributes));
    }
    return attributes;
  }

  public wdLog(message) {
    if ( this.isLogEnabled ) {
       console.log(message.toString());
    }
  }

}
