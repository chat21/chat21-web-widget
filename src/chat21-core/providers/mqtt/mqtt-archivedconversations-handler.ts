import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// mqtt
import {Chat21Service} from './chat-service';

// models
import { ConversationModel } from '../../models/conversation';

// services
import { ConversationsHandlerService } from '../abstract/conversations-handler.service';

// utils
import { TYPE_GROUP } from '../../utils/constants';
import { getImageUrlThumbFromFirebasestorage, avatarPlaceholder, getColorBck } from '../../utils/utils-user';
import { compareValues, getFromNow, conversationsPathForUserId, searchIndexInArrayForUid } from '../../utils/utils';
import { ArchivedConversationsHandlerService } from '../abstract/archivedconversations-handler.service';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class MQTTArchivedConversationsHandler extends ArchivedConversationsHandlerService {
 

    // BehaviorSubject
    BSConversationDetail: BehaviorSubject<ConversationModel>;
    readAllMessages: BehaviorSubject<string>;
    archivedConversationAdded: BehaviorSubject<ConversationModel>;
    archivedConversationChanged: BehaviorSubject<ConversationModel>;
    archivedConversationRemoved: BehaviorSubject<ConversationModel>;
    loadedConversationsStorage: BehaviorSubject<ConversationModel[]>;
    BSConversations: BehaviorSubject<ConversationModel[]>
    // imageRepo: ImageRepoService;

    // public variables
    archivedConversations: Array<ConversationModel> = [];
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
        this.archivedConversations = [];
        // this.databaseProvider.initialize(userId, this.tenant);
        this.isConversationClosingMap = new Map();
        // this.getConversationsFromStorage();
    }

    public getConversationDetail(conversationWith: string, callback) {
        // 1 cerco array locale
        // 2 cerco remoto
        // callback

        const conversation = this.archivedConversations.find(conv => conv.conversation_with === conversationWith);
        console.log('found locally? getConversationDetail *****: ', conversation);
        if (conversation) {
            console.log('found!');
            callback(conversation);
        } else {
            console.log('Not found locally, remote.getConversationDetail *****: ', conversation);
            this.chat21Service.chatClient.conversationDetail(conversationWith, (conversation) => {
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
        // const urlUpdate = conversationsPathForUserId(this.tenant, this.loggedUserId) + '/' + conversation.recipient;
        // const update = {};
        // console.log('connect -------> conversations update', urlUpdate);
        // update['/is_new'] = false;
        // firebase.database().ref(urlUpdate).update(update);
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
            const handlerConversationAdded = this.chat21Service.chatClient.onArchivedConversationAdded( (conv) => {
                console.log('conversation added:', conv.text);
                this.added(conv);
            });
            // const handlerConversationUpdated = this.chat21Service.chatClient.onConversationUpdated( (conv) => {
            //     console.log('conversation updated:', conv.text);
            //     this.changed(conv);
            // });
            const handlerConversationDeleted = this.chat21Service.chatClient.onArchivedConversationDeleted( (conv) => {
                console.log('conversation deleted:', conv.text);
                this.removed(conv);
            });
            this.chat21Service.chatClient.lastConversations( true, (err, conversations) => {
                console.log('Last conversations', conversations, 'err', err);
                if (!err) {
                    conversations.forEach(conv => {
                        this.added(conv);
                    });
                    loaded();
                }
            });
            // SET AUDIO
            // this.audio = new Audio();
            // this.audio.src = URL_SOUND;
            // this.audio.load();
        // const that = this;
        // const urlNodeFirebase = conversationsPathForUserId(this.tenant, this.loggedUserId);
        // console.log('connect -------> conversations', urlNodeFirebase);
        // this.ref = firebase.database().ref(urlNodeFirebase).orderByChild('timestamp').limitToLast(200);
        // this.ref.on('child_changed', (childSnapshot) => {
        //     that.changed(childSnapshot);
        // });
        // this.ref.on('child_removed', (childSnapshot) => {
        //     that.removed(childSnapshot);
        // });
        // this.ref.on('child_added', (childSnapshot) => {
        //     that.added(childSnapshot);
        // });
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
    private added(childSnapshot: any) {
        console.log("NEW CONV:::", childSnapshot)
        // const childData: ConversationModel = childSnapshot;
        // childData.uid = childSnapshot.key;
        // const conversation = this.completeConversation(childData);
        // if (this.isValidConversation(childSnapshot.key, conversation)) {
        //     this.setClosingConversation(childSnapshot.key, false);
        //     // da verificare l'utilità e spostare in questa classe
        //     // this.tiledeskConversationsProvider.setClosingConversation(childSnapshot.key, false);
        //     const index = searchIndexInArrayForUid(this.conversations, conversation.uid);
        //     if (index > -1) {
        //         this.conversations.splice(index, 1, conversation);
        //     } else {
        //         this.conversations.splice(0, 0, conversation);
        //         // this.databaseProvider.setConversation(conversation);
        //     }
        //     this.conversations.sort(compareValues('timestamp', 'desc'));
        //     console.log("ALL CONVS:", this.conversations)
        //     this.conversationChanged.next(conversation);
        //     this.conversationAdded.next(conversation);
        //     // this.events.publish('conversationsChanged', this.conversations);
        // } else {
        //     console.error('ChatConversationsHandler::added::conversations with conversationId: ', childSnapshot.key, 'is not valid');
        // }
        // let childData: ConversationModel = childSnapshot;
        let conversation = this.completeConversation(childSnapshot);
        conversation.uid = conversation.conversation_with;
        // console.log("NUOVA CONVER;" + conversation.uid)
        console.log("NUOVA CONVER;.uid" + conversation.uid)
        if (this.isValidConversation(conversation)) {
            this.setClosingConversation(conversation.conversation_with, false);
            console.log("NUOVA CONVER;.uid1" + conversation.uid)
            console.log("conversations:", this.archivedConversations)
            console.log("cerco: ", conversation.uid)
            const index = this.searchIndexInArrayForConversationWith(this.archivedConversations, conversation.conversation_with);
            console.log("found index:", index)
            console.log("NUOVA CONVER;.uid2" + conversation.uid)
            if (index > -1) {
                console.log("TROVATO")
                this.archivedConversations.splice(index, 1, conversation);
            } else {
                console.log("NON TROVATO")
                this.archivedConversations.splice(0, 0, conversation);
                // this.databaseProvider.setConversation(conversation);
            }
            console.log("NUOVA CONVER;.uid3" + conversation.uid)
            this.archivedConversations.sort(compareValues('timestamp', 'desc'));
            console.log("NUOVA CONVER;.uid4" + conversation.uid)
            console.log("TUTTE:", this.archivedConversations)
            this.archivedConversationChanged.next(conversation);
            console.log("NUOVA CONVER;.uid5" + conversation.uid)
            this.archivedConversationAdded.next(conversation);
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
    // private changed(childSnapshot: any) {
    //     const childData: ConversationModel = childSnapshot.val();
    //     childData.uid = childSnapshot.key;
    //     console.log('changed conversation: ', childData);
    //     const conversation = this.completeConversation(childData);
    //     if (this.isValidConversation(conversation)) {
    //         this.setClosingConversation(childSnapshot.key, false);
    //         const index = searchIndexInArrayForUid(this.conversations, conversation.uid);
    //         if (index > -1) {
    //             this.conversations.splice(index, 1, conversation);
    //         }
    //         // this.databaseProvider.setConversation(conversation);
    //         this.conversations.sort(compareValues('timestamp', 'desc'));
    //         this.conversationChanged.next(conversation);
    //         // this.events.publish('conversationsChanged', this.conversations);
    //         this.conversationChanged.next(conversation);
    //     } else {
    //         console.error('ChatConversationsHandler::changed::conversations with conversationId: ', childSnapshot.key, 'is not valid');
    //     }
    //     if (conversation.is_new) {
    //         this.soundMessage();
    //     }
    // }

    /**
     * 1 -  cerco indice conversazione da eliminare
     * 2 -  elimino conversazione da array conversations
     * 3 -  elimino la conversazione dallo storage
     * 4 -  pubblico conversations:update
     * 5 -  elimino conversazione dall'array delle conversazioni chiuse
     */
    private removed(childSnapshot) {
        const index = searchIndexInArrayForUid(this.archivedConversations, childSnapshot.key);
        if (index > -1) {
            const conversationRemoved = this.archivedConversations[index]
            this.archivedConversations.splice(index, 1);
            // this.conversations.sort(compareValues('timestamp', 'desc'));
            // this.databaseProvider.removeConversation(childSnapshot.key);
            this.archivedConversationRemoved.next(conversationRemoved);
        }
        // remove the conversation from the isConversationClosingMap
        this.deleteClosingConversation(childSnapshot.key);

        // const index = searchIndexInArrayForUid(this.conversations, childSnapshot.key);
        // if (index > -1) {
        //     // 2
        //     this.conversations.splice(index, 1);
        //     // this.conversations.sort(compareValues('timestamp', 'desc'));
        //     // 3
        //     this.databaseProvider.removeConversation(childSnapshot.key);
        //     // 4
        //     // this.conversationsChanged.next(this.conversations);
        //     this.conversationsRemoved.next(this.conversations);
        //     // this.events.publish('conversationsChanged', this.conversations);
        // }
    }

    /**
     * dispose reference di conversations
     */
    dispose() {
        this.archivedConversations = [];
        this.archivedConversations.length = 0;
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
        // da implementare
    }
    
    // ---------------------------------------------------------- //
    // BEGIN FUNCTIONS 
    // ---------------------------------------------------------- //
    /**
     * Completo conversazione aggiungendo:
     * 1 -  nel caso in cui sender_fullname e recipient_fullname sono vuoti, imposto i rispettivi id come fullname,
     *      in modo da avere sempre il campo fullname popolato
     * 2 -  imposto conversation_with e conversation_with_fullname con i valori del sender o al recipient,
     *      a seconda che il sender corrisponda o meno all'utente loggato. Aggiungo 'tu:' se il sender coincide con il loggedUser
     *      Se il sender NON è l'utente loggato, ma è una conversazione di tipo GROUP, il conversation_with_fullname
     *      sarà uguale al recipient_fullname
     * 3 -  imposto stato conversazione, che indica se ci sono messaggi non letti nella conversazione
     * 4 -  imposto il tempo trascorso tra l'ora attuale e l'invio dell'ultimo messaggio
     * 5 -  imposto avatar, colore e immagine
     * @param conv
     */
    // public completeConversation(conv: any): ConversationModel {
    //     const conversation: ConversationModel = conv;
    //     // console.log('completeConversation', conv);
    //     if (!conv.sender_fullname || conv.sender_fullname === 'undefined' || conv.sender_fullname.trim() === '') {
    //         conversation.sender_fullname = conv.sender;
    //     } else {
    //         conversation.sender_fullname = conv.sender_fullname;
    //     }
    //     if (!conv.recipient_fullname || conv.recipient_fullname === 'undefined' || conv.recipient_fullname.trim() === ''){
    //         conversation.recipient_fullname = conv.recipient;
    //     } else {
    //         conversation.recipient_fullname = conv.recipient_fullname;
    //     }
    //     let LABEL_TU: string;
    //     this.translate.get('LABEL_TU').subscribe((res: string) => {
    //         LABEL_TU = res;
    //     });
    //     let conversationWithFullname = conv.sender_fullname;
    //     let conversationWith = conv.sender;
    //     conversation.last_message_text = conv.last_message_text;
    //     if (conv.sender === this.loggedUser.uid) {
    //         conversationWith = conv.recipient;
    //         conversationWithFullname = conv.recipient_fullname;
    //         conversation.last_message_text = LABEL_TU + conv.last_message_text;
    //     } else if (conv.channel_type === TYPE_GROUP) {
    //         conversationWith = conv.recipient;
    //         conversationWithFullname = conv.recipient_fullname;
    //         conversation.last_message_text = conv.last_message_text;
    //     }
    //     conversation.conversation_with_fullname = conversationWithFullname;

    //     conversation.selected = false;
    //     console.log('conv.uid', conv.uid);
    //     conversation.status = this.setStatusConversation(conv.sender, conv.uid);

    //     conversation.time_last_message = this.getTimeLastMessage(conv.timestamp);

    //     conversation.avatar = avatarPlaceholder(conversationWithFullname);
    //     conversation.color = getColorBck(conversationWithFullname);
    //     conversation.image = this.getImageUrlThumbFromFirebasestorage(conv.uid);
    //     // try {
    //     //     const FIREBASESTORAGE_BASE_URL_IMAGE = this.appConfig.getConfig().FIREBASESTORAGE_BASE_URL_IMAGE;
    //     //     conversation.image = getImageUrlThumb(FIREBASESTORAGE_BASE_URL_IMAGE, conversationWith);
    //     // } catch (err) {
    //     //     console.log(err);
    //     // }
    //     // console.log('completeConversation fine', conversation);
    //     return conversation;
    // }

    private completeConversation(conv): ConversationModel {
        // console.log('completeConversation', conv);
        // const LABEL_TU = this.translationMap.get('LABEL_TU');
        // conv.selected = false;
        // if (!conv.sender_fullname || conv.sender_fullname === 'undefined' || conv.sender_fullname.trim() === '') {
        //     conv.sender_fullname = conv.sender;
        // }
        // if (!conv.recipient_fullname || conv.recipient_fullname === 'undefined' || conv.recipient_fullname.trim() === '') {
        //     conv.recipient_fullname = conv.recipient;
        // }
        // let conversation_with_fullname = conv.sender_fullname;
        // let conversation_with = conv.sender;
        // if (conv.sender === this.loggedUserId) {
        //     conversation_with = conv.recipient;
        //     conversation_with_fullname = conv.recipient_fullname;
        //     conv.last_message_text = LABEL_TU + conv.last_message_text;
        // } else if (conv.channel_type === TYPE_GROUP) {
        //     conversation_with = conv.recipient;
        //     conversation_with_fullname = conv.recipient_fullname;
        //     conv.last_message_text = conv.last_message_text;
        // }
        // conv.conversation_with_fullname = conversation_with_fullname;

        // conv.status = this.setStatusConversation(conv.sender, conv.uid);
        // conv.time_last_message = this.getTimeLastMessage(conv.timestamp);
        // conv.avatar = avatarPlaceholder(conversation_with_fullname);
        // conv.color = getColorBck(conversation_with_fullname);
        // return conv;
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
        } else if (conv.channel_type === TYPE_GROUP) {
            conversation_with = conv.recipient;
            conversation_with_fullname = conv.recipient_fullname;
            conv.last_message_text = conv.last_message_text;
        }
        conv.conversation_with_fullname = conversation_with_fullname;
        conv.conversation_with = conversation_with;
        conv.status = this.setStatusConversation(conv.sender, conv.uid);
        conv.time_last_message = this.getTimeLastMessage(conv.timestamp);
        conv.avatar = avatarPlaceholder(conversation_with_fullname);
        conv.color = getColorBck(conversation_with_fullname);
        if (!conv.last_message_text) {
            conv.last_message_text = conv.text; // building conv with a message
        }
        return conv;
    }

    // /**
    //  *
    //  * @param uid
    //  */
    // private getImageUrlThumbFromFirebasestorage(uid: string) {
    //     const FIREBASESTORAGE_BASE_URL_IMAGE = this.appConfig.getConfig().FIREBASESTORAGE_BASE_URL_IMAGE;
    //     const urlStorageBucket = this.appConfig.getConfig().firebaseConfig.storageBucket + '/o/profiles%2F';
    //     const imageurl = FIREBASESTORAGE_BASE_URL_IMAGE + urlStorageBucket + uid + '%2Fthumb_photo.jpg?alt=media';
    //     return imageurl;
    // }

    /** */
    // set the remote conversation as read
    // setConversationRead(conversationUid) {
    //     var conversationRef = this.ref.ref.child(conversationUid);
    //     conversationRef.update ({"is_new" : false});
    // }

    /** */
    // getConversationByUid(conversationUid) {
    //     const index = searchIndexInArrayForUid(this.conversations, conversationUid);
    //     return this.conversations[index];
    // }

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

    // removeByUid(uid) {
    //     const index = searchIndexInArrayForUid(this.conversations, uid);
    //     if (index > -1) {
    //         this.conversations.splice(index, 1);
    //         // this.events.publish('conversationsChanged', this.conversations);
    //         this.conversationsChanged.next(this.conversations);
    //     }
    // }

    // addConversationListener(uidUser, conversationId) {
    //     var that = this;
    //     this.tenant = environment.tenant;
    //     // const tenant = this.chatManager.getTenant();
    //     const url = '/apps/' + this.tenant + '/users/' + uidUser + '/conversations/' + conversationId;
    //     const reference = firebase.database().ref(url);
    //     console.log("ChatConversationsHandler::addConversationListener::reference:",url, reference.toString());
    //     reference.on('value', function (snapshot) {
    //         setTimeout(function () {
    //             // that.events.publish(conversationId + '-listener', snapshot);
    //         }, 100);
    //     });
    // }

    /**
     * restituisce il numero di conversazioni nuove
     */
    countIsNew(): number {
        let num = 0;
        this.archivedConversations.forEach((element) => {
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
        console.log("uid is:", convToCheck.uid)
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
