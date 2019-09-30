import { Injectable, ElementRef, ViewChild } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

// firebase
// import * as firebase from 'firebase/app';
// import 'firebase/database';


import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { DepartmentModel } from '../../models/department';
// models
import { MessageModel } from '../../models/message';
import { StarRatingWidgetService } from '../components/star-rating-widget/star-rating-widget.service';
// tslint:disable-next-line:max-line-length
import { IMG_PROFILE_BOT, IMG_PROFILE_DEFAULT, MSG_STATUS_SENT_SERVER, MSG_STATUS_RECEIVED, TYPE_MSG_TEXT, UID_SUPPORT_GROUP_MESSAGES, PROXY_MSG_START, TYPE_MSG_IMAGE } from '../utils/constants';
// utils
import { createGuid, getImageUrlThumb, searchIndexInArrayForUid, setHeaderDate, replaceBr } from '../utils/utils';
import { Globals } from '../utils/globals';
import { StorageService } from '../providers/storage.service';
import { AppConfigService } from '../providers/app-config.service';

@Injectable()
export class GenericMessagingService {
  tenant: string;
  senderId: string;
  conversationWith: string;
  urlMessages: string;
  urlConversation: string;
  urlNodeFirebaseGroups: string;
  urlNodeFirebaseContact: string;
  messagesRef: any;
  messages: Array<MessageModel> = [];

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

  // sessionUid che individua univocamente la conversazione
  sessionUid: String;

  DEFAULT_AGENT = 'supporto-anagrafe-vcqvkb';
  DEFAULT_RECIPIENT = 'bari_bot';
  DEFAULT_RECIPIENT_FULLNAME = 'Ernesto';
  URL_PROXY = 'https://bariapp.herokuapp.com/proxy';

  constructor(
    // public el: ElementRef,
    public starRatingWidgetService: StarRatingWidgetService,
    public http: Http,
    public g: Globals,
    public storageService: StorageService,
    public appConfigService: AppConfigService
  ) {
    this.API_URL = appConfigService.getConfig().apiUrl;
    //  that.g.wdLog(['MessagingService::this.API_URL',  this.API_URL );
    if (!this.API_URL) {
      throw new Error('apiUrl is not defined');
    }
    this.obsAdded = new BehaviorSubject<MessageModel>(null);
    // this.obsAddedMsg = new BehaviorSubject<string>(null);
    // this.observableWidgetActive = new BehaviorSubject<boolean>(this.isWidgetActive);
  }


  /*** */
  private sendMessageService(message) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    // const options = new RequestOptions({ headers: headers });
    let url = this.URL_PROXY;
    this.g.wdLog(['url: ', url]);

    message['session'] = this.sessionUid;
    message['agent'] = this.DEFAULT_AGENT;
    message['recipient'] = this.DEFAULT_RECIPIENT_FULLNAME;
    message['recipient_fullname'] = this.DEFAULT_RECIPIENT_FULLNAME;

    try {
      JSON.parse(this.g.customAttributes, (key, value) => {
        this.g.wdLog(['keyX: ', key]);
        this.g.wdLog(['valueX: ', value]);
        if (key === 'url_proxy') {
          url = value;
        }
        if (key === 'agent') {
          message['agent'] = value;
        }
        if (key === 'recipient') {
          message['recipient'] = value;
          this.g.recipientId = value;
        }
        if (key === 'recipient_fullname') {
          message['recipient_fullname'] = value;
          this.g.recipientFullname = value;
        }

      });
      // console.log('> attributes: ', attributes);
    } catch (error) {
        // console.log('> Error is handled attributes: ', error);
    }


    this.g.wdLog(['------------------> body: ', JSON.stringify(message)]);
    return this.http
      .post(url, JSON.stringify(message), { headers })
      .map(res => (res.json()));
  }

  /** */
  onMessageReceived(childSnapshot) {
    const message = childSnapshot;
    this.g.wdLog(['added msg*****', childSnapshot.key, JSON.stringify(message)]);
    const text = replaceBr(message['text']);

    if (this.checkMessage(message)) {
      // imposto il giorno del messaggio
      // const timestamp =  firebase.database.ServerValue.TIMESTAMP;
      const dateSendingMessage = setHeaderDate(message['timestamp']);
      // console.log('message[timestamp]: ', message['timestamp']);
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
      msg.sender_urlImage = this.getUrlImgProfile(message['sender']);
      this.triggerGetImageUrlThumb(msg);
      this.addMessage(msg);
    //   if (message && message.sender === this.senderId) {
    //     const index = searchIndexInArrayForUid(this.messages, childSnapshot.key);
    //     if (index < 0) {
    //       this.g.wdLog(['--------> ADD MSG IMG', index, msg]);
    //       msg.status = MSG_STATUS_SENT_SERVER.toString();
    //       this.messages.push(msg);
    //     }
    //   } else {
    //     msg.status = MSG_STATUS_SENT_SERVER.toString();
    //     this.g.wdLog(['--------> ADD MSG', msg.status]);
    //     this.messages.push(msg);
    //   }
    //   this.messages.sort(this.compareValues('timestamp', 'asc'));
    //   this.obsAdded.next(msg);


    }
  }


  /**
   * recupero url immagine profilo
   * @param uid
   */
  getUrlImgProfile(uid: string): string {
    const baseLocation = this.g.baseLocation;
    if (!uid || uid === 'system' ) {
      return baseLocation + IMG_PROFILE_BOT;
    } else if ( uid === 'error') {
      return baseLocation + IMG_PROFILE_DEFAULT;
    } else {
      return getImageUrlThumb(uid);
    }
  }


  private triggerGetImageUrlThumb(message: MessageModel) {
    try {
        const windowContext = this.g.windowContext;
        const triggerGetImageUrlThumb = new CustomEvent('getImageUrlThumb', { detail: { message: message } });
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
          windowContext.tiledesk.tiledeskroot.dispatchEvent(triggerGetImageUrlThumb);
        }
    } catch (e) {
        console.error('Error triggering triggerAfterSendMessageEvent', e);
    }
  }

  private addMessage(message) {
    if (message && message.sender === this.senderId) {
      const index = searchIndexInArrayForUid(this.messages, message.key);
      if (index < 0) {
        this.g.wdLog(['--------> ADD MSG IMG', index, message]);
        message.status = MSG_STATUS_SENT_SERVER.toString();
        this.messages.push(message);
      }
    } else {
      message.status = MSG_STATUS_SENT_SERVER.toString();
      this.g.wdLog(['--------> ADD MSG', message.status]);

      this.messages.push(message);
    }
    this.messages.sort(this.compareValues('timestamp', 'asc'));
    this.obsAdded.next(message);

    try {
      this.storageService.setItem('messages', JSON.stringify(this.messages));
    } catch (error) {
      console.log('> Error is handled attributes: ', error);
    }

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
   * genero un uid univoco
   * da passare al servizio ogni volta che invio un msg
   */
  connect(conversationWith) {
    this.sessionUid = this.storageService.getItem('sessionUid');
    if (this.sessionUid) {
      // console.log('> sessionUid: ', this.sessionUid);
    } else {
      this.sessionUid = createGuid();
      this.storageService.setItem('sessionUid', this.sessionUid);
      // console.log('> sessionUid: ', this.sessionUid);
    }
    this.g.wdLog(['***** connect MessagingService *****']);

    try {
      if (this.storageService.getItem('messages')) {
        this.messages = JSON.parse(this.storageService.getItem('messages'));
      }
    } catch (error) {
      // console.log('> Error is handled attributes: ', error);
    }

    // this.checkRemoveConversation(conversationWith);
    // this.checkMessages(conversationWith);
  }



  /**
   * subcribe to mesages node (on added and removed message)
   * and update array messages
   */
  checkMessages(conversationWith) {
    // const urlMessages = this.urlMessages + conversationWith;
    // const firebaseMessages = firebase.database().ref(urlMessages);
    // this.messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(1000);
    // this.subscriptionsToMessages();
  }


  /**
   * subscribe to:
   * child_removed, child_added, child_changed
   * valutare utilizzo di .map!!!!
   */
  subscriptionsToMessages() {
    // const that = this;
    // //// SUBSCRIBE REMOVED ////
    // this.messagesRef.on('child_removed', function (childSnapshot) {
    //   const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
    //   if (index > -1) {
    //     that.messages.splice(index, 1);
    //   }
    // });
    // //// SUBSCRIBE ADDED ////
    // // this.onMessageArrived = function(child...) {}
    // this.messagesRef.on('child_added', function (childSnapshot) {
    //   const message = childSnapshot.val();
    //   that.g.wdLog(['child_added *****', childSnapshot.key, JSON.stringify(message)]);
    //   const text = replaceBr(message['text']);

    //   if (that.checkMessage(message)) {
    //     // imposto il giorno del messaggio
    //     // const timestamp =  firebase.database.ServerValue.TIMESTAMP;
    //     const dateSendingMessage = setHeaderDate(message['timestamp']);
    //     // console.log('message[timestamp]: ', message['timestamp']);
    //     const msg = new MessageModel(
    //       childSnapshot.key,
    //       message['language'],
    //       message['recipient'],
    //       message['recipient_fullname'],
    //       message['sender'],
    //       message['sender_fullname'],
    //       message['status'],
    //       message['metadata'],
    //       text,
    //       message['timestamp'],
    //       dateSendingMessage,
    //       message['type'],
    //       message['attributes'],
    //       message['channel_type'],
    //       message['progectId']
    //     );
    //     // azzero sto scrivendo
    //     // that.deleteWritingMessages(message['sender']);
    //     // notifico arrivo nuovo messaggio
    //     //  that.g.wdLog(['NOTIFICO NW MSG *****', that.obsAdded);
    //     // that.obsAdded.next(msg);
    //     if (message && message.sender === that.senderId) {
    //       // && message.type !== TYPE_MSG_TEXT) {
    //       // sto aggiungendo un'immagine inviata da me!!!
    //       // const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
    //       // that.messages.splice(index, 1, msg);
    //       const index = searchIndexInArrayForUid(that.messages, childSnapshot.key);
    //       //  that.g.wdLog(['index *****', index, childSnapshot.key);
    //       if (index < 0) {
    //         that.g.wdLog(['--------> ADD MSG IMG', index, msg]);
    //         msg.status = MSG_STATUS_SENT_SERVER.toString();
    //         that.messages.push(msg);
    //       }
    //     } else {
    //       // se msg è inviato da me cambio status
    //       // that.obsAddedMsg.next(text);
    //       msg.status = MSG_STATUS_SENT_SERVER.toString();
    //       that.g.wdLog(['--------> ADD MSG', msg.status]);
    //       that.messages.push(msg);
    //     }
    //     that.messages.sort(that.compareValues('timestamp', 'asc'));
    //     that.obsAdded.next(msg);
    //   }
    // });
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
    } else if (message && message.sender === this.senderId && message.type === TYPE_MSG_IMAGE) {
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
      //firebase.database().ref(urlNodeMessagesUpdate).update({ status: MSG_STATUS_RECEIVED });
    }
  }
}

  /**
   * check if agent writing
   */
  public checkWritingMessages(tenant, conversationWith): any {
    // this.conversationWith = conversationWith;
    // const urlNodeFirebase = '/apps/' + tenant + '/typings/' + conversationWith;
    // this.g.wdLog(['checkWritingMessages *****', urlNodeFirebase]);
    // const firebaseMessages = firebase.database().ref(urlNodeFirebase);
    // const messagesRef = firebaseMessages.orderByChild('timestamp').limitToLast(1);
    // return messagesRef;
    return;
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
         that.g.wdLog(['childSnapshot *****', uid]);
        if (uid.startsWith('bot_')) {
          RESP = uid;
          return;
        }
      }
    );
     that.g.wdLog(['RESP:', RESP]);
    return RESP;
  }



  /**
   *
   */
  sendMessage(senderFullname, msg, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type) { // : string {
    this.g.wdLog(['SEND MESSAGE: ', msg, senderFullname, recipientFullname]);
    this.g.wdLog(['metadata:: ', metadata.button]);

    // aggiungo un uid univoco ad ogni msg
    let uid = createGuid(); // (new Date().getTime()).toString(36);
    attributes.uid = uid;
    if (metadata.uid) {
      uid = metadata.uid;
      attributes.uid = metadata.uid;
    }
    // const messageString = urlify(msg);
    if (!senderFullname || senderFullname === '' ) {
      senderFullname = 'Guest';
    }
    if (!recipientFullname || recipientFullname === '' ) {
      recipientFullname = 'Guest';
    }
    const that = this;
    const now: Date = new Date();
    const timestamp = now.valueOf();
    // const timestamp = firebase.database.ServerValue.TIMESTAMP;

    const language = navigator.language;
    const dateSendingMessage = setHeaderDate(timestamp);
    const message = new MessageModel(
      uid,
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
    // this.messages.push(message);
    // const conversationRef = firebase.database().ref(this.urlMessages + conversationWith);
    // that.g.wdLog([message.toString()]);

    // const messageRef = conversationRef.push();
    // const key = messageRef.key;
    // message.uid = key;
    //  that.g.wdLog(['messageRef: ', messageRef]);
    // const messageForFirebase = message.asFirebaseMessage();
    //  that.g.wdLog(['messageForFirebase: ', messageForFirebase]);
    // messageRef.set(messageForFirebase, function (error) {
    //   // Callback comes here
    //   if (error) {
    //     // cambio lo stato in rosso: invio nn riuscito!!!
    //     message.status = '-100';
    //      that.g.wdLog(['ERRORE', error]);
    //   } else {
    //     // that.checkWritingMessages();
    //     message.status = '150';
    //     that.g.wdLog(['OK MSG INVIATO CON SUCCESSO AL SERVER', message]);
    //   }
    //   //   that.g.wdLog(['****** changed *****', that.messages);
    // });

    if (message.text !== PROXY_MSG_START) {
      this.addMessage(message);
    }

    try {
      if (message.text === PROXY_MSG_START && this.messages.length > 0) {
        return;
      }
    } catch (error) {
      // console.log('> Error is handled attributes: ', error);
    }


    this.sendMessageService(message)
    .subscribe( response => {
        //console.log('RESPONSE°°°°°°°°°°°°°°°°°°°° ', response);
        that.onMessageReceived(response);
    }, (error) => {
        //console.error('::onMessageReceivement', error);
        // that.setParameters(null);
    }, () => {
        //console.log('onMessageReceivement null');
        // that.setParameters(null);
    });
    return message;
  }



  /**
   * check if conversation exists, subscibing conversations node
   * if conversation is removed (closed by agent)
   * call closeConversation and start modal Rating conversation
   */
  private checkRemoveConversation(conversationWith) {
    const that = this;
    //this.conversationsRef = firebase.database().ref(this.urlConversation);
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
    // this.firebaseMessagesKey = firebase.database().ref(this.urlMessages);
    // // creo il nodo conversazione generando un custom uid
    // const newMessageRef = this.firebaseMessagesKey.push();
    // const key = UID_SUPPORT_GROUP_MESSAGES + newMessageRef.key;
    // // sessionStorage.setItem(uid, key);
    // this.g.wdLog(['setItem ************** UID:', uid, ' KWY: ', key]);
    // // this.storageService.setItem(uid, key);
    // this.conversationWith = key;

    const key = 'conversazione_bari_bot';
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
  //    that.g.wdLog(['setRating **************', rate);
  //   this.observableWidgetActive.next(false);
  // }

  /** */
  updateMetadataMessage(uid, metadata) {
    metadata.status = true;
    const message = {
      metadata: metadata
    };
    //const firebaseMessages = firebase.database().ref(this.urlMessages + uid);
    //firebaseMessages.set(message);
  }




  /**
   * called on ondestroy from component 'conversation'
   * detach all callbacks firebase on messagesRef
   */
  unsubscribeAllReferences() {
    this.g.wdLog(['--------> messagesRef.off']);
    try {
      this.messagesRef.off();
    } catch (error) {
        console.log('> Error is: ', error);
    }
    // this.conversationsRef.off('child_removed');
  }

}
