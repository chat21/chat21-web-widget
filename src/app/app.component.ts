import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from 'angular-2-local-storage';
import { UUID } from 'angular2-uuid';
import * as moment from 'moment';
import { environment } from '../environments/environment';
import * as firebase from 'firebase/app';
import {FormsModule} from '@angular/forms';

// models
import { MessageModel } from '../models/message';
// utils
import { setHeaderDate, searchIndexInArrayForUid, urlify } from './utils/utils';
import { MSG_STATUS_RECEIVED, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT } from './utils/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewChecked, AfterViewInit  {
    //@ViewChild('scrollMe') myScrollContainer: ElementRef;
    //@ViewChild('f21Textarea') f21Textarea: ElementRef;

    disableScrollDown = false;
    isShowed: boolean;
    firebaseMessages: any;
    messagesRef;
    db: AngularFireDatabase;
    localStorageService: LocalStorageService;
    messages: any[];
    conversationWith: string;
    loggedUser: any;
    urlNodeFirebase: string;

    testo: string;
    senderId: string;
    recipientId: string;
    conversationId: string;
    tenant: string;
    chat21_tenant: string;
    panelBodyOpen: boolean;
    MSG_STATUS_SENT = MSG_STATUS_SENT;
    MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
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
    localStorageService: LocalStorageService,
    afAuth: AngularFireAuth
) {
    console.log('chat21_tenant ',  this.chat21_tenant);
    this.db = db;
    this.localStorageService = localStorageService;
    this.initialize();
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

/**
 * 
 */
initialize() {
    moment.locale('it');
    this.isShowed = false;
    this.panelBodyOpen = true;
    this.tenant = environment.tenant;
    console.log('this.tenant ',  this.tenant);
    this.messages = [];
    this.authenticateFirebaseAnonymously();
    console.log('this.conversationId  :', this.conversationId );
}
/**
 * 
 */
authenticateFirebaseAnonymously() {
    const that = this;
    firebase.auth().signInAnonymously()
    .then(function(user) {
        that.loggedUser = user;
        console.log('signInAnonymously OK :', user);
        that.getSenderId(user);
    })
    .catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // ...
        console.log('signInAnonymously KO:', errorCode, errorMessage);
    });
    // firebase.auth().onAuthStateChanged(function(user) {
    //     if (user) {
    //         // User is signed in.
    //         const isAnonymous = user.isAnonymous;
    //         const uid = user.uid;
    //         console.log('AUTENTICATE :', user);
    //         // ...
    //     } else {
    //         // User is signed out.
    //         // ...
    //         console.log('NON AUTENTICATE :');
    //     }
    // });
}

/**
 * IMPOSTO: senderId e recipientId
 * 1 - recupero il senderId dell'utente che scrive
 * 1.1 - provo a recuperarlo dal local storage
 * 1.2 - se non esiste ne imposto uno nuovo sostituisco il - con _ e salvo in localstorage
 * 2 - recupero recipientId impostato nel file environment
 * 3 - imposto conversation id
 */
getSenderId(user) {
    this.senderId = this.localStorageService.get<string>('senderId');
    console.log('this.senderId', this.senderId);

    if (!this.senderId) {
        let uuid = user.uid; // UUID.UUID();
        uuid = uuid.split('-').join('_');
        this.localStorageService.set('senderId', uuid);
        this.senderId = uuid;
        console.log('generated new senderId :', uuid);
    }
    this.recipientId = environment.agentId;
    this.conversationId = this.recipientId;
    this.conversationWith = environment.agentId;
    this.listMessages();
}

/**
 * 
 */
listMessages() {
    let lastDate: string = '';
    //this.firebaseMessages = this.messageProvider.loadListMeggages(this.conversationWith);
    //this.firebaseMessages.limitToLast(100).on("value", function(snapshot) {


    // verifico se esiste la conversazione !!!!
    // Determine which child keys in DataSnapshot have data.
    // const url = '/apps/' + this.tenant + '/users/' + this.senderId + '/conversations';
    const that = this;
    this.urlNodeFirebase = '/apps/' + this.tenant + '/users/' + this.senderId + '/messages/' + this.conversationId;
    console.log('urlNodeFirebase *****', this.urlNodeFirebase);
    const firebaseMessages = firebase.database().ref(this.urlNodeFirebase);
    this.messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(100);
    this.messagesRef.on('child_changed', function(childSnapshot) {
        console.log('child_changed *****', childSnapshot.key);
        const itemMsg = childSnapshot.val();

        // imposto il giorno del messaggio per visualizzare o nascondere l'header data
        const calcolaData = setHeaderDate(itemMsg['timestamp'], lastDate);
        if (calcolaData != null) {
            lastDate = calcolaData;
        }

        // creo oggetto messaggio e lo aggiungo all'array dei messaggi
        // tslint:disable-next-line:max-line-length
        const msg = new MessageModel(childSnapshot.key, itemMsg['language'], itemMsg['recipient'], itemMsg['recipient_fullname'], itemMsg['sender'], itemMsg['sender_fullname'], itemMsg['status'], itemMsg['text'], itemMsg['timestamp'], calcolaData, itemMsg['type']);

        const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
        console.log('child_changed222 *****', index, that.messages, childSnapshot.key);
        that.messages.splice(index, 1, msg);
        // aggiorno stato messaggio
        // questo stato indica che è stato consegnato al client e NON che è stato letto
        that.setStatusMessage(childSnapshot, that.conversationWith);
        // pubblico messaggio - sottoscritto in dettaglio conversazione
    });

    this.messagesRef.on('child_removed', function(childSnapshot) {
      // al momento non previsto!!!
      const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
        // controllo superfluo sarà sempre maggiore
        if (index > -1) {
          that.messages.splice(index, 1);
        }
    });

    this.messagesRef.on('child_added', function(childSnapshot) {
      const itemMsg = childSnapshot.val();
      console.log('child_added *****', childSnapshot.key);
      // imposto il giorno del messaggio per visualizzare o nascondere l'header data
      const calcolaData = setHeaderDate(itemMsg['timestamp'], lastDate);
      if (calcolaData != null) {
        lastDate = calcolaData;
      }

      // creo oggetto messaggio e lo aggiungo all'array dei messaggi
      const messageText = urlify(itemMsg['text']);
      // tslint:disable-next-line:max-line-length
      const msg = new MessageModel(childSnapshot.key, itemMsg['language'], itemMsg['recipient'], itemMsg['recipient_fullname'], itemMsg['sender'], itemMsg['sender_fullname'], itemMsg['status'], messageText, itemMsg['timestamp'], calcolaData, itemMsg['type']);
      console.log('child_added *****', calcolaData, that.messages, msg);
      that.messages.push(msg);
      // aggiorno stato messaggio
      // questo stato indica che è stato consegnato al client e NON che è stato letto
      //that.setStatusMessage(childSnapshot, that.conversationWith);
    });



    // this.firebaseMessages = firebase.database().ref(url);
    // console.log('listMessages:: ', url, this.firebaseMessages);
    // // this.firebaseMessages.once('value')
    // this.firebaseMessages.on('value')
    // .then(function(snapshot) {
    //     console.log('LA CONVERSAZIONE ESISTE', url, snapshot);

    //     // if (snapshot.child().exists()) {
    //     //     // that.panelBodyOpen = true;
    //     //     console.log('LA CONVERSAZIONE ESISTE', );
    //     // } else {
    //     //     // that.panelBodyOpen = false;
    //     //     console.log('LA CONVERSAZIONE NON ESISTE');
    //     // }
    // })
    // .catch(function(error) {
    //     // Handle Errors here.
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     // ...
    //     console.log('signInAnonymously KO:', errorCode, errorMessage);
    // });

    // this.messages = this.db.list(url + this.conversationId);
}

/**
   * arriorno lo stato del messaggio
   * questo stato indica che è stato consegnato al client e NON che è stato letto
   * se il messaggio NON è stato inviato da loggedUser AGGIORNO stato a 200
   * @param item
   * @param conversationWith
   */
  setStatusMessage(item, conversationWith) {
    if (item.val()['status'] < MSG_STATUS_RECEIVED) {
      const msg = item.val();
      if (msg.sender !== this.loggedUser.uid && msg.status < MSG_STATUS_RECEIVED) {
        // tslint:disable-next-line:max-line-length
        const urlNodeMessagesUpdate  = '/apps/' + this.tenant + '/users/' + this.loggedUser.uid + '/messages/' + conversationWith + '/' + item.key;
        console.log('AGGIORNO STATO MESSAGGIO', urlNodeMessagesUpdate);
        firebase.database().ref(urlNodeMessagesUpdate).update({ status: MSG_STATUS_RECEIVED });
      }
    }
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
    //const messageString = document.getElementsByTagName('f21textarea')[0].value;
    const messageString = document.getElementsByClassName('f21textarea')[0].nodeValue;
    console.log('f21_update_view_height::', messageString);
    // console.log('************ $messageString2', messageString.trim());
    if (messageString === '') {
        document.getElementsByClassName('f21textarea')[0].nodeValue = '';
      console.log('************ messageString ----->', document.getElementsByClassName('f21textarea')[0].nodeValue, '<-----');
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
    //const msg = document.getElementsByClassName('f21textarea')[0];
    const msg = ((document.getElementById('f21-main-message-context') as HTMLInputElement).value);
    const keyCode = event.which || event.keyCode;
    console.log('onkeypress **************', keyCode, msg);
    if (keyCode === 13) {
        document.getElementsByClassName('f21textarea')[0].nodeValue = '';
        //document.getElementById('f21textarea')[0].value = '';
        this.testo = '';
        const target = document.getElementById('f21-main-message-context');
        target.style.height = this.HEIGHT_DEFAULT;
        target.blur();
        setTimeout(function() {
            target.focus();
        }, 500);
        if (msg && msg.trim() !== '') {
            console.log('sendMessage -> ');
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
    const language = document.documentElement.lang;
    const firebaseMessages = firebase.database().ref(this.urlNodeFirebase);
    if (firebaseMessages) {
        const message = {
            language: language,
            recipient: this.recipientId,
            recipient_fullname: 'Valentina',
            sender: this.senderId,
            sender_fullname: 'Ospite',
            // status: MSG_STATUS_SENDING,
            text: messageString,
            timestamp: timestamp,
            type: 'text'
        };
        console.log('messaggio **************', message);
        const newMessageRef = firebaseMessages.push();
        newMessageRef.set(message);
    }
    this.panelBodyOpen = true;
    this.scrollToBottom();
}

/**
 * purifico il messaggio
 * e lo passo al metodo di invio
 */
controlOfMessage(messageString): string {
    // let messageString = document.getElementById('textarea')[0].value;
    console.log('controlOfMessage **************', messageString);
    messageString = messageString.replace(/(\r\n|\n|\r)/gm, '');
    if (messageString.trim() !== '') {
        return messageString;
    }
    return '';
}

// createSenderConversation(message: any) {
//   const senderIdNormalized = message.sender.replace('.', '_');
//   const conversationsPathDb = '/apps/' + this.tenant + '/users/' + senderIdNormalized + '/conversations/' + this.conversationId;
//   console.log('createSenderConversation.conversationsPathDb: ', conversationsPathDb);
//   const converationsObj = this.db.object(conversationsPathDb);
//   const conversation = {
//             convers_with: message.recipient,
//             is_new: true,
//             last_message_text: message.text,
//             recipient: message.recipient,
//             sender: message.sender,
//             status: 2,
//             timestamp: message.timestamp,
//         };
//   converationsObj.set(conversation);
// }

// createReceiverConversation(message: any) {
//   const receiverIdNormalized = message.recipient.replace('.', '_');
//   const conversationsPathDb = '/apps/' + this.tenant + '/users/' + receiverIdNormalized + '/conversations/' + this.conversationId;
//   console.log('createReceiverConversation.conversationsPathDb: ', conversationsPathDb);
//   const  converationsObj = this.db.object(conversationsPathDb);
//   const conversation = {
//             convers_with: message.sender,
//             is_new: true,
//             last_message_text: message.text,
//             recipient: message.recipient,
//             sender: message.sender,
//             status: 2,
//             timestamp: message.timestamp,
//         };
//   converationsObj.set(conversation);
// }


}
