import { style } from '@angular/animations';
import { MAX_HEIGHT_TEXTAREA } from './../../../../chat21-core/utils/constants';
import { ChatManager } from './../../../../chat21-core/providers/chat-manager';

import { ConversationFooterComponent } from './../conversation-footer/conversation-footer.component';

// tslint:disable-next-line:max-line-length
import { NgZone, HostListener, ElementRef, Component, OnInit, OnChanges, AfterViewInit, Input, Output, ViewChild, EventEmitter, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Globals } from '../../../utils/globals';
import { MessagingService } from '../../../providers/messaging.service';
import { ConversationsService } from '../../../providers/conversations.service';
import { AppConfigService } from '../../../providers/app-config.service';

import {
  CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, TYPE_MSG_TEXT,
  MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER,
  TYPE_MSG_FILE, TYPE_MSG_IMAGE, MAX_WIDTH_IMAGES, IMG_PROFILE_BOT, IMG_PROFILE_DEFAULT, UID_SUPPORT_GROUP_MESSAGES
} from '../../../utils/constants';
import { UploadService_old } from '../../../providers/upload.service';
import { ContactService } from '../../../providers/contact.service';
import { AgentAvailabilityService } from '../../../providers/agent-availability.service';
import { StarRatingWidgetService } from '../../star-rating-widget/star-rating-widget.service';

// models

import { MessageModel } from '../../../../chat21-core/models/message';
import { UploadModel } from '../../../../models/upload';

// utils
import { isJustRecived, getUrlImgProfile, convertColorToRGBA, isPopupUrl, searchIndexInArrayForUid, replaceBr} from '../../../utils/utils';
import { v4 as uuidv4 } from 'uuid';


// Import the resized event model
import { ResizedEvent } from 'angular-resize-event/resized-event';

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

import { AppComponent } from '../../../app.component';
import { CustomTranslateService } from '../../../../chat21-core/providers/custom-translate.service';
import { ConversationHandlerService } from '../../../../chat21-core/providers/abstract/conversation-handler.service';
import { ConversationHandlerBuilderService } from '../../../../chat21-core/providers/abstract/conversation-handler-builder.service';
import { popupUrl } from '../../../../chat21-core/utils/utils';
import { ConversationContentComponent } from '../conversation-content/conversation-content.component';
import { ConversationsHandlerService } from '../../../../chat21-core/providers/abstract/conversations-handler.service';
import { ArchivedConversationsHandlerService } from '../../../../chat21-core/providers/abstract/archivedconversations-handler.service';
import { ConversationModel } from '../../../../chat21-core/models/conversation';
import { AppStorageService } from '../../../../chat21-core/providers/abstract/app-storage.service';
import { LoggerService } from '../../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../../chat21-core/providers/logger/loggerInstance';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
// import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'chat-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {'(window:resize)': 'onResize($event)'}
})
export class ConversationComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('scrollMe') private scrollMe: ElementRef; // l'ID del div da scrollare
  @ViewChild('afConversationComponent') private afConversationComponent: ElementRef; // l'ID del div da scrollare
  // @HostListener('window:resize', ['$event'])
  // ========= begin:: Input/Output values
  // @Input() elRoot: ElementRef;
  @Input() conversationId: string;
  @Input() stylesMap: Map<string, string>;
  @Input() isOpen: boolean;
  @Input() senderId: string;    // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  @Input() isConversationArchived: boolean;
  @Output() onBackHome = new EventEmitter();
  @Output() onCloseWidget = new EventEmitter();
  @Output() onSoundChange = new EventEmitter();
  @Output() onBeforeMessageSent = new EventEmitter();
  @Output() onAfterSendMessage = new EventEmitter();
  @Output() onNewConversationInit = new EventEmitter();
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();
  @Output() onNewMessageCreated = new EventEmitter();
  // ========= end:: Input/Output values

  // projectid: string;   // uid progetto passato come parametro getVariablesFromSettings o getVariablesFromAttributeHtml
  // channelType: string; // tipo di conversazione ( group / direct ) a seconda che recipientId contenga o meno 'group'
  // writingMessage = '';    // messaggio sta scrivendo...
  // isTypings = false;
  conversation: ConversationModel
  conversationWith: string;
  isMenuShow = false;
  
  isButtonsDisabled = true;
  // isConversationArchived = false;
  hideFooterTextReply: boolean = false;
  hideFooterMessagePlaceholder: string = '';
  isTrascriptDownloadEnabled = false;
  audio: any;
  // ========= begin:: gestione scroll view messaggi ======= //
  //startScroll = true; // indica lo stato dello scroll: true/false -> è in movimento/ è fermo
  isScrolling = false;
  idDivScroll = 'c21-contentScroll'; // id div da scrollare
  showBadgeScroollToBottom = false;
  messagesBadgeCount = 0;
  // ========= end:: gestione scroll view messaggi ======= //


  // ========= begin:: send image ======= //
  selectedFiles: FileList;
  isFilePendingToUpload: Boolean = false;
  arrayFilesLoad: Array<any>;
  isFileSelected: Boolean = false;

  isOpenAttachmentPreview: Boolean = false;
  attachments: Array<{ file: Array<any>, metadata: {}}>
  files: Array<any>;
  metadata: {} = {};
  // ========= end:: send image ========= //




  // text used within the html
  private LABEL_PLACEHOLDER: string;

  // userEmail: string;
  // userFullname: string;
  preChatForm = false;
  //textInputTextArea: String;
  HEIGHT_DEFAULT = '20px';
  
  isPopupUrl = isPopupUrl;
  popupUrl = popupUrl;
  IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
  
  // availableAgentsStatus = false; // indica quando è impostato lo stato degli agenti nel subscribe
  messages: Array<MessageModel> = [];
  // recipient_fullname: string;
  // attributes: any;
  // GUEST_LABEL = '';

  CLIENT_BROWSER: string = navigator.userAgent;

  // devo inserirle nel globals
  obsTyping: Subscription;
  subscriptions: Array<any> = [];
  private unsubscribe$: Subject<any> = new Subject<any>();
  showMessageWelcome: boolean;

  // ========= begin::agent availability
  // public areAgentsAvailableText: string;
  // public areAgentsAvailable: Boolean = false;
  // ========= end::agent availability


  // ========== begin:: set icon status message
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_SENT_SERVER = MSG_STATUS_SENT_SERVER;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  // ========== end:: icon status message

  lastMsg = false;
  // _LABEL_PLACEHOLDER: string;

  isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
  firstScroll = true;

  setTimeoutSound: NodeJS.Timer;

  public showSpinner = true;

  getUrlImgProfile = getUrlImgProfile;
  tooltipOptions = {
    'show-delay': 1500,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };

  translationMapHeader: Map<string, string>;
  translationMapFooter: Map<string, string>;
  translationMapContent: Map<string, string>;
  translationMapPreview: Map<string, string>;

  @ViewChild(ConversationFooterComponent) conversationFooter: ConversationFooterComponent
  @ViewChild(ConversationContentComponent) conversationContent: ConversationContentComponent
  conversationHandlerService: ConversationHandlerService
  conversationsHandlerService: ConversationsHandlerService
  archivedConversationsHandlerService: ArchivedConversationsHandlerService

  public isButtonUrl: boolean = false;
  public buttonClicked: any;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    //public el: ElementRef,
    public g: Globals,
    public starRatingWidgetService: StarRatingWidgetService,
    public sanitizer: DomSanitizer,
    public appComponent: AppComponent,
    public appStorageService: AppStorageService,
    public conversationsService: ConversationsService,
    public conversationHandlerBuilderService: ConversationHandlerBuilderService,
    public appConfigService: AppConfigService,
    private customTranslateService: CustomTranslateService,
    private chatManager: ChatManager
  ) { }

  onResize(event){
    this.logger.debug('[CONV-COMP] resize event', event)
  }

  ngOnInit() {
    // this.initAll();
    this.logger.debug('[CONV-COMP] ngOnInit: ', this.senderId);
    this.showMessageWelcome = false;
    // const subscriptionEndRenderMessage = this.appComponent.obsEndRenderMessage.subscribe(() => {
    //   this.ngZone.run(() => {
    //     // that.scrollToBottom();
    //   });
    // });
    // this.subscriptions.push(subscriptionEndRenderMessage);
    // this.attributes = this.setAttributes();
    // this.getTranslation();
    this.translations();
    //this.initAll();
  }

  public translations() {
    const keysHeader = [
      //'LABEL_AVAILABLE',
      //'LABEL_NOT_AVAILABLE',
      //'LABEL_TODAY',
      //'LABEL_TOMORROW',
      //'LABEL_TO',
      'LABEL_LAST_ACCESS',
      //'ARRAY_DAYS',
      //'LABEL_ACTIVE_NOW',
      'LABEL_WRITING',
      'BUTTON_CLOSE_TO_ICON', 
      'OPTIONS', 
      'PREV_CONVERSATIONS',
      'SOUND_OFF',
      'SOUND_ON',
      'DOWNLOAD_TRANSCRIPT',
      'BACK',
      'CLOSE'
    ];

    const keysFooter = [
      'LABEL_PLACEHOLDER',
      'GUEST_LABEL',
    ];

    const keysContent = [
      'INFO_SUPPORT_USER_ADDED_SUBJECT',
      'INFO_SUPPORT_USER_ADDED_YOU_VERB',
      'INFO_SUPPORT_USER_ADDED_COMPLEMENT',
      'INFO_SUPPORT_USER_ADDED_VERB',
      'INFO_SUPPORT_CHAT_REOPENED',
      'INFO_SUPPORT_CHAT_CLOSED',
      'LABEL_TODAY',
      'LABEL_TOMORROW',
      'LABEL_LOADING',
      'LABEL_TO',
      'ARRAY_DAYS',
    ];

    const keysPreview= [
      'BACK', 
      'CLOSE',
      'LABEL_PLACEHOLDER',
    ];

    
    this.translationMapHeader = this.customTranslateService.translateLanguage(keysHeader);
    this.translationMapFooter = this.customTranslateService.translateLanguage(keysFooter);
    this.translationMapContent = this.customTranslateService.translateLanguage(keysContent);
    this.translationMapPreview = this.customTranslateService.translateLanguage(keysPreview);
  }

  ngAfterViewInit() {
    // this.isShowSpinner();
    this.logger.debug('[CONV-COMP] --------ngAfterViewInit: conversation-------- ');
    // this.storageService.setItem('activeConversation', this.conversation.uid);
    
    // --------------------------- //
    // after animation intro
    setTimeout(() => {
      this.initAll();
      // this.setFocusOnId('chat21-main-message-context');
      //this.updateConversationBadge();

      this.g.currentConversationComponent = this;
      if (this.g.newConversationStart === true) {
        this.onNewConversationComponentInit();
        this.g.newConversationStart = false;
      }
      this.setSubscriptions();
      if (this.afConversationComponent) {
        this.afConversationComponent.nativeElement.focus();
      }
      this.isButtonsDisabled = false;
    }, 300);
    // this.g.currentConversationComponent = this;
    // if (this.g.newConversationStart === true) {
    //   this.onNewConversationComponentInit();
    //   // this.g.setParameter('newConversationStart', null)
    //   this.g.newConversationStart = false;
    //   // console.log('reset newconv ' + this.g.newConversationStart);
    //   // do  not send message hello
    // }
    // // ------------------------------------------------ //
    // this.g.wdLog([' --------ngAfterViewInit-------- ']);
    // // console.log('attributes: ', this.g.attributes);
    // //this.scrollToBottom(true);
    // this.setSubscriptions();
    // setTimeout(() => {
    //   if (this.afConversationComponent) {
    //     this.afConversationComponent.nativeElement.focus();
    //   }
    // }, 1000);
  }


  ngOnChanges(changes: SimpleChanges) {
    this.logger.debug('[CONV-COMP] onChagnges', changes)
    if (this.isOpen === true) {
      //this.updateConversationBadge();
      // this.scrollToBottom();
    }
  }

  updateConversationBadge() {
    this.logger.debug('[CONV-COMP] updateConversationBadge', this.conversationId)
    if(this.isConversationArchived && this.conversationId && this.archivedConversationsHandlerService){
      this.archivedConversationsHandlerService.setConversationRead(this.conversationId)
    }
    if (!this.isConversationArchived && this.conversationId && this.conversationsHandlerService) {
      this.conversationsHandlerService.setConversationRead(this.conversationId)
      const badgeNewConverstionNumber = this.conversationsHandlerService.countIsNew()
      this.g.setParameter('conversationsBadge', badgeNewConverstionNumber);
    }

  }

  // ngAfterViewChecked() {
  //   this.isShowSpinner();
  //   this.cdRef.detectChanges();
  // }

  // public isShowSpinner() {
  //   const that = this;
  //   setTimeout(() => {
  //     that.showSpinner = false;
  //   }, 5000);
  // }


  /**
   * do per scontato che this.userId esiste!!!
   */
  initAll() {

    this.logger.debug('[CONV-COMP] ------ 2: setConversation ------ ');
    this.setConversation();

    this.logger.debug('[CONV-COMP] ------ 3: connectConversation ------ ');
    // this.connectConversation();
    this.initConversationHandler();

    this.logger.debug('[CONV-COMP] ------ 4: initializeChatManager ------ ');
    //this.initializeChatManager();

    // sponziello, commentato
    // this.logger.debug('[CONV-COMP] ------ 5: setAvailableAgentsStatus ------ ');
    // this.setAvailableAgentsStatus();
    this.logger.debug('[CONV-COMP] ------ 5: updateConversationbage ------ ');
    this.updateConversationBadge();

    this.logger.debug('[CONV-COMP] ------ 6: getConversationDetail ------ ', this.conversationId);
    this.getConversationDetail() //check if conv is archived or not

    // this.checkListMessages();

    if (this.g.customAttributes && this.g.customAttributes.recipient_fullname) {
      this.g.recipientFullname = this.g.customAttributes.recipient_fullname;
    }

    // try {
    //   JSON.parse(this.g.customAttributes, (key, value) => {
    //     if (key === 'recipient_fullname') {
    //       this.g.recipientFullname = value;
    //     }
    //   });
    // } catch (error) {
    //     this.g.wdLog(['> Error :' + error]);
    // }
  }

  getConversationDetail(){
    if(!this.isConversationArchived){ //get conversation from 'conversations' firebase node
      this.conversationsHandlerService.getConversationDetail(this.conversationId, (conv)=>{
        this.logger.debug('[CONV-COMP] conversationsHandlerService getConversationDetail', this.conversationId, conv)
        this.conversation = conv;    
      })
    }else { //get conversation from 'conversations' firebase node
      this.archivedConversationsHandlerService.getConversationDetail(this.conversationId, (conv)=>{
        this.logger.debug('[CONV-COMP] archivedConversationsHandlerService getConversationDetail', this.conversationId, conv)
        this.conversation = conv;    
      })
    }
    
  }

  // onResize(event) {
  //   // tslint:disable-next-line:no-unused-expression
  //   this.g.wdLog(['RESIZE ----------> ' + event.target.innerWidth]);
  // }

  /**
   * OLD: mi sottoscrivo al nodo /projects/' + projectId + '/users/availables
   * i dipartimenti e gli agenti disponibili sono già stati impostati nello step precedente
   * recuperati dal server (/widget) e settati in global
   * imposto il messaggio online/offline a seconda degli agenti disponibili
   * aggiungo il primo messaggio alla conversazione
   */
  // public setAvailableAgentsStatus() {

  //   const departmentDefault: DepartmentModel =  this.g.departmentDefault;
  //   this.g.wdLog(['departmentDefault', departmentDefault]);
  //   this.g.wdLog(['messages1: ', this.g.online_msg, this.g.offline_msg]);
  //   if (!this.g.online_msg || this.g.online_msg === 'undefined' || this.g.online_msg === '') {
  //     this.g.online_msg = this.g.LABEL_FIRST_MSG;
  //   }
  //   if (!this.g.offline_msg || this.g.offline_msg === 'undefined' || this.g.offline_msg === '') {
  //     this.g.offline_msg = this.g.LABEL_FIRST_MSG_NO_AGENTS;
  //   }

  //   this.g.wdLog(['messages2: ', this.g.online_msg, this.g.offline_msg]);
  //   const availableAgentsForDep = this.g.availableAgents;
  //   if (availableAgentsForDep && availableAgentsForDep.length <= 0) {
  //     this.addFirstMessage(this.g.offline_msg);
  //     this.g.areAgentsAvailableText = this.g.AGENT_NOT_AVAILABLE;
  //     // no more used g.areAgentsAvailableText - g.AGENT_NOT_AVAILABLE is managed in the template
  //   } else {
  //     this.addFirstMessage(this.g.online_msg);
  //     this.g.areAgentsAvailableText = this.g.AGENT_AVAILABLE;
  //     // no more used g.areAgentsAvailableText - g.AGENT_AVAILABLE is managed in the template
  //   }

  //   if ( this.g.recipientId.includes('_bot') || this.g.recipientId.includes('bot_') ) {
  //     this.g.areAgentsAvailableText = '';
  //   }
  //   this.g.wdLog(['messages: ', this.g.online_msg, this.g.offline_msg]);

  //   // this.getAvailableAgentsForDepartment();

  // }

    /**
   * mi sottoscrivo al nodo /departments/' + idDepartmentSelected + '/operators/';
   * per verificare se c'è un agent disponibile
   */
  // private getAvailableAgentsForDepartment() {
  //   const that = this;
  //   const projectid = this.g.projectid;
  //   const departmentSelectedId = this.g.attributes.departmentId;
  //   this.g.wdLog(['departmentSelectedId: ', departmentSelectedId, 'projectid: ', projectid]);

  //   this.agentAvailabilityService
  //   .getAvailableAgentsForDepartment(projectid, departmentSelectedId)
  //   .subscribe( (availableAgents) => {
  //     const availableAgentsForDep = availableAgents['available_agents'];
  //     if (availableAgentsForDep && availableAgentsForDep.length <= 0) {
  //       that.addFirstMessage(that.g.LABEL_FIRST_MSG_NO_AGENTS);
  //     } else {
  //       that.addFirstMessage(that.g.LABEL_FIRST_MSG);
  //     }
  //   }, (error) => {
  //     console.error('2 setOnlineStatus::setAvailableAgentsStatus', error);
  //   }, () => {
  //   });
  // }

  /**
   * mi sottoscrivo al nodo /projects/' + projectId + '/users/availables
   * per verificare se c'è un agent disponibile
   */
  // private setAvailableAgentsStatus() {
  //   const that = this;
  //   this.agentAvailabilityService
  //   .getAvailableAgents(this.g.projectid)
  //   .subscribe( (availableAgents) => {
  //     that.g.wdLog(['availableAgents->', availableAgents]);
  //     if (availableAgents.length <= 0) {
  //       that.areAgentsAvailable = false;
  //       that.areAgentsAvailableText = that.g.AGENT_NOT_AVAILABLE;
  //       that.addFirstMessage(that.g.LABEL_FIRST_MSG_NO_AGENTS);
  //     } else {
  //       that.areAgentsAvailable = true;
  //       that.areAgentsAvailableText = that.g.AGENT_AVAILABLE;
  //       // add first message
  //       this.g.availableAgents = availableAgents;
  //       that.addFirstMessage(that.g.LABEL_FIRST_MSG);
  //     }
  //     that.availableAgentsStatus = true;
  //     that.g.wdLog(['AppComponent::setAvailableAgentsStatus::areAgentsAvailable:', that.areAgentsAvailableText]);
  //   }, (error) => {
  //     console.error('setOnlineStatus::setAvailableAgentsStatus', error);
  //   }, () => {
  //   });
  // }

  // addFirstMessage(text) {
  //   const lang = this.g.lang;
  //   const channelType = this.g.channelType;
  //   const projectid = this.g.projectid;


  //   text = replaceBr(text);
  //   const timestampSendingMessage = new Date('01/01/2000').getTime();
  //   const msg = new MessageModel(
  //     '000000',
  //     lang,
  //     this.conversationWith,
  //     'Bot',
  //     '', // sender
  //     'Bot', // sender fullname
  //     '200', // status
  //     '', // metadata
  //     text,
  //     timestampSendingMessage,
  //     '',
  //     TYPE_MSG_TEXT,
  //     '', // attributes
  //     channelType,
  //     projectid
  //   );
  //   this.g.wdLog(['addFirstMessage ----------> ' + text]);
  //   this.messages.unshift(msg);
  // }

  /**
    * this.g.recipientId:
    * this.g.senderId:
    * this.g.channelType:
    * this.g.tenant
    * 1 - setto channelTypeTEMP ( group / direct )
    *    a seconda che recipientId contenga o meno 'group'
    * 2 - setto conversationWith
    * 2 - setto conversationWith
    *    uguale a recipientId se esiste
    *    uguale al senderId nel this.storageService se esiste
    *    generateUidConversation
  */
  private setConversation() {
    const recipientId = this.g.recipientId;
    const channelType = this.g.channelType;
    this.logger.debug('[CONV-COMP] setConversation recipientId::: ', recipientId, channelType);
    if ( !recipientId ) { this.g.setParameter('recipientId', this.setRecipientId()); }
    if ( !channelType ) { this.g.setParameter('channelType', this.setChannelType()); }
    this.conversationWith = recipientId as string;
    this.logger.debug('[CONV-COMP] setConversation conversation::: ', this.conversation);
    if (!this.conversation) {
      // this.conversation = new ConversationModel(
      //   recipientId,
      //   {},
      //   channelType,
      //   true,
      //   '',
      //   recipientId,
      //   this.g.recipientFullname,
      //   this.senderId,
      //   this.g.userFullname,
      //   '0',
      //   0,
      //   TYPE_MSG_TEXT,
      //   '',
      //   '',
      //   '',
      //   '',
      //   0,
      //   false
      //   );
      this.conversation = new ConversationModel(
        recipientId,
        this.g.attributes,
        channelType,
        this.g.recipientFullname,
        this.conversationWith,
        recipientId,
        this.g.recipientFullname,
        '',
        true,
        '',
        '',
        this.senderId,
        '',
        this.g.userFullname,
        '0',
        '',
        true,
        '',
        '',
        false,
        'text')
    }
  }


  /**
   *
   */
  private setRecipientId() {
    let recipientIdTEMP: string;
    const senderId = this.senderId;
    recipientIdTEMP = this.appStorageService.getItem(senderId);
    if (!recipientIdTEMP) {
      // questa deve essere sincrona!!!!
      // recipientIdTEMP = UID_SUPPORT_GROUP_MESSAGES + uuidv4(); >>>>>OLD 
      recipientIdTEMP = UID_SUPPORT_GROUP_MESSAGES + this.g.projectid + '-' + uuidv4().replace(/-/g, '');
      this.logger.debug('[CONV-COMP] recipitent', recipientIdTEMP)
      //recipientIdTEMP = this.messagingService.generateUidConversation(senderId);
    }
    return recipientIdTEMP;
  }

  /**
   *
   */
  private setChannelType() {
    let channelTypeTEMP = CHANNEL_TYPE_GROUP;
    const projectid = this.g.projectid;
    if (this.g.recipientId && this.g.recipientId.indexOf('group') !== -1) {
      channelTypeTEMP = CHANNEL_TYPE_GROUP;
    } else if (!projectid) {
      channelTypeTEMP = CHANNEL_TYPE_DIRECT;
    }
    return channelTypeTEMP;
  }


  /**
   *  1 - init messagingService
   *  2 - connect: recupero ultimi X messaggi
   */
  // private connectConversation() {
  //     const senderId = this.g.senderId;
  //     const tenant = this.g.tenant;
  //     const channelType = this.g.channelType;
  //     if (!this.conversationWith && this.g.recipientId) {
  //       this.conversationWith = this.g.recipientId;
  //     }
  //     // console.log('connectConversation -- >: ', senderId, tenant, channelType, this.conversationWith, this.g.recipientId);
  //     this.messagingService.initialize( senderId, tenant, channelType );
  //     this.messagingService.initWritingMessages(this.conversationWith);
  //     this.messagingService.getWritingMessages();

  //     // this.upSvc.initialize(senderId, tenant, this.conversationWith);
  //     // his.contactService.initialize(senderId, tenant, this.conversationWith);
  //     this.messagingService.connect( this.conversationWith );
  //     this.messages = this.messagingService.messages;
  //     // this.scrollToBottomStart();
  //     // this.messages.concat(this.messagingService.messages);
  //     // this.messagingService.resetBadge(this.conversationWith);

  // }

   /**
   * recupero da chatManager l'handler
   * se NON ESISTE creo un handler e mi connetto e lo memorizzo nel chatmanager
   * se ESISTE mi connetto
   * carico messaggi
   * attendo x sec se nn arrivano messaggi visualizzo msg welcome
   */
  initConversationHandler() {
    const tenant = this.g.tenant;
    this.messages = [];
    //TODO-GAB: da sistemare loggedUser in firebase-conversation-handler.service
    const loggedUser = { uid: this.senderId}
    const conversationWithFullname = this.g.recipientFullname; // TODO-GAB: risulta null a questo punto
    this.logger.debug('[CONV-COMP] initconversation NEWWW', loggedUser, conversationWithFullname, tenant)
    this.showMessageWelcome = false;
    const handler: ConversationHandlerService = this.chatManager.getConversationHandlerByConversationId(this.conversationWith);
    this.logger.debug('[CONV-COMP] DETTAGLIO CONV - handler **************', handler, this.conversationWith);
    if (!handler) {
      this.conversationHandlerService = this.conversationHandlerBuilderService.build();
      this.conversationHandlerService.initialize(
        this.conversationWith,
        conversationWithFullname,
        loggedUser,
        tenant,
        this.translationMapContent
      );
      this.conversationHandlerService.connect();
      this.logger.debug('[CONV-COMP] DETTAGLIO CONV - NEW handler **************', this.conversationHandlerService);
      this.messages = this.conversationHandlerService.messages;
      
      /* SEND FIRST MESSAGE if preChatForm has 'firstMessage' key */ 
      this.sendFirstMessagePreChatForm()
      
      this.logger.debug('[CONV-COMP] DETTAGLIO CONV - messages **************', this.messages);
      this.chatManager.addConversationHandler(this.conversationHandlerService);

      // attendo un secondo e poi visualizzo il messaggio se nn ci sono messaggi
      const that = this;
      setTimeout( () => {
        if (!that.messages || that.messages.length === 0) {
          //this.showIonContent = true;
          that.showMessageWelcome = true;
          // that.sendFirstMessage()
          that.logger.debug('[CONV-COMP] setTimeout ***', that.showMessageWelcome);
        }
      }, 8000);

    } else {
      this.logger.debug('[CONV-COMP] NON ENTRO ***', this.conversationHandlerService, handler);
      this.conversationHandlerService = handler;
      this.messages = this.conversationHandlerService.messages;
      // sicuramente ci sono messaggi
      // la conversazione l'ho già caricata precedentemente
      // mi arriva sempre notifica dell'ultimo msg (tramite BehaviorSubject)
      // scrollo al bottom della pagina
    }
    this.logger.debug('[CONV-COMP] CONVERSATION MESSAGES ' + this.messages );

    //retrive active and archived conversations-handler service
    this.conversationsHandlerService = this.chatManager.conversationsHandlerService
    this.archivedConversationsHandlerService = this.chatManager.archivedConversationsService

  }

  /**
   *  se nel preChatForm c'è una chiave 'firstMessage'
   *  e la conversazione non ha altri messaggi, invio il firstMessage
   *  del preChatForm appena compilato
   */
  sendFirstMessagePreChatForm(){
    setTimeout(() => {
      if(this.messages && this.messages.length === 0){
        this.logger.debug('[CONV-COMP] sendFirstMessage: messages + attributes ',this.messages, this.g.attributes)
        if(this.g.attributes && this.g.attributes.preChatForm && this.g.attributes.preChatForm.firstMessage){
          const firstMessage = this.g.attributes.preChatForm.firstMessage
          this.conversationFooter.sendMessage(firstMessage, TYPE_MSG_TEXT, this.g.attributes) 
        }
      }
    }, 1000);
  }
  /**
   * inizializzo variabili
   * effettuo il login anonimo su firebase
   * se il login è andato a buon fine recupero id utente
   */
  // initializeChatManager() {
  //   this.arrayFilesLoad = [];
  //   // this.setSubscriptions();
  //   // this.checkWritingMessages();
  // }

  /**
   *
   */
  // setAttributes(): any {
  //   if (!this.g.attributes || this.g.attributes === 'undefined') {
  //     let attributes: any = JSON.parse(this.storageService.getItem('attributes'));
  //     if (!attributes || attributes === 'undefined') {
  //       attributes = {
  //         client: this.CLIENT_BROWSER,
  //         sourcePage: location.href,
  //         projectId: this.g.projectid
  //       };
  //     }
  //     if (this.g.userEmail) {
  //       attributes['userEmail'] = this.g.userEmail;
  //     }
  //     if (this.g.userFullname) {
  //       attributes['userFullname'] = this.g.userFullname;
  //     }
  //     if (this.g.senderId) {
  //       attributes['requester_id'] = this.g.senderId;
  //     }
  //     that.g.wdLog(['>>>>>>>>>>>>>> setAttributes: ', JSON.stringify(attributes)]);
  //     this.storageService.setItem('attributes', JSON.stringify(attributes));
  //     return attributes;
  //   }
  //   return this.g.attributes;
  // }

  /**
   * imposto le sottoscrizioni
   * 1 - conversazione chiusa (CHAT CHIUSA)
   * 2 - nuovo messaggio
   */
  setSubscriptions() {
    const that = this;
    let subscribtion: any;
    let subscribtionKey: string;

    subscribtionKey = 'starRating';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if (!subscribtion) {
      this.starRatingWidgetService.setOsservable(false);
      // CHIUSURA CONVERSAZIONE (ELIMINAZIONE UTENTE DAL GRUPPO)
      // tslint:disable-next-line:max-line-length
      this.logger.debug('[CONV-COMP] setSubscriptions!!!! StartRating', this.starRatingWidgetService.obsCloseConversation.value);
      subscribtion = this.starRatingWidgetService.obsCloseConversation.pipe(takeUntil(this.unsubscribe$)).subscribe(isOpenStartRating => {
        this.logger.debug('[CONV-COMP] startratingggg', isOpenStartRating)
        that.g.setParameter('isOpenStartRating', isOpenStartRating);
        if (isOpenStartRating === false) {
          this.logger.debug('[CONV-COMP] NOT OPEN StartRating **');
        } else if (isOpenStartRating === true) {
          this.logger.debug('[CONV-COMP] OPEN StartRating **');
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }


    subscribtionKey = 'messageAdded';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if (!subscribtion) {
      this.logger.debug('[CONV-COMP] ***** add messageAdded *****',  this.conversationHandlerService);
      subscribtion = this.conversationHandlerService.messageAdded.pipe(takeUntil(this.unsubscribe$)).subscribe((msg: MessageModel) => {
        this.logger.debug('[CONV-COMP] ***** DATAIL messageAdded *****', msg);
        if (msg) {
          that.newMessageAdded(msg);
          this.onNewMessageCreated.emit(msg)
          this.checkMessagesLegntForTranscriptDownloadMenuOption();
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }

    subscribtionKey = 'conversationsRemoved';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if(!subscribtion){

      subscribtion = this.chatManager.conversationsHandlerService.conversationRemoved.pipe(takeUntil(this.unsubscribe$)).subscribe((conversation) => {
        this.logger.debug('[CONV-COMP] ***** DATAIL conversationsRemoved *****', conversation, this.conversationWith, this.isConversationArchived);
        if(conversation && conversation.uid === this.conversationWith && !this.isConversationArchived){
          this.starRatingWidgetService.setOsservable(true)
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }

    subscribtionKey = 'conversationsChanged';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if(!subscribtion){

      subscribtion = this.chatManager.conversationsHandlerService.conversationChanged.pipe(takeUntil(this.unsubscribe$)).subscribe((conversation) => {
        this.logger.debug('[CONV-COMP] ***** DATAIL conversationsChanged *****', conversation, this.conversationWith, this.isConversationArchived);
        if(conversation && conversation.sender !== this.senderId){
          const checkContentScrollPosition = that.conversationContent.checkContentScrollPosition();
          if(checkContentScrollPosition && conversation.is_new){ //update conversation if scroolToBottom is to the end
            this.logger.debug('[CONV-COMP] updateConversationBadge...')
            that.updateConversationBadge();
          }
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }


    // this.starRatingWidgetService.setOsservable(false);
    // // CHIUSURA CONVERSAZIONE (ELIMINAZIONE UTENTE DAL GRUPPO)
    // // tslint:disable-next-line:max-line-length
    // that.g.wdLog(['setSubscriptions!!!! StartRating', this.starRatingWidgetService.obsCloseConversation, this.starRatingWidgetService]);
    // const subscriptionisOpenStartRating: Subscription = this.starRatingWidgetService.obsCloseConversation
    // .subscribe(isOpenStartRating => {
    //   that.g.setParameter('isOpenStartRating', isOpenStartRating);
    //   if (isOpenStartRating === false) {
    //       that.g.wdLog(['CHIUDOOOOO!!!! StartRating']);
    //   } else if (isOpenStartRating === true) {
    //       that.g.wdLog(['APROOOOOOOO!!!! StartRating']);
    //   }
    // });
    // this.subscriptions.push(subscriptionisOpenStartRating);
    // console.log('---------------------->', this.subscriptions);
    // NUOVO MESSAGGIO!!
    /**
     * se:          non sto già scrollando oppure il messaggio l'ho inviato io -> scrollToBottom
     * altrimenti:  se esiste scrollMe (div da scrollare) verifico la posizione
     *  se:         sono alla fine della pagina scrollo alla fine
     *  altrimenti: aumento il badge
     */
    // const obsAddedMessage: Subscription = this.messagingService.obsAdded
    // .subscribe(newMessage => {
    //   that.g.wdLog(['Subscription NEW MSG', newMessage]);
    //   const senderId = that.g.senderId;
    //   if ( that.startScroll || newMessage.sender === senderId) {
    //     that.g.wdLog(['*A 1-------']);
    //     setTimeout(function () {
    //       that.scrollToBottom();
    //     }, 200);
    //   } else if (that.scrollMe) {
    //     const divScrollMe = that.scrollMe.nativeElement;
    //     const checkContentScrollPosition = that.checkContentScrollPosition(divScrollMe);
    //     if (checkContentScrollPosition) {
    //       that.g.wdLog(['*A2-------']);
    //       // https://developer.mozilla.org/it/docs/Web/API/Element/scrollHeight
    //       setTimeout(function () {
    //         that.scrollToBottom();
    //       }, 0);
    //     } else {
    //       that.g.wdLog(['*A3-------']);
    //       that.NUM_BADGES++;
    //       // that.soundMessage(newMessage.timestamp);
    //     }
    //   }

    //   /**
    //    *
    //    */
    //   if (newMessage && newMessage.text && that.lastMsg) {
    //     setTimeout(function () {
    //       let messaggio = '';
    //       const testFocus = ((document.getElementById('testFocus') as HTMLInputElement));
    //       const altTextArea = ((document.getElementById('altTextArea') as HTMLInputElement));
    //       if (altTextArea && testFocus) {
    //         setTimeout(function () {
    //           if (newMessage.sender !== that.g.senderId) {
    //             messaggio += 'messaggio ricevuto da operatore: ' + newMessage.sender_fullname;
    //             altTextArea.innerHTML =  messaggio + ',  testo messaggio: ' + newMessage.text;
    //             testFocus.focus();
    //           }
    //         }, 1000);
    //       }
    //     }, 1000);
    //   }

    // });
    // this.subscriptions.push(obsAddedMessage);
    

    //this.subscriptionTyping();
  }

  checkMessagesLegntForTranscriptDownloadMenuOption(){
    if(this.messages.length > 1 && this.g.allowTranscriptDownload){
      this.isTrascriptDownloadEnabled = true
    }
  }
  // NUOVO MESSAGGIO!!
  /**
   * se:          non sto già scrollando oppure il messaggio l'ho inviato io -> scrollToBottom
   * altrimenti:  se esiste scrollMe (div da scrollare) verifico la posizione
   *  se:         sono alla fine della pagina scrollo alla fine
   *  altrimenti: aumento il badge
   */
  newMessageAdded(msg){
    const that = this;
    const senderId = that.senderId;
      if (msg.sender === senderId) { //caso in cui sender manda msg
        that.logger.debug('[CONV-COMP] *A1-------');
        setTimeout(function () {
          that.conversationContent.scrollToBottom();
        }, 200);
      } else if (msg.sender !== senderId) { //caso in cui operatore manda msg
        const checkContentScrollPosition = that.conversationContent.checkContentScrollPosition();
        if (checkContentScrollPosition) {
          that.logger.debug('[CONV-COMP] *A2-------');
          // https://developer.mozilla.org/it/docs/Web/API/Element/scrollHeight
          setTimeout(function () {
            that.conversationContent.scrollToBottom();
          }, 0);
        } else {
          that.logger.debug('[CONV-COMP] *A3-------');
          that.messagesBadgeCount++;
          // that.soundMessage(msg.timestamp);
        }

        // check if sender can reply --> set footer active/disabled
        if(msg.attributes && msg.attributes['hideTextReply']){
          this.hideFooterTextReply = msg.attributes['hideTextReply']
          if(msg.attributes['typeMessagePlaceholder']) {
            this.hideFooterMessagePlaceholder = msg.attributes['typeMessagePlaceholder']
          }
        } else if (msg.attributes && !msg.attributes['hideTextReply']) {
          this.hideFooterTextReply = false
        }

        //check if user has changed userFullName and userEmail
        if (msg.attributes && msg.attributes['updateUserFullname']) {
          const userFullname = msg.attributes['updateUserFullname'];
          that.logger.debug('[CONV-COMP] newMessageAdded --> updateUserFullname', userFullname)
          that.g.setAttributeParameter('userFullname', userFullname);
          that.g.setParameter('userFullname', userFullname);
          that.appStorageService.setItem('attributes', JSON.stringify(that.g.attributes));
        }
        if (msg.attributes && msg.attributes['updateUserEmail']) {
          const userEmail = msg.attributes['updateUserEmail'];
          console.log('[CONV-COMP] newMessageAdded --> userEmail', userEmail)
          that.g.setAttributeParameter('userEmail', userEmail);
          that.g.setParameter('userEmail', userEmail);
          that.appStorageService.setItem('attributes', JSON.stringify(that.g.attributes));
        }
      }

  }

  /**
   *
   */
  // private checkWritingMessages() {
  //   const that = this;
  //   const tenant = this.g.tenant;
  //   try {
  //     const messagesRef = this.messagingService.checkWritingMessages(tenant, this.conversationWith);
  //     if (messagesRef) {
  //       messagesRef.on('value', function (writing) {
  //         if (writing.exists()) {
  //             that.writingMessage = that.g.LABEL_WRITING;
  //         } else {
  //             that.writingMessage = '';
  //         }
  //       });
  //     }
  //   } catch (e) {
  //     this.g.wdLog(['> Error :' + e]);
  //   }
  // }


  /**
   *
   */
    //checkListMessages() {
    // const that = this;
    // this.messagingService.checkListMessages(this.conversationWith)
    // .then(function (snapshot) {
    //       that.g.wdLog(['checkListMessages: ', snapshot);
    //     if (snapshot.exists()) {
    //         that.isNewConversation = false;
    //           that.g.wdLog(['IS NOT NEW CONVERSATION ?', that.isNewConversation);
    //         setTimeout(function () {
    //             if (that.messages.length === 0) {
    //                 that.isNewConversation = true;
    //             }
    //         }, 2000);
    //         // that.isLogged = true;
    //         //   that.g.wdLog(['IS_LOGGED', 'AppComponent:createConversation:snapshot.exists-if', that.isLogged);
    //         // that.setFocusOnId('chat21-main-message-context');
    //     } else {
    //         /**
    //          * se è una nuova conversazione:
    //          * verifico se departmentId e projectid sono settati
    //          * focus sul input messaggio
    //          */
    //         that.isNewConversation = true;
    //           that.g.wdLog(['IS NEW CONVERSATION ?', that.isNewConversation);
    //         //if (that.g.projectid && !that.g.attributes.departmentId) {
    //             // that.isLogged = false;
    //             //   that.g.wdLog(["IS_LOGGED", "AppComponent:createConversation:snapshot.exists-else-!department", that.isLogged);
    //             //that.getMongDbDepartments();
    //         //} else {
    //             that.setFocusOnId('chat21-main-message-context');
    //             //that.isLogged = true;
    //             //  that.g.wdLog(['IS_LOGGED', 'AppComponent:createConversation:snapshot.exists-else-department', that.isLogged);
    //         //}
    //     }

    //     setTimeout(function () {
    //           that.g.wdLog(['GET listMessages: ', that.conversationWith);
    //         that.messagingService.listMessages(that.conversationWith);
    //     }, 500);


    // }).catch(function (error) {
    //     console.error('checkListMessages ERROR: ', error);
    // });
    //}




  // setFocusOnId(id) {
  //   setTimeout(function () {
  //       const textarea = document.getElementById(id);
  //       if (textarea) {
  //           //   that.g.wdLog(['1--------> FOCUSSSSSS : ', textarea);
  //           textarea.setAttribute('value', ' ');
  //           textarea.focus();
  //       }
  //   }, 500);
  // }




  // /**
  //  * quando premo un tasto richiamo questo metodo che:
  //  * verifica se è stato premuto 'invio'
  //  * se si azzera testo
  //  * imposta altezza campo come min di default
  //  * leva il focus e lo reimposta dopo pochi attimi
  //  * (questa è una toppa per mantenere il focus e eliminare il br dell'invio!!!)
  //  * invio messaggio
  //  * @param event
  //  */
  // onkeypress(event) {
  //   const keyCode = event.which || event.keyCode;
  //   this.textInputTextArea = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);
  //   // this.g.wdLog(['onkeypress **************', this.textInputTextArea]);
  //   if (keyCode === 13) {
  //       this.performSendingMessage();
  //   } else if (keyCode === 9) {
  //     event.preventDefault();
  //   }
  // }

  // private performSendingMessage() {
  //     // const msg = document.getElementsByClassName('f21textarea')[0];
  //     let msg = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);
  //     if (msg && msg.trim() !== '') {
  //         //   that.g.wdLog(['sendMessage -> ', this.textInputTextArea);
  //         // this.resizeInputField();
  //         // this.messagingService.sendMessage(msg, TYPE_MSG_TEXT);
  //         // this.setDepartment();
  //         msg = replaceBr(msg);
  //         this.sendMessage(msg, TYPE_MSG_TEXT);
  //         // this.restoreTextArea();
  //     }
  //     // (<HTMLInputElement>document.getElementById('chat21-main-message-context')).value = '';
  //     // this.textInputTextArea = '';
  //     // this.restoreTextArea();
  // }

  // private restoreTextArea() {
  //   //   that.g.wdLog(['AppComponent:restoreTextArea::restoreTextArea');
  //   this.resizeInputField();
  //   const textArea = (<HTMLInputElement>document.getElementById('chat21-main-message-context'));
  //   this.textInputTextArea = ''; // clear the textarea
  //   if (textArea) {
  //       textArea.value = '';  // clear the textarea
  //       textArea.placeholder = this.g.LABEL_PLACEHOLDER;  // restore the placholder
  //       this.g.wdLog(['AppComponent:restoreTextArea::restoreTextArea::textArea:', 'restored']);
  //   } else {
  //         console.error('AppComponent:restoreTextArea::restoreTextArea::textArea:', 'not restored');
  //   }
  //   this.setFocusOnId('chat21-main-message-context');
  // }


  // /**
  //    * invio del messaggio
  //    * @param msg
  //    * @param type
  //    * @param metadata
  //    * @param additional_attributes
  //    */
  //   sendMessage(msg, type, metadata?, additional_attributes?) { // sponziello
  //     (metadata) ? metadata = metadata : metadata = '';
  //     this.g.wdLog(['SEND MESSAGE: ', msg, type, metadata, additional_attributes]);
  //     if (msg && msg.trim() !== '' || type === TYPE_MSG_IMAGE || type === TYPE_MSG_FILE ) {
  //         let recipientFullname = this.g.GUEST_LABEL;
  //          // sponziello: adds ADDITIONAL ATTRIBUTES TO THE MESSAGE
  //         const g_attributes = this.g.attributes;
  //         // added <any> to resolve the Error occurred during the npm installation: Property 'userFullname' does not exist on type '{}'
  //         const attributes = <any>{};
  //         if (g_attributes) {
  //           for (const [key, value] of Object.entries(g_attributes)) {
  //             attributes[key] = value;
  //           }
  //         }
  //         if (additional_attributes) {
  //           for (const [key, value] of Object.entries(additional_attributes)) {
  //             attributes[key] = value;
  //           }
  //         }
  //          // fine-sponziello
  //         const projectid = this.g.projectid;
  //         const channelType = this.g.channelType;
  //         const userFullname = this.g.userFullname;
  //         const userEmail = this.g.userEmail;
  //         const widgetTitle = this.g.widgetTitle;
  //         const conversationWith = this.conversationWith;
  //         this.triggerBeforeSendMessageEvent(
  //           recipientFullname,
  //           msg,
  //           type,
  //           metadata,
  //           conversationWith,
  //           recipientFullname,
  //           attributes,
  //           projectid,
  //           channelType
  //         );
  //         if (userFullname) {
  //           recipientFullname = userFullname;
  //         } else if (userEmail) {
  //           recipientFullname = userEmail;
  //         } else if (attributes && attributes['userFullname']) {
  //           recipientFullname = attributes['userFullname'];
  //         } else {
  //           recipientFullname = this.g.GUEST_LABEL;
  //         }
  //         const messageSent = this.messagingService.sendMessage(
  //           recipientFullname,
  //           msg,
  //           type,
  //           metadata,
  //           conversationWith,
  //           recipientFullname,
  //           attributes,
  //           projectid,
  //           channelType
  //         );
  //         this.triggerAfterSendMessageEvent(messageSent);
  //         this.isNewConversation = false;

  //         try {
  //           const target = document.getElementById('chat21-main-message-context') as HTMLInputElement;
  //           target.value = '';
  //           target.style.height = this.HEIGHT_DEFAULT;
  //           // console.log('target.style.height: ', target.style.height);
  //         } catch (e) {
  //           this.g.wdLog(['> Error :' + e]);
  //         }
  //         this.restoreTextArea();
  //     }
  // }

  // printMessage(message, messageEl, component) {
  //   const messageOBJ = { message: message, sanitizer: this.sanitizer, messageEl: messageEl, component: component}
  //   this.onBeforeMessageRender.emit(messageOBJ)
  //   const messageText = message.text;
  //   this.onAfterMessageRender.emit(messageOBJ)
  //   // this.triggerBeforeMessageRender(message, messageEl, component);
  //   // const messageText = message.text;
  //   // this.triggerAfterMessageRender(message, messageEl, component);
  //   return messageText;
  // }



  /**
   *
   */

  // onSendPressed(event) {
  //   this.g.wdLog(['onSendPressed:event', event]);
  //   this.g.wdLog(['AppComponent::onSendPressed::isFilePendingToUpload:', this.isFilePendingToUpload]);
  //   if (this.isFilePendingToUpload) {
  //     this.g.wdLog(['AppComponent::onSendPressed', 'is a file']);
  //     // its a file
  //     this.loadFile();
  //     this.isFilePendingToUpload = false;
  //     // disabilito pulsanti
  //     this.g.wdLog(['AppComponent::onSendPressed::isFilePendingToUpload:', this.isFilePendingToUpload]);
  //   } else {
  //     if ( this.textInputTextArea.length > 0 ) {
  //       this.g.wdLog(['AppComponent::onSendPressed', 'is a message']);
  //       // its a message
  //       this.performSendingMessage();
  //       // restore the text area
  //       // this.restoreTextArea();
  //     }
  //   }
  // }

/**
     * recupero url immagine profilo
     * @param uid
  //    */
  //   getUrlImgProfile(uid: string) {
  //     const baseLocation = this.g.baseLocation;
  //     if (!uid || uid === 'system' ) {
  //       return baseLocation + IMG_PROFILE_BOT;
  //     } else if ( uid === 'error') {
  //       return baseLocation + IMG_PROFILE_DEFAULT;
  //     } else {
  //         return getImageUrlThumb(uid);
  //     }
  //     // if (!uid) {
  //     //   return this.IMG_PROFILE_SUPPORT;
  //     // }
  //     // const profile = this.contactService.getContactProfile(uid);
  //     // if (profile && profile.imageurl) {
  //     //       that.g.wdLog(['profile::', profile, ' - profile.imageurl', profile.imageurl);
  //     //     return profile.imageurl;
  //     // } else {
  //     //     return this.IMG_PROFILE_SUPPORT;
  //     // }
  // }

  /**
     * ridimensiona la textarea
     * chiamato ogni volta che cambia il contenuto della textarea
     * imposto stato 'typing'
     */
  //   resizeInputField() {
  //     try {
  //       const target = document.getElementById('chat21-main-message-context') as HTMLInputElement;
  //       // tslint:disable-next-line:max-line-length
  //       //   that.g.wdLog(['H:: this.textInputTextArea', (document.getElementById('chat21-main-message-context') as HTMLInputElement).value , target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
  //       target.style.height = '100%';
  //       if (target.value === '\n') {
  //           target.value = '';
  //           target.style.height = this.HEIGHT_DEFAULT;
  //       } else if (target.scrollHeight > target.offsetHeight) {
  //           target.style.height = target.scrollHeight + 2 + 'px';
  //           target.style.minHeight = this.HEIGHT_DEFAULT;
  //       } else {
  //           //   that.g.wdLog(['PASSO 3');
  //           target.style.height = this.HEIGHT_DEFAULT;
  //           // segno sto scrivendo
  //           // target.offsetHeight - 15 + 'px';
  //       }
  //       this.setWritingMessages(target.value);
  //     } catch (e) {
  //       this.g.wdLog(['> Error :' + e]);
  //     }
  //     // tslint:disable-next-line:max-line-length
  //     //   that.g.wdLog(['H:: this.textInputTextArea', this.textInputTextArea, target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
  // }


  // ========= begin:: typing ======= //

  /**
   *
   * @param str
   */
  // setWritingMessages(str) {
  //   //this.messagingService.setWritingMessages(str, this.g.channelType);
  //   this.typingService.setTyping(this.conversation.uid, str, this.g.senderId, this.getUserFUllName() )
  // }

  /**
   *
   * @param memberID
   */
  // checkMemberId(memberID) {
  //   const that = this;
  //    // && memberID.trim() !== 'system'
  //   if ( memberID.trim() !== '' && memberID.trim() !== this.g.senderId
  //   ) {
  //     if (that.isTypings === false) {
  //       that.isTypings = true;
  //     }
  //   } else {
  //     that.isTypings = false;
  //   }
  // }
  // ================================ //


  // ========= begin:: functions scroll position ======= //
  /**
   *
   */
  // LISTEN TO SCROLL POSITION
  // onScroll(event: any): void {
  //   // console.log('************** SCROLLLLLLLLLL *****************');
  //   this.startScroll = false;
  //   if (this.scrollMe) {
  //     const divScrollMe = this.scrollMe.nativeElement;
  //     const checkContentScrollPosition = this.checkContentScrollPosition(divScrollMe);
  //     if (checkContentScrollPosition) {
  //       this.showBadgeScroollToBottom = false;
  //       this.NUM_BADGES = 0;
  //     } else {
  //       this.showBadgeScroollToBottom = true;
  //     }
  //   }
  // }

  /**
   *
   */
  // checkContentScrollPosition(divScrollMe): boolean {
  //   //   that.g.wdLog(['checkContentScrollPosition ::', divScrollMe);
  //   //   that.g.wdLog(['divScrollMe.diff ::', divScrollMe.scrollHeight - divScrollMe.scrollTop);
  //   //   that.g.wdLog(['divScrollMe.clientHeight ::', divScrollMe.clientHeight);
  //   if (divScrollMe.scrollHeight - divScrollMe.scrollTop <= (divScrollMe.clientHeight + 40)) {
  //     this.g.wdLog(['SONO ALLA FINE ::']);
  //       return true;
  //   } else {
  //     this.g.wdLog([' NON SONO ALLA FINE ::']);
  //       return true;
  //   }
  // }

  /**
   * scrollo la lista messaggi all'ultimo
   * chiamato in maniera ricorsiva sino a quando non risponde correttamente
  */

//  scrollToBottomStart() {
//   const that = this;
//   if ( this.isScrolling === false ) {
//     setTimeout(function () {
//       try {
//         that.isScrolling = true;
//         const objDiv = document.getElementById(that.idDivScroll);
//         setTimeout(function () {
//           that.g.wdLog(['objDiv::', objDiv.scrollHeight]);
//           //objDiv.scrollIntoView(false);
//           objDiv.style.opacity = '1';
//         }, 200);
//         that.isScrolling = false;
//       } catch (err) {
//         that.g.wdLog(['> Error :' + err]);
//       }
//     }, 0);
//   }
// }

  /**
   * scrollo la lista messaggi all'ultimo
   * chiamato in maniera ricorsiva sino a quando non risponde correttamente
  */

 scrollToBottom(withoutAnimation?: boolean) {
  this.conversationContent.scrollToBottom();
  // const that = this;
  //  try {
  //   that.isScrolling = true;
  //   const objDiv = document.getElementById(that.idDivScroll) as HTMLElement;
  //   console.log('divto scrool', objDiv);
  //   // const element = objDiv[0] as HTMLElement;
  //   setTimeout(function () {

  //     if (that.isIE === true || withoutAnimation === true || that.firstScroll === true) {
  //       objDiv.parentElement.classList.add('withoutAnimation');
  //     } else {
  //       objDiv.parentElement.classList.remove('withoutAnimation');
  //     }
  //     objDiv.parentElement.scrollTop = objDiv.scrollHeight;
  //     objDiv.style.opacity = '1';
  //     that.firstScroll = false;
  //   }, 0);
  // } catch (err) {
  //   that.g.wdLog(['> Error :' + err]);
  // }
  // that.isScrolling = false;
 }

//  scrollToBottom_old(withoutAnimation?: boolean) {
//   this.g.wdLog([' scrollToBottom: ', this.isScrolling]);
//   const that = this;
//   // const divScrollMe = this.scrollMe.nativeElement;

//   if ( this.isScrolling === false ) {
//     // const divScrollMe = this.scrollMe.nativeElement;
//     setTimeout(function () {
//       try {
//         that.isScrolling = true;
//         const objDiv = document.getElementById(that.idDivScroll);
//         setTimeout(function () {
//           try {
//             if (that.isIE === true || withoutAnimation === true) {
//               objDiv.scrollIntoView(false);
//             } else {
//               objDiv.scrollIntoView({behavior: 'smooth', block: 'end'});
//             }
//             that.g.wdLog(['objDiv::', objDiv.scrollHeight]);
//           } catch (err) {
//             that.g.wdLog(['> Error :' + err]);
//           }
//           // objDiv.scrollIntoView(false);
//         }, 0);
//         that.isScrolling = false;

//         //// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
//         // setTimeout(function () {
//         //   objDiv.scrollIntoView({behavior: 'smooth', block: 'end'});
//         // }, 500);

//         // let checkContentScrollPosition = false;
//         // do {
//         //   setTimeout(function () {
//         //     that.g.wdLog(['RIPROVO dopo 1 sec::']);
//         //     objDiv.scrollIntoView({behavior: 'smooth', block: 'end'});
//         //     checkContentScrollPosition = that.checkContentScrollPosition(divScrollMe);
//         //   }, 1000);
//         // }
//         // while (checkContentScrollPosition === false);
//         // that.isScrolling = false;

//         //   that.g.wdLog(['checkContentScrollPosition ::', this.divScrollMe);
//         //   that.g.wdLog(['divScrollMe.diff ::', this.divScrollMe.scrollHeight - this.divScrollMe.scrollTop);
//         //   that.g.wdLog(['divScrollMe.clientHeight ::', this.divScrollMe.clientHeight);
//         // try {
//         //   this.divScrollMe.nativeElement.scrollToTop = this.divScrollMe.nativeElement.scrollHeight;
//         // } catch ( err ) { }
//         // // that.badgeNewMessages = 0;
//         // console.log(objDiv);
//       } catch (err) {
//           that.g.wdLog(['> Error :' + err]);
//           setTimeout(function () {
//             that.isScrolling = false;
//           }, 0);
//       }
//     }, 0);
//   }
// }

  // ========= end:: functions scroll position ======= //




// ========= begin:: functions send image ======= //
  // START LOAD IMAGE //
  /**
   * carico in locale l'immagine selezionata e apro pop up anteprima
   */
  // detectFiles(event) {
  //   this.g.wdLog(['detectFiles: ', event]);

  //   if (event) {
  //       this.selectedFiles = event.target.files;
  //       this.g.wdLog(['AppComponent:detectFiles::selectedFiles', this.selectedFiles]);
  //       if (this.selectedFiles == null) {
  //         this.isFilePendingToUpload = false;
  //       } else {
  //         this.isFilePendingToUpload = true;
  //       }
  //       this.g.wdLog(['AppComponent:detectFiles::selectedFiles::isFilePendingToUpload', this.isFilePendingToUpload]);
  //       this.g.wdLog(['fileChange: ', event.target.files]);
  //       if (event.target.files.length <= 0) {
  //         this.isFilePendingToUpload = false;
  //       } else {
  //         this.isFilePendingToUpload = true;
  //       }
  //       const that = this;
  //       if (event.target.files && event.target.files[0]) {
  //           const nameFile = event.target.files[0].name;
  //           const typeFile = event.target.files[0].type;
  //           const reader = new FileReader();
  //             that.g.wdLog(['OK preload: ', nameFile, typeFile, reader]);
  //           reader.addEventListener('load', function () {
  //               that.g.wdLog(['addEventListener load', reader.result]);
  //             that.isFileSelected = true;
  //             // se inizia con image
  //             if (typeFile.startsWith('image')) {
  //               const imageXLoad = new Image;
  //               that.g.wdLog(['onload ', imageXLoad]);
  //               imageXLoad.src = reader.result.toString();
  //               imageXLoad.title = nameFile;
  //               imageXLoad.onload = function () {
  //                 that.g.wdLog(['onload immagine']);
  //                 // that.arrayFilesLoad.push(imageXLoad);
  //                 const uid = (new Date().getTime()).toString(36); // imageXLoad.src.substring(imageXLoad.src.length - 16);
  //                 that.arrayFilesLoad[0] = { uid: uid, file: imageXLoad, type: typeFile };
  //                 that.g.wdLog(['OK: ', that.arrayFilesLoad[0]]);
  //                 // INVIO MESSAGGIO
  //                 that.loadFile();
  //               };
  //             } else {
  //               that.g.wdLog(['onload file']);
  //               const fileXLoad = {
  //                 src: reader.result.toString(),
  //                 title: nameFile
  //               };
  //               // that.arrayFilesLoad.push(imageXLoad);
  //               const uid = (new Date().getTime()).toString(36); // imageXLoad.src.substring(imageXLoad.src.length - 16);
  //               that.arrayFilesLoad[0] = { uid: uid, file: fileXLoad, type: typeFile };
  //               that.g.wdLog(['OK: ', that.arrayFilesLoad[0]]);
  //               // INVIO MESSAGGIO
  //               that.loadFile();
  //             }
  //           }, false);

  //           if (event.target.files[0]) {
  //             reader.readAsDataURL(event.target.files[0]);
  //               that.g.wdLog(['reader-result: ', event.target.files[0]]);
  //           }
  //       }
  //   }
  // }


  // loadFile() {
  //   this.g.wdLog(['that.fileXLoad: ', this.arrayFilesLoad]);
  //       // al momento gestisco solo il caricamento di un'immagine alla volta
  //       if (this.arrayFilesLoad[0] && this.arrayFilesLoad[0].file) {
  //           const fileXLoad = this.arrayFilesLoad[0].file;
  //           const uid = this.arrayFilesLoad[0].uid;
  //           const type = this.arrayFilesLoad[0].type;
  //           this.g.wdLog(['that.fileXLoad: ', type]);
  //           let metadata;
  //           if (type.startsWith('image')) {
  //               metadata = {
  //                   'name': fileXLoad.title,
  //                   'src': fileXLoad.src,
  //                   'width': fileXLoad.width,
  //                   'height': fileXLoad.height,
  //                   'type': type,
  //                   'uid': uid
  //               };
  //           } else {
  //               metadata = {
  //                   'name': fileXLoad.title,
  //                   'src': fileXLoad.src,
  //                   'type': type,
  //                   'uid': uid
  //               };
  //           }
  //           this.g.wdLog(['metadata -------> ', metadata]);
  //           // this.scrollToBottom();
  //           // 1 - aggiungo messaggio localmente
  //           // this.addLocalMessageImage(metadata);
  //           // 2 - carico immagine
  //           const file = this.selectedFiles.item(0);
  //           this.uploadSingle(metadata, file);
  //           // this.isSelected = false;
  //       }
  //   }


  /**
   *
   */
    // uploadSingle(metadata, file) {
    //     const that = this;
    //     const send_order_btn = <HTMLInputElement>document.getElementById('chat21-start-upload-doc');
    //     send_order_btn.disabled = true;
    //     that.g.wdLog(['AppComponent::uploadSingle::', metadata, file]);
    //     // const file = this.selectedFiles.item(0);
    //     const currentUpload = new UploadModel(file);
    //     // console.log(currentUpload.file);

    //     const uploadTask = this.upSvc.pushUpload(currentUpload);
    //     uploadTask.then(snapshot => {
    //         return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
    //     })
    //         .then(downloadURL => {
    //               that.g.wdLog(['AppComponent::uploadSingle:: downloadURL', downloadURL]);
    //               that.g.wdLog([`Successfully uploaded file and got download link - ${downloadURL}`]);

    //             metadata.src = downloadURL;
    //             let type_message = TYPE_MSG_TEXT;
    //             let message = 'File: ' + metadata.src;
    //             if (metadata.type.startsWith('image')) {
    //                 type_message = TYPE_MSG_IMAGE;
    //                 message = ''; // 'Image: ' + metadata.src;
    //             }
    //             that.sendMessage(message, type_message, metadata);
    //             that.isFilePendingToUpload = false;
    //             // return downloadURL;
    //         })
    //         .catch(error => {
    //             // Use to signal error if something goes wrong.
    //             console.error(`AppComponent::uploadSingle:: Failed to upload file and get link - ${error}`);
    //         });
    //   // this.resetLoadImage();
    //     that.g.wdLog(['reader-result: ', file]);
    // }


    /**
     *
     * @param message
     */
    // getSizeImg(message): any {
    //   const metadata = message.metadata;
    //   // const MAX_WIDTH_IMAGES = 300;
    //   const sizeImage = {
    //       width: metadata.width,
    //       height: metadata.height
    //   };
    //   //   that.g.wdLog(['message::: ', metadata);
    //   if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
    //       const rapporto = (metadata['width'] / metadata['height']);
    //       sizeImage.width = MAX_WIDTH_IMAGES;
    //       sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
    //   }
    //   return sizeImage; // h.toString();
    // }

  /**
     * aggiorno messaggio: uid, status, timestamp, headerDate
     * richiamata alla sottoscrizione dell'aggiunta di un nw messaggio
     * in caso in cui il messaggio è un'immagine ed è stata inviata dall'utente
     */
    updateMessage(message) {
      this.logger.debug('[CONV-COMP] UPDATE MSG:', message.metadata.uid);
      const index = searchIndexInArrayForUid(this.messages, message.metadata.uid);
      if (index > -1) {
          this.messages[index].uid = message.uid;
          this.messages[index].status = message.status;
          this.messages[index].timestamp = message.timestamp;
          this.logger.debug('[CONV-COMP] UPDATE ok:', this.messages[index]);
      } else {
          this.messages.push(message);
      }
  }




  /**
     *
     */
  // resetLoadImage() {
  //     this.nameFile = '';
  //     this.selectedFiles = null;
  //       that.g.wdLog(['1 selectedFiles: ', this.selectedFiles);

  //     delete this.arrayFiles4Load[0];
  //     document.getElementById('chat21-file').nodeValue = null;
  //     // event.target.files[0].name, event.target.files
  //     this.isSelected = false;

  //     this.isFilePendingToUpload = false;
  //       that.g.wdLog(['AppComponent::resetLoadImage::isFilePendingToUpload:', this.isFilePendingToUpload);

  //     // this.restoreTextArea();
  // }

  /**
     * salvo un messaggio localmente nell'array dei msg
     * @param metadata
     */
  //   addLocalMessageImage(metadata) {

  //     const now: Date = new Date();
  //     const timestamp = now.valueOf();
  //     const language = document.documentElement.lang;

  //     let recipientFullname;
  //     if (this.userFullname) {
  //         recipientFullname = this.userFullname;
  //     } else if (this.userEmail) {
  //         recipientFullname = this.userEmail;
  //     } else {
  //         recipientFullname = this.GUEST_LABEL;
  //     }
  //     // const projectname = (this.projectname) ? this.projectname : this.projectid;

  //     // set senderFullname
  //     const senderFullname = recipientFullname;

  //     const message = new MessageModel(
  //         metadata.uid, // uid
  //         language, // language
  //         this.conversationWith, // recipient
  //         recipientFullname, // recipient_fullname
  //         this.senderId, // sender
  //         senderFullname, // sender_fullname
  //         '', // status
  //         metadata, // metadata
  //         '', // text
  //         timestamp, // timestamp
  //         '', // headerDate
  //         TYPE_MSG_IMAGE, // type
  //         '',
  //         this.channelType,
  //         this.projectid
  //     );
  //     // this.messages.push(message);
  //     // message.metadata.uid = message.uid;
  //       that.g.wdLog(['addLocalMessageImage: ', this.messages);
  //     this.isSelected = true;
  // }

  // ========= end:: functions send image ======= //

  // =========== BEGIN: event emitter function ====== //
  returnHome() {
    //this.storageService.removeItem('activeConversation');
    //this.g.setParameter('activeConversation', null, false);
    this.onBackHome.emit();
  }

  returnCloseWidget() {
    //this.g.setParameter('activeConversation', null, false);
    this.onCloseWidget.emit();
  }

  returnAfterSendMessage(message: MessageModel){
    this.onAfterSendMessage.emit(message)
  }

  returnSoundChange(soundEnabled){
    this.onSoundChange.emit(soundEnabled)
  }

  returnOnBeforeMessangeSent(messageModel){
    this.onBeforeMessageSent.emit(messageModel)
  }

  returnOnBeforeMessageRender(event){
    this.onBeforeMessageRender.emit(event)
  }

  returnOnAfterMessageRender(event){
    this.onAfterMessageRender.emit(event)
  }

  returnOnScrollContent(event: boolean){
    this.showBadgeScroollToBottom = !event;
    this.logger.debug('[CONV-COMP] scroool eventtt', event)
    //se sono alla fine (showBadgeScroollBottom === true) allora imposto messageBadgeCount a 0
    if(!this.showBadgeScroollToBottom){
      this.messagesBadgeCount = 0;
      this.updateConversationBadge();
    }
    
  }

  returnOnMenuOption(event:boolean){
      this.isMenuShow = event;
  }

  /** CALLED BY: conv-footer component */
  onAttachmentButtonClicked(event: any){
    console.log('onAttachmentButtonClicked::::', event)
    this.isOpenAttachmentPreview = true
    this.attachments = event
  }

  /** CALLED BY: conv-preview component */
  onCloseModalPreview(){
    this.isOpenAttachmentPreview = false
  }

  /** CALLED BY: conv-preview component */
  onSendAttachment(messageText: string){
    console.log('sendd messageee', messageText)
    this.isOpenAttachmentPreview = false
    this.conversationFooter.uploadSingle(this.attachments[0].metadata, this.attachments[0].file, messageText)
    // send message to footer-component
  }

  returnChangeTextArea(event){
    const scrollDiv = this.conversationContent.scrollMe
    const height = +event.textAreaEl.style.height.substring(0, event.textAreaEl.style.height.length - 2);
    if(height > 20 && height < 110){
      scrollDiv.nativeElement.style.height = 'calc(100% - ' + (height - 20)+'px'
      document.getElementById('chat21-button-send').style.right = '18px'
      this.scrollToBottom()
    } else if(height <= 20) {
      scrollDiv.nativeElement.style.height = '100%'
    } else if(height > 110){
      document.getElementById('chat21-button-send').style.right = '18px'
    }
  }

  // =========== END: event emitter function ====== //


  // dowloadTranscript() {
  //   const url = this.API_URL + 'public/requests/' + this.conversationWith + '/messages.html';
  //   const windowContext = this.g.windowContext;
  //   windowContext.open(url, '_blank');
  //   this.isMenuShow  = false;
  // }


  openInputFiles() {
    alert('ok');
    if (document.getElementById('chat21-file')) {
     const docInput = document.getElementById('chat21-file');
     docInput.style.display = 'block';
    }
  }



  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
  /**
   * elimino tutte le sottoscrizioni
   */
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.logger.debug('[CONV-COMP] ngOnDestroy ------------------> this.subscriptions', this.subscriptions);
    //this.storageService.removeItem('activeConversation');
    
    this.unsubscribe();
  }


  /** */
  unsubscribe() {
    this.logger.debug('[CONV-COMP] ******* unsubscribe *******');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.chatManager.conversationsHandlerService.conversationRemoved.next(null)

    // TODO-GAB: da verificare se eliminarlo
    this.subscriptions.forEach(function (subscription) {
        subscription.value.unsubscribe();
    });
    this.subscriptions = [];
    this.subscriptions.length = 0;
    //this.messagingService.unsubscribeAllReferences();
    this.logger.debug('[CONV-COMP]this.subscriptions', this.subscriptions);
  }
  // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//



  /**
   * regola sound message:
   * se lo invio io -> NO SOUND
   * se non sono nella conversazione -> SOUND
   * se sono nella conversazione in fondo alla pagina -> NO SOUND
   * altrimenti -> SOUND
   */
  soundMessage(timestamp?) {
    if (!isJustRecived(this.g.startedAt.getTime(), timestamp)) {
      return;
    }
    const soundEnabled = this.g.soundEnabled;
    const baseLocation = this.g.baseLocation;
    if ( soundEnabled ) {
      const that = this;
      this.audio = new Audio();
      this.audio.src = baseLocation + '/assets/sounds/justsaying.mp3';
      this.audio.load();
      // console.log('conversation play');
      clearTimeout(this.setTimeoutSound);
      this.setTimeoutSound = setTimeout(function () {
        that.audio.play();
        that.logger.debug('[CONV-COMP] ****** soundMessage 1 *****', that.audio.src);
      }, 1000);
    }
  }

  // isLastMessage(idMessage: string) {
  //   // console.log('idMessage: ' + idMessage + 'id LAST Message: ' + this.messages[this.messages.length - 1].uid);
  //   if (idMessage === this.messages[this.messages.length - 1].uid) {
  //     return true;
  //   }
  //   return false;
  // }

  /** */
  // returnOnTextActionButtonClicked(event: string) {
  //   if (event) {
  //     const metadata = {
  //       'button': true
  //     };
  //     this.conversationFooter.sendMessage(event, TYPE_MSG_TEXT, metadata);
  //     // this.sendMessage($event, TYPE_MSG_TEXT);
  //   }
  // }

  /** */
  returnOnAttachmentButtonClicked(event: any) {
    this.logger.debug('[CONV-COMP] eventbutton', event)
    if (!event || !event.target.type) {
      return;
    }
    switch (event.target.type) {
      case 'url':
        try {
          this.openLink(event.target.button);
        } catch (err) {
          this.logger.error('[CONV-COMP] url > Error :' + err);
        }
        return;
      case 'action':
        try {
          this.actionButton(event.target.button);
        } catch (err) {
          this.logger.error('[CONV-COMP] action > Error :' + err);
        }
        return false;
      case 'text':
        try{
          const text = event.target.button.value
          const metadata = { 'button': true };
          this.conversationFooter.sendMessage(text, TYPE_MSG_TEXT, metadata);
        }catch(err){
          this.logger.error('[CONV-COMP] text > Error :' + err);
        }
      default: return;
    }
  }

  onOpenExternalFrame(event){
    window.open(event.link, '_blank');
  }

  onCloseInternalFrame(event){
    this.isButtonUrl = false
    this.buttonClicked = null;
  }

  /** */
  private openLink(event: any) {
    const link = event.link ? event.link : '';
    const target = event.target ? event.target : '';
    if (target === 'self') {
      // window.open(link, '_self');
      this.isButtonUrl= true;
      this.buttonClicked = event
    } else if (target === 'parent') {
      window.open(link, '_parent');
    } else {
      window.open(link, '_blank');
    }
  }

  /** */
  private actionButton(event: any) {
    // console.log(event);
    const action = event.action ? event.action : '';
    const message = event.value ? event.value : '';
    const subtype = event.show_reply ?  '' : 'info';

    const attributes = {
      action: action,
      subtype: subtype
    };
    this.conversationFooter.sendMessage(message, TYPE_MSG_TEXT, null, attributes);
    this.logger.debug('[CONV-COMP] > action :');
  }


  // ========= START:: TRIGGER FUNCTIONS ============//
  private onNewConversationComponentInit() {
    this.logger.debug('[CONV-COMP] ------- onNewConversationComponentInit ------- ');
    this.setConversation();
    // this.connectConversation();
    const newConvId = this.conversationWith;
    const default_settings = this.g.default_settings;
    const appConfigs = this.appConfigService.getConfig();

    this.onNewConversationInit.emit({ global: this.g, default_settings: default_settings, newConvId: newConvId, appConfigs: appConfigs })
  }

  // triggerBeforeMessageRender(message, messageEl, component) {
  //   // console.log('triggerBeforeMessageRender');
  //   try {
  //     // tslint:disable-next-line:max-line-length
  //     const beforeMessageRender = new CustomEvent('beforeMessageRender',
  //       { detail: { message: message, sanitizer: this.sanitizer, messageEl: messageEl, component: component} });
  //     const windowContext = this.g.windowContext;
  //     if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
  //         windowContext.tiledesk.tiledeskroot.dispatchEvent(beforeMessageRender);
  //         this.g.windowContext = windowContext;
  //     } else {
  //       const returnEventValue = this.elRoot.nativeElement.dispatchEvent(beforeMessageRender);
  //     }
  //   } catch (e) {
  //     this.g.wdLog(['> Error :' + e]);
  //   }
  // }

  // triggerAfterMessageRender(message, messageEl, component) {
  //   // console.log('triggerBeforeMessageRender');
  //   try {
  //     // tslint:disable-next-line:max-line-length
  //     const afterMessageRender = new CustomEvent('afterMessageRender',
  //       { detail: { message: message, sanitizer: this.sanitizer, messageEl: messageEl, component: component} });
  //     const windowContext = this.g.windowContext;
  //     if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
  //         windowContext.tiledesk.tiledeskroot.dispatchEvent(afterMessageRender);
  //         this.g.windowContext = windowContext;
  //     } else {
  //       const returnEventValue = this.elRoot.nativeElement.dispatchEvent(afterMessageRender);
  //     }
  //   } catch (e) {
  //     this.g.wdLog(['> Error :' + e]);
  //   }
  // }


  // tslint:disable-next-line:max-line-length
  // private triggerBeforeSendMessageEvent(senderFullname, text, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type) {
  //   try {
  //       // tslint:disable-next-line:max-line-length
  //       const onBeforeMessageSend = new CustomEvent('onBeforeMessageSend', { detail: { senderFullname: senderFullname, text: text, type: type, metadata, conversationWith: conversationWith, recipientFullname: recipientFullname, attributes: attributes, projectid: projectid, channelType: channel_type } });
  //       const windowContext = this.g.windowContext;
  //       if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
  //           windowContext.tiledesk.tiledeskroot.dispatchEvent(onBeforeMessageSend);
  //           this.g.windowContext = windowContext;
  //       } else {
  //         this.el.nativeElement.dispatchEvent(onBeforeMessageSend);
  //       }
  //   } catch (e) {
  //     this.g.wdLog(['> Error :' + e]);
  //   }
  // }

  // tslint:disable-next-line:max-line-length
  // private triggerAfterSendMessageEvent(message) {
  //   try {
  //       // tslint:disable-next-line:max-line-length
  //       const onAfterMessageSend = new CustomEvent('onAfterMessageSend', { detail: { message: message } });
  //       const windowContext = this.g.windowContext;
  //       if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
  //           windowContext.tiledesk.tiledeskroot.dispatchEvent(onAfterMessageSend);
  //           this.g.windowContext = windowContext;
  //       } else {
  //         this.el.nativeElement.dispatchEvent(onAfterMessageSend);
  //       }
  //   } catch (e) {
  //     this.g.wdLog(['> Error :' + e]);
  //   }
  // }
  
  // ========= END:: TRIGGER FUNCTIONS ============//


  /**
   * function customize tooltip
   */
  // handleTooltipEvents(event) {
  //   const that = this;
  //   const showDelay = this.tooltipOptions['showDelay'];
  //   // console.log(this.tooltipOptions);
  //   setTimeout(function () {
  //     try {
  //       const domRepresentation = document.getElementsByClassName('chat-tooltip');
  //       if (domRepresentation) {
  //         const item = domRepresentation[0] as HTMLInputElement;
  //         // console.log(item);
  //         if (!item.classList.contains('tooltip-show')) {
  //           item.classList.add('tooltip-show');
  //         }
  //         setTimeout(function () {
  //           if (item.classList.contains('tooltip-show')) {
  //             item.classList.remove('tooltip-show');
  //           }
  //         }, that.tooltipOptions['hideDelayAfterClick']);
  //       }
  //     } catch (err) {
  //         that.g.wdLog(['> Error :' + err]);
  //     }
  //   }, showDelay);
  // }
}
