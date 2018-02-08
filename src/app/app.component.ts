import { Component, OnInit, OnDestroy } from '@angular/core';

import * as moment from 'moment';
import { environment } from '../environments/environment';

// services
import { AuthService } from './core/auth.service';
import { MessagingService } from './providers/messaging.service';
// models
import { MessageModel } from '../models/message';
// utils
// import { setHeaderDate, searchIndexInArrayForUid, urlify } from './utils/utils';
// tslint:disable-next-line:max-line-length
import { MAX_WIDTH_IMAGES, UID_SUPPORT_GROUP_MESSAGES, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER } from './utils/constants';


// https://www.davebennett.tech/subscribe-to-variable-change-in-angular-4-service/
import { Subscription } from 'rxjs/Subscription';


import { UploadModel } from '../models/upload';
import { UploadService } from './providers/upload.service';
import { ContactService } from './providers/contact.service';
// import { StarRatingWidgetComponent } from './components/star-rating-widget/star-rating-widget.component';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy, OnInit  {
    isShowed: boolean; /** indica se il pannello conversazioni è aperto o chiuso */
    loggedUser: any;
    subscriptions: Subscription[] = [];
    arrayImages4Load: Array<any>;
    arrayLocalImmages:  Array<any> = [];
    messages: MessageModel[];
    conversationWith: string;
    senderId: string;
    // recipientId: string;
    // conversationId: string;
    nameImg: string;

    tenant: string;
    // agentId: string;

    imageXLoad = new Image;
    isSelected = false;

    MSG_STATUS_SENT = MSG_STATUS_SENT;
    MSG_STATUS_SENT_SERVER = MSG_STATUS_SENT_SERVER;
    MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;

    textInputTextArea: String;
    HEIGHT_DEFAULT = '40px';
    myStyles = {
        'overflow-x': 'hidden',
        'word-wrap': 'break-word',
        'resize': 'none',
        'overflow-y': 'auto',
        'height': this.HEIGHT_DEFAULT,
        'max-height': '100px',
        'border': 'none',
        'padding': '10px'
    };
    private selectedFiles: FileList;
    isWidgetActive: boolean;
    // private currentUpload: UploadModel;

    constructor(
        public authService: AuthService,
        public messagingService: MessagingService,
        // public starRatingWidgetComponent: StarRatingWidgetComponent,
        public upSvc: UploadService,
        public contactService: ContactService
    ) {
        this.tenant = location.search.split('tenant=')[1];
        this.isWidgetActive = false;
        // this.agentId = location.search.split('agentId=')[1];
        // tenant: 'chat21',
        // agentId: '9EBA3VLhNKMFIVa0IOco82TkIzk1'
    }

    /**
     * creo sottoscrizione ad array messaggi del provider
     * inizializzo la pagina
     */
    ngOnInit() {
        const that = this;
        const subscriptionMessages: Subscription = this.messagingService.observable
        .subscribe(messages => {
            that.messages = messages;
            console.log('subscriptionMessages:', that.subscriptions, subscriptionMessages);
            that.scrollToBottom();
        });
        this.subscriptions.push(subscriptionMessages);


        const subscriptionRatingWidget: Subscription = this.messagingService.observableWidgetActive
        .subscribe(isWidgetActive => {
            that.isWidgetActive = isWidgetActive;
            console.log('subscriptionRatingWidget:', that.isWidgetActive, subscriptionRatingWidget);
        });
        this.subscriptions.push(subscriptionRatingWidget);
        this.initialize();
    }

    /**
     * elimino tutte le sottoscrizioni
     */
    ngOnDestroy() {
        this.subscriptions.forEach(function(subscription) {
            subscription.unsubscribe();
        });
    }

    /**
     * inizializzo variabili
     * effettuo il login anonimo su firebase
     * se il login è andato a buon fine recupero id utente
     */
    initialize() {
        const that = this;
        moment.locale('it');
        this.isShowed = false;
        this.messages = [];
        this.arrayImages4Load = [];

        this.authService.authenticateFirebaseAnonymously()
        .then(function(user) {
            that.loggedUser = user;
            that.createConversation(user);
        })
        .catch(function(error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            that.messages = [];
            console.log('22222 signInAnonymously KO:', errorCode, errorMessage);
            // devo scrivere un messaggio di errore e aggiungere un pulsante riprova
        });
    }

    /**
     * IMPOSTO: senderId, recipientId, conversationId, conversationWith
     * 1 - recupero il senderId dell'utente loggato che scrive
     * 2 - recupero recipientId impostato nel file environment
     * 3 - inizializzo messagingService
     * 4 - recupero messaggi conversazione
     */
    createConversation(user) {
        this.senderId = user.uid;
        // this.recipientId = environment.agentId;
        // this.conversationId = environment.agentId;
        // this.conversationWith = environment.agentId;

        if (!this.tenant) {
            this.tenant = environment.tenant;
        }
        this.messagingService.initialize(user,  this.tenant);

        const key = sessionStorage.getItem(UID_SUPPORT_GROUP_MESSAGES);
        console.log('generateUidConversation **************', key, user.uid);
        if (key) {
            this.conversationWith = key;
        } else {
            this.conversationWith = this.messagingService.generateUidConversation();
        }

        console.log('createConversation: ', this.tenant, this.conversationWith);
        this.upSvc.initialize(user.uid,  this.tenant, this.conversationWith);
        this.messagingService.listMessages(this.conversationWith);
        this.contactService.initialize(user.uid, this.tenant, this.conversationWith);
    }

    //// ACTIONS ////
    /**
     * apro il popup conversazioni
     */
    f21_open() {
        this.isShowed = !this.isShowed;
        // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
        console.log('isShowed::', this.isShowed);
        if (this.isShowed) {
            this.scrollToBottom();
        }
    }
    /**
    * chiudo il popup conversazioni
    */
    f21_close() {
        console.log('isShowed::', this.isShowed);
        this.isShowed = false;
    }
    // /**
    //  * f21_update_view_height
    // */
    // f21_update_view_height() {
    //     const target = document.getElementById('chat21-main-message-context');
    //     console.log('f21_update_view_height::', target.style, target.offsetHeight);
    //     // const messageString = document.getElementsByTagName('f21textarea')[0].value;
    //     const messageString = document.getElementsByClassName('f21textarea')[0].nodeValue;
    //     console.log('f21_update_view_height::', messageString);
    //     // console.log('************ $messageString2', messageString.trim());
    //     if (messageString === '') {
    //         document.getElementsByClassName('f21textarea')[0].nodeValue = '';
    //         console.log('************ messageString ----->', document.getElementsByClassName('f21textarea')[0].nodeValue, '<-----');
    //         return;
    //     }
    // }

    /**
     * srollo la lista messaggi all'ultimo
     * chiamato in maniera ricorsiva sino a quando non risponde correttamente
     */
    scrollToBottom() {
        const that = this;
        setTimeout(function() {
            try {
                const objDiv = document.getElementById('scrollMe');
                console.log('scrollTop1 ::', objDiv.scrollTop,  objDiv.scrollHeight);
                // if (objDiv.scrollTop !== objDiv.scrollHeight) {
                //     objDiv.scrollTop = objDiv.scrollHeight + 10;
                //     console.log('scrollTop1 ::', objDiv.scrollTop);
                // }
                //// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
                document.getElementById('scrollMe').scrollIntoView(false);
            } catch (err) {
                console.log('RIPROVO ::', that.isShowed);
                if (that.isShowed === true) {
                    that.scrollToBottom();
                }
            }
        }, 300);
    }

    /**
     * ridimensiona la textarea
     * chiamato ogni volta che cambia il contenuto della textarea
     */
    resizeInputField() {
        const target = document.getElementById('chat21-main-message-context');
        // tslint:disable-next-line:max-line-length
        console.log('H:: this.textInputTextArea', (document.getElementById('chat21-main-message-context') as HTMLInputElement).value , target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
        target.style.height = '100%';
        if ( (document.getElementById('chat21-main-message-context') as HTMLInputElement).value === '\n' ) {
            console.log('PASSO 0');
            (document.getElementById('chat21-main-message-context') as HTMLInputElement).value = null;
            target.style.height = this.HEIGHT_DEFAULT;
        } else if (target.scrollHeight > target.offsetHeight ) {
            console.log('PASSO 2');
            target.style.height = target.scrollHeight + 2 + 'px';
        } else {
            console.log('PASSO 3');
            target.style.height = this.HEIGHT_DEFAULT; // target.offsetHeight - 15 + 'px';
        }
        // tslint:disable-next-line:max-line-length
        console.log('H:: this.textInputTextArea', this.textInputTextArea, target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);

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
        // const msg = document.getElementsByClassName('f21textarea')[0];
        const msg = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);
        const keyCode = event.which || event.keyCode;
        console.log('onkeypress **************', keyCode, msg);
        if (keyCode === 13) {

            // const target = document.getElementById('chat21-main-message-context');
            // target.style.height = this.HEIGHT_DEFAULT;
            // target.blur();
            // setTimeout(function() {
            //     target.focus();
            // }, 500);

            if (msg && msg.trim() !== '') {
                console.log('sendMessage -> ', this.textInputTextArea);
                this.resizeInputField();
                // this.messagingService.sendMessage(msg, TYPE_MSG_TEXT);
                this.sendMessage(msg, TYPE_MSG_TEXT);
                this.scrollToBottom();
            }
            this.textInputTextArea = null;
        }
    }

    detectFiles(event) {
        console.log('event: ', event.target.files[0].name, event.target.files);
        // let profileModal = this.modalCtrl.create(UpdateImageProfilePage, {event: event}, { enableBackdropDismiss: false });
        // profileModal.present();
        if (event) {
            this.selectedFiles = event.target.files;
            this.fileChange(event);
          }
      }

      fileChange(event) {
        // delete this.arrayImages4Load[0];
        console.log('fileChange: ', event.target.files);
        const that = this;
        if (event.target.files && event.target.files[0]) {
            this.nameImg = event.target.files[0].name;
            // const preview = document.querySelector('img');
            // const file    = document.querySelector('input[type=file]').files[0];
            const reader  = new FileReader();
            reader.addEventListener('load', function () {
                that.isSelected = true;
                // aggiungo nome img in un div 'event.target.files[0].name'
                // aggiungo div pulsante invio
                // preview.src = reader.result;
                const imageXLoad = new Image;
                imageXLoad.src = reader.result;
                imageXLoad.title = that.nameImg;
                imageXLoad.onload = function() {
                    //that.arrayImages4Load.push(imageXLoad);
                    that.arrayImages4Load[0] = imageXLoad;
                };
            }, false);
            if (event.target.files[0]) {
                reader.readAsDataURL(event.target.files[0]);
                console.log('reader-result: ', event.target.files[0]);
            }
        }
      }

      loadImage() {
        // al momento gestisco solo il caricamento di un'immagine alla volta
        const imageXLoad = this.arrayImages4Load[0];
        console.log('that.imageXLoad: ', imageXLoad);
        // const key = imageXLoad.src.substring(imageXLoad.src.length - 16);
        const metadata = {
            'src': imageXLoad.src,
            'width': imageXLoad.width,
            'height': imageXLoad.height,
            'status': false
          };
          // 1 - invio messaggio
          this.onSendImage(metadata);
          // 2 - carico immagine
          const file = this.selectedFiles.item(0);
          this.uploadSingle(metadata, file);
          this.isSelected = false;
      }


      resetLoadImage() {
        console.log('resetLoadImage: ');
        this.nameImg = '';
        delete this.arrayImages4Load[0];
        document.getElementById('chat21-file').nodeValue = null;
        // event.target.files[0].name, event.target.files
        this.isSelected = false;
      }

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
    //   addImageToMessages(src, timestamp) {
    //     console.log('addImageToMessages: ', src);
    //     const  metadata = {
    //         'uid': timestamp.toString(),
    //         'width': this.imageXLoad.width,
    //         'height': this.imageXLoad.height
    //     };
    //     const message = new MessageModel(
    //         timestamp.toString(),
    //         '',
    //         this.conversationWith,
    //         'Valentina',
    //         this.senderId,
    //         'Ospite',
    //         '',
    //         metadata,
    //         src,
    //         '',
    //         '',
    //         TYPE_MSG_IMAGE
    //     );
    //     this.messages.push(message);
    //     this.isSelected = true;
    //     this.scrollToBottom();
    //   }

    //   uploadSingle_old(timestamp) {
    //     const that = this;
    //     const send_order_btn = <HTMLInputElement>document.getElementById('chat21-start-upload-img');
    //     send_order_btn.disabled = true;
    //     const file = this.selectedFiles.item(0);
    //     const currentUpload = new UploadModel(file);
    //     this.upSvc.pushUpload(currentUpload)
    //     .then(function(snapshot) {
    //         console.log('Uploaded a blob or file! ', snapshot.downloadURL);
    //         that.onSendImage(snapshot.downloadURL, timestamp);
    //     })
    //     .catch(function(error) {
    //         // Handle Errors here.
    //         const errorCode = error.code;
    //         const errorMessage = error.message;
    //     });
    //     console.log('reader-result: ');
    //   }

      uploadSingle(metadata, file) {
        const that = this;
        const send_order_btn = <HTMLInputElement>document.getElementById('chat21-start-upload-img');
        send_order_btn.disabled = true;

        console.log('uploadSingle: ', metadata, file);
        // const file = this.selectedFiles.item(0);
        const currentUpload = new UploadModel(file);
        this.upSvc.pushUpload(currentUpload)
        .then(function(snapshot) {
          console.log('Uploaded a file! ', snapshot.downloadURL);
          that.updateMetadataMessage(metadata);
        })
        .catch(function(error) {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log('error: ', errorCode, errorMessage);
        });
        console.log('reader-result: ', file);
      }

      updateMetadataMessage(metadata) {
        // recupero id nodo messaggio
        const key = metadata.src.substring(metadata.src.length - 16);
        const uid =  this.arrayLocalImmages[key];
        console.log('UPDATE MESSAGE: ', key, uid);
        this.messagingService.updateMetadataMessage(uid, metadata);
        delete this.arrayLocalImmages[key];
      }

      addLocalImage4Key(key, resultSendMsgKey) {
        this.arrayLocalImmages[key] = resultSendMsgKey;
      }

      onSendImage(metadata) {
        console.log('onSendImage::::: ', metadata);
        this.sendMessage('', TYPE_MSG_IMAGE, metadata);
        // this.scrollToBottom();
        this.textInputTextArea = null;
      }

      sendMessage(msg, type, metadata?) {
        (metadata) ? metadata = metadata : metadata = '';
        console.log('SEND MESSAGE: ', msg);
        if (msg && msg.trim() !== '' || type !== TYPE_MSG_TEXT ) {
          // tslint:disable-next-line:max-line-length
          const resultSendMsgKey = this.messagingService.sendMessage(msg, type, metadata, this.conversationWith);
          console.log('resultSendMsgKey: ', resultSendMsgKey);
          if (resultSendMsgKey) {
            if (metadata) {
              const key = metadata.src.substring(metadata.src.length - 16);
              this.addLocalImage4Key(key, resultSendMsgKey);
            }
            this.scrollToBottom();
          }
        }
      }

    //   onSendImage(url, timestamp) {
    //     console.log('onSendImage::::: ', url, this.imageXLoad.width, this.imageXLoad.height);
    //     const metadata = {
    //         'uid': timestamp.toString(),
    //         'width': this.imageXLoad.width,
    //         'height': this.imageXLoad.height
    //     };
    //     console.log('onSendImage::::: ', metadata, url);
    //     this.messagingService.sendMessage(url, TYPE_MSG_IMAGE, metadata);
    //     this.scrollToBottom();
    //     this.textInputTextArea = null;
    // }

    getHeightImg(metadata): string {
        const rapporto = (metadata['width'] / metadata['height']);
        const h = 230 / rapporto;
        return h.toString();
    }


    getUrlImgProfile(uid): string {
        // console.log('getUrlImgProfile::::: ', uid);
        const profile = this.contactService.getContactProfile(uid);
        if (profile && profile.imageurl) {
            return profile.imageurl;
        } else {
            return '';
        }
    }



    openRate() {
        console.log('this.isWidgetActive', this.isWidgetActive);
        this.isWidgetActive = true;
    }
    closeRate() {
        console.log('this.isWidgetActive', this.isWidgetActive);
        this.isWidgetActive = false;
    }
}
