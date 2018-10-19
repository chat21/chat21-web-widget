import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { TranslatorService } from '../providers/translator.service';
// tslint:disable-next-line:max-line-length
import { CALLOUT_TIMER_DEFAULT, CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, MSG_STATUS_SENDING, MAX_WIDTH_IMAGES, UID_SUPPORT_GROUP_MESSAGES, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, TYPE_MSG_FILE, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER, BCK_COLOR_CONVERSATION_SELECTED } from '../utils/constants';

@Injectable()
export class Globals {

  CLIENT_BROWSER = navigator.userAgent;
  attributes: any;

  senderId: string;
  isOpenHome: boolean;
  BUILD_VERSION: string;
  baseLocation: string;
  isOpenPrechatForm: boolean;
  isOpenSelectionDepartment: boolean;
  isOpenConversation: boolean;
  token: string;

  // params url
  tenant: string;
  recipientId: string;
  projectid: string;
  widgetTitle: string;
  poweredBy: string;
  userId: string;
  userEmail: string;
  userPassword: string;
  userFullname: string;
  preChatForm: boolean;
  isOpen: boolean;
  channelType: string;
  lang: string;
  calloutTimer: number;
  align: string;
  hideHeaderCloseButton: boolean;
  wellcomeMsg: string;
  calloutTitle: string;
  calloutMsg: string;
  fullscreenMode: boolean;
  themeColor: string;
  themeForegroundColor: string;
  allowTranscriptDownload: boolean;
  showWidgetNameInConversation: boolean;
  userToken: string;



  // text used within the html
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



  constructor(
    private translatorService: TranslatorService
  ) {
    this.tenant = '';
    this.senderId = '';
    this.themeColor = '';
    this.themeForegroundColor = '';
    this.poweredBy = '';
  }


  initialize(el) {

    this.initParameters();
    console.log(' ---------------- B1 ---------------- ');

    this.getVariablesFromAttributeHtml(el);
    console.log(' ---------------- B2 ---------------- ');

    // this.getVariablesFromSettings();
    this.getVariablesFromSettings();
    console.log(' ---------------- B3 ---------------- ');

    // this.getVariableUrlParameters();
    this.getVariableUrlParameters();
    console.log(' ---------------- B4 ---------------- ');

     // 'chatName', this.chatName,
     console.log('tenant', this.tenant, 'recipientId', this.recipientId, 'projectid', this.projectid,
     'widgetTitle', this.widgetTitle, 'poweredBy', this.poweredBy,
     'userId', this.userId, 'userEmail', this.userEmail, 'userPassword', this.userPassword,
     'userFullname', this.userFullname, 'preChatForm', this.preChatForm, 'isOpen', this.isOpen,
     'channelType', this.channelType, 'lang', this.lang, 'calloutTimer', this.calloutTimer,
     'align ', this.align, 'hideHeaderCloseButton ', this.hideHeaderCloseButton, 'wellcomeMsg ', this.wellcomeMsg,
     'calloutTitle ', this.calloutTitle, 'calloutMsg ', this.calloutMsg, 'fullscreenMode', this.fullscreenMode,
     'themeColor', this.themeColor, 'themeForegroundColor', this.themeForegroundColor,
     'allowTranscriptDownload', this.allowTranscriptDownload);


      // if the lang is passed as parameter use it, otherwise use a default language ("en")
      this.translatorService.setLanguage(!this.lang ? 'en' : this.lang);
      console.log(' ---------------- 5 ---------------- ');

      // this.translate();
      this.translate();
      console.log(' ---------------- 6 ---------------- ');

      this.attributes = this.setAttributes();

  }




  initParameters() {
    this.tenant = environment.tenant;
    this.preChatForm = false;
    this.widgetTitle = 'TileDesk';
    this.poweredBy = '<a target="_blank" href="http://www.tiledesk.com/">Powered by <b>TileDesk</b></a>';
    this.isOpen = false;
    this.fullscreenMode = false;
    this.themeColor = '#2a6ac1';
    this.themeForegroundColor = '#ffffff';
    this.channelType = CHANNEL_TYPE_GROUP;
    this.align = 'right';
    this.calloutTimer = -1;
    this.hideHeaderCloseButton = false;
    this.wellcomeMsg = '';
    this.calloutTitle = '';
    this.calloutMsg = '';
    this.allowTranscriptDownload = false;
    this.showWidgetNameInConversation = false;
    

    // for retrocompatibility 0.9 (without tiledesk.js)
    this.baseLocation = 'https://widget.tiledesk.com';
    if (window['tiledesk']) {
        this.baseLocation = window['tiledesk'].getBaseLocation();
    }
  }


  /**
   * tenant:
   * recipientId:
   * projectid:
   * chatName:
   * poweredBy:
   * userId:
   * userEmail:
   * userPassword:
   * userFullname:
   * preChatForm:
   * align
   * callouTimer
   * hideHeaderCloseButton
  */
  getVariablesFromSettings() {
    // https://stackoverflow.com/questions/45732346/externally-pass-values-to-an-angular-application
    if (!window['tiledesk']) {
      return 0;
    }
    let TEMP;
    TEMP = window['tiledeskSettings']['tenant'];
    if (TEMP) {
      this.tenant = TEMP;
    }
    TEMP = window['tiledeskSettings']['recipientId'];
    if (TEMP) {
      this.recipientId = TEMP;
    }
    TEMP = window['tiledeskSettings']['projectid'];
    if (TEMP) {
      this.projectid = TEMP;
    }
    TEMP = window['tiledeskSettings']['widgetTitle'];
    if (TEMP) {
      this.widgetTitle = TEMP;
    }
    TEMP = window['tiledeskSettings']['poweredBy'];
    if (TEMP) {
      this.poweredBy = TEMP;
    }
    TEMP = window['tiledeskSettings']['userId'];
    if (TEMP) {
      this.userId = TEMP;
    }
    TEMP = window['tiledeskSettings']['userEmail'];
    if (TEMP) {
      this.userEmail = TEMP;
    }
    TEMP = window['tiledeskSettings']['userPassword'];
    if (TEMP) {
      this.userPassword = TEMP;
    }
    TEMP = window['tiledeskSettings']['userFullname'];
    if (TEMP) {
      this.userFullname = TEMP;
    }
    TEMP = window['tiledeskSettings']['preChatForm'];
    if (TEMP) {
      this.preChatForm = true;
    }
    TEMP = window['tiledeskSettings']['isOpen'];
    if (TEMP) {
      this.isOpen = true;
    }
    TEMP = window['tiledeskSettings']['channelType'];
    if (TEMP) {
      this.channelType = TEMP;
    }
    TEMP = window['tiledeskSettings']['lang'];
    if (TEMP) {
      this.lang = TEMP;
    }
    TEMP = window['tiledeskSettings']['align'];
    if (TEMP) {
      this.align = TEMP;
    }
    TEMP = window['tiledeskSettings']['calloutTimer'];
    if (TEMP) {
      this.calloutTimer = TEMP;
    }
    TEMP = window['tiledeskSettings']['hideHeaderCloseButton'];
    if (TEMP) {
      this.hideHeaderCloseButton = true;
    }
    TEMP = window['tiledeskSettings']['wellcomeMsg'];
    if (TEMP) {
      this.wellcomeMsg = TEMP;
    }
    TEMP = window['tiledeskSettings']['calloutTitle'];
    if (TEMP) {
      this.calloutTitle = TEMP;
    }
    TEMP = window['tiledeskSettings']['calloutMsg'];
    if (TEMP) {
      this.calloutMsg = TEMP;
    }
    TEMP = window['tiledeskSettings']['fullscreenMode'];
    if (TEMP) {
      this.fullscreenMode = TEMP;
    }
    TEMP = window['tiledeskSettings']['themeColor'];
    if (TEMP) {
      this.themeColor = TEMP;
    }
    TEMP = window['tiledeskSettings']['themeForegroundColor'];
    if (TEMP) {
      this.themeForegroundColor = TEMP;
    }
    TEMP = window['tiledeskSettings']['allowTranscriptDownload'];
    if (TEMP) {
      this.allowTranscriptDownload = TEMP;
    }

    TEMP = window['tiledeskSettings']['userToken'];
    if (TEMP) {
      this.userToken = TEMP;
    }
  }


  /**
   * tenant:
   * recipientId:
   * projectid:
   * chatName:
   * poweredBy:
   * userId:
   * userEmail:
   * userPassword:
   * userFullname:
   * preChatForm:
   * align
   * calloutTimer
   * hideHeaderCloseButton
  */
  getVariablesFromAttributeHtml(el) {
    // https://stackoverflow.com/questions/45732346/externally-pass-values-to-an-angular-application
    let TEMP;
    TEMP = el.nativeElement.getAttribute('tenant');
    if (TEMP) {
      this.tenant = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('recipientId');
    if (TEMP) {
      this.recipientId = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('projectid');
    if (TEMP) {
      this.projectid = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('widgetTitle');
    if (TEMP) {
      this.widgetTitle = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('poweredBy');
    if (TEMP) {
      this.poweredBy = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('userId');
    if (TEMP) {
      this.userId = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('userEmail');
    if (TEMP) {
      this.userEmail = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('userPassword');
    if (TEMP) {
      this.userPassword = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('userFullname');
    if (TEMP) {
      this.userFullname = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('preChatForm');
    if (TEMP) {
      this.preChatForm = true;
    }
    TEMP = el.nativeElement.getAttribute('isOpen');
    if (TEMP) {
      this.isOpen = true;
    }
    TEMP = el.nativeElement.getAttribute('channelType');
    if (TEMP) {
      this.channelType = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('lang');
    if (TEMP) {
      this.lang = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('align');
    if (TEMP) {
      this.align = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('calloutTimer');
    if (TEMP) {
      this.calloutTimer = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('hideHeaderCloseButton');
    if (TEMP) {
      this.hideHeaderCloseButton = true;
    }
    TEMP = el.nativeElement.getAttribute('wellcomeMsg');
    if (TEMP) {
      this.wellcomeMsg = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('calloutTitle');
    if (TEMP) {
      this.calloutTitle = TEMP;
    }
    TEMP = el.nativeElement.getAttribute('calloutMsg');
    if (TEMP) {
      this.calloutMsg = TEMP;
    }
  }


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
    if (this.getParameterByName('tiledesk_hideheaderclosebutton')) {
      this.hideHeaderCloseButton = true;
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
    if (this.getParameterByName('tiledesk_themecolor')) {
      this.themeColor = this.getParameterByName('tiledesk_themecolor');
    }
    if (this.getParameterByName('tiledesk_themeforegroundcolor')) {
      this.themeForegroundColor = this.getParameterByName('tiledesk_themeforegroundcolor');
    }
    if (this.getParameterByName('tiledesk_allowtranscriptdownload')) {
      this.allowTranscriptDownload = true;
    }
    if (this.getParameterByName('tiledesk_showWidgetNameInConversation')) {
      this.showWidgetNameInConversation = true;
    }
  }

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
  }


  private getParameterByName(name) {
    // if (!url) url = window.location.href;

    const url = window.location.href;

    name = name.replace(/[\[\]]/g, '\\$&');
    // console.log('»»» getParameterByName NAME ', name);
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);

    // console.log('»»» getParameterByName RESULT ', results);
    if (!results) { return null; }

    if (!results[2]) { return ''; }

    // console.log('»»» getParameterByName RESULT[2] ', results[2]);
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }


  private setAttributes(): any {
    let attributes: any = JSON.parse(localStorage.getItem('attributes'));
    if (!attributes || attributes === 'undefined') {
        attributes = {
            client: this.CLIENT_BROWSER,
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

}
