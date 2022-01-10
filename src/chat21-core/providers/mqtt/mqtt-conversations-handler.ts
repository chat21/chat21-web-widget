import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// mqtt
import {Chat21Service} from './chat-service';

// models
import { ConversationModel } from '../../models/conversation';

// services
import { ConversationsHandlerService } from '../abstract/conversations-handler.service';
// import { DatabaseProvider } from 'src/app/services/database';

// utils
import { TYPE_GROUP } from '../../utils/constants';
import { getImageUrlThumbFromFirebasestorage, avatarPlaceholder, getColorBck } from '../../utils/utils-user';
import { compareValues, getFromNow, conversationsPathForUserId, searchIndexInArrayForUid } from '../../utils/utils';
// import { ImageRepoService } from '../abstract/image-repo.service';
// import { ConsoleReporter } from 'jasmine';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class MQTTConversationsHandler extends ConversationsHandlerService {
    

    // BehaviorSubject
    BSConversationDetail: BehaviorSubject<ConversationModel>;
    conversationAdded: BehaviorSubject<ConversationModel>;
    conversationChanged: BehaviorSubject<ConversationModel>;
    conversationRemoved: BehaviorSubject<ConversationModel>;
    loadedConversationsStorage: BehaviorSubject<ConversationModel[]>;
    BSConversations: BehaviorSubject<ConversationModel[]>
    // readAllMessages: BehaviorSubject<string>;
    // imageRepo: ImageRepoService;

    // public variables
    conversations: Array<ConversationModel> = [];
    uidConvSelected: string;
    tenant: string;
    // FIREBASESTORAGE_BASE_URL_IMAGE: string;
    // urlStorageBucket: string;

    // private variables
    private loggedUserId: string;
    private translationMap: Map<string, string>;
    private isConversationClosingMap: Map<string, boolean>;

    private audio: any;
    private setTimeoutSound: any;

    constructor(
        // private tiledeskConversationsProvider: TiledeskConversationProvider,
        // public databaseProvider: DatabaseProvider,
        public chat21Service: Chat21Service
    ) {
        super();
    }

    /**
     * inizializzo conversations handler
     */
    initialize(
        tenant: string, 
        userId: string,
        translationMap: Map<string, string>
        ) {
        console.log('initialize MQTTConversationsHandler');
        this.loggedUserId = userId;
        this.translationMap = translationMap;
        this.conversations = [];
        // this.databaseProvider.initialize(userId, this.tenant);
        this.isConversationClosingMap = new Map();
        // this.getConversationsFromStorage();
    }

    public getConversationDetail(conversationWith: string, callback) {
        // 1 cerco array locale
        // 2 cerco remoto
        // callback

        const conversation = this.conversations.find(conv => conv.conversation_with === conversationWith);
        console.log('found locally? getConversationDetail *****: ', conversation);
        if (conversation) {
            console.log('found!');
            callback(conversation);
        } else {
            console.log('Not found locally, remote.getConversationDetail *****: ', conversation);
            this.chat21Service.chatClient.conversationDetail(conversationWith, (err, conversation) => {
                if (conversation) {
                    if (callback) {
                        callback(this.completeConversation(conversation));
                    }
                }
                else {
                    if (callback) {
                        callback(null);
                    }
                }
            })
        }
    }

    setConversationRead(conversationrecipient): void {
        console.log("setConversationRead...")
        this.chat21Service.chatClient.updateConversationIsNew(conversationrecipient, false, (err) => {
            if (err) {
                console.error("setConversationRead: false. An error occurred", err);
            }
            else {
                console.log("setConversationRead: false. Ok");
            }
        });
    }

    /**
     *
     */
    // private getConversationsFromStorage() {
    //     const that = this;
    //     this.databaseProvider.getConversations()
    //     .then((conversations: [ConversationModel]) => {
    //         that.loadedConversationsStorage.next(conversations);
    //         // that.events.publish('loadedConversationsStorage', conversations);
    //     })
    //     .catch((e) => {
    //         console.log('error: ', e);
    //     });
    // }

    /**
     * connecting to conversations
     */
    // connect() {
    //     console.log('connecting MQTT conversations handler');
    //     const handlerConversationAdded = this.chat21Service.chatClient.onConversationAdded( (conv) => {
    //         console.log('conversation added:', conv.text);
    //         this.added(conv);
    //     });
    //     const handlerConversationUpdated = this.chat21Service.chatClient.onConversationUpdated( (conv) => {
    //         console.log('conversation updated:', conv.text);
    //         this.changed(conv);
    //     });
    //     const handlerConversationDeleted = this.chat21Service.chatClient.onConversationDeleted( (conv) => {
    //         console.log('conversation deleted:', conv.text);
    //         this.removed(conv);
    //     });
    //     this.chat21Service.chatClient.lastConversations( (err, conversations) => {
    //         console.log('Last conversations', conversations, 'err', err);
    //         if (!err) {
    //             conversations.forEach(conv => {
    //                 this.added(conv);
    //             });
    //         }
    //     });
    //     // SET AUDIO
    //     this.audio = new Audio();
    //     this.audio.src = URL_SOUND;
    //     this.audio.load();


    // ---------------------------------------------------------------------------------
     // New connect - renamed subscribeToConversation
     //----------------------------------------------------------------------------------
     subscribeToConversations(loaded) {
            console.log('connecting MQTT conversations handler');
            const handlerConversationAdded = this.chat21Service.chatClient.onConversationAdded( (conv) => {
                let conversation = this.completeConversation(conv); // needed to get the "conversation_with", and find the conv in the conv-history
                const index = this.searchIndexInArrayForConversationWith(this.conversations, conversation.conversation_with);
                if (index > -1) {
                    console.log("Added conv -> Changed!")
                    this.changed(conversation);
                }
                else {
                    console.log("Added conv -> Added!")
                    this.added(conversation);
                }
            });
            const handlerConversationUpdated = this.chat21Service.chatClient.onConversationUpdated( (conv, topic) => {
                console.log('conversation updated:', JSON.stringify(conv));
                this.changed(conv);
            });
            const handlerConversationDeleted = this.chat21Service.chatClient.onConversationDeleted( (conv, topic) => {
                console.log('conversation deleted:', conv, topic);
                // example topic: apps.tilechat.users.ME.conversations.CONVERS-WITH.clientdeleted
                const topic_parts = topic.split("/")
                console.debug("topic and parts", topic_parts)
                if (topic_parts.length < 7) {
                    console.error("Error. Not a conversation-deleted topic:", topic);
                    return
                }
                const convers_with = topic_parts[5];
                this.removed({
                    uid: convers_with
                });
            });
            this.chat21Service.chatClient.lastConversations( false, (err, conversations) => {
                console.log('Last conversations', conversations, 'err', err);
                if (!err) {
                    conversations.forEach(conv => {
                        this.added(conv);
                    });
                    loaded();
                }
            });
    }

    getLastConversation(callback: (conv: ConversationModel, error: string) => void): void {
        throw new Error('Method not implemented.');
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    /**
     * 1 -  completo la conversazione con i parametri mancanti
     * 2 -  verifico che sia una conversazione valida
     * 3 -  salvo stato conversazione (false) nell'array delle conversazioni chiuse
     * 4 -  aggiungo alla pos 0 la nuova conversazione all'array di conversazioni 
     *      o sostituisco la conversazione con quella preesistente
     * 5 -  salvo la conversazione nello storage
     * 6 -  ordino l'array per timestamp
     * 7 -  pubblico conversations:update
     */
    private added(conv: any) {
        console.log("NEW CONV childSnapshot", conv)
        let conversation = this.completeConversation(conv);
        if (this.isValidConversation(conversation)) {
            this.setClosingConversation(conversation.conversation_with, false);
            console.log("new conv.uid" + conversation.uid);
            console.log("conversations:", this.conversations);
            const index = this.searchIndexInArrayForConversationWith(this.conversations, conversation.conversation_with);
            console.log("found index:", index)
            console.log("NUOVA CONVER;.uid2" + conversation.uid)
            if (index > -1) {
                console.log("TROVATO")
                this.conversations.splice(index, 1, conversation);
            } else {
                console.log("NON TROVATO")
                this.conversations.splice(0, 0, conversation);
                // this.databaseProvider.setConversation(conversation);
            }
            console.log("NUOVA CONVER;.uid3" + conversation.uid)
            this.conversations.sort(compareValues('timestamp', 'desc'));
            console.log("NUOVA CONVER;.uid4" + conversation.uid)
            console.log("TUTTE:", this.conversations)
            // this.conversationChanged.next(conversation);
            console.log("NUOVA CONVER;.uid5" + conversation.uid)
            this.conversationAdded.next(conversation);
            console.log("NUOVA CONVER;.uid6" + conversation.uid)
            // this.events.publish('conversationsChanged', this.conversations);
        } else {
            console.error('ChatConversationsHandler::added::conversations with conversationId: ', conversation.conversation_with, 'is not valid');
        }
    }

    searchIndexInArrayForConversationWith(conversations, conversation_with: string) {
        return conversations.findIndex(conv => conv.conversation_with === conversation_with);
    }

    /**
     * 1 -  completo la conversazione con i parametri mancanti
     * 2 -  verifico che sia una conversazione valida
     * 3 -  aggiungo alla pos 0 la nuova conversazione all'array di conversazioni 
     * 4 -  salvo la conversazione nello storage
     * 5 -  ordino l'array per timestamp
     * 6 -  pubblico conversations:update
     * 7 -  attivo sound se è un msg nuovo
     */
    private changed(conversation: any) {
        // const childData: ConversationModel = childSnapshot;
        // childData.uid = childSnapshot.key;
        // console.log('changed conversation: ', childData);
        // const conversation = this.completeConversation(childData);
        console.log("Conversation changed:", conversation)
        // let conversation = this.completeConversation(childSnapshot);
        // childSnapshot.uid = childSnapshot.conversation_with;
        // let conversation = this.completeConversation(childSnapshot);
        // console.log("Conversation completed:", conversation);
        // conversation.uid = conversation.conversation_with;
        // console.log("conversation.uid" + conversation.uid)
        // console.log("conversation.uid", conversation.uid)
        // if (this.isValidConversation(conversation)) {
        // this.setClosingConversation(conversation.uid, false);
        if (!conversation.conversation_with) {
            conversation.conversation_with = conversation.conversWith // conversWith comes from remote
        }
        const index = searchIndexInArrayForUid(this.conversations, conversation.conversation_with);
        if (index > -1) {
            // const conv = this.conversations[index];
            // console.log("Conversation to update found", conv);
            this.updateConversationWithSnapshot(this.conversations[index], conversation);
            console.log("conversationchanged.isnew", index, JSON.stringify(conversation))
            this.conversations.sort(compareValues('timestamp', 'desc'));
            this.conversations.splice(index, 1, this.conversations[index])
            this.conversationChanged.next(this.conversations[index]);
        }
    }

    private updateConversationWithSnapshot(conv: ConversationModel, snap: any) {
        console.log("updating conv", conv, "with snap", snap)
        console.log("print snap keys/values")
        Object.keys(snap).forEach(k => {
            console.log("key:" + k);
            if (k === 'is_new') {
                console.log("aggiorno key:" + k);
                conv.is_new = snap[k];
            }
            if (k === 'text') {
                console.log("aggiorno key:" + k);
                conv.last_message_text = snap[k];
                conv.text = snap[k];
            }
            if (k === 'recipient') {
                console.log("aggiorno key:" + k);
                conv.recipient = snap[k];
            }
            if (k === 'recipient_fullname') {
                console.log("aggiorno key:" + k);
                conv.recipient_fullname = snap[k];
            }
            if (k === 'sender') {
                console.log("aggiorno key:" + k);
                conv.sender = snap[k];
            }
            if (k === 'sender_fullname') {
                console.log("aggiorno key:" + k);
                conv.sender_fullname = snap[k];
            }
            if (k === 'attributes') {
                console.log("aggiorno key:" + k);
                conv.attributes = snap[k];
            }
            if (k === 'timestamp') {
                console.log("aggiorno key:" + k);
                conv.timestamp = snap[k]; //this.getTimeLastMessage(snap[k]);
            }
            if (k === 'status') {
                console.log("aggiorno key:" + k);
                conv.status = this.setStatusConversation(conv.sender, conv.uid);
            }
            if (k === 'type') {
                console.log("aggiorno key:" + k);
                conv.type = snap[k];
            }

        });
        console.log('listtttttt', this.conversations, conv, snap)
        // SCHEMA ConversationModel
        // public uid: string,
        // public attributes: any,
        // public channel_type: string,
        // public conversation_with_fullname: string,
        // public conversation_with: string,
        // public recipient: string,
        // public recipient_fullname: string,
        // public image: string,
        // public is_new: boolean,
        // public last_message_text: string,
        // public sender: string,
        // public senderAuthInfo: any,
        // public sender_fullname: string,
        // public status: string,
        // public timestamp: string,
        // public selected: boolean,
        // public color: string,
        // public avatar: string,
        // public archived: boolean
    }

    
    /**
     * 1 -  cerco indice conversazione da eliminare
     * 2 -  elimino conversazione da array conversations
     * 3 -  elimino la conversazione dallo storage
     * 4 -  pubblico conversations:update
     * 5 -  elimino conversazione dall'array delle conversazioni chiuse
     */
    private removed(childSnapshot) {
        const index = searchIndexInArrayForUid(this.conversations, childSnapshot.uid);
        if (index > -1) {
            const conversationRemoved = this.conversations[index]
            this.conversations.splice(index, 1);
            // this.conversations.sort(compareValues('timestamp', 'desc'));
            // this.databaseProvider.removeConversation(childSnapshot.key);
            console.debug("conversationRemoved::", conversationRemoved)
            this.conversationRemoved.next(conversationRemoved);
        }
        // remove the conversation from the isConversationClosingMap
        this.deleteClosingConversation(childSnapshot.uid);
    }

    /**
     * dispose reference di conversations
     */
    dispose() {
        this.conversations.length = 0;
        this.conversations = [];
        this.uidConvSelected = '';
    }

    getClosingConversation(conversationId: string) {
        return this.isConversationClosingMap[conversationId];
    }

    setClosingConversation(conversationId: string, status: boolean) {
        this.isConversationClosingMap[conversationId] = status;
    }

    deleteClosingConversation(conversationId: string) {
        this.isConversationClosingMap.delete(conversationId);
    }

    archiveConversation(conversationId: string) { 
        this.chat21Service.chatClient.archiveConversation(conversationId);
    }

    private completeConversation(conv): ConversationModel {
        console.log('completeConversation', conv);
        conv.selected = false;
        if (!conv.sender_fullname || conv.sender_fullname === 'undefined' || conv.sender_fullname.trim() === '') {
            conv.sender_fullname = conv.sender;
        }
        if (!conv.recipient_fullname || conv.recipient_fullname === 'undefined' || conv.recipient_fullname.trim() === '') {
            conv.recipient_fullname = conv.recipient;
        }
        let conversation_with_fullname = conv.sender_fullname;
        let conversation_with = conv.sender;
        if (conv.sender === this.loggedUserId) {
            conversation_with = conv.recipient;
            conversation_with_fullname = conv.recipient_fullname;
            conv.last_message_text = conv.last_message_text;
        } else if (this.isGroup(conv)) {
            conversation_with = conv.recipient;
            conversation_with_fullname = conv.recipient_fullname;
            conv.last_message_text = conv.last_message_text;
        }
        conv.conversation_with_fullname = conversation_with_fullname;
        conv.conversation_with = conversation_with;
        conv.status = this.setStatusConversation(conv.sender, conv.uid);
        conv.avatar = avatarPlaceholder(conversation_with_fullname);
        conv.color = getColorBck(conversation_with_fullname);
        if (!conv.last_message_text) {
            conv.last_message_text = conv.text; // building conv with a message
        }
        conv.uid = conv.conversation_with;
        return conv;
    }

    private isGroup(conv: ConversationModel) {
        if (conv.recipient && conv.recipient.startsWith('group-') || conv.recipient.startsWith('support-group')) {
            return true;
        };
        return false;
    }

    /** */
    private setStatusConversation(sender, uid): string {
        let status = '0'; // letto
        if (sender === this.loggedUserId || uid === this.uidConvSelected) {
            status = '0';
        } else {
            status = '1'; // non letto
        }
        return status;
    }

    /**
     * calcolo il tempo trascorso da ora al timestamp passato
     * @param timestamp 
     */
    private getTimeLastMessage(timestamp: string) {
        const timestampNumber = parseInt(timestamp) / 1000;
        const time = getFromNow(timestampNumber);
        return time;
    }

    /**
     * restituisce il numero di conversazioni nuove
     */
    countIsNew(): number {
        let num = 0;
        this.conversations.forEach((element) => {
            if (element.is_new === true) {
                num++;
            }
        });
        return num;
    }

    // ---------------------------------------------------------- //
    // END FUNCTIONS
    // ---------------------------------------------------------- //

    /**
     * attivo sound se è un msg nuovo
     */
    private soundMessage() {
        console.log('****** soundMessage *****', this.audio);
        const that = this;
        // this.audio = new Audio();
        // this.audio.src = 'assets/pling.mp3';
        // this.audio.load();
        this.audio.pause();
        this.audio.currentTime = 0;
        clearTimeout(this.setTimeoutSound);
        this.setTimeoutSound = setTimeout(function () {
        //setTimeout(function() {
            that.audio.play()
            .then(function() {
                // console.log('****** then *****');
            })
            .catch(function() {
                // console.log('***//tiledesk-dashboard/chat*');
            });
        }, 1000);       
    }

    // /**
    //  *  check if the conversations is valid or not
    // */
    // private isValidConversation(convToCheckId, convToCheck: ConversationModel) : boolean {
    //     //console.log("[BEGIN] ChatConversationsHandler:: convToCheck with uid: ", convToCheckId);
    //     if (!this.isValidField(convToCheck.uid)) {
    //         console.error("ChatConversationsHandler::isValidConversation:: 'uid is not valid' ");
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.is_new)) {
    //         console.error("ChatConversationsHandler::isValidConversation:: 'is_new is not valid' ");
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.last_message_text)) {
    //         console.error("ChatConversationsHandler::isValidConversation:: 'last_message_text is not valid' ");
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.recipient)) {
    //         console.error("ChatConversationsHandler::isValidConversation:: 'recipient is not valid' ");
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.recipient_fullname)) {
    //         console.error("ChatConversationsHandler::isValidConversation:: 'recipient_fullname is not valid' ");
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.sender)) {
    //         console.error("ChatConversationsHandler::isValidConversation:: 'sender is not valid' ");
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.sender_fullname)) {
    //         console.error("ChatConversationsHandler::isValidConversation:: 'sender_fullname is not valid' ");
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.status)) {
    //         console.error("ChatConversationsHandler::isValidConversation:: 'status is not valid' ");
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.timestamp)) {
    //         console.error("ChatConversationsHandler::isValidConversation:: 'timestamp is not valid' ");
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.channel_type)) {
    //         console.error("ChatConversationsHandler::isValidConversation:: 'channel_type is not valid' ");
    //         return false;
    //     }
    //     //console.log("[END] ChatConversationsHandler:: convToCheck with uid: ", convToCheckId);
    //     // any other case
    //     return true;
    // }

    /**
     *  check if the conversations is valid or not
    */
    private isValidConversation(convToCheck: ConversationModel) : boolean {
        //console.log("[BEGIN] ChatConversationsHandler:: convToCheck with uid: ", convToCheckId);
        console.log("checking uid of", convToCheck)
        console.log("conversation.uid", convToCheck.uid)
        console.log("channel_type is:", convToCheck.channel_type)
        
        if (!this.isValidField(convToCheck.uid)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'uid is not valid' ");
            return false;
        }
        // if (!this.isValidField(convToCheck.is_new)) {
        //     console.error("ChatConversationsHandler::isValidConversation:: 'is_new is not valid' ");
        //     return false;
        // }
        if (!this.isValidField(convToCheck.last_message_text)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'last_message_text is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.recipient)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'recipient is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.recipient_fullname)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'recipient_fullname is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.sender)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'sender is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.sender_fullname)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'sender_fullname is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.status)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'status is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.timestamp)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'timestamp is not valid' ");
            return false;
        }
        if (!this.isValidField(convToCheck.channel_type)) {
            console.error("ChatConversationsHandler::isValidConversation:: 'channel_type is not valid' ");
            return false;
        }
        //console.log("[END] ChatConversationsHandler:: convToCheck with uid: ", convToCheckId);
        // any other case
        return true;
    }

    // checks if a conversation's field is valid or not
    private isValidField(field) : boolean{
        return (field === null || field === undefined) ? false : true;
    }

}
