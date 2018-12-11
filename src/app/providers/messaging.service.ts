import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

// import { AngularFireDatabase } from 'angularfire2/database';
// import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import 'firebase/database';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { DepartmentModel } from '../../models/department';
// models
import { MessageModel } from '../../models/message';
import { StarRatingWidgetService } from '../components/star-rating-widget/star-rating-widget.service';
// tslint:disable-next-line:max-line-length
import { MSG_STATUS_RECEIVED, TYPE_MSG_TEXT, UID_SUPPORT_GROUP_MESSAGES } from '../utils/constants';
// utils
import { searchIndexInArrayForUid, setHeaderDate, replaceBr } from '../utils/utils';
import { Globals } from '../utils/globals';


@Injectable()
export class MessagingService {
  tenant: string;
  senderId: string;
  conversationWith: string;
  urlMessages: string;
  urlConversation: string;
  urlNodeFirebaseGroups: string;
  urlNodeFirebaseContact: string;
  messagesRef: any;
  messages: Array<MessageModel>;

  obsAdded: any;
  obsAddedMsg: any;
  // observableWidgetActive: any;

  firebaseMessagesKey: any;
  conversationRef: any;
  conversationsRef: any;                    /** ref nodo conversazioni: check if conversation is closed */
  // isWidgetActive: boolean;
  channel_type: string;
  API_URL: string;
  departments: DepartmentModel[];
  filterSystemMsg = true;


  constructor(
    public starRatingWidgetService: StarRatingWidgetService,
    public http: Http,
    public g: Globals
  ) {
    this.API_URL = environment.apiUrl;
    //  this.g.wdLog(['MessagingService::this.API_URL',  this.API_URL );
    if (!this.API_URL) {
      throw new Error('apiUrl is not defined');
    }
    this.obsAdded = new BehaviorSubject<MessageModel>(null);
    // this.obsAddedMsg = new BehaviorSubject<string>(null);
    // this.observableWidgetActive = new BehaviorSubject<boolean>(this.isWidgetActive);
  }


  /**
   * da modificare e da spostare da qui!!!
   * chiamata da app component sull'init!!!
   */
  public getMongDbDepartments(projectId): Observable<DepartmentModel[]> {
    const url = this.API_URL + projectId + '/departments/';
    this.g.wdLog(['***** getMongDbDepartments *****', url]);
    // const url = `http://api.chat21.org/app1/departments`;
    // tslint:disable-next-line:max-line-length
    // const TOKEN = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFiYWRlODM5ZGI3ZDAwMTQ3N2QzZDUiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IlNwb256aWVsbG8iLCJmaXJzdG5hbWUiOiJBbmRyZWEiLCJwYXNzd29yZCI6IiQyYSQxMCRkMHBTV3lTQkp5ejFQLmE0Y0QuamwubnpvbW9xMGlXZUlHRmZqRGNQZVhUeENpRUVJOTdNVyIsImVtYWlsIjoic3BvbnppZWxsb0BnbWFpbC5jb20iLCJfaWQiOiI1YWFiYWRlODM5ZGI3ZDAwMTQ3N2QzZDUifSwiJGluaXQiOnRydWUsImlhdCI6MTUyMTY1MjE3Mn0.-iBbE2gCDrcUF1uh9HdK1kVsIRyRCBi_Pvm7LJEKhbs';
    //  this.g.wdLog(['MONGO DB DEPARTMENTS URL', url, TOKEN);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // headers.append('Authorization', TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  /**
   *
   */
  public initialize(userUid, tenant, channel_type) {
     this.g.wdLog(['***** initialize MessagingService *****']);
    this.messages = [];
    this.channel_type = channel_type;
    this.senderId = userUid;
    this.tenant = tenant;
    this.urlMessages = '/apps/' + this.tenant + '/users/' + this.senderId + '/messages/';
    this.urlConversation = '/apps/' + this.tenant + '/users/' + this.senderId + '/conversations/';
  }

  /**
   *
   */
  connect(conversationWith) {
     this.g.wdLog(['***** connect MessagingService *****']);
    this.checkRemoveConversation(conversationWith);
    this.checkMessages(conversationWith);
  }

  /**
   * subcribe to mesages node (on added and removed message)
   * and update array messages
   */
  checkMessages(conversationWith) {
    const urlMessages = this.urlMessages + conversationWith;
    const firebaseMessages = firebase.database().ref(urlMessages);
    this.messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(1000);
    this.subscriptionsToMessages();
  }


  /**
   * subscribe to:
   * child_removed, child_added, child_changed
   * valutare utilizzo di .map!!!!
   */
  subscriptionsToMessages() {
    const that = this;
    //// SUBSCRIBE REMOVED ////
    this.messagesRef.on('child_removed', function (childSnapshot) {
      const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
      if (index > -1) {
        that.messages.splice(index, 1);
      }
    });
    //// SUBSCRIBE ADDED ////
    this.messagesRef.on('child_added', function (childSnapshot) {
      const message = childSnapshot.val();
       that.g.wdLog(['child_added *****', childSnapshot.key, JSON.stringify(message)]);
      const text = replaceBr(message['text']);

      if (that.checkMessage(message)) {
        // imposto il giorno del messaggio
        // const timestamp =  firebase.database.ServerValue.TIMESTAMP;
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
          text,
          message['timestamp'],
          dateSendingMessage,
          message['type'],
          message['attributes'],
          message['channel_type'],
          message['progectId']
        );
        // azzero sto scrivendo
        // that.deleteWritingMessages(message['sender']);
        // notifico arrivo nuovo messaggio
        //  this.g.wdLog(['NOTIFICO NW MSG *****', that.obsAdded);
        that.obsAdded.next(msg);
        if (message && message.sender === that.senderId) {
          // && message.type !== TYPE_MSG_TEXT) {
          // sto aggiungendo un'immagine inviata da me!!!
          // const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
          // that.messages.splice(index, 1, msg);
          const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
          //  this.g.wdLog(['index *****', index, childSnapshot.key);
          if (index < 0) {
            that.g.wdLog(['--------> ADD MSG IMG', index, msg]);
            that.messages.push(msg);
          }
        } else {
           that.g.wdLog(['--------> ADD MSG', msg]);
          // se msg è inviato da me cambio status
          // that.obsAddedMsg.next(text);
          that.messages.push(msg);
        }
        that.messages.sort(that.compareValues('timestamp', 'asc'));
      }
    });
  }

  /**
   *
   */
  checkMessage(message): boolean {
    if (message.text.trim() === '' && message.type === TYPE_MSG_TEXT) {
      // se è un messaggio vuoto non fare nulla
      return false;
    }
    if (this.filterSystemMsg && message.attributes && message.attributes['subtype'] === 'info') {
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
   * function for dynamic sorting
   */
  private compareValues(key, order = 'asc') {
    return function (a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }
      const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }


  /**
   * ?????????????????????????????????
   * ?????????????????????????????????
   * aggiorno lo stato del messaggio
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
      const urlNodeMessagesUpdate = '/apps/' + this.tenant + '/users/' + this.senderId + '/messages/' + conversationWith + '/' + item.key;
       this.g.wdLog(['AGGIORNO STATO MESSAGGIO', urlNodeMessagesUpdate]);
      firebase.database().ref(urlNodeMessagesUpdate).update({ status: MSG_STATUS_RECEIVED });
    }
  }
}

  /**
   * check if agent writing
   */
  public checkWritingMessages(tenant, conversationWith): any {
    this.conversationWith = conversationWith;
    const urlNodeFirebase = '/apps/' + tenant + '/typings/' + conversationWith;
     this.g.wdLog(['checkWritingMessages *****', urlNodeFirebase]);
    const firebaseMessages = firebase.database().ref(urlNodeFirebase);
    const messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(1);
    return messagesRef;
  }

  /**
   * NON USATA
   * ?????????????????????????????????
   * ?????????????????????????????????
   * verifico se sta rispondendo un bot, func chiamata da checkWritingMessages
   */
  checkIsBot(snapshot) {
     this.g.wdLog(['snapshot.numChildren() *****', snapshot.numChildren()]);
    const that = this;
    let RESP = null;
    if (snapshot.numChildren() === 0) {
      return '';
    }
    snapshot.forEach(
      function (childSnapshot) {
        const uid = childSnapshot.key;
         this.g.wdLog(['childSnapshot *****', uid]);
        if (uid.startsWith('bot_')) {
          RESP = uid;
          return;
        }
      }
    );
     this.g.wdLog(['RESP:', RESP]);
    return RESP;
  }



  /**
   *
   */
  sendMessage(senderFullname, msg, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type) { // : string {
     this.g.wdLog(['SEND MESSAGE: ', msg, senderFullname, recipientFullname]);
     this.g.wdLog(['metadata:: ', metadata.toString()]);
    // const messageString = urlify(msg);
    if (!senderFullname || senderFullname === '' ) {
      senderFullname = 'Guest';
    }
    if (!recipientFullname || recipientFullname === '' ) {
      recipientFullname = 'Guest';
    }
    const that = this;
    // const now: Date = new Date();
    // const timestamp = now.valueOf();
    const timestamp =  firebase.database.ServerValue.TIMESTAMP;
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
    this.messages.push(message);
    const conversationRef = firebase.database().ref(this.urlMessages + conversationWith);
    this.g.wdLog(['messaggio **************', message.toString()]);

    // firebaseMessagesCustomUid.push(message, function(error) {
    //   if (error) {
    //     // cambio lo stato in rosso: invio nn riuscito!!!
    //     message.status = '-100';
    //      this.g.wdLog(['ERRORE', message);
    //   } else {
    //     // that.checkWritingMessages();
    //     message.status = '150';
    //      this.g.wdLog(['OK MSG INVIATO CON SUCCESSO AL SERVER', message);
    //   }


    const messageRef = conversationRef.push();
    const key = messageRef.key;
    message.uid = key;
     this.g.wdLog(['messageRef: ', messageRef]);
    const messageForFirebase = message.asFirebaseMessage();
     this.g.wdLog(['messageForFirebase: ', messageForFirebase]);
    messageRef.set(messageForFirebase, function (error) {
      // Callback comes here
      if (error) {
        // cambio lo stato in rosso: invio nn riuscito!!!
        message.status = '-100';
         that.g.wdLog(['ERRORE', error]);
      } else {
        // that.checkWritingMessages();
        message.status = '150';
        that.g.wdLog(['OK MSG INVIATO CON SUCCESSO AL SERVER', message]);
      }
      //   this.g.wdLog(['****** changed *****', that.messages);
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
   * check if conversation exists, subscibing conversations node
   * if conversation is removed (closed by agent)
   * call closeConversation and start modal Rating conversation
   */
  private checkRemoveConversation(conversationWith) {
    const that = this;
    this.conversationsRef = firebase.database().ref(this.urlConversation);
    this.conversationsRef.on('child_removed', function (snap) {
       that.g.wdLog(['child_removed ***********************', snap.key, snap.val()]);
      if (snap.key === conversationWith) {
        that.closeConversation();
      }
    });
  }

  /**
   * pass osservable var starRatingWidgetService in conversation
   * for open rating chat modal
   */
  closeConversation() {
     this.g.wdLog(['MessagingService::closeConversation', 'conversation closed']);
    this.starRatingWidgetService.setOsservable(true);
  }

  /**
   *
   */
  generateUidConversation(uid): string {
    this.firebaseMessagesKey = firebase.database().ref(this.urlMessages);
    // creo il nodo conversazione generando un custom uid
    const newMessageRef = this.firebaseMessagesKey.push();
    const key = UID_SUPPORT_GROUP_MESSAGES + newMessageRef.key;
    // sessionStorage.setItem(uid, key);
    localStorage.setItem(uid, key);
    this.conversationWith = key;
    return key;
  }

  /**
   * purifico il messaggio
   * e lo passo al metodo di invio
   */
  private controlOfMessage(messageString): string {
    // let messageString = document.getElementById('textarea')[0].value;
     this.g.wdLog(['controlOfMessage **************', messageString]);
    messageString = messageString.replace(/(\r\n|\n|\r)/gm, '');
    if (messageString.trim() !== '') {
      return messageString;
    }
    return '';
  }


  /** */
  // setRating(rate) {
  //    this.g.wdLog(['setRating **************', rate);
  //   this.observableWidgetActive.next(false);
  // }

  /** */
  updateMetadataMessage(uid, metadata) {
    metadata.status = true;
    const message = {
      metadata: metadata
    };
    const firebaseMessages = firebase.database().ref(this.urlMessages + uid);
    firebaseMessages.set(message);
  }




  /**
   * called on ondestroy from component 'conversation'
   * detach all callbacks firebase on messagesRef
   */
  unsubscribeAllReferences() {
     this.g.wdLog(['--------> messagesRef.off']);
    this.messagesRef.off();
    // this.conversationsRef.off('child_removed');
  }

}
