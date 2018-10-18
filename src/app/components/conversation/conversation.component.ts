import { ElementRef, Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Globals } from '../../utils/globals';
import { MessagingService } from '../../providers/messaging.service';

import {
  CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, TYPE_MSG_TEXT,
  MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER,
  TYPE_MSG_IMAGE, MAX_WIDTH_IMAGES
} from '../../utils/constants';
import { UploadService } from '../../providers/upload.service';
import { ContactService } from '../../providers/contact.service';
import { AgentAvailabilityService } from '../../providers/agent-availability.service';

// models
import { MessageModel } from '../../../models/message';
import { UploadModel } from '../../../models/upload';

// utils
import { strip_tags, isPopupUrl, popupUrl, setHeaderDate, searchIndexInArrayForUid, urlify, encodeHTML } from '../../utils/utils';
// import { detectIfIsMobile} from './utils/utils';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent implements OnInit {
  @ViewChild('scrollMe') private scrollMe: ElementRef;

  // ========= begin:: Input/Output values
  @Output() eventClose = new EventEmitter();
  @Input() recipientId: string; // uid conversazione ex: support-group-LOT8SLRhIqXtR1NO...
  @Input() senderId: string;    // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  @Input() departmentSelected: string;
  // ========= end:: Input/Output values

  // projectid: string;   // uid progetto passato come parametro getVariablesFromSettings o getVariablesFromAttributeHtml
  // channelType: string; // tipo di conversazione ( group / direct ) a seconda che recipientId contenga o meno 'group'
  writingMessage = '';    // messaggio sta scrivendo...

  // ========= begin:: gestione scroll view messaggi ======= //
  startScroll = true;
  idDivScroll = 'c21-contentScroll'; // id div da scrollare
  showButtonToBottom = false;
  NUM_BADGES = 0;
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


  textInputTextArea: String;
  HEIGHT_DEFAULT = '20px';


  conversationWith: string;

  isPopupUrl = isPopupUrl;
  IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';

  isNewConversation = true;
  messages: MessageModel[];

  attributes: any;
  GUEST_LABEL = '';

  CLIENT_BROWSER: string = navigator.userAgent;

  // devo inserirle nel globals
  subscriptions: Subscription[] = [];

  // ========= begin::agent availability
  private areAgentsAvailableText: string;
  private areAgentsAvailable: Boolean = false;
  // ========= end::agent availability


  // ========== begin:: set icon status message
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_SENT_SERVER = MSG_STATUS_SENT_SERVER;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  // ========== end:: icon status message


  constructor(
    public el: ElementRef,
    public g: Globals,
    public messagingService: MessagingService,
    public upSvc: UploadService,
    public contactService: ContactService,
    private agentAvailabilityService: AgentAvailabilityService
  ) {

  }

  ngOnInit() {
    console.log(' ngOnInit: app-conversation ');
    console.log(' recipientId: ', this.recipientId);
    console.log(' senderId: ', this.senderId);
    console.log(' projectid: ', this.g.projectid);
    console.log(' channelType: ', this.g.channelType);
    console.log(' onSelectDepartment: ', this.departmentSelected);
    this.initAll();
    this.scrollToBottom();
  }

  /**
   * do per scontato che this.userId esiste!!!
   */
  initAll() {
    console.log(' ---------------- 1: setAvailableAgentsStatus ---------------- ');
    this.setAvailableAgentsStatus();

    console.log(' ---------------- 2: setConversation ---------------------- ');
    this.setConversation();

    console.log(' ---------------- 3: connectConversation ---------------------- ');
    this.connectConversation();

    console.log(' ---------------- 4: initializeChatManager ------------------- ');
    this.initializeChatManager();
  }



  /**
   * mi sottoscrivo al nodo /projects/' + projectId + '/users/availables
   * per verificare se c'è un agent disponibile
   */
  private setAvailableAgentsStatus() {
    this.agentAvailabilityService
    .getAvailableAgents(this.g.projectid)
    .subscribe( (availableAgents) => {
      console.log('availableAgents', availableAgents);
      if (availableAgents.length <= 0) {
        this.areAgentsAvailable = false;
        this.areAgentsAvailableText = this.g.AGENT_NOT_AVAILABLE;
      } else {
        this.areAgentsAvailable = true;
        this.areAgentsAvailableText = this.g.AGENT_AVAILABLE;
      }
      console.log('AppComponent::setAvailableAgentsStatus::areAgentsAvailable:', this.areAgentsAvailable);
    }, (error) => {
      console.error('setOnlineStatus::setAvailableAgentsStatus', error);
    }, () => {
    });
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
    *    uguale al senderId nel localStorage se esiste
    *    generateUidConversation
  */
  private setConversation() {
    console.log('setConversation recipientId: ', this.recipientId);
    if ( !this.recipientId ) { this.recipientId = this.setRecipientId(this.recipientId); }
    if ( !this.g.channelType ) { this.g.channelType = this.setChannelType(this.recipientId); }
    this.conversationWith = this.recipientId;
    console.log('createConversation.recipientId', this.recipientId);
    console.log('createConversation.channelType', this.g.channelType);
    console.log('createConversation.senderId', this.senderId);
  }

  /**
   *
   */
  private setRecipientId(recipientId) {
    let recipientIdTEMP;
    if (!recipientId) {
      recipientIdTEMP = localStorage.getItem(this.senderId);
      if (!recipientIdTEMP) {
        // questa deve essere sincrona!!!!
        recipientIdTEMP = this.messagingService.generateUidConversation(this.senderId);
      }
    }
    return recipientIdTEMP;
  }

  /**
   *
   */
  private setChannelType(recipientId) {
    let channelTypeTEMP = CHANNEL_TYPE_GROUP;
    if (recipientId) {
      if (recipientId.indexOf('group') !== -1) {
        channelTypeTEMP = CHANNEL_TYPE_GROUP;
      } else if (!this.g.projectid) {
        channelTypeTEMP = CHANNEL_TYPE_DIRECT;
      }
    }
    return channelTypeTEMP;
  }


  /**
   *  1 - init messagingService
   *  2 - connect: recupero ultimi X messaggi
   */
  private connectConversation() {
      this.messagingService.initialize( this.senderId, this.g.tenant, this.g.channelType );
      this.upSvc.initialize(this.senderId, this.g.tenant, this.conversationWith);
      this.contactService.initialize(this.senderId, this.g.tenant, this.conversationWith);
      this.messagingService.connect( this.conversationWith );
      this.messages = this.messagingService.messages;
  }


  /**
   * inizializzo variabili
   * effettuo il login anonimo su firebase
   * se il login è andato a buon fine recupero id utente
   */
  initializeChatManager() {
    this.arrayFilesLoad = [];
    this.attributes = this.setAttributes();
    this.setSubscriptions();

    // this.isOpenSelectionDepartment = false;
    // if (!this.attributes.departmentId) {
    //     this.departmentSelected = null;
    // }

    // configuro il form di autenticazione
    // if (!this.attributes.userEmail && !this.attributes.userFullname && this.preChatForm) {
    //     if (this.preChatFormGroup) {
    //         this.subcribeToFormChanges();
    //     }
    // } else {
    //     this.userEmail = this.attributes.userEmail;
    //     this.userFullname = this.attributes.userFullname;
    //     this.preChatForm = false;
    // }
    this.checkWritingMessages();
  }

  /**
   *
   */
  setAttributes(): any {
    let attributes: any = JSON.parse(localStorage.getItem('attributes'));
    if (!attributes || attributes === 'undefined') {
      attributes = {
        client: this.CLIENT_BROWSER,
        sourcePage: location.href,
        projectId: this.g.projectid,
        // departmentId: '',
        // departmentName: '',
        // departmentId: this.departmentSelected._id,
        // departmentName: this.departmentSelected.name,
        // userEmail: this.userEmail,
        // userName: this.userFullname
      };
      if (this.g.userEmail) {
        attributes['userEmail'] = this.g.userEmail;
      }
      if (this.g.userFullname) {
        attributes['userFullname'] = this.g.userFullname;
      }
      console.log('>>>>>>>>>>>>>> setAttributes: ', JSON.stringify(attributes));
      localStorage.setItem('attributes', JSON.stringify(attributes));
    }
    return attributes;
  }

  /**
   * imposto le sottoscrizioni
   * 1 - utente eliminato dal gruppo (CHAT CHIUSA)
   */
  setSubscriptions() {
    const that = this;
    // CHIUSURA CONVERSAZIONE (ELIMINAZIONE UTENTE DAL GRUPPO)
    // const subscriptionIsWidgetActive: Subscription = this.starRatingWidgetService.observable
    // .subscribe(isWidgetActive => {
    //   that.isWidgetActive = isWidgetActive;
    //   if (isWidgetActive === false) {
    //     localStorage.removeItem('isWidgetActive');
    //     console.log('CHIUDOOOOO!!!!:', that.isConversationOpen, isWidgetActive);
    //   } else if (isWidgetActive === true) {
    //     console.log('APROOOOOOOO!!!!:');
    //     localStorage.setItem('isWidgetActive', 'true');
    //     that.isConversationOpen = false;
    //   }
    // });
    // this.subscriptions.push(subscriptionIsWidgetActive);

    // NUOVO MESSAGGIO!!
    const obsAddedMessage: Subscription = this.messagingService.obsAdded
    .subscribe(newMessage => {
      console.log('Subscription NEW MSG');
      if ( that.startScroll || newMessage.sender === that.senderId) {
        that.scrollToBottom();
      } else if (that.scrollMe) {
        const divScrollMe = that.scrollMe.nativeElement;
        const checkContentScrollPosition = that.checkContentScrollPosition(divScrollMe);
        if (checkContentScrollPosition) {
          // https://developer.mozilla.org/it/docs/Web/API/Element/scrollHeight
          setTimeout(function () {
            that.scrollToBottom();
          }, 500);
        } else {
          that.NUM_BADGES++;
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
    const that = this;
    this.messagingService.checkListMessages(this.conversationWith)
    .then(function (snapshot) {
        console.log('checkListMessages: ', snapshot);
        if (snapshot.exists()) {
            that.isNewConversation = false;
            console.log('IS NOT NEW CONVERSATION ?', that.isNewConversation);
            setTimeout(function () {
                if (that.messages.length === 0) {
                    that.isNewConversation = true;
                }
            }, 2000);
            // that.isLogged = true;
            // console.log('IS_LOGGED', 'AppComponent:createConversation:snapshot.exists-if', that.isLogged);
            // that.setFocusOnId('chat21-main-message-context');
        } else {
            /**
             * se è una nuova conversazione:
             * verifico se departmentId e projectid sono settati
             * focus sul input messaggio
             */
            that.isNewConversation = true;
            console.log('IS NEW CONVERSATION ?', that.isNewConversation);
            //if (that.g.projectid && !that.g.attributes.departmentId) {
                // that.isLogged = false;
                // console.log("IS_LOGGED", "AppComponent:createConversation:snapshot.exists-else-!department", that.isLogged);
                //that.getMongDbDepartments();
            //} else {
                that.setFocusOnId('chat21-main-message-context');
                //that.isLogged = true;
                //console.log('IS_LOGGED', 'AppComponent:createConversation:snapshot.exists-else-department', that.isLogged);
            //}
        }

        setTimeout(function () {
            console.log('GET listMessages: ', that.conversationWith);
            that.messagingService.listMessages(that.conversationWith);
        }, 500);


    }).catch(function (error) {
        console.error('checkListMessages ERROR: ', error);
    });
  }




  setFocusOnId(id) {
    setTimeout(function () {
        const textarea = document.getElementById(id);
        if (textarea) {
            // console.log('1--------> FOCUSSSSSS : ', textarea);
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
      console.log('onkeypress **************', keyCode);
      if (keyCode === 13) {
          this.performSendingMessage();
      }
  }

  private performSendingMessage() {
      // const msg = document.getElementsByClassName('f21textarea')[0];
      const msg = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);
      if (msg && msg.trim() !== '') {
          // console.log('sendMessage -> ', this.textInputTextArea);
          this.resizeInputField();
          // this.messagingService.sendMessage(msg, TYPE_MSG_TEXT);
          //this.setDepartment();
          this.sendMessage(msg, TYPE_MSG_TEXT);
          //this.scrollToBottom();
      }
      // (<HTMLInputElement>document.getElementById('chat21-main-message-context')).value = '';
      // this.textInputTextArea = '';
      this.restoreTextArea();
  }

  private restoreTextArea() {
    // console.log('AppComponent:restoreTextArea::restoreTextArea');
    this.resizeInputField();
    const textArea = (<HTMLInputElement>document.getElementById('chat21-main-message-context'));
    this.textInputTextArea = ''; // clear the textarea
    if (textArea) {
        textArea.value = '';  // clear the textarea
        textArea.placeholder = this.g.LABEL_PLACEHOLDER;  // restore the placholder
          console.log('AppComponent:restoreTextArea::restoreTextArea::textArea:', 'restored');
    } else {
          console.error('AppComponent:restoreTextArea::restoreTextArea::textArea:', 'not restored');
    }
  }


  /**
     * invio del messaggio
     * @param msg
     * @param type
     * @param metadata
     */
    sendMessage(msg, type, metadata?) {
      (metadata) ? metadata = metadata : metadata = '';
      console.log('SEND MESSAGE: ', msg, type, metadata);
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
          // tslint:disable-next-line:max-line-length
          const messageSent = this.messagingService.sendMessage(recipientFullname, msg, type, metadata, this.conversationWith, recipientFullname, this.attributes, this.g.projectid, this.g.channelType);
          this.triggerAfterSendMessageEvent(messageSent);
          this.isNewConversation = false;
      }
  }

  // tslint:disable-next-line:max-line-length
  private triggerBeforeSendMessageEvent(senderFullname, text, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type) {
    try {
        // tslint:disable-next-line:max-line-length
        const loadEvent = new CustomEvent('beforeMessageSend', { detail: { senderFullname: senderFullname, text: text, type: type, metadata, conversationWith: conversationWith, recipientFullname: recipientFullname, attributes: attributes, projectid: projectid, channelType: channel_type } });
        this.el.nativeElement.dispatchEvent(loadEvent);
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

  private onSendPressed(event) {
    console.log('onSendPressed:event', event);
    console.log('AppComponent::onSendPressed::isFilePendingToUpload:', this.isFilePendingToUpload);
    if (this.isFilePendingToUpload) {
      console.log('AppComponent::onSendPressed', 'is a file');
      // its a file
      this.loadFile();
      this.isFilePendingToUpload = false;
      console.log('AppComponent::onSendPressed::isFilePendingToUpload:', this.isFilePendingToUpload);
    } else {
      console.log('AppComponent::onSendPressed', 'is a message');
      // its a message
      this.performSendingMessage();
      // restore the text area
      this.restoreTextArea();
    }
  }

  
/**
     * recupero url immagine profilo
     * @param uid
     */
    getUrlImgProfile(uid): string {
      return this.IMG_PROFILE_SUPPORT;
      // if (!uid) {
      //   return this.IMG_PROFILE_SUPPORT;
      // }
      // const profile = this.contactService.getContactProfile(uid);
      // if (profile && profile.imageurl) {
      //     console.log('profile::', profile, ' - profile.imageurl', profile.imageurl);
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
      // console.log('H:: this.textInputTextArea', (document.getElementById('chat21-main-message-context') as HTMLInputElement).value , target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
      target.style.height = '100%';
      if ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value === '\n') {
          // console.log('PASSO 0');
          (document.getElementById('chat21-main-message-context') as HTMLInputElement).value = '';
          target.style.height = this.HEIGHT_DEFAULT;
      } else if (target.scrollHeight > target.offsetHeight) {
          // console.log('PASSO 2');
          target.style.height = target.scrollHeight + 2 + 'px';
      } else {
          // console.log('PASSO 3');
          target.style.height = this.HEIGHT_DEFAULT;
          // segno sto scrivendo
          // target.offsetHeight - 15 + 'px';
      }
      // tslint:disable-next-line:max-line-length
      // console.log('H:: this.textInputTextArea', this.textInputTextArea, target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
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
    // console.log('checkContentScrollPosition ::', divScrollMe);
    // console.log('divScrollMe.diff ::', divScrollMe.scrollHeight - divScrollMe.scrollTop);
    // console.log('divScrollMe.clientHeight ::', divScrollMe.clientHeight);
    if (divScrollMe.scrollHeight - divScrollMe.scrollTop <= (divScrollMe.clientHeight + 40)) {
        // console.log('SONO ALLA FINE ::');
        return true;
    } else {
        return false;
    }
  }

  /**
   * scrollo la lista messaggi all'ultimo
   * chiamato in maniera ricorsiva sino a quando non risponde correttamente
  */
  scrollToBottom() {
    const that = this;
    // const divScrollMe = this.scrollMe.nativeElement;
    setTimeout(function () {
      // console.log('scrollToBottom ::', divID);
      try {
        const objDiv = document.getElementById(that.idDivScroll);
        //// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
        objDiv.scrollIntoView(false);

        // console.log('checkContentScrollPosition ::', this.divScrollMe);
        // console.log('divScrollMe.diff ::', this.divScrollMe.scrollHeight - this.divScrollMe.scrollTop);
        // console.log('divScrollMe.clientHeight ::', this.divScrollMe.clientHeight);

        // try {
        //   this.divScrollMe.nativeElement.scrollToTop = this.divScrollMe.nativeElement.scrollHeight;
        // } catch ( err ) { }
        // // that.badgeNewMessages = 0;
      } catch (err) {
        console.log('RIPROVO ::');
        that.scrollToBottom();
      }
    }, 0);
  }

  // ========= end:: functions scroll position ======= //




// ========= begin:: functions send image ======= //
  // START LOAD IMAGE //
  /**
   * carico in locale l'immagine selezionata e apro pop up anteprima
   */
  detectFiles(event) {
    console.log('detectFiles: ', event);
    if (event) {
        this.selectedFiles = event.target.files;
        console.log('AppComponent:detectFiles::selectedFiles', this.selectedFiles);
        if (this.selectedFiles == null) {
          this.isFilePendingToUpload = false;
        } else {
          this.isFilePendingToUpload = true;
        }
        console.log('AppComponent:detectFiles::selectedFiles::isFilePendingToUpload', this.isFilePendingToUpload);
        console.log('fileChange: ', event.target.files);
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
            console.log('OK preload: ', nameFile, typeFile, reader);
            reader.addEventListener('load', function () {
              console.log('addEventListener load', reader.result);
              that.isFileSelected = true;
              // se inizia con image
              if (typeFile.startsWith('image')) {
                const imageXLoad = new Image;
                console.log('onload ', imageXLoad);
                imageXLoad.src = reader.result.toString();
                imageXLoad.title = nameFile;
                imageXLoad.onload = function () {
                  console.log('onload immagine');
                  // that.arrayFilesLoad.push(imageXLoad);
                  const uid = imageXLoad.src.substring(imageXLoad.src.length - 16);
                  that.arrayFilesLoad[0] = { uid: uid, file: imageXLoad, type: typeFile };
                  console.log('OK: ', that.arrayFilesLoad[0]);
                  // INVIO MESSAGGIO
                  that.loadFile();
                };
              } else {
                console.log('onload file');
                const fileXLoad = {
                  src: reader.result.toString(),
                  title: nameFile
                };
                // that.arrayFilesLoad.push(imageXLoad);
                const uid = fileXLoad.src.substring(fileXLoad.src.length - 16);
                that.arrayFilesLoad[0] = { uid: uid, file: fileXLoad, type: typeFile };
                console.log('OK: ', that.arrayFilesLoad[0]);
                // INVIO MESSAGGIO
                that.loadFile();
              }
              
            }, false);

            if (event.target.files[0]) {
              reader.readAsDataURL(event.target.files[0]);
              console.log('reader-result: ', event.target.files[0]);
            }
        }
    }
  }


  loadFile() {
        console.log('that.fileXLoad: ', this.arrayFilesLoad);
        // al momento gestisco solo il caricamento di un'immagine alla volta
        if (this.arrayFilesLoad[0] && this.arrayFilesLoad[0].file) {
            const fileXLoad = this.arrayFilesLoad[0].file;
            const uid = this.arrayFilesLoad[0].uid;
            const type = this.arrayFilesLoad[0].type;
            console.log('that.fileXLoad: ', type);
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
            console.log('metadata -------> ', metadata);
            this.scrollToBottom();
            // 1 - aggiungo messaggio localmente
            // this.addLocalMessageImage(metadata);
            // 2 - carico immagine
            const file = this.selectedFiles.item(0);
            this.uploadSingle(metadata, file);
            //this.isSelected = false;
        }
    }


  /**
   *
   */
    uploadSingle(metadata, file) {
        const that = this;
        const send_order_btn = <HTMLInputElement>document.getElementById('chat21-start-upload-doc');
        send_order_btn.disabled = true;
        console.log('AppComponent::uploadSingle::', metadata, file);
        // const file = this.selectedFiles.item(0);
        const currentUpload = new UploadModel(file);
        const uploadTask = this.upSvc.pushUpload(currentUpload);
        uploadTask.then(snapshot => {
            return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
        })
            .then(downloadURL => {
                console.log('AppComponent::uploadSingle:: downloadURL', downloadURL);
                console.log(`Successfully uploaded file and got download link - ${downloadURL}`);

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
      console.log('reader-result: ', file);
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
      // console.log('message::: ', metadata);
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
      console.log('UPDATE MSG:', message.metadata.uid);
      const index = searchIndexInArrayForUid(this.messages, message.metadata.uid);
      if (index > -1) {
          this.messages[index].uid = message.uid;
          this.messages[index].status = message.status;
          this.messages[index].timestamp = message.timestamp;
          this.messages[index].headerDate = message.headerDate;
          console.log('UPDATE ok:', this.messages[index]);
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
  //     console.log('1 selectedFiles: ', this.selectedFiles);

  //     delete this.arrayFiles4Load[0];
  //     document.getElementById('chat21-file').nodeValue = null;
  //     // event.target.files[0].name, event.target.files
  //     this.isSelected = false;

  //     this.isFilePendingToUpload = false;
  //     console.log('AppComponent::resetLoadImage::isFilePendingToUpload:', this.isFilePendingToUpload);

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
  //     console.log('addLocalMessageImage: ', this.messages);
  //     this.isSelected = true;
  //     this.scrollToBottom();
  // }
  
  // ========= end:: functions send image ======= //

  returnHome() {
    this.eventClose.emit();
  }

}
