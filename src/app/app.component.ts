import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from 'angular-2-local-storage';
import { UUID } from 'angular2-uuid';
import * as moment from 'moment';
import { environment } from '../environments/environment';
import * as firebase from 'firebase/app';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewChecked, AfterViewInit  {
    @ViewChild('scrollMe') myScrollContainer: ElementRef;
    // @ViewChild('content') content: ElementRef;
    disableScrollDown = false;

  isShowed: boolean;
  messages: FirebaseListObservable<any>;
  db: AngularFireDatabase;
  // newMessageText: string;
  testo: string;
  senderId: string;
  recipientId: string;
  conversationId: string;
  tenant: string;
  public chat21_tenant: string;
  public panelBodyOpen: boolean;
  MSG_STATUS_SENT = 1;
  MSG_STATUS_RETURN_RECEIPT = 2;
  HEIGHT_DEFAULT = '35px';

  myStyles = {
    'overflow-x': 'hidden',
    'word-wrap': 'break-word',
    'resize': 'none',
    'overflow-y': 'auto',
    'height': this.HEIGHT_DEFAULT,
    'max-height': '100px',
    'border': 'none'
};

  constructor(
      db: AngularFireDatabase,
      private localStorageService: LocalStorageService
    ) {

    console.log('chat21_web_widget_version 2.0');
    console.log('chat21_tenant ',  this.chat21_tenant);
    moment.locale('it');
    this.db = db;
    this.isShowed = false;
    this.panelBodyOpen = true;
    this.tenant = environment.tenant;
    console.log('this.tenant ',  this.tenant);

    this.senderId = localStorageService.get<string>('senderId');
    console.log('this.senderId', this.senderId);


    if (!this.senderId) {
      let uuid = UUID.UUID();
     // uuid = uuid.replace('-', '_');
      uuid = uuid.split('-').join('_');
      localStorageService.set('senderId', uuid);
      this.senderId = uuid;
       console.log('generated new senderId :', uuid);
    }
    this.recipientId = environment.agentId;

    if (this.senderId.localeCompare(this.recipientId) < 0) {
        this.conversationId = this.senderId + '-' + this.recipientId;
    }else {
        this.conversationId = this.recipientId + '-' + this.senderId;
    }
    console.log('this.conversationId  :', this.conversationId );

    // se esiste la conversazione apro il popup!!!!
    // Determine which child keys in DataSnapshot have data.
    const url = '/apps/' + this.tenant + '/messages/';
    const ref = firebase.database().ref(url);
    const that = this;
    ref.once('value')
    .then(function(snapshot) {
        if (snapshot.child(that.conversationId).exists()) {
            // that.panelBodyOpen = true;
            console.log('LA CONVERSAZIONE ESISTE');
        } else {
            // that.panelBodyOpen = false;
            console.log('LA CONVERSAZIONE NON ESISTE');
        }
    });

    this.messages = db.list(url + this.conversationId);
    // this.messages.$ref
    // .on("child_added", (child) => {
    //   console.log("child_added", child.key, child.val());
    //   that.scrollToBottom();
    // });
    console.log('this.messages', this.messages);
  }


ngOnInit() {
    // this.scrollToBottom();
}

ngAfterViewInit() {
    // console.log('ngAfterViewInit::');
}

ngAfterViewChecked() {
    // this.scrollToBottom();
}

f21_open() {
    this.isShowed = !this.isShowed;
    // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
    console.log('isShowed::', this.isShowed);
    if (this.isShowed) {
        this.scrollToBottom();
    }
}

f21_close() {
    console.log('isShowed::', this.isShowed);
    this.isShowed = false;
}


f21_update_view_height() {
    const target = document.getElementById('f21-main-message-context');
    console.log('f21_update_view_height::', target.style, target.offsetHeight);
    const messageString = document.getElementsByTagName('textarea')[0].value;
    console.log('f21_update_view_height::', messageString);

    // console.log('************ $messageString2', messageString.trim());
    if (messageString === '') {
        document.getElementsByTagName('textarea')[0].value = '';
      console.log('************ messageString ----->', document.getElementsByTagName('textarea')[0].value, '<-----');
      return;
    }
    // if (event.inputType == "insertLineBreak" && messageString == null){
    //   console.log('************ insertLineBreak');
    //   return;
    // }
    // se messageString contiene \n non dimensiono!!!
    // var match = /\r|\n/.exec(messageString);
    // if (!match) {
    //   this.adjust();
    // }
}

/**
 *
 */
scrollToBottom() {
    const that = this;
    setTimeout(function() {
        try {
            const objDiv = document.getElementById('scrollMe');
            if (objDiv.scrollTop !== objDiv.scrollHeight) {
                objDiv.scrollTop = objDiv.scrollHeight;
            }
            document.getElementById('scrollMe').scrollIntoView(false);
            console.log('scrollTop ::', objDiv.scrollTop,  objDiv.scrollHeight);
        } catch (err) {
            console.log('RIPROVO ::');
            that.scrollToBottom();
        }
    }, 300);
}

/**
 *
 */
resizeInputField() {
    const target = document.getElementById('f21-main-message-context');
    console.log('H::', target.scrollHeight, target.offsetHeight, target.clientHeight);
    target.style.height = '100%';
    if (target.scrollHeight > target.offsetHeight) {
        target.style.height = target.scrollHeight + 2 + 'px';
        // target.style.background-color = 'red';
    } else {
        // target.offsetHeight = 'auto';
        target.style.height = this.HEIGHT_DEFAULT; // target.offsetHeight - 15 + 'px';
    }
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
    const msg = document.getElementsByTagName('textarea')[0].value;
    const keyCode = event.which || event.keyCode;
    console.log('onkeypress **************', keyCode);
    if (keyCode === 13) {
        document.getElementsByTagName('textarea')[0].value = '';
        this.testo = '';
        const target = document.getElementById('f21-main-message-context');
        target.style.height = this.HEIGHT_DEFAULT;
        target.blur();
        setTimeout(function() {
            target.focus();
        }, 500);
        if (msg && msg.trim() !== '') {
            this.sendMessage(msg);
            this.scrollToBottom();
        }
    }
}

/**
 * invio messaggio
 * purifico il testo del messaggio
 * creo un oggetto messaggio e lo aggiungo all'array di messaggi
 * @param msg
 */
sendMessage(msg) {
    const messageString = this.controlOfMessage(msg);
    console.log('text::::: ', messageString);
    const now: Date = new Date();
    const timestamp = now.valueOf();
    // creo messaggio e lo aggiungo all'array
    // cambio lo stato da 0 a 1 e lo invio
    // quando lo ricevo cambio lo stato a 2
    const message = {
        conversationId: this.conversationId,
        recipient: this.recipientId,
        sender: this.senderId,
        // sender_fullname: this.user.displayName,
        // status: 2,
        text: messageString,
        timestamp: timestamp,
        type: 'text'
    };
    console.log('messaggio **************', message);
    this.messages.push(message);
    this.createSenderConversation(message);
    this.createReceiverConversation(message);
    this.panelBodyOpen = true;

    this.scrollToBottom();
}

/**
 * purifico il messaggio
 * e lo passo al metodo di invio
 */
controlOfMessage(messageString): string {
    // let messageString = document.getElementsByTagName('textarea')[0].value;
    console.log('controlOfMessage **************', messageString);
    messageString = messageString.replace(/(\r\n|\n|\r)/gm, '');
    if (messageString.trim() !== '') {
        return messageString;
    }
    return '';
}

createSenderConversation(message: any) {
  const senderIdNormalized = message.sender.replace('.', '_');
  const conversationsPathDb = '/apps/' + this.tenant + '/users/' + senderIdNormalized + '/conversations/' + this.conversationId;
  console.log('createSenderConversation.conversationsPathDb: ', conversationsPathDb);
  const converationsObj = this.db.object(conversationsPathDb);
  const conversation = {
            convers_with: message.recipient,
            is_new: true,
            last_message_text: message.text,
            recipient: message.recipient,
            sender: message.sender,
            status: 2,
            timestamp: message.timestamp,
        };
  converationsObj.set(conversation);
}

createReceiverConversation(message: any) {
  const receiverIdNormalized = message.recipient.replace('.', '_');
  const conversationsPathDb = '/apps/' + this.tenant + '/users/' + receiverIdNormalized + '/conversations/' + this.conversationId;
  console.log('createReceiverConversation.conversationsPathDb: ', conversationsPathDb);
  const  converationsObj = this.db.object(conversationsPathDb);
  const conversation = {
            convers_with: message.sender,
            is_new: true,
            last_message_text: message.text,
            recipient: message.recipient,
            sender: message.sender,
            status: 2,
            timestamp: message.timestamp,
        };
  converationsObj.set(conversation);
}


}
