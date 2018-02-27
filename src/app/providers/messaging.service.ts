import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// import { AngularFireDatabase } from 'angularfire2/database';
// import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { environment } from '../../environments/environment';
// utils
import { setHeaderDate, searchIndexInArrayForUid, urlify } from '../utils/utils';
// tslint:disable-next-line:max-line-length
import { CHANNEL_TYPE_GROUP, UID_SUPPORT_GROUP_MESSAGES, MSG_STATUS_RECEIVED, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, CHANNEL_TYPE_DIRECT } from '../utils/constants';
// models
import { MessageModel } from '../../models/message';
import { DepartmentModel } from '../../models/department';

import { StarRatingWidgetService } from '../components/star-rating-widget/star-rating-widget.service';

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
  // obsAdded: any;
  obsAdded: BehaviorSubject<MessageModel>;
  obsChanged: BehaviorSubject<MessageModel>;
  obsRemoved: BehaviorSubject<MessageModel>;

  observableWidgetActive: any;

  firebaseMessagesKey: any;
  firebaseGroupMenbersRef: any;
  isWidgetActive: boolean;
  channel_type: string;
  MONGODB_BASE_URL: string;
  departments: DepartmentModel[];


  constructor(
    // private firebaseAuth: AngularFireAuth
    public starRatingWidgetService: StarRatingWidgetService,
    public http: Http
  ) {
    // this.channel_type = CHANNEL_TYPE_GROUP;
    this.MONGODB_BASE_URL = 'http://api.chat21.org/app1/';
    this.messages = new Array<MessageModel>();
    this.observable = new BehaviorSubject<MessageModel[]>(this.messages);
    this.obsAdded = new BehaviorSubject<MessageModel>(null);
    this.obsChanged = new BehaviorSubject<MessageModel>(null);
    this.obsRemoved = new BehaviorSubject<MessageModel>(null);
    this.observableWidgetActive = new BehaviorSubject<boolean>(this.isWidgetActive);
  }

  /** */
  eventChange(message, event) {
    this.observable.next(this.messages);
    if (event === 'ADDED') {
      this.obsAdded.next(message);
    } else if (event === 'CHANGED') {
      this.obsChanged.next(message);
    } else if (event === 'REMOVED') {
      this.obsRemoved.next(message);
    }
  }

  /**
   *
  */
  public initialize(user, tenant, channel_type) {
    this.channel_type = channel_type;
    const that = this;
    this.messages = [];
    this.loggedUser = user;
    this.senderId = user.uid;
    this.tenant = tenant;
    this.urlNodeFirebase = '/apps/' + this.tenant + '/users/' + this.senderId + '/messages/';
    console.log('urlNodeFirebase *****', this.urlNodeFirebaseGroups);
  }

  public getMongDbDepartments(token): Observable<DepartmentModel[]> {
    const url = this.MONGODB_BASE_URL + 'departments/';
    // const url = `http://api.chat21.org/app1/departments`;
    console.log('MONGO DB DEPARTMENTS URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', token);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   *
  */

  public checkListMessages(conversationWith): any {
    this.conversationWith = conversationWith;
    this.checkRemoveMember();
    const that = this;
    const firebaseMessages = firebase.database().ref(this.urlNodeFirebase + this.conversationWith);
    this.messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(100);
    return this.messagesRef.once('value');
  }

  public listMessages(conversationWith) {
    const text_area = <HTMLInputElement>document.getElementById('chat21-main-message-context');
    text_area.focus();
    let lastDate = '';
    const that = this;
    // this.conversationWith = conversationWith;
    // this.checkRemoveMember();
    // const firebaseMessages = firebase.database().ref(this.urlNodeFirebase + this.conversationWith);
    // this.messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(100);

    // CHANGED
    this.messagesRef.on('child_changed', function(childSnapshot) {
        console.log('child_changed *****', childSnapshot.key);
        const itemMsg = childSnapshot.val();
        // imposto il giorno del messaggio per visualizzare o nascondere l'header data
        const calcolaData = setHeaderDate(itemMsg['timestamp'], lastDate);
        if (calcolaData != null) {
            lastDate = calcolaData;
        }
        const messageText = urlify(itemMsg['text']);
        // creo oggetto messaggio e lo aggiungo all'array dei messaggi
        // tslint:disable-next-line:max-line-length
        const msg = new MessageModel(childSnapshot.key, itemMsg['language'], itemMsg['recipient'], itemMsg['recipient_fullname'], itemMsg['sender'], itemMsg['sender_fullname'], itemMsg['status'], itemMsg.metadata, messageText, itemMsg['timestamp'], calcolaData, itemMsg['type']);
        const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
        console.log('child_changed *****', index, that.messages, childSnapshot.key);
        that.messages.splice(index, 1, msg);
        // aggiorno stato messaggio
        // questo stato indica che è stato consegnato al client e NON che è stato letto
        that.setStatusMessage(childSnapshot, that.conversationWith);
        // pubblico messaggio - sottoscritto in dettaglio conversazione
        that.eventChange(msg, 'CHANGED');
    });


    // REMOVED
    this.messagesRef.on('child_removed', function(childSnapshot) {
      // al momento non previsto!!!
      const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
        // controllo superfluo sarà sempre maggiore
        if (index > -1) {
          that.messages.splice(index, 1);
        }
        that.eventChange(childSnapshot.key, 'REMOVED');
    });


    // ADDED
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
      that.messages.push(msg);

      that.eventChange(msg, 'ADDED');
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


  sendMessage(msg, type, metadata, conversationWith, attributes) { // : string {
    console.log('SEND MESSAGE: ', msg);
    // console.log("messageTextArea:: ",this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style);
    // const messageString = urlify(msg);
    const now: Date = new Date();
    const timestamp = now.valueOf();
    const language = document.documentElement.lang;
    // const sender_fullname = this.loggedUser.fullname;
    // const recipient_fullname = conversationWithDetailFullname;

    const message = {
      language: language,
      recipient: conversationWith,
      recipient_fullname: 'Support Group',
      sender: this.senderId,
      sender_fullname: 'Ospite',
      metadata: metadata,
      text: msg,
      timestamp: timestamp,
      type: type,
      channel_type: this.channel_type,
      attributes: attributes
    };

    const firebaseMessagesCustomUid = firebase.database().ref(this.urlNodeFirebase + conversationWith);
    console.log('messaggio **************', this.urlNodeFirebase, conversationWith, message);
    firebaseMessagesCustomUid.push(message);
    // const newMessageRef = firebaseMessagesCustomUid.push();
    // newMessageRef.set(message);
    // se non c'è rete viene aggiunto al nodo in locale e visualizzato
    // appena torno on line viene inviato!!!

    // if (!this.firebaseGroupMenbersRef) {
      // this.checkRemoveMember();
    // }
    // return newMessageRef.key;
  }
  /**
   * invio messaggio
   * purifico il testo del messaggio
   * creo un oggetto messaggio e lo aggiungo all'array di messaggi
   * @param msg
  */
  // public sendMessage_old(msg, type, metadata?) {
  //   (metadata) ? metadata = metadata : metadata = '';
  //   const messageString = this.controlOfMessage(msg);
  //   console.log('text::::: ', msg, messageString);
  //   const now: Date = new Date();
  //   const timestamp = now.valueOf();
  //   // creo messaggio e lo aggiungo all'array
  //   const language = document.documentElement.lang;
  //   const message = {
  //     channel_type: 'group',
  //     language: language,
  //     recipient: this.conversationWith,
  //     recipient_fullname: 'Support Group',
  //     sender: this.senderId,
  //     sender_fullname: 'Ospite',
  //     metadata: metadata,
  //     text: messageString,
  //     timestamp: timestamp,
  //     type: type
  //   };
  //   const firebaseMessagesCustomUid = firebase.database().ref(this.urlNodeFirebase + this.conversationWith);
  //   const newMessageRef = firebaseMessagesCustomUid.push(message);
  //   console.log('messaggio **************', this.firebaseGroupMenbersRef, message, this.conversationWith);

  //   if (!this.firebaseGroupMenbersRef) {
  //     this.checkRemoveMember();
  //   }

  // }

  /**
   *
   */
  private checkRemoveMember() {
    const that = this;
    // dopo aver aggiunto un messaggio al gruppo
    // mi sottoscrivo al nodo user/groups/ui-group/members
    // tslint:disable-next-line:max-line-length
    const urlNodeFirebaseGroupMenbers  = '/apps/' + this.tenant + '/users/' + this.loggedUser.uid + '/groups/' + this.conversationWith + '/members/';
    console.log('MI SOTTOSCRIVO A !!!!!', urlNodeFirebaseGroupMenbers);
    this.firebaseGroupMenbersRef = firebase.database().ref(urlNodeFirebaseGroupMenbers);
    this.firebaseGroupMenbersRef.on('child_removed', function(childSnapshot) {
      console.log('HO RIMOSSO!!!!!', childSnapshot.key, urlNodeFirebaseGroupMenbers);
      if ( childSnapshot.key === that.loggedUser.uid) {
        // CHIUDO CONVERSAZIONE
        that.closeConversation();
      }
    });
  }

  private closeConversation() {
    // apro popup rating
    this.starRatingWidgetService.setOsservable(true);
  }

  /**
   *
   */
  generateUidConversation(uid): string {
    this.firebaseMessagesKey = firebase.database().ref(this.urlNodeFirebase);
    // creo il nodo conversazione generando un custom uid
    const newMessageRef = this.firebaseMessagesKey.push();
    const key = UID_SUPPORT_GROUP_MESSAGES + newMessageRef.key;
    sessionStorage.setItem(uid, key);
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


  setRating(rate) {
    console.log('setRating **************', rate);
    this.observableWidgetActive.next(false);
  }


  updateMetadataMessage(uid, metadata) {
    metadata.status = true;
    const message = {
      metadata: metadata
    };
    const firebaseMessages = firebase.database().ref(this.urlNodeFirebase + uid);
    firebaseMessages.set(message);
  }

}
