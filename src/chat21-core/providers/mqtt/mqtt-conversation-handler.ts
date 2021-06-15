import { Inject, Injectable, ɵConsole } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// // firebase
// import * as firebase from 'firebase/app';
// import 'firebase/messaging';
// import 'firebase/database';
// import 'firebase/firestore';
// mqtt
import {Chat21Service} from './chat-service';

// models
import { MessageModel } from '../../models/message';
import { UserModel } from '../../models/user';

// services
import { ConversationHandlerService } from '../abstract/conversation-handler.service';

// utils
import { MSG_STATUS_RECEIVED, CHAT_REOPENED, CHAT_CLOSED, MEMBER_JOINED_GROUP, TYPE_DIRECT, MESSAGE_TYPE_INFO } from '../../utils/constants';
import {
  htmlEntities,
  compareValues,
  searchIndexInArrayForUid,
  setHeaderDate,
  conversationMessagesRef
} from '../../utils/utils';
import { messageType } from '../../utils/utils-message';


// @Injectable({ providedIn: 'root' })
@Injectable()
export class MQTTConversationHandler extends ConversationHandlerService {

    // BehaviorSubject
    messageAdded: BehaviorSubject<MessageModel>;
    messageChanged: BehaviorSubject<MessageModel>;
    messageRemoved: BehaviorSubject<string>;
    isTypings: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    // public variables
    public attributes: any;
    public messages: MessageModel[];
    public conversationWith: string;
    public ref: any;

    // private variables
    private translationMap: Map<string, string>; // LABEL_TODAY, LABEL_TOMORROW
    // private urlNodeFirebase: string;
    private recipientId: string;
    private recipientFullname: string;
    private tenant: string;
    private loggedUser: UserModel;
    private senderId: string;
    private listSubsriptions: any[];
    private CLIENT_BROWSER: string;
    private lastDate = '';


    constructor(
        public chat21Service: Chat21Service,
        @Inject('skipMessage') private skipInfoMessage: boolean
        
    ) {
        super();
        console.log('contructor MQTTConversationHandler');
    }

    /**
     * inizializzo conversation handler
     */
    initialize(
        recipientId: string,
        recipientFullName: string,
        loggedUser: UserModel,
        tenant: string,
        translationMap: Map<string, string>
    ) {
        console.log('initWithRecipient:::', tenant);
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
        // this.attributes = this.setAttributes();
    }

    /**
     * mi connetto al nodo messages
     * recupero gli ultimi 100 messaggi
     * creo la reference
     * mi sottoscrivo a change, removed, added
     */
    connect() {
        this.chat21Service.chatClient.lastMessages(this.conversationWith, (err, messages) => {
            if (!err) {
                messages.forEach(msg => {
                    this.addedMessage(msg);
                });
            }
        });
        console.log('connecting conversation handler...');
        if (this.conversationWith == null) {
            console.error('cant connect invalid this.conversationWith', this.conversationWith);
            return;
        }
        const handler_message_added = this.chat21Service.chatClient.onMessageAddedInConversation(
            this.conversationWith, (message, topic) => {
                console.log('message added:', message, 'on topic:', topic);
                this.addedMessage(message);
        });
        const handler_message_updated = this.chat21Service.chatClient.onMessageUpdatedInConversation(
            this.conversationWith,  (message, topic) => {
            console.log('message updated:', message, 'on topic:', topic);
            this.updatedMessageStatus(message);
        });
        console.log("this.conversationWith,", this.conversationWith);
        if (this.isGroup(this.conversationWith)) {
            this.chat21Service.chatClient.getGroup(this.conversationWith, (err, group) => {
                console.log('got group:', group)
                console.log('subscribing to group updates...');
                const handler_group_updated = this.chat21Service.chatClient.onGroupUpdated( (group, topic) => {
                    if (topic.conversWith === this.conversationWith) {
                        console.log('group updated:', group);
                    }
                });
            });
        }

        // this.lastDate = '';
        // const that = this;
        // this.urlNodeFirebase = conversationMessagesRef(this.tenant, this.loggedUser.uid);
        // this.urlNodeFirebase = this.urlNodeFirebase + this.conversationWith;
        // console.log('urlNodeFirebase *****', this.urlNodeFirebase);
        // const firebaseMessages = firebase.database().ref(this.urlNodeFirebase);
        // this.ref = firebaseMessages.orderByChild('timestamp').limitToLast(100);
        // this.ref.on('child_added', (childSnapshot) => {
        //     console.log('>>>>>>>>>>>>>> child_added: ', childSnapshot.val());
        //     that.added(childSnapshot);
        // });
        // this.ref.on('child_changed', (childSnapshot) => {
        //     console.log('>>>>>>>>>>>>>> child_changed: ', childSnapshot.val());
        //     that.changed(childSnapshot);
        // });
        // this.ref.on('child_removed', (childSnapshot) => {
        //     that.removed(childSnapshot);
        // });
    }

    isGroup(groupId) {
        if (groupId.indexOf('group-') >= 0) {
            return true;
        }
        return false;
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
    // sendMessage(
    //     msg,
    //     type,
    //     metadata,
    //     this.conversationWith,
    //     this.conversationWithFullname,
    //     this.loggedUser.uid,
    //     fullname,
    //     this.channelType
    //   );
    sendMessage(
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

        console.log('Senderfullname', senderFullname);
        const language = document.documentElement.lang;
        const recipientFullname = conversationWithFullname;
        const recipientId = conversationWith;
        attributes.lang = language;
        this.chat21Service.chatClient.sendMessage(
            msg,
            typeMsg,
            recipientId,
            recipientFullname,
            senderFullname,
            attributes,
            metadataMsg,
            channelType,
            // language,
            (err, message) => {
                console.log('message: ' + JSON.stringify(message) + ' sent with err: ' + err);
                if (err) {
                // cambio lo stato in rosso: invio nn riuscito!!!
                message.status = '-100';
                console.log('ERRORE', err);
                } else {
                message.status = '150';
                console.log('OK MSG INVIATO CON SUCCESSO AL SERVER', message);
                }
            }
        );
        return new MessageModel(
            '',
            language,
            conversationWith,
            recipientFullname,
            sender,
            senderFullname,
            0,
            metadataMsg,
            msg,
            Date.now(),
            typeMsg,
            this.attributes,
            channelType,
            false
        );
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
    // private setAttributes(): any {
    //     let attributes: any = JSON.parse(sessionStorage.getItem('attributes'));
    //     if (!attributes || attributes === 'undefined') {
    //         attributes = {
    //             client: this.CLIENT_BROWSER,
    //             sourcePage: location.href,
    //             userEmail: this.loggedUser.email,
    //             userFullname: this.loggedUser.fullname
    //         };
    //         console.log('>>>>>>>>>>>>>> setAttributes: ', JSON.stringify(attributes));
    //         sessionStorage.setItem('attributes', JSON.stringify(attributes));
    //     }
    //     return attributes;
    // }

    /** */
    private addedMessage(messageSnapshot: any) {
        const msg = this.messageGenerate(messageSnapshot);
        msg.uid = msg.message_id;
        if(this.skipInfoMessage && messageType(MESSAGE_TYPE_INFO, msg) ){
            return;
        }
        // imposto il giorno del messaggio per visualizzare o nascondere l'header data
        msg.headerDate = null;
        const headerDate = setHeaderDate(this.translationMap, msg.timestamp);
        if (headerDate !== this.lastDate) {
            this.lastDate = headerDate;
            msg.headerDate = headerDate;
        }
        console.log('adding message:' + JSON.stringify(msg));
        // console.log('childSnapshot.message_id:' + msg.message_id);
        // console.log('childSnapshot.key:' + msg.key);
        // console.log('childSnapshot.uid:' + msg.uid);
        this.addReplaceMessageInArray(msg.uid, msg);
        this.updateMessageStatusReceived(msg);
        this.messageAdded.next(msg);
    }

    // /** */
    // private updatedMessage(message: any) {
    //     const msg = this.messageGenerate(message);
    //     msg.uid = msg.message_id;
    //     // imposto il giorno del messaggio per visualizzare o nascondere l'header data
    //     // con**** DATAIL messageAdded ***sole.log('>>>>>>>>>>>>>> changed headerDate: ', msg);
    //     this.addReplaceMessageInArray(msg.uid, msg);
    //     this.messageChanged.next(msg);
    // }

    /** */
    private updatedMessageStatus(patch: any) {
        // const msg = this.messageGenerate(message);
        if(this.skipInfoMessage && messageType(MESSAGE_TYPE_INFO, patch) ){
            return;
        }
        console.log('updating message with patch', patch);
        const index = searchIndexInArrayForUid(this.messages, patch.message_id);
        if (index > -1) {
            const message = this.messages[index];
            if (message) {
                message.status = patch.status;
                console.log('message found and patched (replacing)', message);
                // imposto il giorno del messaggio per visualizzare o nascondere l'header data
                // con**** DATAIL messageAdded ***sole.log('>>>>>>>>>>>>>> changed headerDate: ', msg);
                this.addReplaceMessageInArray(message.uid, message);
                this.messageChanged.next(message);
            }
        }
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
        // const msg: MessageModel = childSnapshot.val();
        console.log("childSnapshot>" + JSON.stringify(childSnapshot));
        const msg = childSnapshot;
        msg.uid = childSnapshot.key;
        // controllo fatto per i gruppi da rifattorizzare
        if (!msg.sender_fullname || msg.sender_fullname === 'undefined') {
            msg.sender_fullname = msg.sender;
        }
        // bonifico messaggio da url
        // if (msg.type === 'text') {
        //     msg.text = htmlEntities(msg.text);
        // }
        // verifico che il sender è il logged user
        console.log("****>msg.sender:" + msg.sender);
        console.log("****>this.loggedUser.uid:" + this.loggedUser.uid);
        msg.isSender = this.isSender(msg.sender, this.loggedUser.uid);
        // traduco messaggi se sono del server
        if (msg.attributes && msg.attributes.subtype) {
            if (msg.attributes.subtype === 'info' || msg.attributes.subtype === 'info/support') {
                this.translateInfoSupportMessages(msg);
            }
        }
        return msg;
    }

    /** */
    private addReplaceMessageInArray(uid: string, msg: MessageModel) {
        const index = searchIndexInArrayForUid(this.messages, uid);
        if (index > -1) {
            // const headerDate = this.messages[index].headerDate;
            // msg.headerDate = headerDate;
            this.messages.splice(index, 1, msg);
        } else {
            this.messages.splice(0, 0, msg);
        }
        this.messages.sort(compareValues('timestamp', 'asc'));
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
    private updateMessageStatusReceived(msg) {
        console.log('updateMessageStatusReceived', msg);
        if (msg['status'] < MSG_STATUS_RECEIVED) {
            console.log('status ', msg['status'], ' < (RECEIVED:200)', MSG_STATUS_RECEIVED);
            if (msg.sender !== this.loggedUser.uid && msg.status < MSG_STATUS_RECEIVED) {
                console.log('updating message with status received');
                this.chat21Service.chatClient.updateMessageStatus(msg.message_id, this.conversationWith, MSG_STATUS_RECEIVED, null);
            }
        }
        // if (msg.status < MSG_STATUS_RECEIVED) {
        //     if (msg.sender !== this.loggedUser.uid && msg.status < MSG_STATUS_RECEIVED) {
        //     const urlNodeMessagesUpdate  = this.urlNodeFirebase + '/' + msg.uid;
        //     console.log('AGGIORNO STATO MESSAGGIO', urlNodeMessagesUpdate);
        //     firebase.database().ref(urlNodeMessagesUpdate).update({ status: MSG_STATUS_RECEIVED });
        //     }
        // }
    }

    /**
     * controllo se il messaggio è stato inviato da loggerUser
     * richiamato dalla pagina elenco messaggi della conversazione
     */
    private isSender(sender: string, currentUserId: string) {
        console.log('isSender::::: ', sender, currentUserId);
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
    console.log('unsubscribe: ', key);
    this.listSubsriptions.forEach(sub => {
      console.log('unsubscribe: ', sub.uid, key);
      if (sub.uid === key) {
        console.log('unsubscribe: ', sub.uid, key);
        sub.unsubscribe(key, null);
        return;
      }
    });
  }

}
