import { CustomLogger } from './../logger/customLogger';

import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/firestore';

// models

import { UserModel } from '../../models/user';

// services
import { ConversationHandlerService } from '../abstract/conversation-handler.service';

// utils
import { MSG_STATUS_RECEIVED, CHAT_REOPENED, CHAT_CLOSED, MEMBER_JOINED_GROUP, TYPE_DIRECT, MESSAGE_TYPE_INFO } from '../../utils/constants';
import {
  htmlEntities,
  compareValues,
  searchIndexInArrayForUid,
  conversationMessagesRef
} from '../../utils/utils';
import { timestamp } from 'rxjs/operators';
import { MessageModel } from '../../models/message';
import { messageType } from '../../utils/utils-message';



// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseConversationHandler extends ConversationHandlerService {

    // BehaviorSubject
    messageAdded: BehaviorSubject<MessageModel>;
    messageChanged: BehaviorSubject<MessageModel>;
    messageRemoved: BehaviorSubject<string>;
    isTyping: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    // public variables
    public attributes: any;
    public messages: MessageModel[];
    public conversationWith: string;


    // private variables
    private translationMap: Map<string, string>; // LABEL_TODAY, LABEL_TOMORROW
    private urlNodeFirebase: string;
    private recipientId: string;
    private recipientFullname: string;
    private tenant: string;
    private loggedUser: UserModel;
    private senderId: string;
    private listSubsriptions: any[];
    private CLIENT_BROWSER: string;
    private lastDate = '';
    private logger: CustomLogger = new CustomLogger(true)
    private ref: firebase.database.Query;

    constructor(@Inject('skipMessage') private skipMessage: boolean) {
        super();
    }

    /**
     * inizializzo conversation handler
     */
    initialize(recipientId: string,recipientFullName: string,loggedUser: UserModel,tenant: string,translationMap: Map<string, string>) {
        this.logger.printDebug('initWithRecipient::: FirebaseConversationHandler',recipientId, recipientFullName, loggedUser, tenant, translationMap)
        this.recipientId = recipientId;
        this.recipientFullname = recipientFullName;
        this.loggedUser = loggedUser;
        if (loggedUser) {
            this.senderId = loggedUser.uid;
        }
        this.tenant = tenant;
        this.translationMap = translationMap;
        
        this.listSubsriptions = [];
        this.CLIENT_BROWSER = navigator.userAgent;
        this.conversationWith = recipientId;
        this.messages = [];
        this.attributes = this.setAttributes();
    }

    /**
     * mi connetto al nodo messages
     * recupero gli ultimi 100 messaggi
     * creo la reference
     * mi sottoscrivo a change, removed, added
     */
    connect() {
        this.lastDate = '';
        const that = this;
        this.urlNodeFirebase = conversationMessagesRef(this.tenant, this.loggedUser.uid);
        this.urlNodeFirebase = this.urlNodeFirebase + this.conversationWith;
        this.logger.printDebug('urlNodeFirebase *****', this.urlNodeFirebase);
        const firebaseMessages = firebase.database().ref(this.urlNodeFirebase);
        this.ref = firebaseMessages.orderByChild('timestamp').limitToLast(100);
        this.ref.on('child_added', (childSnapshot) => {
            this.logger.printDebug('>>>>>>>>>>>>>> child_added: ', childSnapshot.val())
            that.added(childSnapshot);
        });
        this.ref.on('child_changed', (childSnapshot) => {
            this.logger.printDebug('>>>>>>>>>>>>>> child_changed: ', childSnapshot.val())
            that.changed(childSnapshot);
        });
        this.ref.on('child_removed', (childSnapshot) => {
            that.removed(childSnapshot);
        });
    }


    /**
     * bonifico url in testo messaggio
     * recupero time attuale
     * recupero lingua app
     * recupero senderFullname e recipientFullname
     * aggiungo messaggio alla reference
     * @param msg
     * @param conversationWith
     * @param conversationWithDetailFullname
     */
    sendMessage(
        msg: string,
        typeMsg: string,
        metadataMsg: string,
        conversationWith: string,
        conversationWithFullname: string,
        sender: string,
        senderFullname: string,
        channelType: string
    ) {
        const that = this;
        if (!channelType || channelType === 'undefined') {
            channelType = TYPE_DIRECT;
        }
        const firebaseMessagesCustomUid = firebase.database().ref(this.urlNodeFirebase);

        // const key = messageRef.key;
        const lang = document.documentElement.lang;
        const recipientFullname = conversationWithFullname;
         // const dateSendingMessage = setHeaderDate(this.translationMap, '');
        const timestamp = firebase.database.ServerValue.TIMESTAMP
        const message = new MessageModel(
            '',
            lang,
            conversationWith,
            recipientFullname,
            sender,
            senderFullname,
            0,
            metadataMsg,
            msg,
            timestamp,
            //dateSendingMessage,
            typeMsg,
            this.attributes,
            channelType,
            false
        );
        const messageRef = firebaseMessagesCustomUid.push({
                language: lang,
                recipient: conversationWith,
                recipient_fullname: recipientFullname,
                sender: sender,
                sender_fullname: senderFullname,
                status: 0,
                metadata: metadataMsg,
                text: msg,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                type: typeMsg,
                attributes: this.attributes,
                channel_type: channelType
                // isSender: true
            });

        // const message = new MessageModel(
        //     key,
        //     language, // language
        //     conversationWith, // recipient
        //     recipientFullname, // recipient_full_name
        //     sender, // sender
        //     senderFullname, // sender_full_name
        //     0, // status
        //     metadata, // metadata
        //     msg, // text
        //     0, // timestamp
        //     type, // type
        //     this.attributes, // attributes
        //     channelType, // channel_type
        //     true // is_sender
        // );
        this.logger.printDebug('messages: ',  this.messages);
        this.logger.printDebug('senderFullname: ',  senderFullname);
        this.logger.printDebug('sender: ',  sender);
        this.logger.printDebug('SEND MESSAGE: ', msg, channelType);
        this.logger.printDebug('timestamp: ', );
        this.logger.printDebug('messaggio **************', );
        // messageRef.update({
        //     uid: messageRef.key
        // }, ( error ) => {
        //     // if (error) {
        //     //     message.status = -100;
        //     //     console.log('ERRORE', error);
        //     // } else {
        //     //     message.status = 150;
        //     //     console.log('OK MSG INVIATO CON SUCCESSO AL SERVER', message);
        //     // }
        //     // console.log('****** changed *****', that.messages);
        // });

        
          return message
    }

    sendMessage2(
        msg: string,
        typeMsg: string,
        metadataMsg: string,
        conversationWith: string,
        conversationWithFullname: string,
        sender: string,
        senderFullname: string,
        channelType: string,
        attributes: any
    ) {
        const that = this;
        if (!channelType || channelType === 'undefined') {
            channelType = TYPE_DIRECT;
        }
        const firebaseMessagesCustomUid = firebase.database().ref(this.urlNodeFirebase);

        // const key = messageRef.key;
        const lang = document.documentElement.lang;
        const recipientFullname = conversationWithFullname;
        const timestamp = firebase.database.ServerValue.TIMESTAMP
        const message = new MessageModel(
            '',
            lang,
            conversationWith,
            recipientFullname,
            sender,
            senderFullname,
            0,
            metadataMsg,
            msg,
            timestamp,
            //dateSendingMessage,
            typeMsg,
            attributes,
            channelType,
            false
        );
        const messageRef = firebaseMessagesCustomUid.push({
                language: lang,
                recipient: conversationWith,
                recipient_fullname: recipientFullname,
                sender: sender,
                sender_fullname: senderFullname,
                status: 0,
                metadata: metadataMsg,
                text: msg,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                type: typeMsg,
                attributes: attributes,
                channel_type: channelType
                // isSender: true
            });

        // const message = new MessageModel(
        //     key,
        //     language, // language
        //     conversationWith, // recipient
        //     recipientFullname, // recipient_full_name
        //     sender, // sender
        //     senderFullname, // sender_full_name
        //     0, // status
        //     metadata, // metadata
        //     msg, // text
        //     0, // timestamp
        //     type, // type
        //     this.attributes, // attributes
        //     channelType, // channel_type
        //     true // is_sender
        // );
        this.logger.printDebug('messages: ',  this.messages);
        this.logger.printDebug('senderFullname: ',  senderFullname);
        this.logger.printDebug('sender: ',  sender);
        this.logger.printDebug('SEND MESSAGE: ', msg, channelType);
        this.logger.printDebug('timestamp: ', );
        this.logger.printDebug('messaggio **************', );
        // messageRef.update({
        //     uid: messageRef.key
        // }, ( error ) => {
        //     // if (error) {
        //     //     message.status = -100;
        //     //     console.log('ERRORE', error);
        //     // } else {
        //     //     message.status = 150;
        //     //     console.log('OK MSG INVIATO CON SUCCESSO AL SERVER', message);
        //     // }
        //     // console.log('****** changed *****', that.messages);
        // });

        
          return message
    }

    /**
     * dispose reference della conversazione
     */
    dispose() {
        // this.ref.off();
    }


    // ---------------------------------------------------------- //
    // BEGIN PRIVATE FUNCTIONS
    // ---------------------------------------------------------- //
    /** */
    private setAttributes(): any {
        const attributes: any = {
            client: this.CLIENT_BROWSER,
            sourcePage: location.href,
            
        };

        if(this.loggedUser && this.loggedUser.email ){
            attributes.userEmail = this.loggedUser.email
        }
        if(this.loggedUser && this.loggedUser.fullname) {
            attributes.userFullname = this.loggedUser.fullname
        }
        

        // let attributes: any = JSON.parse(sessionStorage.getItem('attributes'));
        // if (!attributes || attributes === 'undefined') {
        //     attributes = {
        //         client: this.CLIENT_BROWSER,
        //         sourcePage: location.href,
        //         userEmail: this.loggedUser.email,
        //         userFullname: this.loggedUser.fullname
        //     };
        //     console.log('>>>>>>>>>>>>>> setAttributes: ', JSON.stringify(attributes));
        //     sessionStorage.setItem('attributes', JSON.stringify(attributes));
        // }
        return attributes;
    }

    /** */
    private added(childSnapshot: any) {
        const msg = this.messageGenerate(childSnapshot);
        // msg.attributes && msg.attributes['subtype'] === 'info'
        if(this.skipMessage && messageType(MESSAGE_TYPE_INFO, msg) ){
            return;
        }
        // console.log('>>>>>>>>>>>>>> added headerDate: ', msg);
        this.addRepalceMessageInArray(childSnapshot.key, msg);
        this.messageAdded.next(msg);
    }

    /** */
    private changed(childSnapshot: any) {
        const msg = this.messageGenerate(childSnapshot);
        // imposto il giorno del messaggio per visualizzare o nascondere l'header data
        // console.log('>>>>>>>>>>>>>> changed headerDate: ', msg);
        // msg.attributes && msg.attributes['subtype'] === 'info'
        if(this.skipMessage && messageType(MESSAGE_TYPE_INFO, msg) ){
            return;
        }
        this.addRepalceMessageInArray(childSnapshot.key, msg);
        this.messageChanged.next(msg);
        
    }

    /** */
    private removed(childSnapshot: any) {
        const index = searchIndexInArrayForUid(this.messages, childSnapshot.key);
        // controllo superfluo sarà sempre maggiore
        if (index > -1) {
            this.messages.splice(index, 1);
            this.messageRemoved.next(childSnapshot.key);
        }
    }

    /** */
    private messageGenerate(childSnapshot: any) {
        const msg: MessageModel = childSnapshot.val();        
        msg.uid = childSnapshot.key;
        // controllo fatto per i gruppi da rifattorizzare
        if (!msg.sender_fullname || msg.sender_fullname === 'undefined') {
            msg.sender_fullname = msg.sender;
        }
        // bonifico messaggio da url
        if (msg.type === 'text') {
            // msg.text = htmlEntities(msg.text);
        }
        // verifico che il sender è il logged user
        msg.isSender = this.isSender(msg.sender, this.loggedUser.uid);
        // traduco messaggi se sono del server
        if (msg.attributes && msg.attributes.subtype) {
            if (msg.attributes.subtype === 'info' || msg.attributes.subtype === 'info/support') {
                this.translateInfoSupportMessages(msg);
            }
        }
        if (msg.attributes && msg.attributes.projectId) {
            this.attributes.projectId = msg.attributes.projectId;
            // sessionStorage.setItem('attributes', JSON.stringify(attributes));
        }
        return msg;
    }

    /** */
    private addRepalceMessageInArray(key: string, msg: MessageModel) {
        const index = searchIndexInArrayForUid(this.messages, key);
        if (index > -1) {
            this.messages.splice(index, 1, msg);
        } else {
            this.messages.splice(0, 0, msg);
        }
        this.messages.sort(compareValues('timestamp', 'asc'));
        // aggiorno stato messaggio, questo stato indica che è stato consegnato al client e NON che è stato letto
        this.setStatusMessage(msg, this.conversationWith);
    }

    /** */
    private translateInfoSupportMessages(message: MessageModel) {
        // check if the message attributes has parameters and it is of the "MEMBER_JOINED_GROUP" type
        const INFO_SUPPORT_USER_ADDED_SUBJECT = this.translationMap.get('INFO_SUPPORT_USER_ADDED_SUBJECT');
        const INFO_SUPPORT_USER_ADDED_YOU_VERB = this.translationMap.get('INFO_SUPPORT_USER_ADDED_YOU_VERB');
        const INFO_SUPPORT_USER_ADDED_COMPLEMENT = this.translationMap.get('INFO_SUPPORT_USER_ADDED_COMPLEMENT');
        const INFO_SUPPORT_USER_ADDED_VERB = this.translationMap.get('INFO_SUPPORT_USER_ADDED_VERB');
        const INFO_SUPPORT_CHAT_REOPENED = this.translationMap.get('INFO_SUPPORT_CHAT_REOPENED');
        const INFO_SUPPORT_CHAT_CLOSED = this.translationMap.get('INFO_SUPPORT_CHAT_CLOSED');
        if (message.attributes.messagelabel
            && message.attributes.messagelabel.parameters
            && message.attributes.messagelabel.key === MEMBER_JOINED_GROUP
        ) {
            let subject: string;
            let verb: string;
            let complement: string;
            if (message.attributes.messagelabel.parameters.member_id === this.loggedUser.uid) {
                subject = INFO_SUPPORT_USER_ADDED_SUBJECT;
                verb = INFO_SUPPORT_USER_ADDED_YOU_VERB;
                complement = INFO_SUPPORT_USER_ADDED_COMPLEMENT;
            } else {

                if (message.attributes.messagelabel.parameters.fullname) {
                    // other user has been added to the group (and he has a fullname)
                    subject = message.attributes.messagelabel.parameters.fullname;
                    verb = INFO_SUPPORT_USER_ADDED_VERB;
                    complement = INFO_SUPPORT_USER_ADDED_COMPLEMENT;
                } else {
                    // other user has been added to the group (and he has not a fullname, so use hes useruid)
                    subject = message.attributes.messagelabel.parameters.member_id;
                    verb = INFO_SUPPORT_USER_ADDED_VERB;
                    complement = INFO_SUPPORT_USER_ADDED_COMPLEMENT;
                }
            }
            message.text = subject + ' ' + verb + ' ' + complement;
        } else if ((message.attributes.messagelabel && message.attributes.messagelabel.key === CHAT_REOPENED)) {
            message.text = INFO_SUPPORT_CHAT_REOPENED;
        } else if ((message.attributes.messagelabel && message.attributes.messagelabel.key === CHAT_CLOSED)) {
            message.text = INFO_SUPPORT_CHAT_CLOSED;
        }
    }


    /**
     * aggiorno lo stato del messaggio
     * questo stato indica che è stato consegnato al client e NON che è stato letto
     * se il messaggio NON è stato inviato da loggedUser AGGIORNO stato a 200
     * @param item
     * @param conversationWith
     */
    private setStatusMessage(msg: MessageModel, conversationWith: string) {
        if (msg.status < MSG_STATUS_RECEIVED) {
            if (msg.sender !== this.loggedUser.uid && msg.status < MSG_STATUS_RECEIVED) {
            const urlNodeMessagesUpdate  = this.urlNodeFirebase + '/' + msg.uid;
            this.logger.printDebug('AGGIORNO STATO MESSAGGIO', urlNodeMessagesUpdate);
            firebase.database().ref(urlNodeMessagesUpdate).update({ status: MSG_STATUS_RECEIVED });
            }
        }
    }

    /**
     * controllo se il messaggio è stato inviato da loggerUser
     * richiamato dalla pagina elenco messaggi della conversazione
     */
    private isSender(sender: string, currentUserId: string) {
        if (currentUserId) {
            if (sender === currentUserId) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    /** */
    // updateMetadataMessage(uid: string, metadata: any) {
    //     metadata.status = true;
    //     const message = {
    //         metadata: metadata
    //     };
    //     const firebaseMessages = firebase.database().ref(this.urlNodeFirebase + uid);
    //     firebaseMessages.set(message);
    // }


  unsubscribe(key: string) {
    this.logger.printDebug('unsubscribe: ', key);
    this.listSubsriptions.forEach(sub => {
        this.logger.printDebug('unsubscribe: ', sub.uid, key);
      if (sub.uid === key) {
        this.logger.printDebug('unsubscribe: ', sub.uid, key);
        sub.unsubscribe(key, null);
        return;
      }
    });
  }

}
