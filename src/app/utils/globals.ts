import { LogLevel } from './../../chat21-core/utils/constants';
import { Injectable } from '@angular/core';
// import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../environments/environment';
// import { TranslatorService } from '../providers/translator.service';
import { DepartmentModel } from '../../models/department';
import { User } from '../../models/User';
import { ProjectModel } from '../../models/project';

import { detectIfIsMobile, convertColorToRGBA, getParameterByName, setColorFromString, avatarPlaceholder } from '../utils/utils';

import { CHANNEL_TYPE_GROUP } from '../utils/constants';
// import { TemplateBindingParseResult } from '@angular/compiler';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ConversationModel } from '../../models/conversation';
import { ConversationComponent } from '../components/conversation-detail/conversation/conversation.component';
import { invertColor } from '../../chat21-core/utils/utils';
// import { variable } from '@angular/compiler/src/output/output_ast';
// import { storage } from 'firebase';

@Injectable()
export class Globals {

  obsObjChanged = new BehaviorSubject<any>(null);
  obsIsOpen = new BehaviorSubject<boolean>(null);
  // obsGlobalsParameters =  new BehaviorSubject<any>(null);
  BASE_LOCATION = 'https://widget.tiledesk.com/v2';
  // POWERED_BY = '<a tabindex="-1" target="_blank" href="http://www.tiledesk.com/">Powered by <b>TileDesk</b></a>';
  
  POWERED_BY ='<a tabindex="-1" target="_blank" href="http://www.tiledesk.com/"><span>POWERED BY</span> <img src="https://support-pre.tiledesk.com/dashboard/assets/img/logos/tiledesk-logo.svg"/></a>'
  DEFAULT_LOGO_CHAT = '/assets/images/tiledesk_logo_white_small.png';
  WIDGET_TITLE = 'Tiledesk';

  // private parameters = {};
  // private default_settings;



  // ========= begin:: sottoscrizioni ======= //
  // subscriptions: Subscription[] = []; /** */
  // ========= end:: sottoscrizioni ======= //

  // ============ BEGIN: SET FUNCTION BY UTILS ==============//
  getParameterByName = getParameterByName;
  convertColorToRGBA = convertColorToRGBA;
  // ============ BEGIN: SET INTERNAL PARAMETERS ==============//
  project = new ProjectModel();
  senderId: string;
  tenant: string;
  channelType: string;
  default_settings: any;
  isMobile: boolean;
  isLogged: boolean;
  soundEnabled: boolean;
  BUILD_VERSION: String;
  filterSystemMsg: boolean; /** se è true i messaggi inviati da system non vengono visualizzati */
  baseLocation: string;
  availableAgents: Array<User> = [];
  isLogout = false; /** indica se ho appena fotto il logout */

  attributes: any;
  preChatFormJson: any; // *******  new ********
  token: string;
  tiledeskToken: string;
  firebaseToken: string;
  lang: string;
  conversationsBadge: number;
  activeConversation: ConversationModel;
  public currentConversationComponent: ConversationComponent;

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
  privacyApproved = false;
  startedAt = new Date();

  // ============ BEGIN: LABELS ==============//
  LABEL_TU: string;
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
  LABEL_SEND_NEW_MESSAGE: string;
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
  DOWNLOAD_TRANSCRIPT: string;
  RATE_CHAT: string;
  WELCOME_TITLE: string;
  WELCOME_MSG: string;
  WELCOME: string;
  OPTIONS: string;
  SOUND_ON: string;
  SOUND_OFF: string;
  LOGOUT: string;
  CUSTOMER_SATISFACTION: string;
  YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE: string;
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
  LABEL_PREVIEW: string;

  // ============ BEGIN: EXTERNAL PARAMETERS ==============//
   globalsParameters: any;
   autoStart: boolean;
   startHidden: boolean;
   isShown: boolean;
   isOpen: boolean;
   startFromHome: boolean;
   projectid: string;
   preChatForm: boolean; 
   align: string;
   calloutTimer: number;
   calloutTitle: string;
   calloutMsg: string;
   calloutStaus: boolean;
   userFullname: string;
   userEmail: string;
   widgetTitle: string;
   fullscreenMode: boolean;
   hideHeaderCloseButton: boolean;
   themeColor: string;
   themeForegroundColor: string;
   themeColor50: string;
   colorGradient: string;
   colorBck: string
   colorGradient180: string;
   allowTranscriptDownload: boolean;
   poweredBy: string;
   logoChat: string;
   welcomeTitle: string;
   welcomeMsg: string;
   recipientId: string;
   newConversationStart: boolean;
   recipientFullname: string;
  //  userId: string;
  //  userToken: string;
   marginX: string;
   marginY: string;
   launcherWidth: string;
   launcherHeight: string;
   baloonImage: string;
   baloonShape: string;
   isLogEnabled: boolean;
   openExternalLinkButton: boolean;
   hideHeaderConversationOptionsMenu: boolean;
   hideSettings: boolean;
   filterByRequester: boolean;
   persistence;
   windowContext;

   showWaitTime: boolean;
   showAvailableAgents: boolean;
   showLogoutOption: boolean;
   supportMode: boolean;

   online_msg: string;
   offline_msg: string;

   customAttributes: any;
   showAttachmentButton: boolean;
   showAllConversations: boolean;
  //  privacyField: string;
   jwt: string;

   isOpenNewMessage: boolean;
   dynamicWaitTimeReply: boolean; // *******  new ********
   logLevel: string; // *******  new ********

   bubbleSentBackground: string; // *******  new ********
   bubbleSentTextColor: string; // *******  new ********
   bubbleReceivedBackground: string; // *******  new ********
   bubbleReceivedTextColor: string; // *******  new ********
   fontSize: string; // *******  new ********
   fontFamily: string; // *******  new ********
   buttonFontSize: string; // *******  new ********
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

    let wContext: any = window;
    // console.log('windowContext 0', wContext);
    if (window.frameElement && window.frameElement.getAttribute('tiledesk_context') === 'parent') {
      wContext = window.parent;
    }
    // console.log('windowContext 1', wContext);
    const windowcontextFromWindow = getParameterByName(window, 'windowcontext');
    if (windowcontextFromWindow !== null && windowcontextFromWindow === 'window.parent') {
      wContext = window.parent;
    }
    // console.log('windowContext 2', wContext);
    // this.parameters['windowContext'] = windowContext;
    this.windowContext = wContext;

    // ============ BEGIN: SET EXTERNAL PARAMETERS ==============//
    this.baseLocation = this.BASE_LOCATION;
    this.autoStart = true;
    this.startHidden = false;
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
    this.align = '';
    /** if it is true, the chat window is automatically open when the
    widget is loaded. Permitted values: true, false. Default value : false */
    this.calloutTimer = -1;
    /** Proactively open the chat windows to increase the customer engagement.
    Permitted values: -1 (Disabled), 0 (Immediatly) or a positive integer value.
    For exmaple: 5 (After 5 seconds), 10 (After 10 seconds). */
    this.calloutTitle = '';
    /** title box callout */
    this.calloutMsg = '';
    /** stato callout (shown only first time) */
    this.calloutStaus = true;
    /** message box callout */
    this.userFullname = '';
    /** userFullname: Current user fullname. Set this parameter to specify
    the visitor fullname. */
    this.userEmail = '';
    /** Current user email address. Set this parameter to specify the visitor
    email address.  */
    this.widgetTitle = '';
    /** Set the widget title label shown in the widget header. Value type : string.
    The default value is Tiledesk. */
    this.dynamicWaitTimeReply = true;  
    /** The user can decide whether or not to share the 
     * average response time of his team (if 'dynamicWaitTimeReply' is 
     * false the WAITING_TIME_NOT_FOUND will always be displayed) 
     * is set to true for backward compatibility with old projects */
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
    this.colorBck = convertColorToRGBA('#000000', 100)
    /** allows you to change background color.
    Permitted values: Hex color codes, e.g. #425635 and RGB color
    codes, e.g. rgb(66,86,53) */
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
    this.launcherWidth = '60px'
    /** set launcher width widget  */
    this.launcherHeight = '60px'
    /** set launcher height widget  */
    this.baloonImage='';
    /** set launcher baloon widget image: require SVG url  */
    this.baloonShape = '50%';
    /** set launcher balon widget shape: can set corner by corner   */
    this.isLogEnabled = false;
    // this.parameters['isLogEnabled'] = false;
    this.openExternalLinkButton = true;
    /** enable to open URL in  self action link button in external page from widget */
    this.hideHeaderConversationOptionsMenu = false;
    /** enable to hide/show options menu in conversation detail header */
    this.hideSettings = false;
    /** enable to hide/show options menu in home component */
    this.filterByRequester = false;
    /** show conversations with conversation.attributes.requester_id == user.uid */
    this.persistence = 'local';
    /** set the auth persistence */
    this.preChatFormJson = [{name: "userFullname", type:"text", mandatory:true, label:{ en:"User fullname", it:"Nome utente"}},{name:"userEmail", type:"text", mandatory:true, regex:"/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/", label:{ en:"Email", it: "Indirizzo email"},"errorLabel":{ en:"Invalid email address", it:"Indirizzo email non valido"}}]
    /** set the preChatForm Json as default if preChatFormCustomFieldsEnabled is false or not exist */
    this.bubbleSentBackground = convertColorToRGBA('#2a6ac1', 100); //'#62a8ea'
    /** set the background of bubble sent message */
    this.bubbleSentTextColor = convertColorToRGBA('#ffffff', 100); //'#ffffff'
    /** set the text color of bubble sent message */
    this.bubbleReceivedBackground= convertColorToRGBA('#f7f7f7', 100);
    /** set the background of bubble received message */
    this.bubbleReceivedTextColor = convertColorToRGBA('#1a1a1a', 100); //#1a1a1a
    /** set the text color of bubble received message */
    this.fontSize = '1.4em'
    /** set the text size of bubble messages */
    this.fontFamily = "'Roboto','Google Sans', Helvetica, Arial, sans-serif'"
    /** set the text family of bubble messages */
    this.buttonFontSize = '15px'
    /** set the text size of attachment-buttons */

    this.showWaitTime = true;

    this.showAvailableAgents = true;
    // this.parameters['availableAgents'] = [];

    this.showLogoutOption = true;

    this.offline_msg = this.LABEL_FIRST_MSG_NO_AGENTS;
    this.online_msg = this.LABEL_FIRST_MSG;

    this.isOpenNewMessage = false;
    this.showAttachmentButton = true;
    this.showAllConversations = true;

    // ============ END: SET EXTERNAL PARAMETERS ==============//


    // ============ BEGIN: SET INTERNAL PARAMETERS ==============//
    this.tenant = environment.firebaseConfig.tenant;
    // this.parameters['tenant'] = environment.tenant;
    // this.parameters.push({'tenant': environment.tenant});

    /** Set the widget title label shown in the widget header. Value type : string.
    The default value is Tiledesk. */
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

    this.BUILD_VERSION = 'v.' + environment.version;
    // this.parameters['BUILD_VERSION'] = 'v.' + environment.version;
    // this.parameters.push({'BUILD_VERSION': 'v.' + environment.version});

    this.filterSystemMsg = true;
    /** ???? scolpito in MessagingService. se è true i messaggi inviati da system non vengono visualizzati */
    // this.parameters['filterSystemMsg'] = true;
    // this.parameters.push({'filterSystemMsg': true});

    this.soundEnabled = true;
    // this.parameters['soundEnabled'] = true;
    // this.parameters.push({'soundEnabled': true});

    this.conversationsBadge = 0;
    // this.parameters['conversationsBadge'] = 0;
    // this.parameters.push({'conversationsBadge': 0});

    this.activeConversation = null;
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

    this.newConversationStart = true;

  }


  /**
   * @param attributes
   */
  initialize() {
    this.createDefaultSettingsObject();
    this.setParameter('isMobile', detectIfIsMobile(this.windowContext));
    this.setParameter('attributes', this.attributes);
    this.setProjectParameters();
  }

  /** */
  public setProjectParameters() {
    let projectName = this.project.name;
    if (this.widgetTitle && this.widgetTitle !== '') {
      projectName = this.widgetTitle;
    }
    this.project.customization(
      projectName,
      this.logoChat,
      avatarPlaceholder(projectName),
      setColorFromString(projectName),
      this.welcomeTitle,
      this.welcomeMsg
    );
    // console.log('this.project::::: ', this.project);
  }

  /**
   * 1: setDefaultSettings
   */
  createDefaultSettingsObject() {
    this.default_settings = {
      'tenant': this.tenant, 'recipientId': this.recipientId,
      'projectid': this.projectid, 'widgetTitle': this.widgetTitle,
      'poweredBy': this.poweredBy, 'userEmail': this.userEmail, //'userId': this.userId, 
      'userFullname': this.userFullname, 'preChatForm': this.preChatForm, 'preChatFormJson': this.preChatFormJson,
      'isOpen': this.isOpen, 'channelType': this.channelType,
      'lang': this.lang, 'calloutTimer': this.calloutTimer, 'calloutStaus': this.calloutStaus,
      'align': this.align,'welcomeMsg': this.welcomeMsg, 'calloutTitle': this.calloutTitle,
      'calloutMsg': this.calloutMsg, 'fullscreenMode': this.fullscreenMode, 'hideHeaderCloseButton': this.hideHeaderCloseButton,
      'themeColor': this.themeColor, 'themeForegroundColor': this.themeForegroundColor,
      'allowTranscriptDownload': this.allowTranscriptDownload, //'userToken': this.userToken,
      'autoStart': this.autoStart, 'startHidden': this.startHidden, 'isShown': this.isShown,
      'startFromHome': this.startFromHome, 'logoChat': this.logoChat,
      'welcomeTitle': this.welcomeTitle, 'marginX': this.marginX,
      'marginY': this.marginY, 'lancherWidth': this.launcherWidth, 'lancherHeight': this.launcherHeight,
      'baloonImage': this.baloonImage, 'baloonShape': this.baloonShape, 'isLogEnabled': this.isLogEnabled,
      'openExternalLinkButton': this.openExternalLinkButton, 'hideHeaderConversationOptionsMenu': this.hideHeaderConversationOptionsMenu,
      'hideSettings': this.hideSettings,'filterByRequester': this.filterByRequester, 
      'persistence': this.persistence,'showWaitTime': this.showWaitTime, 'showAvailableAgents': this.showAvailableAgents,
      'showLogoutOption': this.showLogoutOption, 'showAttachmentButton': this.showAttachmentButton,
      'showAllConversations': this.showAllConversations, 'jwt': this.jwt,
      'dynamicWaitTimeReply': this.dynamicWaitTimeReply, 'soundEnabled': this.soundEnabled, 'logLevel': this.logLevel,
      'bubbleSentBackground' : this.bubbleSentBackground, 'bubbleSentTextColor': this.bubbleSentTextColor,   
      'bubbleReceivedBackground': this.bubbleReceivedBackground, 'bubbleReceivedTextColor': this.bubbleReceivedTextColor,
      'fontSize': this.fontSize, 'fontFamily': this.fontFamily, 'buttonFontSize': this.buttonFontSize
    };
  }


  setColorWithGradient() {
    this.themeColor50 = convertColorToRGBA(this.themeColor, 50); // this.g.themeColor + 'CC';
    this.colorGradient = 'linear-gradient(' + this.themeColor + ', ' + this.themeColor50 + ')';
    this.colorGradient180 = 'linear-gradient( 180grad, ' + this.themeColor + ', ' + this.themeColor50 + ')';
    this.bubbleSentBackground = 'linear-gradient( 135grad, ' + this.bubbleSentBackground + ', ' + convertColorToRGBA(this.bubbleSentBackground, 50) + ')';
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
  public setParameter(key: string, val: any, storage?: boolean) {
    // storage = true;
    this[key] = val;
    const obj = {'key': key, 'val': val};
    if (storage === true) {
      this.obsObjChanged.next(obj);
    }
  }

  /**
   *
   * @param key
   * @param val
   */
  public setAttributeParameter(key: string, val: any) {
    this.attributes[key] = val;
    this.setParameter('attributes', this.attributes, true);
  }

  /**
   *
   * @param message
   */
  public wdLog(message: any) {
    if ( this.isLogEnabled && message.length > 0 ) {
      message.forEach(element => console.log(element));
      // console.log(message.toString());
    }
  }


}
