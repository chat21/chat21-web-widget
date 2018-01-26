import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// import { AngularFireDatabase } from 'angularfire2/database';
// import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { environment } from '../../environments/environment';
// utils
import { setHeaderDate, searchIndexInArrayForUid, urlify } from '../utils/utils';
import { MSG_STATUS_RECEIVED } from '../utils/constants';
// models
import { MessageModel } from '../../models/message';

@Injectable()
export class MessagingService {

  loggedUser: any;
  tenant: string;
  senderId: string;
  recipientId: string;
  conversationId: string;
  conversationWith: string;
  urlNodeFirebase: string;
  messagesRef: any;
  messages: Array<MessageModel>;
  observable: any;

  constructor(
    // private firebaseAuth: AngularFireAuth
  ) {
    this.messages = new Array<MessageModel>();
    this.observable = new BehaviorSubject<MessageModel[]>(this.messages);
  }

  /** */
  eventChange() {
    this.observable.next(this.messages);
  }
  /** */
  public initialize(user) {
    this.messages = [];
    this.loggedUser = user;
    this.senderId = user.uid;
    this.tenant = environment.tenant;
    this.recipientId = environment.agentId;
    this.conversationId = environment.agentId;
    this.conversationWith = environment.agentId;
    this.urlNodeFirebase = '/apps/' + this.tenant + '/users/' + this.senderId + '/messages/' + this.conversationId;
    console.log('urlNodeFirebase *****', this.urlNodeFirebase);
  }
  /** */
  public listMessages() {
    let lastDate = '';
    // verifico se esiste la conversazione !!!!
    // Determine which child keys in DataSnapshot have data.
    // const url = '/apps/' + this.tenant + '/users/' + this.senderId + '/conversations';
    const that = this;
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
        that.eventChange();
    });

    this.messagesRef.on('child_removed', function(childSnapshot) {
      // al momento non previsto!!!
      const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
        // controllo superfluo sarà sempre maggiore
        if (index > -1) {
          that.messages.splice(index, 1);
        }
        that.eventChange();
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
      // const msg = itemMsg.map();
      // msg.uid = childSnapshot.key;
      // msg.text = urlify(itemMsg['text']);
      // msg.timestamp = calcolaData;
      // tslint:disable-next-line:max-line-length
      const msg = new MessageModel(childSnapshot.key, itemMsg['language'], itemMsg['recipient'], itemMsg['recipient_fullname'], itemMsg['sender'], itemMsg['sender_fullname'], itemMsg['status'], messageText, itemMsg['timestamp'], calcolaData, itemMsg['type']);
      console.log('child_added *****', calcolaData, that.messages, msg);
      that.messages.push(msg);
      that.eventChange();
    });
   }

   /**
   * arriorno lo stato del messaggio
   * questo stato indica che è stato consegnato al client e NON che è stato letto
   * se il messaggio NON è stato inviato da loggedUser AGGIORNO stato a 200
   * @param item
   * @param conversationWith
   */
  private setStatusMessage(item, conversationWith) {
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

  /**
   * invio messaggio
   * purifico il testo del messaggio
   * creo un oggetto messaggio e lo aggiungo all'array di messaggi
   * @param msg
   */
  public sendMessage(msg) {
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
  }

  /**
   * purifico il messaggio
   * e lo passo al metodo di invio
   */
  private controlOfMessage(messageString): string {
    // let messageString = document.getElementById('textarea')[0].value;
    console.log('controlOfMessage **************', messageString);
    messageString = messageString.replace(/(\r\n|\n|\r)/gm, '');
    if (messageString.trim() !== '') {
        return messageString;
    }
    return '';
  }


}
