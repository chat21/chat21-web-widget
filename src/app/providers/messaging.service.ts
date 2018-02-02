import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// import { AngularFireDatabase } from 'angularfire2/database';
// import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { environment } from '../../environments/environment';
// utils
import { setHeaderDate, searchIndexInArrayForUid, urlify } from '../utils/utils';
import { UID_SUPPORT_GROUP_MESSAGES, MSG_STATUS_RECEIVED, TYPE_MSG_TEXT, TYPE_MSG_IMAGE } from '../utils/constants';
// models
import { MessageModel } from '../../models/message';

@Injectable()
export class MessagingService {

  loggedUser: any;
  tenant: string;
  senderId: string;
  // recipientId: string;
  // conversationId: string;
  conversationWith: string;
  urlNodeFirebase: string;
  urlNodeFirebaseGroups: string;
  urlNodeFirebaseContact: string;
  messagesRef: any;
  messages: Array<MessageModel>;
  observable: any;

  firebaseMessagesKey: any;
  firebaseGroupMenbersRef: any;

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

  /**
   *
  */
  public initialize(user, tenant) {
    const that = this;
    this.messages = [];
    this.loggedUser = user;
    this.senderId = user.uid;
    this.tenant = tenant;
    this.urlNodeFirebase = '/apps/' + this.tenant + '/users/' + this.senderId + '/messages/';
    console.log('urlNodeFirebase *****', this.urlNodeFirebaseGroups);
  }

  /**
   *
  */
  public listMessages(conversationWith) {
    this.conversationWith = conversationWith;
    let lastDate = '';
    const that = this;
    const firebaseMessages = firebase.database().ref(this.urlNodeFirebase + this.conversationWith);
    this.messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(100);
    this.messagesRef.on('child_changed', function(childSnapshot) {
        console.log('child_changed *****', childSnapshot.key);
        const itemMsg = childSnapshot.val();
        // imposto il giorno del messaggio per visualizzare o nascondere l'header data
        const calcolaData = setHeaderDate(itemMsg['timestamp'], lastDate);
        if (calcolaData != null) {
            lastDate = calcolaData;
        }
        let messageText = '';
        if (itemMsg.type === TYPE_MSG_IMAGE) {
          messageText = itemMsg['text'];
        } else {
          messageText = urlify(itemMsg['text']);
        }
        // creo oggetto messaggio e lo aggiungo all'array dei messaggi
        // tslint:disable-next-line:max-line-length
        const msg = new MessageModel(childSnapshot.key, itemMsg['language'], itemMsg['recipient'], itemMsg['recipient_fullname'], itemMsg['sender'], itemMsg['sender_fullname'], itemMsg['status'], itemMsg.metadata, messageText, itemMsg['timestamp'], calcolaData, itemMsg['type']);
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
      let messageText = '';
      if (itemMsg.type === TYPE_MSG_IMAGE) {
        console.log('itemMsg.type *****', itemMsg.metadata);
        messageText = itemMsg['text'];
      } else {
        messageText = urlify(itemMsg['text']);
      }
      try {
        const index = searchIndexInArrayForUid(that.messages, itemMsg.metadata['uid']);
        console.log('child_DELETE *****', index, that.messages, itemMsg.metadata['uid']);
        if (index > -1) {
          that.messages.splice(index, 1);
        }
      } catch (err) {
        console.log('RIPROVO ::');
      }
      // tslint:disable-next-line:max-line-length
      const msg = new MessageModel(childSnapshot.key, itemMsg['language'], itemMsg['recipient'], itemMsg['recipient_fullname'], itemMsg['sender'], itemMsg['sender_fullname'], itemMsg['status'], itemMsg.metadata, messageText, itemMsg['timestamp'], calcolaData, itemMsg['type']);
      console.log('child_added *****', calcolaData, that.messages, msg);
      // controllo se c'è un oggetto == aggiunto in locale e lo sostituisco
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
  public sendMessage(msg, type, metadata?) {
    (metadata) ? metadata = metadata : metadata = '';
    const messageString = this.controlOfMessage(msg);
    console.log('text::::: ', msg, messageString);
    const now: Date = new Date();
    const timestamp = now.valueOf();
    // creo messaggio e lo aggiungo all'array
    const language = document.documentElement.lang;
    const message = {
      channel_type: 'group',
      language: language,
      recipient: this.conversationWith,
      recipient_fullname: '',
      sender: this.senderId,
      sender_fullname: 'Ospite',
      metadata: metadata,
      text: messageString,
      timestamp: timestamp,
      type: type
    };
    const firebaseMessagesCustomUid = firebase.database().ref(this.urlNodeFirebase + this.conversationWith);
    const newMessageRef = firebaseMessagesCustomUid.push(message);
    console.log('messaggio **************', this.firebaseGroupMenbersRef, message, this.conversationWith);

    if (!this.firebaseGroupMenbersRef) {
      this.checkRemoveMember();
    }

  }

  /**
   *
   */
  private checkRemoveMember() {
    // dopo aver aggiunto un messaggio al gruppo
    // mi sottoscrivo al nodo user/groups/ui-group/members
    // tslint:disable-next-line:max-line-length
    const urlNodeFirebaseGroupMenbers  = '/apps/' + this.tenant + '/users/' + this.loggedUser.uid + '/groups/' + this.conversationWith + '/members/';
    console.log('MI SOTTOSCRIVO A !!!!!', urlNodeFirebaseGroupMenbers);
    this.firebaseGroupMenbersRef = firebase.database().ref(urlNodeFirebaseGroupMenbers);
    this.firebaseGroupMenbersRef.on('child_removed', function(childSnapshot) {
      console.log('HO RIMOSSO!!!!!', childSnapshot.key, urlNodeFirebaseGroupMenbers);
      if ( childSnapshot.key === this.loggedUser.uid) {
        // CHIUDO CONVERSAZIONE
        this.closeConversation();
      }
    });
  }

  private closeConversation() {
    // apro popup stelle e add messaggio
  }

  /**
   *
   */
  generateUidConversation(): string {
    this.firebaseMessagesKey = firebase.database().ref(this.urlNodeFirebase);
    // creo il nodo conversazione generando un custom uid
    const newMessageRef = this.firebaseMessagesKey.push();
    const key = UID_SUPPORT_GROUP_MESSAGES + newMessageRef.key;
    // firebaseMessages.child(key).set('');
    sessionStorage.setItem(UID_SUPPORT_GROUP_MESSAGES, key);
    this.conversationWith = key;
    return key;
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
