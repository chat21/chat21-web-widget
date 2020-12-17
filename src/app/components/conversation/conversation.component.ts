// tslint:disable-next-line:max-line-length
import { NgZone, HostListener, ElementRef, Component, OnInit, OnChanges, OnDestroy, AfterViewInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Globals } from '../../utils/globals';
import { MessagingService } from '../../providers/messaging.service';
import { ConversationsService } from '../../providers/conversations.service';
import { AppConfigService } from '../../providers/app-config.service';

import {
  CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, TYPE_MSG_TEXT,
  MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER,
  TYPE_MSG_FILE, TYPE_MSG_IMAGE, MAX_WIDTH_IMAGES, IMG_PROFILE_BOT, IMG_PROFILE_DEFAULT,
  CONVERSATION_STATUS
} from '../../utils/constants';
import { UploadService } from '../../providers/upload.service';
import { ContactService } from '../../providers/contact.service';
import { AgentAvailabilityService } from '../../providers/agent-availability.service';
import { StarRatingWidgetService } from '../../components/star-rating-widget/star-rating-widget.service';

// models
import { ConversationModel } from '../../../models/conversation';
import { MessageModel } from '../../../models/message';
import { UploadModel } from '../../../models/upload';

// utils
import { isJustRecived, getUrlImgProfile, convertColorToRGBA, isPopupUrl, searchIndexInArrayForUid, replaceBr } from '../../utils/utils';


// Import the resized event model
import { ResizedEvent } from 'angular-resize-event/resized-event';

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

import { AppComponent } from '../../app.component';
import { StorageService } from '../../providers/storage.service';
import { DepartmentModel } from '../../../models/department';
// import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'tiledeskwidget-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {'(window:resize)': 'onResize($event)'}
})
export class ConversationComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('scrollMe') private scrollMe: ElementRef; // l'ID del div da scrollare
  @ViewChild('afConversationComponent') private afConversationComponent: ElementRef; // l'ID del div da scrollare
  // @HostListener('window:resize', ['$event'])
  // ========= begin:: Input/Output values
  @Output() eventClose = new EventEmitter();
  @Output() eventCloseWidget = new EventEmitter();
  @Output() eventNewConversation = new EventEmitter<string>();

  @Input() recipientId: string; // uid conversazione ex: support-group-LOT8SLRhIqXtR1NO...
  @Input() elRoot: ElementRef;
  @Input() conversation: ConversationModel;
  @Input() isOpen: boolean;
  // @Input() senderId: string;    // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  // @Input() departmentSelected: string;
  // ========= end:: Input/Output values

  // projectid: string;   // uid progetto passato come parametro getVariablesFromSettings o getVariablesFromAttributeHtml
  // channelType: string; // tipo di conversazione ( group / direct ) a seconda che recipientId contenga o meno 'group'
  writingMessage = '';    // messaggio sta scrivendo...
  isTypings = false;
  private setTimeoutWritingMessages;
  isMenuShow = false;
  isScrolling = false;
  isButtonsDisabled = true;
  isConversationArchived = false;

  // ========= begin:: gestione scroll view messaggi ======= //
  startScroll = true; // indica lo stato dello scroll: true/false -> è in movimento/ è fermo
  idDivScroll = 'c21-contentScroll'; // id div da scrollare
  showButtonToBottom = false;
  NUM_BADGES = 0;
  audio: any;
  // ========= end:: gestione scroll view messaggi ======= //


  // ========= begin:: send image ======= //
  selectedFiles: FileList;
  isFilePendingToUpload: Boolean = false;
  arrayFilesLoad: Array<any>;
  isFileSelected: Boolean = false;
  // ========= end:: send image ========= //




  // text used within the html
  private LABEL_PLACEHOLDER: string;
  public LABEL_SEND_NEW_MESSAGE: string;
  private API_URL: string;

  userEmail: string;
  userFullname: string;
  preChatForm = false;
  themeColor50: string;
  textInputTextArea: String;
  HEIGHT_DEFAULT = '20px';
  conversationWith: string;
  isPopupUrl = isPopupUrl;
  IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
  isNewConversation = false;
  // availableAgentsStatus = false; // indica quando è impostato lo stato degli agenti nel subscribe
  messages: Array<MessageModel>;
  recipient_fullname: string;
  // attributes: any;
  // GUEST_LABEL = '';

  CLIENT_BROWSER: string = navigator.userAgent;

  // devo inserirle nel globals
  // obsTyping: Subscription;
  subscriptions: Subscription[] = [];


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

  constructor(
    public el: ElementRef,
    public g: Globals,
    private ngZone: NgZone,
    public messagingService: MessagingService,
    public upSvc: UploadService,
    public contactService: ContactService,
    private agentAvailabilityService: AgentAvailabilityService,
    public starRatingWidgetService: StarRatingWidgetService,
    public sanitizer: DomSanitizer,
    public appComponent: AppComponent,
    public storageService: StorageService,
    public conversationsService: ConversationsService,
    public appConfigService: AppConfigService

    // public cdRef: ChangeDetectorRef
    // private translate: TranslateService
  ) {
    this.API_URL = this.appConfigService.getConfig().apiUrl;
    this.g.wdLog([' constructor conversation component ']);
    this.LABEL_SEND_NEW_MESSAGE = 'Invia un nuovo messaggio'; // this.g.LABEL_SEND_NEW_MESSAGE;
  }


  // +++++++++++++++ begin:: SYSTEM FUNCTIONS +++++++++++++++ //
  /**
   * ngOnInit
   */
  ngOnInit() {
    this.g.wdLog([' ConversationComponent ngOnInit: app-conversation ']);
    this.initSubscriptions();
  }

  /**
   * ngAfterViewInit:
   * after animation intro
   */
  ngAfterViewInit() {
    this.g.wdLog([' ConversationComponent --------ngAfterViewInit-------- ']);
    const themeColor = this.g.themeColor;
    this.themeColor50 = convertColorToRGBA(themeColor, 50);
    setTimeout(() => {
      this.g.currentConversationComponent = this;
      if (this.afConversationComponent && this.afConversationComponent.nativeElement) {
        this.afConversationComponent.nativeElement.focus();
      }
      this.setFocusOnId('chat21-main-message-context');
      this.isButtonsDisabled = false;
    }, 300);
  }

  /**
   * ngOnChanges
   */
  ngOnChanges() {
    // console.log('ConversationComponent ngOnChanges');
    if (this.isOpen === true) {
      this.updateConversationBadge();
      // this.scrollToBottom();
    }
  }

  /**
   * elimino tutte le sottoscrizioni
   */
  ngOnDestroy() {
    this.g.wdLog(['ngOnDestroy ------------------> this.subscriptions', this.subscriptions]);
    // this.storageService.removeItem('idActiveConversation');
    this.unsubscribe();
  }


  // +++++++++++++++ end:: SYSTEM FUNCTIONS +++++++++++++++ //


  // +++++++++++++++ begin:: MY FUNCTIONS +++++++++++++++ //
  /**
   * 1
   * initSubscriptions
   */
  initSubscriptions() {
    this.g.wdLog([' ConversationComponent initSubscriptions ']);
    const that = this;

    // subscriptionEndRenderMessage
    const subscriptionEndRenderMessage = this.appComponent.obsEndRenderMessage.subscribe(() => {
      this.ngZone.run(() => {
        // that.scrollToBottom();
      });
    });
    this.subscriptions.push(subscriptionEndRenderMessage);

    // subscriptionOpenConversation
    const subscriptionOpenConversation = this.appComponent.obsOpenConversation.subscribe( (data: any) => {
      console.log(' subscriptionOpenConversation -------------->' + data + '<----');
      // if (data) {
        that.conversationBuilder(data);
      // }
    });
    this.subscriptions.push(subscriptionOpenConversation);

    // subscriptionisOpenStarRating
    this.starRatingWidgetService.setOsservable(false);
    const subscriptionisOpenStarRating = this.starRatingWidgetService.obsCloseConversation.subscribe((isOpenStarRating: boolean) => {
      that.starRatingPanel(isOpenStarRating);
    });
    this.subscriptions.push(subscriptionisOpenStarRating);

    // subscriptionAddedMessage
    const subscriptionAddedMessage = this.messagingService.obsAdded.subscribe((message: any) => {
      that.messageAdded(message);
    });
    this.subscriptions.push(subscriptionAddedMessage);

    // subscriptionTyping
    const subscriptionTyping = this.messagingService.obsTyping.subscribe((childSnapshot: any) => {
      that.typing(childSnapshot);
    });
    this.subscriptions.push(subscriptionTyping);
  }

  /**
   * typing
   * @param childSnapshot
   */
  private typing(childSnapshot: any) {
    if (childSnapshot) {
      // this.isTypings = true;
      const that = this;
      this.checkMemberId(childSnapshot.key);
      clearTimeout(this.setTimeoutWritingMessages);
      this.setTimeoutWritingMessages = setTimeout(() => {
          that.isTypings = false;
          that.writingMessage = that.g.LABEL_WRITING;
      }, 2000);
    }
  }

  /**
   * Open/Close StarRating panel
   * @param isOpenStarRating
   */
  private starRatingPanel(isOpenStarRating: boolean) {
    this.g.setParameter('isOpenStarRating', isOpenStarRating);
    if (isOpenStarRating === false) {
      this.g.wdLog(['CHIUDOOOOO!!!! isOpenStarRating']);
    } else if (isOpenStarRating === true) {
      this.g.wdLog(['APROOOOOOOO!!!! isOpenStarRating']);
    }
  }

  /**
   * messageAdded
   * @param message
   * scroll element: https://developer.mozilla.org/it/docs/Web/API/Element/scrollHeight
   */
  private messageAdded(message: any) {
    this.g.wdLog(['messageAdded: ', message]);
    const that = this;
    const senderId = this.g.senderId;
    if ( this.startScroll || message.sender === senderId) {
      this.g.wdLog(['*A 1-------']);
      setTimeout(() => {
        that.scrollToBottom();
      }, 200);
    } else if (this.scrollMe) {
      const divScrollMe = this.scrollMe.nativeElement;
      const checkContentScrollPosition = this.checkContentScrollPosition(divScrollMe);
      if (checkContentScrollPosition) {
        this.g.wdLog(['*A2-------']);
        setTimeout(() => {
          that.scrollToBottom();
        }, 0);
      } else {
        this.g.wdLog(['*A3-------']);
        this.NUM_BADGES++;
        // that.soundMessage(newMessage.timestamp);
      }
    }

    if (message && message.text && this.lastMsg) {
      try {
        let messaggio = '';
        const testFocus = ((document.getElementById('testFocus') as HTMLInputElement));
        const altTextArea = ((document.getElementById('altTextArea') as HTMLInputElement));
        if (altTextArea && testFocus) {
          setTimeout(function () {
            if (message.sender !== this.g.senderId) {
              messaggio += 'messaggio ricevuto da operatore: ' + message.sender_fullname;
              altTextArea.innerHTML =  messaggio + ',  testo messaggio: ' + message.text;
              testFocus.focus();
            }
          }, 1000);
        }
      } catch (e) {
        this.g.wdLog(['> Error :' + e]);
      }
    }

  }

  /**
   * 1
   * conversationBuilder
   * @param data
   */
  conversationBuilder(data: string) {
    console.log(' subscriptionOpenConversation --------------> 0', data);
    if (data && data !== CONVERSATION_STATUS) {
      console.log(' subscriptionOpenConversation --------------> 1', data);
      this.isNewConversation = false;
      this.loadConversationDetail(data);
    } else if (data && data === CONVERSATION_STATUS) {
      console.log(' subscriptionOpenConversation --------------> 2');
      this.isNewConversation = true;
      this.createNewConversation();
    }
    this.initConversation();
    this.updateConversationBadge();
  }

  /**
   * 2
   * loadConversationDetail
   * @param idConversation
   */
  loadConversationDetail(idConversation: string) {
    console.log('loadConversationDetail::::::::::: ', idConversation);
    this.storageService.setItem('idActiveConversation', idConversation);
    const that = this;
    const tenant = this.g.tenant;
    const senderId = this.g.senderId;
    this.conversationsService.loadConversationDetail(tenant, senderId, idConversation)
    .then(function(dataSnapshot: any) {
      console.log('loadConversationDetail:: ', dataSnapshot.val());
      if (dataSnapshot.val()) {
        console.log('loadConversationDetail:: 1');
        that.conversation = dataSnapshot.val();
        that.isConversationArchived = false;
        // if (that.conversation.archived) {
        //   that.isConversationArchived = true;
        // }
      } else if (idConversation && !that.isNewConversation) {
        console.log('loadConversationDetail:: 2');
        // la conversazione è archiviata !!!
        that.isConversationArchived = true;
      } else {
        console.log('loadConversationDetail:: 3');
        that.isConversationArchived = false;
      }

      // console.log('dataSnapshot:::::::::::--> ', that.conversation, that.isNewConversation, idConversation);
    });
  }

  /**
   * 3
   * createNewConversation
   */
  createNewConversation() {
    this.g.wdLog(['AppComponent::startNwConversation 222']);
    const newUidConversation = this.generateNewUidConversation();
    this.g.setParameter('recipientId', newUidConversation);
    this.g.wdLog([' recipientId: ', this.g.recipientId]);
    this.loadConversationDetail(newUidConversation);
    this.triggerNewConversationEvent(newUidConversation);
  }

  /**
   * genero un nuovo conversationWith
   * al login o all'apertura di una nuova conversazione
   */
  generateNewUidConversation() {
    this.g.wdLog(['generateUidConversation **************: senderId= ', this.g.senderId]);
    return this.messagingService.generateUidConversation(this.g.senderId);
  }

  /**
   * updateConversationBadge
   */
  updateConversationBadge() {
    if (this.conversation) {
      this.conversationsService.updateIsNew(this.conversation);
      this.conversationsService.updateConversationBadge();
    }
  }

  /**
   * initConversation
   */
  initConversation() {
    this.messages = [];
    this.g.wdLog([' ---------------- 2: setConversation ---------------------- ']);
    this.setConversation();
    this.g.wdLog([' ---------------- 3: connectConversation ---------------------- ']);
    this.connectConversation();
    this.g.wdLog([' ---------------- 4: initializeChatManager ------------------- ']);
    this.initializeChatManager();

    // sponziello, commentato
    // this.g.wdLog([' ---------------- 5: setAvailableAgentsStatus ---------------- ']);
    // this.setAvailableAgentsStatus();

    // this.g.wdLog([' ---------------- 6: activeConversation ------------------- ', this.conversation]);
    // if (this.conversation) {
    //   this.g.setParameter('activeConversation', this.conversation, true);
    // }
    // this.checkListMessages();

    if (this.g.customAttributes && this.g.customAttributes.recipient_fullname) {
      this.g.recipientFullname = this.g.customAttributes.recipient_fullname;
    }
    // this.storageService.setItem('idActiveConversation', this.conversationWith);
  }

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
    // se recipientId lo imposto in global-setting prendendolo dall'url se esiste!
    // altrimenti lo imposto recuperandolo dal localStorage se esiste
    // altrimenti genero un uid per la nuova conversazione
    let recipientId = this.g.recipientId;
    this.g.wdLog(['setConversation recipientId::: ', recipientId]);
    const senderId = this.g.senderId;
    if ( !recipientId ) {
      let recipientIdTEMP = this.storageService.getItem('idActiveConversation');
      // let recipientIdTEMP = this.setRecipientId(senderId);
      if (!recipientIdTEMP) {
        recipientIdTEMP = this.messagingService.generateUidConversation(senderId);
      }
      recipientId = recipientIdTEMP;
    }
    this.g.setParameter('recipientId', recipientId);


    const channelType = this.g.channelType;
    this.g.wdLog(['setConversation channelType::: ', channelType]);
    if ( !channelType ) { this.g.setParameter('channelType', this.setChannelType()); }
    this.conversationWith = recipientId; // as string;
  }

  /**
   *
   */
  // private setRecipientId(senderId: string) {
  //   const recipientIdTEMP = this.storageService.getItem(senderId);
  //   return recipientIdTEMP;
  // }


  /**
   *
   */
  private setChannelType() {
    let channelTypeTEMP = CHANNEL_TYPE_GROUP;
    const projectid = this.g.projectid;
    if (this.recipientId && this.recipientId.indexOf('group') !== -1) {
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
  private connectConversation() {
    const senderId = this.g.senderId;
    const tenant = this.g.tenant;
    const channelType = this.g.channelType;
    if (!this.conversationWith && this.g.recipientId) {
      this.conversationWith = this.g.recipientId;
    }
    // console.log('connectConversation -- >: ', senderId, tenant, channelType, this.conversationWith, this.g.recipientId);
    this.messagingService.initialize( senderId, tenant, channelType );
    this.messagingService.initWritingMessages(this.conversationWith);
    this.messagingService.getWritingMessages();

    this.upSvc.initialize(senderId, tenant, this.conversationWith);
    // his.contactService.initialize(senderId, tenant, this.conversationWith);
    this.messagingService.connect( this.conversationWith );
    this.messages = this.messagingService.messages;
    // this.scrollToBottomStart();
    // this.messages.concat(this.messagingService.messages);
    // this.messagingService.resetBadge(this.conversationWith);
  }

  /**
   * inizializzo variabili
   * effettuo il login anonimo su firebase
   * se il login è andato a buon fine recupero id utente
   */
  initializeChatManager() {
    this.arrayFilesLoad = [];
    // this.setSubscriptions();
    // this.checkWritingMessages();
  }

  /**
   *
   */
  private checkWritingMessages() {
    const that = this;
    const tenant = this.g.tenant;
    try {
      const messagesRef = this.messagingService.checkWritingMessages(tenant, this.conversationWith);
      if (messagesRef) {
        messagesRef.on('value', function (writing) {
          if (writing.exists()) {
              that.writingMessage = that.g.LABEL_WRITING;
          } else {
              that.writingMessage = '';
          }
        });
      }
    } catch (e) {
      this.g.wdLog(['> Error :' + e]);
    }
  }

  /**
   * setFocusOnId
   * @param id
   */
  setFocusOnId(id: string) {
    setTimeout(function () {
        const textarea = document.getElementById(id);
        if (textarea) {
            //   that.g.wdLog(['1--------> FOCUSSSSSS : ', textarea);
            textarea.setAttribute('value', ' ');
            textarea.focus();
        }
    }, 500);
  }


  /**
   * performSendingMessage
   */
  private performSendingMessage() {
    // const msg = document.getElementsByClassName('f21textarea')[0];
    let msg = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);
    if (msg && msg.trim() !== '') {
        //   that.g.wdLog(['sendMessage -> ', this.textInputTextArea);
        // this.resizeInputField();
        // this.messagingService.sendMessage(msg, TYPE_MSG_TEXT);
        // this.setDepartment();
        msg = replaceBr(msg);
        this.sendMessage(msg, TYPE_MSG_TEXT);
        // this.restoreTextArea();
    }
    // (<HTMLInputElement>document.getElementById('chat21-main-message-context')).value = '';
    // this.textInputTextArea = '';
    // this.restoreTextArea();
  }

  /**
   * restoreTextArea
   */
  private restoreTextArea() {
    //   that.g.wdLog(['AppComponent:restoreTextArea::restoreTextArea');
    this.resizeInputField();
    const textArea = (<HTMLInputElement>document.getElementById('chat21-main-message-context'));
    this.textInputTextArea = ''; // clear the textarea
    if (textArea) {
        textArea.value = '';  // clear the textarea
        textArea.placeholder = this.g.LABEL_PLACEHOLDER;  // restore the placholder
        this.g.wdLog(['AppComponent:restoreTextArea::restoreTextArea::textArea:', 'restored']);
    } else {
          console.error('AppComponent:restoreTextArea::restoreTextArea::textArea:', 'not restored');
    }
    this.setFocusOnId('chat21-main-message-context');
  }
  // +++++++++++++++ end:: MY FUNCTIONS +++++++++++++++ //







  // +++++++++++++++ begin:: ACTIONS +++++++++++++++ //
  /**
   * quando premo un tasto richiamo questo metodo che:
   * verifica se è stato premuto 'invio'
   * se si azzera testo
   * imposta altezza campo come min di default
   * leva il focus e lo reimposta dopo pochi attimi
   * (questa è una toppa per mantenere il focus e eliminare il br dell'invio!!!)
   * invio messaggio
   * @param event
   */
  onkeypress(event: any) {
    const keyCode = event.which || event.keyCode;
    this.textInputTextArea = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);
    if (keyCode === 13) {
        this.performSendingMessage();
    } else if (keyCode === 9) {
      event.preventDefault();
    }
  }

  /**
   * onSendPressed
   */
  onSendPressed(event: any) {
    this.g.wdLog(['onSendPressed:event', event]);
    this.g.wdLog(['AppComponent::onSendPressed::isFilePendingToUpload:', this.isFilePendingToUpload]);
    if (this.isFilePendingToUpload) {
      this.g.wdLog(['AppComponent::onSendPressed', 'is a file']);
      // its a file
      this.loadFile();
      this.isFilePendingToUpload = false;
      // disabilito pulsanti
      this.g.wdLog(['AppComponent::onSendPressed::isFilePendingToUpload:', this.isFilePendingToUpload]);
    } else {
      if ( this.textInputTextArea && this.textInputTextArea.length > 0 ) {
        this.g.wdLog(['AppComponent::onSendPressed', 'is a message']);
        // its a message
        this.performSendingMessage();
        // restore the text area
        // this.restoreTextArea();
      }
    }
  }

  /**
   * ridimensiona la textarea
   * chiamato ogni volta che cambia il contenuto della textarea
   * imposto stato 'typing'
   */
  resizeInputField() {
    try {
      const target = document.getElementById('chat21-main-message-context') as HTMLInputElement;
      // tslint:disable-next-line:max-line-length
      // that.g.wdLog(['H:: this.textInputTextArea', (document.getElementById('chat21-main-message-context') as HTMLInputElement).value , target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
      target.style.height = '100%';
      if (target.value === '\n') {
          target.value = '';
          target.style.height = this.HEIGHT_DEFAULT;
      } else if (target.scrollHeight > target.offsetHeight) {
          target.style.height = target.scrollHeight + 2 + 'px';
          target.style.minHeight = this.HEIGHT_DEFAULT;
      } else {
          //   that.g.wdLog(['PASSO 3');
          target.style.height = this.HEIGHT_DEFAULT;
          // segno sto scrivendo
          // target.offsetHeight - 15 + 'px';
      }
      this.setWritingMessages(target.value);
    } catch (e) {
      this.g.wdLog(['> Error :' + e]);
    }
    // tslint:disable-next-line:max-line-length
    // that.g.wdLog(['H:: this.textInputTextArea', this.textInputTextArea, target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
  }
  // +++++++++++++++ end:: ACTIONS +++++++++++++++ //



  // +++++++++++++++ begin:: typing +++++++++++++++ //

  /**
   * setWritingMessages
   * @param str
   */
  setWritingMessages(str: string) {
    this.messagingService.setWritingMessages(str, this.g.channelType);
  }


  /**
   * checkMemberId
   * @param memberID
   */
  checkMemberId(memberID: string) {
    const that = this;
     // && memberID.trim() !== 'system'
    if ( memberID.trim() !== '' && memberID.trim() !== this.g.senderId
    ) {
      if (that.isTypings === false) {
        that.isTypings = true;
      }
    } else {
      that.isTypings = false;
    }
  }
  // +++++++++++++++ end:: typing +++++++++++++++ //

  // +++++++++++++++ begin:: DESTROY ALL SUBSCRIPTIONS +++++++++++++++ //
  /**
   * unsubscribe
   */
  unsubscribe() {
    this.g.wdLog(['******* unsubscribe *******']);
    this.subscriptions.forEach(function (subscription) {
        subscription.unsubscribe();
    });
    this.subscriptions.length = 0;
    this.messagingService.unsubscribeAllReferences();
    this.g.wdLog(['this.subscriptions', this.subscriptions]);
  }
// +++++++++++++++ end:: DESTROY ALL SUBSCRIPTIONS +++++++++++++++


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


  onResize(event: any) {
    this.g.wdLog(['RESIZE ----------> ' + event.target.innerWidth]);
  }

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


  // addNewConversation() {
  //   // è una new conversazione
  //   console.log('addNewConversation: ', this.messages.length, this.conversation);
  //   if (this.messages.length <= 1 && !this.conversation) {

  //   const now: Date = new Date();
  //   const timestamp = now.valueOf();

  //   // if (conversation.sender === that.senderId) {
  //   //   conversation.sender_fullname = this.g.YOU;
  //   // }
  //   // if (conversation.sender !== that.senderId) {
  //   //   conversation.avatar = that.avatarPlaceholder(conversation.sender_fullname);
  //   //   conversation.color = that.setColorFromString(conversation.sender_fullname);
  //   //   conversation.image = that.getUrlImgProfile(conversation.sender);
  //   // } else {
  //   //   conversation.avatar = that.avatarPlaceholder(conversation.recipient_fullname);
  //   //   conversation.color = that.setColorFromString(conversation.recipient_fullname);
  //   //   conversation.image = that.getUrlImgProfile(conversation.recipient);
  //   // }


  //     this.conversation = new ConversationModel(
  //       this.conversationWith,
  //       {},
  //       this.g.channelType,
  //       true,
  //       '',
  //       this.recipientId,
  //       this.g.recipientFullname,
  //       this.g.senderId,
  //       this.g.YOU,
  //       '0',
  //       timestamp,
  //       TYPE_MSG_TEXT,
  //       '',
  //       '',
  //       '',
  //       '',
  //       0,
  //       false
  //       );
  //   }
  // }



  /**
   *
   */
  // checkListMessages() {
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
  // }











  /**
     * invio del messaggio
     * @param msg
     * @param type
     * @param metadata
     * @param additional_attributes
     */
    sendMessage(msg, type, metadata?, additional_attributes?) { // sponziello
      (metadata) ? metadata = metadata : metadata = '';
      this.g.wdLog(['SEND MESSAGE: ', msg, type, metadata, additional_attributes]);
      if (msg && msg.trim() !== '' || type === TYPE_MSG_IMAGE || type === TYPE_MSG_FILE ) {
          let recipientFullname = this.g.GUEST_LABEL;
           // sponziello: adds ADDITIONAL ATTRIBUTES TO THE MESSAGE
          const g_attributes = this.g.attributes;
          // added <any> to resolve the Error occurred during the npm installation: Property 'userFullname' does not exist on type '{}'
          const attributes = <any>{};
          if (g_attributes) {
            for (const [key, value] of Object.entries(g_attributes)) {
              attributes[key] = value;
            }
          }
          if (additional_attributes) {
            for (const [key, value] of Object.entries(additional_attributes)) {
              attributes[key] = value;
            }
          }
           // fine-sponziello
          const projectid = this.g.projectid;
          const channelType = this.g.channelType;
          const userFullname = this.g.userFullname;
          const userEmail = this.g.userEmail;
          const showWidgetNameInConversation = this.g.showWidgetNameInConversation;
          const widgetTitle = this.g.widgetTitle;
          const conversationWith = this.conversationWith;
          this.triggerBeforeSendMessageEvent(
            recipientFullname,
            msg,
            type,
            metadata,
            conversationWith,
            recipientFullname,
            attributes,
            projectid,
            channelType
          );
          if (userFullname) {
            recipientFullname = userFullname;
          } else if (userEmail) {
            recipientFullname = userEmail;
          } else if (attributes && attributes['userFullname']) {
            recipientFullname = attributes['userFullname'];
          } else {
            recipientFullname = this.g.GUEST_LABEL;
          }
          if (showWidgetNameInConversation && showWidgetNameInConversation === true) {
            recipientFullname += ' - ' + widgetTitle;
          }
          const messageSent = this.messagingService.sendMessage(
            recipientFullname,
            msg,
            type,
            metadata,
            conversationWith,
            recipientFullname,
            attributes,
            projectid,
            channelType
          );
          this.triggerAfterSendMessageEvent(messageSent);
          this.isNewConversation = false;

          try {
            const target = document.getElementById('chat21-main-message-context') as HTMLInputElement;
            target.value = '';
            target.style.height = this.HEIGHT_DEFAULT;
            // console.log('target.style.height: ', target.style.height);
          } catch (e) {
            this.g.wdLog(['> Error :' + e]);
          }
          this.restoreTextArea();
      }
  }

  /**
   * printMessage
   * @param message
   * @param messageEl
   * @param component
   */
  printMessage(message: any, messageEl: any, component: any) {
    this.triggerBeforeMessageRender(message, messageEl, component);
    const messageText = message.text;
    this.triggerAfterMessageRender(message, messageEl, component);
    return messageText;
  }



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




  // ========= begin:: functions scroll position ======= //
  /**
   *
   */
  // LISTEN TO SCROLL POSITION
  onScroll(event: any): void {
    // console.log('************** SCROLLLLLLLLLL *****************');
    this.startScroll = false;
    if (this.scrollMe) {
      const divScrollMe = this.scrollMe.nativeElement;
      const checkContentScrollPosition = this.checkContentScrollPosition(divScrollMe);
      if (checkContentScrollPosition) {
        this.showButtonToBottom = false;
        this.NUM_BADGES = 0;
      } else {
        this.showButtonToBottom = true;
      }
    }
  }

  /**
   *
   */
  checkContentScrollPosition(divScrollMe): boolean {
    //   that.g.wdLog(['checkContentScrollPosition ::', divScrollMe);
    //   that.g.wdLog(['divScrollMe.diff ::', divScrollMe.scrollHeight - divScrollMe.scrollTop);
    //   that.g.wdLog(['divScrollMe.clientHeight ::', divScrollMe.clientHeight);
    if (divScrollMe.scrollHeight - divScrollMe.scrollTop <= (divScrollMe.clientHeight + 40)) {
      this.g.wdLog(['SONO ALLA FINE ::']);
        return true;
    } else {
      this.g.wdLog([' NON SONO ALLA FINE ::']);
        return false;
    }
  }


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
  const that = this;
   try {
    that.isScrolling = true;
    const objDiv = document.getElementById(that.idDivScroll) as HTMLElement;
    // const element = objDiv[0] as HTMLElement;
    setTimeout(function () {

      if (that.isIE === true || withoutAnimation === true || that.firstScroll === true) {
        objDiv.parentElement.classList.add('withoutAnimation');
      } else {
        objDiv.parentElement.classList.remove('withoutAnimation');
      }
      objDiv.parentElement.scrollTop = objDiv.scrollHeight;
      objDiv.style.opacity = '1';
      that.firstScroll = false;
    }, 0);
  } catch (err) {
    that.g.wdLog(['> Error :' + err]);
  }
  that.isScrolling = false;
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
  detectFiles(event) {
    this.g.wdLog(['detectFiles: ', event]);

    if (event) {
        this.selectedFiles = event.target.files;
        this.g.wdLog(['AppComponent:detectFiles::selectedFiles', this.selectedFiles]);
        if (this.selectedFiles == null) {
          this.isFilePendingToUpload = false;
        } else {
          this.isFilePendingToUpload = true;
        }
        this.g.wdLog(['AppComponent:detectFiles::selectedFiles::isFilePendingToUpload', this.isFilePendingToUpload]);
        this.g.wdLog(['fileChange: ', event.target.files]);
        if (event.target.files.length <= 0) {
          this.isFilePendingToUpload = false;
        } else {
          this.isFilePendingToUpload = true;
        }
        const that = this;
        if (event.target.files && event.target.files[0]) {
            const nameFile = event.target.files[0].name;
            const typeFile = event.target.files[0].type;
            const reader = new FileReader();
              that.g.wdLog(['OK preload: ', nameFile, typeFile, reader]);
            reader.addEventListener('load', function () {
                that.g.wdLog(['addEventListener load', reader.result]);
              that.isFileSelected = true;
              // se inizia con image
              if (typeFile.startsWith('image')) {
                const imageXLoad = new Image;
                that.g.wdLog(['onload ', imageXLoad]);
                imageXLoad.src = reader.result.toString();
                imageXLoad.title = nameFile;
                imageXLoad.onload = function () {
                  that.g.wdLog(['onload immagine']);
                  // that.arrayFilesLoad.push(imageXLoad);
                  const uid = (new Date().getTime()).toString(36); // imageXLoad.src.substring(imageXLoad.src.length - 16);
                  that.arrayFilesLoad[0] = { uid: uid, file: imageXLoad, type: typeFile };
                  that.g.wdLog(['OK: ', that.arrayFilesLoad[0]]);
                  // INVIO MESSAGGIO
                  that.loadFile();
                };
              } else {
                that.g.wdLog(['onload file']);
                const fileXLoad = {
                  src: reader.result.toString(),
                  title: nameFile
                };
                // that.arrayFilesLoad.push(imageXLoad);
                const uid = (new Date().getTime()).toString(36); // imageXLoad.src.substring(imageXLoad.src.length - 16);
                that.arrayFilesLoad[0] = { uid: uid, file: fileXLoad, type: typeFile };
                that.g.wdLog(['OK: ', that.arrayFilesLoad[0]]);
                // INVIO MESSAGGIO
                that.loadFile();
              }
            }, false);

            if (event.target.files[0]) {
              reader.readAsDataURL(event.target.files[0]);
                that.g.wdLog(['reader-result: ', event.target.files[0]]);
            }
        }
    }
  }


  loadFile() {
    this.g.wdLog(['that.fileXLoad: ', this.arrayFilesLoad]);
        // al momento gestisco solo il caricamento di un'immagine alla volta
        if (this.arrayFilesLoad[0] && this.arrayFilesLoad[0].file) {
            const fileXLoad = this.arrayFilesLoad[0].file;
            const uid = this.arrayFilesLoad[0].uid;
            const type = this.arrayFilesLoad[0].type;
            this.g.wdLog(['that.fileXLoad: ', type]);
            let metadata;
            if (type.startsWith('image')) {
                metadata = {
                    'name': fileXLoad.title,
                    'src': fileXLoad.src,
                    'width': fileXLoad.width,
                    'height': fileXLoad.height,
                    'type': type,
                    'uid': uid
                };
            } else {
                metadata = {
                    'name': fileXLoad.title,
                    'src': fileXLoad.src,
                    'type': type,
                    'uid': uid
                };
            }
            this.g.wdLog(['metadata -------> ', metadata]);
            // this.scrollToBottom();
            // 1 - aggiungo messaggio localmente
            // this.addLocalMessageImage(metadata);
            // 2 - carico immagine
            const file = this.selectedFiles.item(0);
            this.uploadSingle(metadata, file);
            // this.isSelected = false;
        }
    }


  /**
   *
   */
    uploadSingle(metadata, file) {
        const that = this;
        const send_order_btn = <HTMLInputElement>document.getElementById('chat21-start-upload-doc');
        send_order_btn.disabled = true;
        that.g.wdLog(['AppComponent::uploadSingle::', metadata, file]);
        // const file = this.selectedFiles.item(0);
        const currentUpload = new UploadModel(file);
        // console.log(currentUpload.file);

        const uploadTask = this.upSvc.pushUpload(currentUpload);
        uploadTask.then(snapshot => {
            return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
        })
            .then(downloadURL => {
                  that.g.wdLog(['AppComponent::uploadSingle:: downloadURL', downloadURL]);
                  that.g.wdLog([`Successfully uploaded file and got download link - ${downloadURL}`]);

                metadata.src = downloadURL;
                let type_message = TYPE_MSG_TEXT;
                let message = 'File: ' + metadata.src;
                if (metadata.type.startsWith('image')) {
                    type_message = TYPE_MSG_IMAGE;
                    message = ''; // 'Image: ' + metadata.src;
                }
                that.sendMessage(message, type_message, metadata);
                that.isFilePendingToUpload = false;
                // return downloadURL;
            })
            .catch(error => {
                // Use to signal error if something goes wrong.
                console.error(`AppComponent::uploadSingle:: Failed to upload file and get link - ${error}`);
            });
      // this.resetLoadImage();
        that.g.wdLog(['reader-result: ', file]);
    }


    /**
     *
     * @param message
     */
    getSizeImg(message): any {
      const metadata = message.metadata;
      // const MAX_WIDTH_IMAGES = 300;
      const sizeImage = {
          width: metadata.width,
          height: metadata.height
      };
      //   that.g.wdLog(['message::: ', metadata);
      if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
          const rapporto = (metadata['width'] / metadata['height']);
          sizeImage.width = MAX_WIDTH_IMAGES;
          sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
      }
      return sizeImage; // h.toString();
  }

  /**
     * aggiorno messaggio: uid, status, timestamp, headerDate
     * richiamata alla sottoscrizione dell'aggiunta di un nw messaggio
     * in caso in cui il messaggio è un'immagine ed è stata inviata dall'utente
     */
    updateMessage(message) {
      this.g.wdLog(['UPDATE MSG:', message.metadata.uid]);
      const index = searchIndexInArrayForUid(this.messages, message.metadata.uid);
      if (index > -1) {
          this.messages[index].uid = message.uid;
          this.messages[index].status = message.status;
          this.messages[index].timestamp = message.timestamp;
          this.messages[index].headerDate = message.headerDate;
          this.g.wdLog(['UPDATE ok:', this.messages[index]]);
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
  //     if (this.showWidgetNameInConversation && this.showWidgetNameInConversation === true) {
  //         recipientFullname += ' - ' + this.widgetTitle;
  //     }

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

  returnHome() {
    console.log('returnHome');
    this.storageService.removeItem('idActiveConversation');
    // this.storageService.removeItem('activeConversation');
    // this.g.setParameter('activeConversation', null, false);
    this.eventClose.emit();
  }

  returnCloseWidget() {
    // this.g.setParameter('activeConversation', null, false);
    this.eventCloseWidget.emit();
  }

  dowloadTranscript() {
    const url = this.API_URL + 'public/requests/' + this.conversationWith + '/messages.html';
    const windowContext = this.g.windowContext;
    windowContext.open(url, '_blank');
    this.isMenuShow  = false;
  }

  toggleSound() {
    this.g.setParameter('isSoundActive', !this.g.isSoundActive);
    this.isMenuShow  = false;
    // this.g.isSoundActive = !this.g.isSoundActive;
    // if ( this.g.isSoundActive === false ) {
    //   this.storageService.setItem('isSoundActive', false);
    // } else {
    //   this.storageService.setItem('isSoundActive', true);
    // }
  }

  toggleMenu() {
    this.isMenuShow = !this.isMenuShow;
  }

  openInputFiles() {
    alert('ok');
    if (document.getElementById('chat21-file')) {
     const docInput = document.getElementById('chat21-file');
     docInput.style.display = 'block';
    }
  }




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
    const isSoundActive = this.g.isSoundActive;
    const baseLocation = this.g.baseLocation;
    if ( isSoundActive ) {
      const that = this;
      this.audio = new Audio();
      this.audio.src = baseLocation + '/assets/sounds/justsaying.mp3';
      this.audio.load();
      // console.log('conversation play');
      clearTimeout(this.setTimeoutSound);
      this.setTimeoutSound = setTimeout(function () {
        that.audio.play();
        that.g.wdLog(['****** soundMessage 1 *****', that.audio.src]);
      }, 1000);
    }
  }

  hideMenuOptions() {
    this.g.wdLog(['hideMenuOptions B']);
    this.isMenuShow  = false;
 }

  isLastMessage(idMessage: string) {
    // console.log('idMessage: ' + idMessage + 'id LAST Message: ' + this.messages[this.messages.length - 1].uid);
    if (idMessage === this.messages[this.messages.length - 1].uid) {
      return true;
    }
    return false;
  }

  /** */
  returnOpenAttachment(event: String) {
    if (event) {
      const metadata = {
        'button': true
      };
      this.sendMessage(event, TYPE_MSG_TEXT, metadata);
      // this.sendMessage($event, TYPE_MSG_TEXT);
    }
  }

  /** */
  returnClickOnAttachmentButton(event: any) {
    if (!event || !event.type) {
      return;
    }
    switch (event.type) {
      case 'url':
        try {
          this.openLink(event);
        } catch (err) {
          this.g.wdLog(['> Error :' + err]);
        }
        return;
      case 'action':
        try {
          this.actionButton(event);
        } catch (err) {
          this.g.wdLog(['> Error :' + err]);
        }
        return false;
      default: return;
    }
  }

  /** */
  private openLink(event: any) {
    const link = event.link ? event.link : '';
    const target = event.target ? event.target : '';
    if (target === 'self') {
      window.open(link, '_self');
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
    this.sendMessage(message, TYPE_MSG_TEXT, null, attributes);
    this.g.wdLog(['> action :']);
  }

  /**
   * 
   */
  private openNewConversation() {
    this.g.wdLog(['openNewConversation']);
    this.eventNewConversation.emit();
  }



  // ========= START:: TRIGGER FUNCTIONS ============//
  /**
   * triggerNewConversationEvent
   * @param newConvId
   */
  private triggerNewConversationEvent(newConvId: string) {
    const default_settings = this.g.default_settings;
    const appConfigs = this.appConfigService.getConfig();
    this.g.wdLog([' ---------------- triggerNewConversationEvent ---------------- ', default_settings]);
    const onNewConversation = new CustomEvent('onNewConversation', {
      detail: {
          global: this.g,
          default_settings: default_settings,
          newConvId: newConvId,
          appConfigs: appConfigs
        }
      });
    const windowContext = this.g.windowContext;
    if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        windowContext.tiledesk.tiledeskroot.dispatchEvent(onNewConversation);
        this.g.windowContext = windowContext;
    } else {
        this.el.nativeElement.dispatchEvent(onNewConversation);
    }
  }

  /**
   * onNewConversationComponentInit
   */
  private onNewConversationComponentInit() {
    this.g.wdLog([' ---------------- onNewConversationComponentInit -------------- ']);
    this.setConversation();
    const newConvId = this.conversationWith;
    const default_settings = this.g.default_settings;
    const appConfigs = this.appConfigService.getConfig();
    this.g.wdLog([' ---------------- triggerOnNewConversationComponentInit ---------------- ', default_settings]);
    const onNewConversation = new CustomEvent('onNewConversationComponentInit', {
      detail: {
          global: this.g,
          default_settings: default_settings,
          newConvId: newConvId,
          appConfigs: appConfigs
        }
      });
    const windowContext = this.g.windowContext;
    if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        windowContext.tiledesk.tiledeskroot.dispatchEvent(onNewConversation);
        this.g.windowContext = windowContext;
    } else {
        this.el.nativeElement.dispatchEvent(onNewConversation);
    }
  }

  /**
   * triggerBeforeMessageRender
   * @param message
   * @param messageEl
   * @param component
   */
  triggerBeforeMessageRender(message: any, messageEl: any, component: any) {
    try {
      const beforeMessageRender = new CustomEvent('beforeMessageRender',
        { detail: {
            message: message,
            sanitizer: this.sanitizer,
            messageEl: messageEl,
            component: component
          }
        });
      const windowContext = this.g.windowContext;
      if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
          windowContext.tiledesk.tiledeskroot.dispatchEvent(beforeMessageRender);
          this.g.windowContext = windowContext;
      } else {
        const returnEventValue = this.elRoot.nativeElement.dispatchEvent(beforeMessageRender);
      }
    } catch (e) {
      this.g.wdLog(['> Error :' + e]);
    }
  }

  /**
   * triggerAfterMessageRender
   * @param message
   * @param messageEl
   * @param component
   */
  triggerAfterMessageRender(message: any, messageEl: any, component: any) {
    try {
      const afterMessageRender = new CustomEvent('afterMessageRender',
        { detail: {
            message: message,
            sanitizer: this.sanitizer,
            messageEl: messageEl,
            component: component
          }
        });
      const windowContext = this.g.windowContext;
      if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
          windowContext.tiledesk.tiledeskroot.dispatchEvent(afterMessageRender);
          this.g.windowContext = windowContext;
      } else {
        const returnEventValue = this.elRoot.nativeElement.dispatchEvent(afterMessageRender);
      }
    } catch (e) {
      this.g.wdLog(['> Error :' + e]);
    }
  }


  /**
   * triggerBeforeSendMessageEvent
   * @param senderFullname
   * @param text
   * @param type
   * @param metadata
   * @param conversationWith
   * @param recipientFullname
   * @param attributes
   * @param projectid
   * @param channel_type
   */
  private triggerBeforeSendMessageEvent(
    senderFullname: string,
    text: string,
    type: any,
    metadata: any,
    conversationWith: string,
    recipientFullname: string,
    attributes: any,
    projectid: string,
    channel_type: any
    ) {
    try {
        const onBeforeMessageSend = new CustomEvent('onBeforeMessageSend',
        { detail: {
            senderFullname: senderFullname,
            text: text,
            type: type,
            metadata,
            conversationWith: conversationWith,
            recipientFullname: recipientFullname,
            attributes: attributes,
            projectid: projectid,
            channelType: channel_type
          }
        });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onBeforeMessageSend);
            this.g.windowContext = windowContext;
        } else {
          this.el.nativeElement.dispatchEvent(onBeforeMessageSend);
        }
    } catch (e) {
      this.g.wdLog(['> Error :' + e]);
    }
  }

  /**
   * triggerAfterSendMessageEvent
   * @param message
   */
  private triggerAfterSendMessageEvent(message: any) {
    try {
        const onAfterMessageSend = new CustomEvent('onAfterMessageSend',
        { detail: {
            message: message
          }
        });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onAfterMessageSend);
            this.g.windowContext = windowContext;
        } else {
          this.el.nativeElement.dispatchEvent(onAfterMessageSend);
        }
    } catch (e) {
      this.g.wdLog(['> Error :' + e]);
    }
  }

  // ========= END:: TRIGGER FUNCTIONS ============//


  /**
   * function customize tooltip
   */
  handleTooltipEvents(event) {
    const that = this;
    const showDelay = this.tooltipOptions['showDelay'];
    // console.log(this.tooltipOptions);
    setTimeout(function () {
      try {
        const domRepresentation = document.getElementsByClassName('chat-tooltip');
        if (domRepresentation) {
          const item = domRepresentation[0] as HTMLInputElement;
          // console.log(item);
          if (!item.classList.contains('tooltip-show')) {
            item.classList.add('tooltip-show');
          }
          setTimeout(function () {
            if (item.classList.contains('tooltip-show')) {
              item.classList.remove('tooltip-show');
            }
          }, that.tooltipOptions['hideDelayAfterClick']);
        }
      } catch (err) {
          that.g.wdLog(['> Error :' + err]);
      }
    }, showDelay);
  }
}
