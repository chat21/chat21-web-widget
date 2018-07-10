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
import { CHANNEL_TYPE_GROUP, UID_SUPPORT_GROUP_MESSAGES, MSG_STATUS_SENT_SERVER, MSG_STATUS_RECEIVED, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, CHANNEL_TYPE_DIRECT } from '../utils/constants';
// models
import { MessageModel } from '../../models/message';
import { DepartmentModel } from '../../models/department';

import { StarRatingWidgetService } from '../components/star-rating-widget/star-rating-widget.service';

@Injectable()
export class MessagingService {

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

  // obsCheckWritingMessages: BehaviorSubject<string>;
  obsAdded: any;
  // obsAdded: BehaviorSubject<MessageModel>;
  // obsChanged: BehaviorSubject<MessageModel>;
  // obsRemoved: BehaviorSubject<MessageModel>;

  observableWidgetActive: any;

  firebaseMessagesKey: any;
  firebaseGroupMenbersRef: any;
  isWidgetActive: boolean;
  channel_type: string;
  MONGODB_BASE_URL: string;
  departments: DepartmentModel[];
  filterSystemMsg =  true;


  constructor(
    // private firebaseAuth: AngularFireAuth
    public starRatingWidgetService: StarRatingWidgetService,
    public http: Http
  ) {
    // this.channel_type = CHANNEL_TYPE_GROUP;
    this.MONGODB_BASE_URL = 'https://chat21-api-nodejs.herokuapp.com/';
    // this.MONGODB_BASE_URL = 'http://api.chat21.org/';
    // this.MONGODB_BASE_URL = 'http://api.chat21.org/app1/';
    // 'https://chat21-api-nodejs.herokuapp.com/app1/'; // 'http://api.chat21.org/app1/';
    this.messages = new Array<MessageModel>();
    // this.observable = new BehaviorSubject<MessageModel[]>(this.messages);
    // this.obsCheckWritingMessages = new BehaviorSubject<string>(null);
    this.obsAdded = new BehaviorSubject<MessageModel>(null);
    // this.obsChanged = new BehaviorSubject<MessageModel>(null);
    // this.obsRemoved = new BehaviorSubject<MessageModel>(null);
    this.observableWidgetActive = new BehaviorSubject<boolean>(this.isWidgetActive);
  }

  /** */
  // eventChange(message, event) {
  //   this.observable.next(this.messages);
  //   if (event === 'ADDED') {
  //     this.obsAdded.next(message);
  //   } else if (event === 'CHANGED') {
  //     this.obsChanged.next(message);
  //   } else if (event === 'REMOVED') {
  //     this.obsRemoved.next(message);
  //   }
  // }

  /**
   *
  */
  public initialize(userUid, tenant, channel_type) {
    const that = this;
    this.channel_type = channel_type;
    this.messages = [];
    this.senderId = userUid;
    this.tenant = tenant;
    this.urlNodeFirebase = '/apps/' + this.tenant + '/users/' + this.senderId + '/messages/';
    // console.log('urlNodeFirebase *****', this.urlNodeFirebaseGroups);
  }

  public getMongDbDepartments(token, projectId): Observable<DepartmentModel[]> {
    const url = this.MONGODB_BASE_URL + projectId + '/departments/';
    // const url = `http://api.chat21.org/app1/departments`;
    // tslint:disable-next-line:max-line-length
    const TOKEN = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFiYWRlODM5ZGI3ZDAwMTQ3N2QzZDUiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IlNwb256aWVsbG8iLCJmaXJzdG5hbWUiOiJBbmRyZWEiLCJwYXNzd29yZCI6IiQyYSQxMCRkMHBTV3lTQkp5ejFQLmE0Y0QuamwubnpvbW9xMGlXZUlHRmZqRGNQZVhUeENpRUVJOTdNVyIsImVtYWlsIjoic3BvbnppZWxsb0BnbWFpbC5jb20iLCJfaWQiOiI1YWFiYWRlODM5ZGI3ZDAwMTQ3N2QzZDUifSwiJGluaXQiOnRydWUsImlhdCI6MTUyMTY1MjE3Mn0.-iBbE2gCDrcUF1uh9HdK1kVsIRyRCBi_Pvm7LJEKhbs';
    console.log('MONGO DB DEPARTMENTS URL', url, TOKEN);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  // public getMongDbDepartments(): Observable<Department[]> {
  //   const url = this.MONGODB_BASE_URL;
  //   // const url = `http://localhost:3000/app1/departments/`;
  //   // const url = `http://api.chat21.org/app1/departments/;
  //   console.log('MONGO DB DEPARTMENTS URL', url);
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   headers.append('Authorization', this.TOKEN);
  //   return this.http
  //     .get(url, { headers })
  //     .map((response) => response.json());
  // }


  /**
   * verifico se nel nodo della conversazione ci sono messaggi
   * recupero gli ultimi 100 e li ordino dall'ultimo al primo
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


  // public checkWritingMessages() {
  //   const that = this;
  //   const urlNodeFirebaseMembers = '/apps/' + this.tenant + '/users/' + this.senderId + '/groups/' + this.conversationWith + '/members';
  //   console.log('urlNodeFirebaseMembers *****', urlNodeFirebaseMembers);
  //   const firebaseGroup = firebase.database().ref(urlNodeFirebaseMembers)
  //   .once('value').then(function(snapshot) {
  //     console.log('snapshot.val() *****', snapshot);
  //     const resp = that.checkIsBot(snapshot);
  //     that.obsCheckWritingMessages.next(resp);
  //   });
  // }

  public checkWritingMessages(tenant, conversationWith): any {
    this.conversationWith = conversationWith;
    const that = this;
    // /apps/tilechat/typings/<GROUP_ID>/<USER_ID> = 1
    const urlNodeFirebase = '/apps/' + tenant + '/typings/' + conversationWith;
    console.log('checkWritingMessages *****', urlNodeFirebase);
    const firebaseMessages = firebase.database().ref(urlNodeFirebase);
    const messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(1);
    return messagesRef;
//     var starCountRef = firebase.database().ref('posts/' + postId + '/starCount');
// starCountRef.on('value', function(snapshot) {
  }


  // public deleteWritingMessages(sender) {
  //   console.log('deleteWritingMessages *****', sender);
  //   if (sender.startsWith('bot_')) {
  //     this.obsCheckWritingMessages.next(null);
  //   }
  // }

  checkIsBot(snapshot) {
    console.log('snapshot.numChildren() *****', snapshot.numChildren());
    const that = this;
    let RESP = null;
    if (snapshot.numChildren() === 0) {
      return '';
    }
    snapshot.forEach(
      function(childSnapshot) {
        const uid = childSnapshot.key;
        console.log('childSnapshot *****', uid);
        if (uid.startsWith('bot_')) {
          RESP = uid;
          return;
        }
      }
    );
    console.log('RESP:', RESP);
    return RESP;
  }



  checkMessage(message): boolean {
    if (message.text.trim() === '' && message.type === TYPE_MSG_TEXT) {
      // se è un messaggio vuoto non fare nulla
      return false;
    }
    if (message.sender === 'system' && this.filterSystemMsg && message.attributes['subtype'] !== 'info/support') {
      // se è un msg inviato da system NON fare nulla
      return false;
    } else if (message && message.sender === this.senderId && message.type !== TYPE_MSG_TEXT) {
        // se è un'immagine che ho inviato io NON fare nulla
        // aggiorno la stato del messaggio e la data
        // this.updateMessage(message);
        return true;
    }
    return true;
  }

/**
 * mi sottoscrivo al cambio valori nei messaggi della chat
 * @param conversationWith
 */
  public listMessages(conversationWith) {
    const text_area = <HTMLInputElement>document.getElementById('chat21-main-message-context');
    // tslint:disable-next-line:curly
    // if (text_area) text_area.focus();
    const that = this;
    // this.conversationWith = conversationWith;
    // this.checkRemoveMember();
    // const firebaseMessages = firebase.database().ref(this.urlNodeFirebase + this.conversationWith);
    // this.messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(100);

    // CHANGED
    // this.messagesRef.on('child_changed', function(childSnapshot) {
    //     const message = childSnapshot.val();
    //     console.log('child_changed *****', childSnapshot.val());
    //     if ( that.checkMessage(message) ) {
    //       // imposto il giorno del messaggio
    //       const dateSendingMessage = setHeaderDate(message['timestamp']);

    //       const msg = new MessageModel(
    //         childSnapshot.key,
    //         message['language'],
    //         message['recipient'],
    //         message['recipient_fullname'],
    //         message['sender'],
    //         message['sender_fullname'],
    //         message['status'],
    //         message['metadata'],
    //         message['text'],
    //         message['timestamp'],
    //         dateSendingMessage,
    //         message['type'],
    //         message['attributes']
    //       );
    //       const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
    //       that.messages.splice(index, 1, msg);
    //       console.log('child_changed *****', index, msg.uid);

    //       // if (message && message.sender === that.senderId) {
    //       //   that.checkWritingMessages();
    //       // }
    //       // questo stato indica che è stato consegnato al client e NON che è stato letto
    //       // that.setStatusMessage(childSnapshot, that.conversationWith);
    //     }
    // });

    // REMOVED
    this.messagesRef.on('child_removed', function(childSnapshot) {
      // al momento non previsto!!!
      const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
        // controllo superfluo sarà sempre maggiore
        if (index > -1) {
          that.messages.splice(index, 1);
        }
    });

    // ADDED
    this.messagesRef.on('child_added', function(childSnapshot) {
      const message = childSnapshot.val();
      console.log('child_added *****', childSnapshot.val());
      if ( that.checkMessage(message) ) {

        // imposto il giorno del messaggio
        const dateSendingMessage = setHeaderDate(message['timestamp']);
        const msg = new MessageModel(
          childSnapshot.key,
          message['language'],
          message['recipient'],
          message['recipient_fullname'],
          message['sender'],
          message['sender_fullname'],
          message['status'],
          message['metadata'],
          message['text'],
          message['timestamp'],
          dateSendingMessage,
          message['type'],
          message['attributes'],
          message['channel_type'],
          message['progectId']
        );
        console.log('child_added *****', dateSendingMessage, msg);
        // azzero sto scrivendo
        // that.deleteWritingMessages(message['sender']);
        // notifico arrivo nuovo messaggio
        console.log('NOTIFICO NW MSG *****', that.obsAdded);
        that.obsAdded.next(msg);

        if (message && message.sender === that.senderId) {
          // && message.type !== TYPE_MSG_TEXT) {
          // sto aggiungendo un'immagine inviata da me!!!
          // const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
          // that.messages.splice(index, 1, msg);
          const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
          console.log('index *****', index, childSnapshot.key);
          if (index < 0) {
            console.log('--------> ADD MSG', index);
            that.messages.push(msg);
          }
        } else {
          // se msg è inviato da me cambio status
          that.messages.push(msg);
        }

      }
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
      if (msg.sender !== this.senderId && msg.status < MSG_STATUS_RECEIVED) {
        // tslint:disable-next-line:max-line-length
        const urlNodeMessagesUpdate  = '/apps/' + this.tenant + '/users/' + this.senderId + '/messages/' + conversationWith + '/' + item.key;
        console.log('AGGIORNO STATO MESSAGGIO', urlNodeMessagesUpdate);
        firebase.database().ref(urlNodeMessagesUpdate).update({ status: MSG_STATUS_RECEIVED });
      }
    }
  }


  sendMessage(senderFullname, msg, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type) { // : string {
    console.log('SEND MESSAGE: ', msg);
    // console.log("messageTextArea:: ",this.messageTextArea['_elementRef'].nativeElement.getElementsByTagName('textarea')[0].style);
    // const messageString = urlify(msg);
    const that = this;
    const now: Date = new Date();
    const timestamp = now.valueOf();
    const language = navigator.language;
    // document.documentElement.lang;
    // const sender_fullname = this.loggedUser.fullname;
    const dateSendingMessage = setHeaderDate(timestamp);
    const message = new MessageModel(
      '',
      language,
      conversationWith,
      recipientFullname,
      this.senderId,
      senderFullname,
      '',
      metadata,
      msg,
      timestamp,
      dateSendingMessage,
      type,
      attributes,
      channel_type,
      projectid
    );

    // const message = {
    //   uid: '',
    //   language: language,
    //   recipient: conversationWith,
    //   recipient_fullname: recipientFullname,
    //   sender: this.senderId,
    //   sender_fullname: senderFullname,
    //   status: '',
    //   metadata: metadata,
    //   text: msg,
    //   timestamp: timestamp,
    //   type: type,
    //   attributes: attributes,
    //   channel_type: this.channel_type,
    //   projectid: projectid
    // };

    this.messages.push(message);

    const firebaseMessagesCustomUid = firebase.database().ref(this.urlNodeFirebase + conversationWith);
    console.log('messaggio **************', this.urlNodeFirebase + conversationWith, attributes);
    // firebaseMessagesCustomUid.push(message, function(error) {
    //   if (error) {
    //     // cambio lo stato in rosso: invio nn riuscito!!!
    //     message.status = '-100';
    //     console.log('ERRORE', message);
    //   } else {
    //     // that.checkWritingMessages();
    //     message.status = '150';
    //     console.log('OK MSG INVIATO CON SUCCESSO AL SERVER', message);
    //   }


      const messageRef = firebaseMessagesCustomUid.push();
      const key = messageRef.key;
      message.uid = key;
      console.log('messageRef: ', messageRef, key);
      messageRef.set(message, function( error ) {
        // Callback comes here
        if (error) {
          // cambio lo stato in rosso: invio nn riuscito!!!
          message.status = '-100';
          console.log('ERRORE', error);
        } else {
          // that.checkWritingMessages();
          message.status = '150';
          console.log('OK MSG INVIATO CON SUCCESSO AL SERVER', message);
        }
        console.log('****** changed *****', that.messages);

      });


    // this.checkWritingMessages();
    // const newMessageRef = firebaseMessagesCustomUid.push();
    // newMessageRef.set(message);
    // se non c'è rete viene aggiunto al nodo in locale e visualizzato
    // appena torno on line viene inviato!!!

    // if (!this.firebaseGroupMenbersRef) {
      // this.checkRemoveMember();
    // }
    // return newMessageRef.key;
    return message;
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
    const urlNodeFirebaseGroupMenbers  = '/apps/' + this.tenant + '/users/' + this.senderId + '/groups/' + this.conversationWith + '/members/';
    // console.log('MI SOTTOSCRIVO A !!!!!', urlNodeFirebaseGroupMenbers);
    this.firebaseGroupMenbersRef = firebase.database().ref(urlNodeFirebaseGroupMenbers);
    this.firebaseGroupMenbersRef.on('child_removed', function(childSnapshot) {
      // console.log('HO RIMOSSO!!!!!', childSnapshot.key, urlNodeFirebaseGroupMenbers);
      if ( childSnapshot.key === that.senderId) {
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
