import { NgZone, HostListener, ElementRef, Component, OnInit, AfterViewInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Globals } from '../../utils/globals';
import { MessagingService } from '../../providers/messaging.service';

import {
  CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, TYPE_MSG_TEXT,
  MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER,
  TYPE_MSG_IMAGE, MAX_WIDTH_IMAGES, IMG_PROFILE_BOT, IMG_PROFILE_DEFAULT
} from '../../utils/constants';
import { UploadService } from '../../providers/upload.service';
import { ContactService } from '../../providers/contact.service';
import { AgentAvailabilityService } from '../../providers/agent-availability.service';
import { StarRatingWidgetService } from '../../components/star-rating-widget/star-rating-widget.service';

// models
import { MessageModel } from '../../../models/message';
import { UploadModel } from '../../../models/upload';

// utils
import { getImageUrlThumb, convertColorToRGBA, isPopupUrl, searchIndexInArrayForUid, replaceBr } from '../../utils/utils';


// Import the resized event model
import { ResizedEvent } from 'angular-resize-event/resized-event';

import {DomSanitizer} from '@angular/platform-browser';

import { AppComponent } from '../../app.component';
import { StorageService } from '../../providers/storage.service';

@Component({
  selector: 'tiledeskwidget-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {'(window:resize)': 'onResize($event)'}
})
export class ConversationComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollMe') private scrollMe: ElementRef; // l'ID del div da scrollare
  // @HostListener('window:resize', ['$event'])
  // ========= begin:: Input/Output values
  @Output() eventClose = new EventEmitter();
  @Output() eventCloseWidget = new EventEmitter();
  @Input() recipientId: string; // uid conversazione ex: support-group-LOT8SLRhIqXtR1NO...
  @Input() elRoot: ElementRef;
  // @Input() senderId: string;    // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  // @Input() departmentSelected: string;
  // ========= end:: Input/Output values

  // projectid: string;   // uid progetto passato come parametro getVariablesFromSettings o getVariablesFromAttributeHtml
  // channelType: string; // tipo di conversazione ( group / direct ) a seconda che recipientId contenga o meno 'group'
  writingMessage = '';    // messaggio sta scrivendo...
  isMenuShow = false;
  isScrolling = false;

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

  userEmail: string;
  userFullname: string;
  preChatForm = false;
  themeColor50: string;
  textInputTextArea: String;
  HEIGHT_DEFAULT = '20px';
  conversationWith: string;
  isPopupUrl = isPopupUrl;
  IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
  isNewConversation = true;
  // availableAgentsStatus = false; // indica quando è impostato lo stato degli agenti nel subscribe
  messages: Array<MessageModel>;

  attributes: any;
  GUEST_LABEL = '';

  CLIENT_BROWSER: string = navigator.userAgent;

  // devo inserirle nel globals
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
    public storageService: StorageService
  ) {
    this.initAll();

    // this.soundMessage(); // SOLO UN TEST DA ELIMINARE!!!
  }

  // onResized(event: ResizedEvent): void {
  //   const that = this;
  //   this.ngZone.run(() => {
  //     that.g.wdLog([' ResizedEvent  ', event]);
  //     //that.scrollToBottom();
  //   });
  // }

  ngOnInit() {
    // this.initAll();
      this.g.wdLog([' ngOnInit: app-conversation ', this.g]);
      this.g.wdLog([' recipientId: ', this.g.recipientId]);
      this.g.wdLog([' senderId: ', this.g.senderId]);
      this.g.wdLog([' projectid: ', this.g.projectid]);
      this.g.wdLog([' channelType: ', this.g.channelType]);
      this.g.wdLog([' departmentDefault: ', this.g.departmentDefault]);
    // set first message customized for department
    // if (this.g.departmentDefault.online_msg) {
    //   this.g.LABEL_FIRST_MSG = this.g.departmentDefault.online_msg;
    // }
    // if (this.g.departmentDefault.offline_msg) {
    //   this.g.LABEL_FIRST_MSG_NO_AGENTS = this.g.departmentDefault.offline_msg;
    // }

    const that = this;
    const subscriptionEndRenderMessage = this.appComponent.obsEndRenderMessage.subscribe(() => {
      this.ngZone.run(() => {
        that.scrollToBottom();
      });
    });
    this.subscriptions.push(subscriptionEndRenderMessage);

    this.setFocusOnId('chat21-main-message-context');

    this.attributes = this.setAttributes();
  }

  ngAfterViewInit() {
    this.g.wdLog([' --------ngAfterViewInit-------- ']);
    // if (this.scrollMe) {
    //   const divScrollMe = this.scrollMe.nativeElement;
    //   const checkContentScrollPosition = this.checkContentScrollPosition(divScrollMe);
    //   if (checkContentScrollPosition) {
    //     this.scrollToBottom();
    //   }
    // }
  }


  /**
   * do per scontato che this.userId esiste!!!
   */
  initAll() {
    // this.themeColor50 = this.g.themeColor + '7F';
    this.themeColor50 = convertColorToRGBA(this.g.themeColor, 50);
    this.messages = [];

      this.g.wdLog([' ---------------- 2: setConversation ---------------------- ']);
    this.setConversation();

      this.g.wdLog([' ---------------- 3: connectConversation ---------------------- ']);
    this.connectConversation();

      this.g.wdLog([' ---------------- 4: initializeChatManager ------------------- ']);
    this.initializeChatManager();


    this.g.wdLog([' ---------------- 5: setAvailableAgentsStatus ---------------- ']);
    this.setAvailableAgentsStatus();


    this.g.activeConversation = this.conversationWith;
    // this.checkListMessages();
  }

  onResize(event) {
    // tslint:disable-next-line:no-unused-expression
    this.g.wdLog(['RESIZE ----------> ' + event.target.innerWidth]);
  }

  /**
   * mi sottoscrivo al nodo /projects/' + projectId + '/users/availables
   * per verificare se c'è un agent disponibile
   */
  private setAvailableAgentsStatus() {
    this.g.wdLog(['departmentSelected ----------> ', this.g.departmentSelected]);

    this.g.wdLog(['setAvailableAgentsStatus ----------> ' + this.g.availableAgents.length]);
    // set first message customized for department
    if (this.g.departmentDefault && this.g.departmentDefault.online_msg) {
      this.g.LABEL_FIRST_MSG = this.g.departmentDefault.online_msg;
    }
    if (this.g.departmentDefault && this.g.departmentDefault.offline_msg) {
      this.g.LABEL_FIRST_MSG_NO_AGENTS = this.g.departmentDefault.offline_msg;
    }
    // if (this.g.availableAgents && this.g.availableAgents.length <= 0) {
    //   this.addFirstMessage(this.g.LABEL_FIRST_MSG_NO_AGENTS);
    // } else {
    //   this.addFirstMessage(this.g.LABEL_FIRST_MSG);
    // }
    this.getAvailableAgentsForDepartment();

  }

    /**
   * mi sottoscrivo al nodo /departments/' + idDepartmentSelected + '/operators/';
   * per verificare se c'è un agent disponibile
   */
  private getAvailableAgentsForDepartment() {
    const that = this;
    this.agentAvailabilityService
    .getAvailableAgentsForDepartment(this.g.projectid, this.g.departmentSelected._id)
    .subscribe( (availableAgents) => {
      const availableAgentsForDep = availableAgents['available_agents'];
      console.log(availableAgents);
      if (availableAgentsForDep && availableAgentsForDep.length <= 0) {
        that.addFirstMessage(that.g.LABEL_FIRST_MSG_NO_AGENTS);
      } else {
        that.addFirstMessage(that.g.LABEL_FIRST_MSG);
      }
    }, (error) => {
      console.error('setOnlineStatus::setAvailableAgentsStatus', error);
    }, () => {
    });
  }

  /**
   * mi sottoscrivo al nodo /projects/' + projectId + '/users/availables
   * per verificare se c'è un agent disponibile
   */
  // private setAvailableAgentsStatus() {
  //   const that = this;
  //   this.agentAvailabilityService
  //   .getAvailableAgents(this.g.projectid)
  //   .subscribe( (availableAgents) => {
  //     this.g.wdLog(['availableAgents->', availableAgents]);
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

  addFirstMessage(text) {
    text = replaceBr(text);
    const timestampSendingMessage = new Date('01/01/2000').getTime();
    const msg = new MessageModel(
      '000000',
      this.g.lang,
      this.conversationWith,
      'Bot',
      '', // sender
      'Bot', // sender fullname
      '200', // status
      '', // metadata
      text,
      timestampSendingMessage,
      '',
      TYPE_MSG_TEXT,
      '', // attributes
      this.g.channelType,
      this.g.projectid
    );
    this.g.wdLog(['addFirstMessage ----------> ' + text]);
    this.messages.unshift(msg);
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
      this.g.wdLog(['setConversation recipientId: ', this.g.recipientId, this.g.channelType]);
    if ( !this.g.recipientId ) { this.g.recipientId = this.setRecipientId(); }
    if ( !this.g.channelType ) { this.g.channelType = this.setChannelType(); }
    this.conversationWith = this.g.recipientId;
      this.g.wdLog(['createConversation.recipientId', this.g.recipientId]);
      this.g.wdLog(['createConversation.channelType', this.g.channelType]);
      this.g.wdLog(['createConversation.senderId', this.g.senderId]);
  }

  /**
   *
   */
  private setRecipientId() {
    let recipientIdTEMP;
    recipientIdTEMP = this.storageService.getItem(this.g.senderId);
    if (!recipientIdTEMP) {
      // questa deve essere sincrona!!!!
      // console.log("199");
      recipientIdTEMP = this.messagingService.generateUidConversation(this.g.senderId);
    }
    return recipientIdTEMP;
  }

  /**
   *
   */
  private setChannelType() {
    let channelTypeTEMP = CHANNEL_TYPE_GROUP;
    if (this.recipientId.indexOf('group') !== -1) {
      channelTypeTEMP = CHANNEL_TYPE_GROUP;
    } else if (!this.g.projectid) {
      channelTypeTEMP = CHANNEL_TYPE_DIRECT;
    }
    return channelTypeTEMP;
  }


  /**
   *  1 - init messagingService
   *  2 - connect: recupero ultimi X messaggi
   */
  private connectConversation() {
      this.messagingService.initialize( this.g.senderId, this.g.tenant, this.g.channelType );
      this.upSvc.initialize(this.g.senderId, this.g.tenant, this.conversationWith);
      this.contactService.initialize(this.g.senderId, this.g.tenant, this.conversationWith);
      this.messagingService.connect( this.conversationWith );
      this.messages = this.messagingService.messages;
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
    this.setSubscriptions();
    this.checkWritingMessages();
  }

  /**
   *
   */
  setAttributes(): any {
    if (!this.g.attributes || this.g.attributes === 'undefined') {
      let attributes: any = JSON.parse(this.storageService.getItem('attributes'));
      if (!attributes || attributes === 'undefined') {
        attributes = {
          client: this.CLIENT_BROWSER,
          sourcePage: location.href,
          projectId: this.g.projectid
        };
      }
      if (this.g.userEmail) {
        attributes['userEmail'] = this.g.userEmail;
      }
      if (this.g.userFullname) {
        attributes['userFullname'] = this.g.userFullname;
      }
      if (this.g.senderId) {
        attributes['requester_id'] = this.g.senderId;
      }
      this.g.wdLog(['>>>>>>>>>>>>>> setAttributes: ', JSON.stringify(attributes)]);
      this.storageService.setItem('attributes', JSON.stringify(attributes));
      return attributes;
    }
    return this.g.attributes;
  }

  /**
   * imposto le sottoscrizioni
   * 1 - conversazione chiusa (CHAT CHIUSA)
   * 2 - nuovo messaggio
   */
  setSubscriptions() {
    const that = this;
    this.starRatingWidgetService.setOsservable(false);
    // CHIUSURA CONVERSAZIONE (ELIMINAZIONE UTENTE DAL GRUPPO)
     // tslint:disable-next-line:max-line-length
      this.g.wdLog(['setSubscriptions!!!! StartRating', this.starRatingWidgetService.obsCloseConversation, this.starRatingWidgetService]);
    const subscriptionisOpenStartRating: Subscription = this.starRatingWidgetService.obsCloseConversation
    .subscribe(isOpenStartRating => {
      that.g.isOpenStartRating = isOpenStartRating;
      if (isOpenStartRating === false) {
          this.g.wdLog(['CHIUDOOOOO!!!! StartRating']);
      } else if (isOpenStartRating === true) {
          this.g.wdLog(['APROOOOOOOO!!!! StartRating']);
      }
    });
    this.subscriptions.push(subscriptionisOpenStartRating);

    // NUOVO MESSAGGIO!!
    /**
     * se:          non sto già scrollando oppure il messaggio l'ho inviato io -> scrollToBottom
     * altrimenti:  se esiste scrollMe (div da scrollare) verifico la posizione
     *  se:         sono alla fine della pagina scrollo alla fine
     *  altrimenti: aumento il badge
     */
    const obsAddedMessage: Subscription = this.messagingService.obsAdded
    .subscribe(newMessage => {
      that.g.wdLog(['Subscription NEW MSG', newMessage]);
      // if ( newMessage ) {
      //   that.triggetBeforeMessageRender(newMessage.text);
      // }
      if ( that.startScroll || newMessage.sender === that.g.senderId) {
        that.g.wdLog(['1-------']);
        setTimeout(function () {
          that.scrollToBottom();
        }, 100);
      } else if (that.scrollMe) {
        const divScrollMe = that.scrollMe.nativeElement;
        const checkContentScrollPosition = that.checkContentScrollPosition(divScrollMe);
        if (checkContentScrollPosition) {
          that.g.wdLog(['2-------']);
          // https://developer.mozilla.org/it/docs/Web/API/Element/scrollHeight
          setTimeout(function () {
            that.scrollToBottom();
          }, 100);
        } else {
          that.g.wdLog(['3-------']);
          that.NUM_BADGES++;
          that.soundMessage();
        }
      }
    });

    this.subscriptions.push(obsAddedMessage);
  }

  /**
   *
   */
  private checkWritingMessages() {
    const that = this;
    const messagesRef = this.messagingService.checkWritingMessages(this.g.tenant, this.conversationWith);
    messagesRef.on('value', function (writing) {
        if (writing.exists()) {
            that.writingMessage = that.g.LABEL_WRITING;
        } else {
            that.writingMessage = '';
        }
    });
  }


  /**
   *
   */
  checkListMessages() {
    // const that = this;
    // this.messagingService.checkListMessages(this.conversationWith)
    // .then(function (snapshot) {
    //       this.g.wdLog(['checkListMessages: ', snapshot);
    //     if (snapshot.exists()) {
    //         that.isNewConversation = false;
    //           this.g.wdLog(['IS NOT NEW CONVERSATION ?', that.isNewConversation);
    //         setTimeout(function () {
    //             if (that.messages.length === 0) {
    //                 that.isNewConversation = true;
    //             }
    //         }, 2000);
    //         // that.isLogged = true;
    //         //   this.g.wdLog(['IS_LOGGED', 'AppComponent:createConversation:snapshot.exists-if', that.isLogged);
    //         // that.setFocusOnId('chat21-main-message-context');
    //     } else {
    //         /**
    //          * se è una nuova conversazione:
    //          * verifico se departmentId e projectid sono settati
    //          * focus sul input messaggio
    //          */
    //         that.isNewConversation = true;
    //           this.g.wdLog(['IS NEW CONVERSATION ?', that.isNewConversation);
    //         //if (that.g.projectid && !that.g.attributes.departmentId) {
    //             // that.isLogged = false;
    //             //   this.g.wdLog(["IS_LOGGED", "AppComponent:createConversation:snapshot.exists-else-!department", that.isLogged);
    //             //that.getMongDbDepartments();
    //         //} else {
    //             that.setFocusOnId('chat21-main-message-context');
    //             //that.isLogged = true;
    //             //  this.g.wdLog(['IS_LOGGED', 'AppComponent:createConversation:snapshot.exists-else-department', that.isLogged);
    //         //}
    //     }

    //     setTimeout(function () {
    //           this.g.wdLog(['GET listMessages: ', that.conversationWith);
    //         that.messagingService.listMessages(that.conversationWith);
    //     }, 500);


    // }).catch(function (error) {
    //     console.error('checkListMessages ERROR: ', error);
    // });
  }




  setFocusOnId(id) {
    setTimeout(function () {
        const textarea = document.getElementById(id);
        if (textarea) {
            //   this.g.wdLog(['1--------> FOCUSSSSSS : ', textarea);
            textarea.setAttribute('value', ' ');
            textarea.focus();
        }
    }, 500);
}




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
    onkeypress(event) {
      const keyCode = event.which || event.keyCode;
      this.textInputTextArea = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);
        this.g.wdLog(['onkeypress **************', this.textInputTextArea]);
      if (keyCode === 13) {
          this.performSendingMessage();
      } else if (keyCode === 9) {
        event.preventDefault();
      }
  }

  private performSendingMessage() {
      // const msg = document.getElementsByClassName('f21textarea')[0];
      let msg = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);
      if (msg && msg.trim() !== '') {
          //   this.g.wdLog(['sendMessage -> ', this.textInputTextArea);
          // this.resizeInputField();
          // this.messagingService.sendMessage(msg, TYPE_MSG_TEXT);
          // this.setDepartment();
          msg = replaceBr(msg);
          this.sendMessage(msg, TYPE_MSG_TEXT);
          // this.scrollToBottom();
          this.restoreTextArea();
          this.scrollToBottom();
      }
      // (<HTMLInputElement>document.getElementById('chat21-main-message-context')).value = '';
      // this.textInputTextArea = '';
      // this.restoreTextArea();
  }

  private restoreTextArea() {
    //   this.g.wdLog(['AppComponent:restoreTextArea::restoreTextArea');
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


  /**
     * invio del messaggio
     * @param msg
     * @param type
     * @param metadata
     */
    sendMessage(msg, type, metadata?) {
      (metadata) ? metadata = metadata : metadata = '';
        this.g.wdLog(['SEND MESSAGE: ', msg, type, metadata]);
      if (msg && msg.trim() !== '' || type !== TYPE_MSG_TEXT) {
          let recipientFullname = this.GUEST_LABEL;
          this.triggerBeforeSendMessageEvent(
            recipientFullname,
            msg,
            type,
            metadata,
            this.conversationWith,
            recipientFullname,
            this.attributes,
            this.g.projectid,
            this.g.channelType
          );
          if (this.g.userFullname) {
            recipientFullname = this.g.userFullname;
          } else if (this.g.userEmail) {
            recipientFullname = this.g.userEmail;
          } else if (this.attributes && this.attributes.userFullname) {
            recipientFullname = this.attributes.userFullname;
          } else {
            recipientFullname = this.GUEST_LABEL;
          }
          if (this.g.showWidgetNameInConversation && this.g.showWidgetNameInConversation === true) {
            recipientFullname += ' - ' + this.g.widgetTitle;
          }
            this.g.wdLog(['this.g.userFullname:', this.g.userFullname]);
            this.g.wdLog(['recipientFullname:', recipientFullname]);
          // tslint:disable-next-line:max-line-length
          const messageSent = this.messagingService.sendMessage(recipientFullname, msg, type, metadata, this.conversationWith, recipientFullname, this.attributes, this.g.projectid, this.g.channelType);
          this.triggerAfterSendMessageEvent(messageSent);
          this.isNewConversation = false;
      }
  }

  printMessage(message, messageEl, component) {
    // console.log('messageEl', messageEl);
    // console.log('component', component);

    this.triggerBeforeMessageRender(message, messageEl, component);

    const messageText = message.text;
    // console.log('triggerBeforeMessageRender after');
    // TODO Aggiungi linky
    this.triggerAfterMessageRender(message, messageEl, component);

    return messageText;
  }

  triggerBeforeMessageRender(message, messageEl, component) {
    // console.log('triggerBeforeMessageRender');
    try {
      // tslint:disable-next-line:max-line-length
      const beforeMessageRender = new CustomEvent('beforeMessageRender',
        { detail: { message: message, sanitizer: this.sanitizer, messageEl: messageEl, component: component} });

      const returnEventValue = this.elRoot.nativeElement.dispatchEvent(beforeMessageRender);
      // console.log('returnEventValue', returnEventValue);
    } catch (e) {
        console.error('Error triggering triggerBeforeMessageRender', e);
    }
  }

  triggerAfterMessageRender(message, messageEl, component) {
    // console.log('triggerBeforeMessageRender');
    try {
      // tslint:disable-next-line:max-line-length
      const afterMessageRender = new CustomEvent('afterMessageRender',
        { detail: { message: message, sanitizer: this.sanitizer, messageEl: messageEl, component: component} });

      const returnEventValue = this.elRoot.nativeElement.dispatchEvent(afterMessageRender);
      // console.log('returnEventValue', returnEventValue);
    } catch (e) {
        console.error('Error triggering triggerAfterMessageRender', e);
    }
  }



  // tslint:disable-next-line:max-line-length
  private triggerBeforeSendMessageEvent(senderFullname, text, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type) {
    try {
        // tslint:disable-next-line:max-line-length
        const beforeMessageSend = new CustomEvent('beforeMessageSend', { detail: { senderFullname: senderFullname, text: text, type: type, metadata, conversationWith: conversationWith, recipientFullname: recipientFullname, attributes: attributes, projectid: projectid, channelType: channel_type } });
        this.el.nativeElement.dispatchEvent(beforeMessageSend);
    } catch (e) {
        console.error('Error triggering triggerBeforeSendMessageEvent', e);
    }
  }

  // tslint:disable-next-line:max-line-length
  private triggerAfterSendMessageEvent(message) {
    try {
        // tslint:disable-next-line:max-line-length
        const loadEvent = new CustomEvent('afterMessageSend', { detail: { message: message } });
        this.el.nativeElement.dispatchEvent(loadEvent);
    } catch (e) {
        console.error('Error triggering triggerAfterSendMessageEvent', e);
    }
  }

  /**
   *
   */

  onSendPressed(event) {
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
      if ( this.textInputTextArea.length > 0 ) {
          this.g.wdLog(['AppComponent::onSendPressed', 'is a message']);
        // its a message
        this.performSendingMessage();
        // restore the text area
        // this.restoreTextArea();
      }
    }
  }

/**
     * recupero url immagine profilo
     * @param uid
     */
    getUrlImgProfile(uid): string {

      if (!uid || uid === 'system' ) {
        return this.g.baseLocation + IMG_PROFILE_BOT;
      } else if ( uid === 'error') {
        return this.g.baseLocation + IMG_PROFILE_DEFAULT;
      } else {
          return getImageUrlThumb(uid);
      }
      // if (!uid) {
      //   return this.IMG_PROFILE_SUPPORT;
      // }
      // const profile = this.contactService.getContactProfile(uid);
      // if (profile && profile.imageurl) {
      //       this.g.wdLog(['profile::', profile, ' - profile.imageurl', profile.imageurl);
      //     return profile.imageurl;
      // } else {
      //     return this.IMG_PROFILE_SUPPORT;
      // }
  }

  /**
     * ridimensiona la textarea
     * chiamato ogni volta che cambia il contenuto della textarea
     */
    resizeInputField() {
      const target = document.getElementById('chat21-main-message-context');
      if (!target) {
          return;
      }
      // tslint:disable-next-line:max-line-length
      //   this.g.wdLog(['H:: this.textInputTextArea', (document.getElementById('chat21-main-message-context') as HTMLInputElement).value , target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
      target.style.height = '100%';
      if ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value === '\n') {
          //   this.g.wdLog(['PASSO 0');
          (document.getElementById('chat21-main-message-context') as HTMLInputElement).value = '';
          target.style.height = this.HEIGHT_DEFAULT;
      } else if (target.scrollHeight > target.offsetHeight) {
          //   this.g.wdLog(['PASSO 2');
          target.style.height = target.scrollHeight + 2 + 'px';
      } else {
          //   this.g.wdLog(['PASSO 3');
          target.style.height = this.HEIGHT_DEFAULT;
          // segno sto scrivendo
          // target.offsetHeight - 15 + 'px';
      }
      // tslint:disable-next-line:max-line-length
      //   this.g.wdLog(['H:: this.textInputTextArea', this.textInputTextArea, target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
  }



  // ================================ //


  // ========= begin:: functions scroll position ======= //
  /**
   *
   */
  // LISTEN TO SCROLL POSITION
  onScroll(event: any): void {
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
    //   this.g.wdLog(['checkContentScrollPosition ::', divScrollMe);
    //   this.g.wdLog(['divScrollMe.diff ::', divScrollMe.scrollHeight - divScrollMe.scrollTop);
    //   this.g.wdLog(['divScrollMe.clientHeight ::', divScrollMe.clientHeight);
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
  scrollToBottom() {
    this.g.wdLog([' scrollToBottom: ', this.isScrolling]);
    const that = this;
    if ( this.isScrolling === false ) {
      // const divScrollMe = this.scrollMe.nativeElement;
      setTimeout(function () {
        try {
          that.isScrolling = true;
          const objDiv = document.getElementById(that.idDivScroll);
          //// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
          setTimeout(function () {
            objDiv.scrollIntoView(false);
          }, 100);
          that.isScrolling = false;
          //   this.g.wdLog(['checkContentScrollPosition ::', this.divScrollMe);
          //   this.g.wdLog(['divScrollMe.diff ::', this.divScrollMe.scrollHeight - this.divScrollMe.scrollTop);
          //   this.g.wdLog(['divScrollMe.clientHeight ::', this.divScrollMe.clientHeight);
          // try {
          //   this.divScrollMe.nativeElement.scrollToTop = this.divScrollMe.nativeElement.scrollHeight;
          // } catch ( err ) { }
          // // that.badgeNewMessages = 0;
          // console.log(objDiv);
        } catch (err) {
            that.g.wdLog(['RIPROVO ::']);
            that.isScrolling = false;
          // that.scrollToBottom();
        }
      }, 0);
    }
  }

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
              this.g.wdLog(['OK preload: ', nameFile, typeFile, reader]);
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
                  const uid = imageXLoad.src.substring(imageXLoad.src.length - 16);
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
                const uid = fileXLoad.src.substring(fileXLoad.src.length - 16);
                that.arrayFilesLoad[0] = { uid: uid, file: fileXLoad, type: typeFile };
                that.g.wdLog(['OK: ', that.arrayFilesLoad[0]]);
                // INVIO MESSAGGIO
                that.loadFile();
              }

            }, false);

            if (event.target.files[0]) {
              reader.readAsDataURL(event.target.files[0]);
                this.g.wdLog(['reader-result: ', event.target.files[0]]);
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
            this.scrollToBottom();
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
          this.g.wdLog(['AppComponent::uploadSingle::', metadata, file]);
        // const file = this.selectedFiles.item(0);
        const currentUpload = new UploadModel(file);
        const uploadTask = this.upSvc.pushUpload(currentUpload);
        uploadTask.then(snapshot => {
            return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
        })
            .then(downloadURL => {
                  this.g.wdLog(['AppComponent::uploadSingle:: downloadURL', downloadURL]);
                  this.g.wdLog([`Successfully uploaded file and got download link - ${downloadURL}`]);

                metadata.src = downloadURL;
                let type_message = TYPE_MSG_TEXT;
                let message = 'File: ' + metadata.src;
                if (metadata.type.startsWith('image')) {
                    type_message = TYPE_MSG_IMAGE;
                    message = 'Image: ' + metadata.src;
                }
                that.sendMessage(message, type_message, metadata);
                that.scrollToBottom();
                that.isFilePendingToUpload = false;
                // return downloadURL;
            })
            .catch(error => {
                // Use to signal error if something goes wrong.
                console.error(`AppComponent::uploadSingle:: Failed to upload file and get link - ${error}`);
            });
      // this.resetLoadImage();
        this.g.wdLog(['reader-result: ', file]);
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
      //   this.g.wdLog(['message::: ', metadata);
      if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
          const rapporto = (metadata['width'] / metadata['height']);
          sizeImage.width = MAX_WIDTH_IMAGES;
          sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
      }
      // this.scrollToBottom();
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
  //       this.g.wdLog(['1 selectedFiles: ', this.selectedFiles);

  //     delete this.arrayFiles4Load[0];
  //     document.getElementById('chat21-file').nodeValue = null;
  //     // event.target.files[0].name, event.target.files
  //     this.isSelected = false;

  //     this.isFilePendingToUpload = false;
  //       this.g.wdLog(['AppComponent::resetLoadImage::isFilePendingToUpload:', this.isFilePendingToUpload);

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
  //       this.g.wdLog(['addLocalMessageImage: ', this.messages);
  //     this.isSelected = true;
  //     this.scrollToBottom();
  // }

  // ========= end:: functions send image ======= //

  returnHome() {
    this.g.activeConversation = null;
    this.eventClose.emit();
  }

  returnCloseWidget() {
    this.g.activeConversation = null;
    this.eventCloseWidget.emit();
  }

  dowloadTranscript() {
    const url = 'https://api.tiledesk.com/v1/public/requests/' + this.conversationWith + '/messages.html';
    window.open(url, '_blank');
  }

  toggleSound() {
    this.g.isSoundActive = !this.g.isSoundActive;
    if ( this.g.isSoundActive === true ) {
      this.storageService.setItem('isSoundActive', 'true');
    } else {
      this.storageService.setItem('isSoundActive', 'false');
    }
  }

  toggleMenu() {
    this.isMenuShow = !this.isMenuShow;
  }




  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
  /**
   * elimino tutte le sottoscrizioni
   */
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
      this.g.wdLog(['ngOnDestroy ------------------> this.subscriptions', this.subscriptions]);
    this.unsubscribe();
  }

  /** */
  unsubscribe() {
    this.subscriptions.forEach(function (subscription) {
        subscription.unsubscribe();
    });
    this.subscriptions.length = 0;
    this.messagingService.unsubscribeAllReferences();
      this.g.wdLog(['this.subscriptions', this.subscriptions]);
  }
  // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//



  /**
   * regola sound message:
   * se lo invio io -> NO SOUND
   * se non sono nella conversazione -> SOUND
   * se sono nella conversazione in fondo alla pagina -> NO SOUND
   * altrimenti -> SOUND
   */
  soundMessage() {
    if ( this.g.isSoundActive ) {
      const that = this;
      this.audio = new Audio();
      this.audio.src = this.g.baseLocation + '/assets/sounds/Carme.mp3';
      this.g.wdLog(['****** soundMessage *****', this.audio.src]);
      this.audio.load();
      // console.log('conversation play');
      setTimeout(function() {
        that.audio.play();
      }, 0);
    }
  }

  hideMenuOptions() {
    this.g.wdLog(['hideMenuOptions']);
    this.isMenuShow  = false;
 }

}
