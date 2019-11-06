import { Injectable } from '@angular/core';
// import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../environments/environment';
// import { TranslatorService } from '../providers/translator.service';
import { DepartmentModel } from '../../models/department';
import { User } from '../../models/User';
import { detectIfIsMobile, convertColorToRGBA, getParameterByName } from '../utils/utils';

import { CHANNEL_TYPE_GROUP } from '../utils/constants';
// import { TemplateBindingParseResult } from '@angular/compiler';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import { StorageService } from '../providers/storage.service';
import { AppConfigService } from '../providers/app-config.service';
// import { variable } from '@angular/compiler/src/output/output_ast';
// import { storage } from 'firebase';

@Injectable()
export class Globals {

  obsObjChanged = new BehaviorSubject<any>(null);
  obsIsOpen = new BehaviorSubject<boolean>(null);
  // obsGlobalsParameters =  new BehaviorSubject<any>(null);
  BASE_LOCATION = 'https://widget.tiledesk.com/v2';
  POWERED_BY = '<a tabindex="-1" target="_blank" href="http://www.tiledesk.com/">Powered by <b>TileDesk</b></a>';

  DEFAULT_LOGO_CHAT = '/assets/images/tiledesk_logo_white_small.png';
  WIDGET_TITLE = 'TileDesk';

  // private parameters = {};
  // private default_settings;



  // ========= begin:: sottoscrizioni ======= //
  // subscriptions: Subscription[] = []; /** */
  // ========= end:: sottoscrizioni ======= //

  // ============ BEGIN: SET FUNCTION BY UTILS ==============//
  getParameterByName = getParameterByName;
  convertColorToRGBA = convertColorToRGBA;
  // ============ BEGIN: SET INTERNAL PARAMETERS ==============//
  senderId: string;
  tenant: string;
  channelType: string;
  default_settings: any;
  isMobile: boolean;
  isLogged: boolean;
  isSoundActive: boolean;
  isLogoutEnabled: boolean;
  BUILD_VERSION: String;
  filterSystemMsg: boolean; /** se è true i messaggi inviati da system non vengono visualizzati */
  baseLocation: string;
  availableAgents: Array<User> = [];
  isLogout = false; /** indica se ho appena fotto il logout */

  attributes: any;
  token: string;
  lang: string;
  conversationsBadge: number;
  activeConversation: string;

  isOpenStartRating: boolean;
  departments: DepartmentModel[];
  departmentSelected: DepartmentModel;
  departmentDefault: any;
  isOpenMenuOptions: boolean;
  isOpenPrechatForm: boolean;

  // areAgentsAvailable = false;
  areAgentsAvailableText: string;
  availableAgentsStatus = false; // indica quando è impostato lo stato degli agenti nel subscribe
  signInWithCustomToken: boolean;
  displayEyeCatcherCard: string;

  firstOpen = true;
  departmentID = null;

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
  WAITING_TIME_FOUND: string;
  WAITING_TIME_NOT_FOUND: string;
  CLOSED: string;


  // ============ BEGIN: EXTERNAL PARAMETERS ==============//
   globalsParameters: any;
   autoStart: boolean;
   isShown: boolean;
   isOpen: boolean;
   startFromHome: boolean;
   projectid: string;
   preChatForm: boolean;
   align: string;
   calloutTimer: number;
   calloutTitle: string;
   calloutMsg: string;
   userFullname: string;
   userEmail: string;
   widgetTitle: string;
   fullscreenMode: boolean;
   hideHeaderCloseButton: boolean;
   themeColor: string;
   themeForegroundColor: string;
   themeColor50: string;
   colorGradient: string;
   showWidgetNameInConversation: boolean;
   allowTranscriptDownload: boolean;
   poweredBy: string;
   logoChat: string;
   wellcomeTitle: string;
   wellcomeMsg: string;
   recipientId: String;
   recipientFullname: String;
   userId: string;
   userPassword: string;
   userToken: string;
   marginX: string;
   marginY: string;
   isLogEnabled: boolean;
   filterByRequester: boolean;
   persistence;
   windowContext;

   showWaitTime: boolean;
   showAvailableAgents: boolean;
   showLogoutOption: boolean;
   supportMode: boolean;

   online_msg: string;
   offline_msg: string;

   customAttributes: string;
   hideAttachButton: boolean;

   isOpenNewMessage: boolean;

  constructor(
  ) {
    // console.log(' ---------------- 1: initDefafultParameters ---------------- ');
  }


  /**
   * 1: initParameters
   */
  initDefafultParameters() {
    // console.log('initDefafultParameters, ', window, window.frameElement);
    this.globalsParameters = {};
    this.filterSystemMsg = true;

    let windowContext = window;
    if (window.frameElement && window.frameElement.getAttribute('tiledesk_context') === 'parent') {
      windowContext = window.parent;
    }
    const windowcontextFromWindow = getParameterByName(window, 'windowcontext');
    if (windowcontextFromWindow !== null && windowcontextFromWindow === 'window.parent') {
        windowContext = window.parent;
    }
    // this.parameters['windowContext'] = windowContext;
    this.windowContext = windowContext;

    // ============ BEGIN: SET EXTERNAL PARAMETERS ==============//
    this.baseLocation = this.BASE_LOCATION;
    this.autoStart = true;
    /** start Authentication and startUI */
    this.isShown = true;
    /** show/hide all widget -> js call: showAllWidget */
    this.isOpen = false;
    /** show/hide window widget -> js call: hideAllWidget */
    this.startFromHome = true;
    /** start from Home or Conversation */
    this.isOpenPrechatForm = true;
    /** check open/close modal prechatform if g.preChatForm is true  */
    this.isOpenStartRating = false;
    /** show/hide all rating chat */
    this.projectid = '';
    /** The TileDesk project id. Find your TileDesk ProjectID in the
    TileDesk Dashboard under the Widget menu. */
    this.preChatForm = false;
    /** You can require customers to enter information like name and email
    before sending a chat message by enabling the Pre-Chat form. Permitted
    values: true, false. The default value is false. */
    this.align = 'right';
    /** if it is true, the chat window is automatically open when the
    widget is loaded. Permitted values: true, false. Default value : false */
    this.calloutTimer = -1;
    /** Proactively open the chat windows to increase the customer engagement.
    Permitted values: -1 (Disabled), 0 (Immediatly) or a positive integer value.
    For exmaple: 5 (After 5 seconds), 10 (After 10 seconds). */
    this.calloutTitle = '';
    /** title box callout */
    this.calloutMsg = '';
    /** message box callout */
    this.userFullname = '';
    /** userFullname: Current user fullname. Set this parameter to specify
    the visitor fullname. */
    this.userEmail = '';
    /** Current user email address. Set this parameter to specify the visitor
    email address.  */
    this.widgetTitle = this.WIDGET_TITLE;
    /** Set the widget title label shown in the widget header. Value type : string.
    The default value is Tiledesk. */
    this.hideHeaderCloseButton = false;
    /** Hide the close button in the widget header. Permitted values: true,
    false. The default value is false. */
    this.fullscreenMode = false;
    /** if it is true, the chat window is open in fullscreen mode. Permitted
    values: true, false. Default value : false */
    this.themeColor = convertColorToRGBA('#2a6ac1', 100);
    /** allows you to change the main widget's color
    (color of the header, color of the launcher button,
    other minor elements). Permitted values: Hex color
    codes, e.g. #87BC65 and RGB color codes, e.g. rgb(135,188,101) */
    this.themeForegroundColor = convertColorToRGBA('#ffffff', 100);
    /** allows you to change text and icons' color.
    Permitted values: Hex color codes, e.g. #425635 and RGB color
    codes, e.g. rgb(66,86,53) */
    this.showWidgetNameInConversation = false;
    /** If you want to display the widget title in the conversations,
    set the showWidgetNameInConversation field to true. It is advisable
    if you need to manage multiple projects. Value type : boolean.
    The default value is false. */
    this.allowTranscriptDownload = false;
    /** allows the user to download the chat transcript. The download button appears
    when the chat is closed by the operator. Permitter values: true, false.
    Default value: false */
    this.poweredBy = this.POWERED_BY;
    /** link nel footer widget */
    this.logoChat = this.BASE_LOCATION + this.DEFAULT_LOGO_CHAT;
    /** url img logo */
    this.marginX = '20px';
    /** set margin left or rigth widget  */
    this.marginY = '20px';
    /** set margin bottom widget */
    this.isLogEnabled = false;
    // this.parameters['isLogEnabled'] = false;

    this.filterByRequester = false;
    /** show conversations with conversation.attributes.requester_id == user.uid */
    this.persistence = 'local';

    this.showWaitTime = true;

    this.showAvailableAgents = true;
    // this.parameters['availableAgents'] = [];

    this.showLogoutOption = true;

    this.offline_msg = this.LABEL_FIRST_MSG_NO_AGENTS;
    this.online_msg = this.LABEL_FIRST_MSG;

    this.hideAttachButton = false;
    this.isOpenNewMessage = false;

    // ============ END: SET EXTERNAL PARAMETERS ==============//


    // ============ BEGIN: SET INTERNAL PARAMETERS ==============//
    this.tenant = environment.tenant;
    // this.parameters['tenant'] = environment.tenant;
    // this.parameters.push({'tenant': environment.tenant});
                                                        /** name tenant ex: tilechat */
    this.channelType = CHANNEL_TYPE_GROUP;
    // this.parameters['channelType'] = CHANNEL_TYPE_GROUP;
    // this.parameters.push({'channelType': CHANNEL_TYPE_GROUP});
                                                        /** channelType: group/direct  */
    this.default_settings = {};
    // this.parameters.push({'default_settings': '' });
                                                        /** settings for pass variables to js */
    this.isMobile = false;
    // this.parameters['isMobile'] = false;
    // this.parameters.push({'isMobile': false});  /** detect is mobile : detectIfIsMobile() */

    this.isLogged = false;
    // this.parameters['isLogged'] = false;
    // this.parameters.push({'isLogged': false});  /** detect is logged */

    this.isLogoutEnabled = true;
    // this.parameters['isLogoutEnabled'] = true;
    // this.parameters.push({'isLogoutEnabled': true});
                                                        /** enable/disable button logout in menu options */
    this.BUILD_VERSION = 'v.' + environment.version;
    // this.parameters['BUILD_VERSION'] = 'v.' + environment.version;
    // this.parameters.push({'BUILD_VERSION': 'v.' + environment.version});

    this.filterSystemMsg = true;
    /** ???? scolpito in MessagingService. se è true i messaggi inviati da system non vengono visualizzati */
    // this.parameters['filterSystemMsg'] = true;
    // this.parameters.push({'filterSystemMsg': true});

    this.isSoundActive = true;
    // this.parameters['isSoundActive'] = true;
    // this.parameters.push({'isSoundActive': true});

    this.conversationsBadge = 0;
    // this.parameters['conversationsBadge'] = 0;
    // this.parameters.push({'conversationsBadge': 0});

    this.activeConversation = '';
    // this.parameters['activeConversation'] = '';
    // this.parameters.push({'activeConversation': ''});

    this.isOpenMenuOptions = false;
    // this.parameters['isOpenMenuOptions'] = false;
    // this.parameters.push({'isOpenMenuOptions': false});
                                                        /** open/close menu options  */
    this.signInWithCustomToken = false;
    // this.parameters['signInWithCustomToken'] = false;
    // this.parameters.push({'signInWithCustomToken': false});

    this.displayEyeCatcherCard = 'none';
    // this.parameters['displayEyeCatcherCard'] = 'none';
    // this.parameters.push({'displayEyeCatcherCard': 'none'});
    // ============ END: SET INTERNAL PARAMETERS ==============//

    this.supportMode = true;
    // this.parameters['supportMode'] = true;
    // this.parameters.push({'supportMode': true});
  }


  /**
   * @param attributes
   */
  initialize() {
    this.createDefaultSettingsObject();
    this.setParameter('isMobile', detectIfIsMobile(this.windowContext));
    this.setParameter('attributes', this.attributes);
  }

  /**
   * 1: setDefaultSettings
   */
  createDefaultSettingsObject() {
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
      'wellcomeTitle': this.wellcomeTitle, 'marginX': this.marginX,
      'marginY': this.marginY, 'isLogEnabled': this.isLogEnabled,
      'filterByRequester': this.filterByRequester, 'persistence': this.persistence,
      'showWaitTime': this.showWaitTime, 'showAvailableAgents': this.showAvailableAgents,
      'showLogoutOption': this.showLogoutOption, 'hideAttachButton': this.hideAttachButton
    };
  }


  setColorWithGradient() {
    this.themeColor50 = convertColorToRGBA(this.themeColor, 30); // this.g.themeColor + 'CC';
    this.colorGradient = 'linear-gradient(' + this.themeColor + ', ' + this.themeColor50 + ')';
}

  /**
   *
   * @param val
   */
  public setIsOpen(val: boolean) {
    // console.log('setIsOpen', val);
    this.isOpen = val;
    this.obsIsOpen.next(val);
  }

  /**
   *
   * @param key
   * @param val
   */
  public setParameter(key: string, val: any) {
    this[key] = val;
    const obj = {'key': key, 'val': val};
    this.obsObjChanged.next(obj);
  }

  /**
   *
   * @param key
   * @param val
   */
  public setAttributeParameter(key: string, val: any) {
    this.attributes[key] = val;
    this.setParameter('attributes', this.attributes);
  }

  /**
   *
   * @param message
   */
  public wdLog(message: any) {
    if ( this.isLogEnabled ) {
        console.log(message.toString());
    }
  }

}
