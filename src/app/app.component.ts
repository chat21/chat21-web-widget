import { StarRatingWidgetService } from './components/star-rating-widget/star-rating-widget.service';
import { StarRatingWidgetComponent } from './components/star-rating-widget/star-rating-widget.component';
import { UserModel } from '../../src/chat21-core/models/user';

import { ElementRef, Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewEncapsulation } from '@angular/core';
// import * as moment from 'moment';
import * as moment from 'moment/moment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// https://www.davebennett.tech/subscribe-to-variable-change-in-angular-4-service/
import 'rxjs/add/operator/takeWhile';
import { Subscription } from 'rxjs/Subscription';

// services
import { Globals } from './utils/globals';


import { MessagingService } from './providers/messaging.service';
import { ContactService } from './providers/contact.service';
import { StorageService } from './providers/storage.service';
import { TranslatorService } from './providers/translator.service';
//import { ConversationsService } from './providers/conversations.service';
import { ChatPresenceHandlerService } from './providers/chat-presence-handler.service';
import { AgentAvailabilityService } from './providers/agent-availability.service';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/app';
import { environment } from '../environments/environment';

// utils
// setLanguage,
// getImageUrlThumb,
import { strip_tags, isPopupUrl, popupUrl, detectIfIsMobile, supports_html5_storage, getImageUrlThumb } from './utils/utils';
import { ConversationModel } from '../chat21-core/models/conversation';
import { AppConfigService } from './providers/app-config.service';


import { GlobalSettingsService } from './providers/global-settings.service';
import { SettingsSaverService } from './providers/settings-saver.service';
import { User } from '../models/User';
import { CustomTranslateService } from '../chat21-core/providers/custom-translate.service';
import { ConversationsHandlerService } from '../chat21-core/providers/abstract/conversations-handler.service';
import { ChatManager } from '../chat21-core/providers/chat-manager';
import { TypingService } from '../chat21-core/providers/abstract/typing.service';
import { AuthService2 } from '../chat21-core/providers/abstract/auth.service';
import { AuthService } from './providers/auth.service';
import { v4 as uuidv4 } from 'uuid';
import { FIREBASESTORAGE_BASE_URL_IMAGE, STORAGE_PREFIX, UID_SUPPORT_GROUP_MESSAGES } from './utils/constants';
import { ConversationHandlerBuilderService } from '../chat21-core/providers/abstract/conversation-handler-builder.service';
import { ConversationHandlerService } from '../chat21-core/providers/abstract/conversation-handler.service';
import { Triggerhandler } from '../chat21-core/utils/triggerHandler';
import { PresenceService } from '../chat21-core/providers/abstract/presence.service';
import { ArchivedConversationsHandlerService } from '../chat21-core/providers/abstract/archivedconversations-handler.service';
import { URL_SOUND } from '../chat21-core/utils/constants';
import { ImageRepoService } from '../chat21-core/providers/abstract/image-repo.service';
import { timeout } from 'rxjs/operator/timeout';
// import { TranslationLoader } from './translation-loader';

@Component({
    selector: 'tiledeskwidget-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None /* it allows to customize 'Powered By' */
    // providers: [AgentAvailabilityService, TranslatorService]
})

export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
    obsEndRenderMessage: any;
    stateLoggedUser;
    // ========= begin:: parametri di stato widget ======= //
    isInitialized = false;              /** if true show button */
    isOpenHome = true;                  /** check open/close component home ( sempre visibile xchè il primo dello stack ) */
    isOpenConversation = false;         /** check open/close component conversation if is true  */
    isOpenAllConversation = false;
    isOpenSelectionDepartment = false;  /** check open/close modal select department */
    // isOpenPrechatForm = false;          /** check open/close modal prechatform if g.preChatForm is true  */
    isOpenStartRating = false;          /** check open/close modal start rating chat if g.isStartRating is true  */
    // isWidgetActive: boolean;            /** var bindata sullo stato conv aperta/chiusa !!!! da rivedere*/
    // isModalLeaveChatActive = false;     /** ???? */
    departments = [];
    marginBottom: number;
    conversationSelected: ConversationModel;
    lastConversation: ConversationModel;
    // isBeingAuthenticated = false;           /** authentication is started */
    // ========= end:: parametri di stato widget ======= //


    // ========= begin:: dichiarazione funzioni ======= //
    detectIfIsMobile = detectIfIsMobile; /** utils: controllo se mi trovo su mobile */
    isPopupUrl = isPopupUrl;
    popupUrl = popupUrl;
    strip_tags = strip_tags;
    // ========= end:: dichiarazione funzioni ======= //


    // ========= begin:: sottoscrizioni ======= //
    subscriptions: Subscription[] = []; /** */
    // ========= end:: sottoscrizioni ======= //

    // ========= begin:: variabili del componente ======= //
    listConversations: Array<ConversationModel>;
    archivedConversations: Array<ConversationModel>;
    private audio: any;
    private setTimeoutSound: any;
    // ========= end:: variabili del componente ======== //

    // ========= begin:: DA SPOSTARE ======= //
    IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
    // private aliveSubLoggedUser = true; /** ????? */
    // THERE ARE TWO 'CARD CLOSE BUTTONS' THAT ARE DISPLAYED ON THE BASIS OF PLATFORM
    // isMobile: boolean;
    // ========= end:: DA SPOSTARE ========= //

    styleMapConversation: Map<string, string> = new Map();

    
    constructor(
        private el: ElementRef,
        private ngZone: NgZone,
        public g: Globals,
        public triggerHandler: Triggerhandler,
        public translatorService: TranslatorService,
        private translateService: CustomTranslateService,
        //public authService: AuthService,
        public authService2: AuthService2,
        //public messagingService: MessagingService,
        public contactService: ContactService,
        //public chatPresenceHandlerService: ChatPresenceHandlerService,
        public presenceService: PresenceService,
        private agentAvailabilityService: AgentAvailabilityService,
        private storageService: StorageService,
        public appConfigService: AppConfigService,
        public globalSettingsService: GlobalSettingsService,
        public settingsSaverService: SettingsSaverService,
        //public conversationsService: ConversationsService,
        public conversationsHandlerService: ConversationsHandlerService,
        public archivedConversationsService: ArchivedConversationsHandlerService,
        public conversationHandlerBuilderService: ConversationHandlerBuilderService,
        public chatManager: ChatManager,
        public typingService: TypingService,
        public imageRepoService: ImageRepoService
    ) {
        if (!appConfigService.getConfig().firebase || appConfigService.getConfig().firebase.apiKey === 'CHANGEIT') {
            throw new Error('firebase config is not defined. Please create your widget-config.json. See the Chat21-Web_widget Installation Page');
        }
       
        firebase.initializeApp(appConfigService.getConfig().firebase);  // here shows the error
        this.obsEndRenderMessage = new BehaviorSubject(null);
    }

    /** */
    ngOnInit() {
        this.g.wdLog(' ---------------- ngOnInit ---------------- ');
        this.initWidgetParamiters();
        
        
    }

    /** */
    ngAfterViewInit() {
        // this.triggerOnViewInit();
        this.ngZone.run(() => {
            const that = this;
            const subChangedConversation = this.conversationsHandlerService.conversationChanged.subscribe((conversation) => {
                // that.ngZone.run(() => {
                    if(conversation){
                        that.triggerOnConversationUpdated(conversation);
                    }else {
                        console.log('oBSconversationChanged null: errorrr')
                        return;
                    }
                    if ( that.g.isOpen === true ) {
                        that.g.setParameter('displayEyeCatcherCard', 'none');
                        
                        that.g.wdLog([' obsChangeConversation ::: ' + conversation]);
                        if (conversation.attributes && conversation.attributes['subtype'] === 'info') {
                            return;
                        }
                        if (conversation.is_new) {
                            this.soundMessage();
                        }
                        
                        
                    }else {
                        //widget closed
                        that.lastConversation = conversation;
                        this.g.isOpenNewMessage = true;

                        let badgeNewConverstionNumber = this.conversationsHandlerService.countIsNew()
                        this.g.setParameter('conversationsBadge', badgeNewConverstionNumber);
                        console.log('widgetclosed:::', this.g.conversationsBadge, this.conversationsHandlerService.countIsNew())
                    }
                // });
            });
            this.subscriptions.push(subChangedConversation);

            const subAddedConversation = this.conversationsHandlerService.conversationAdded.subscribe((conversation) => {
                // that.ngZone.run(() => {
                    if ( that.g.isOpen === true && conversation) {
                        that.g.setParameter('displayEyeCatcherCard', 'none');
                        that.triggerOnConversationUpdated(conversation);
                        that.g.wdLog([' obsAddedConversation ::: ' + conversation]);
                        if (conversation && conversation.attributes && conversation.attributes['subtype'] === 'info') {
                            return;
                        }
                        if (conversation.is_new) {
                            this.soundMessage();
                            
                        }
                        that.lastConversation = conversation;
                        this.g.isOpenNewMessage = true;
                    }else {
                        //widget closed

                        let badgeNewConverstionNumber = this.conversationsHandlerService.countIsNew()
                        this.g.setParameter('conversationsBadge', badgeNewConverstionNumber);
                        console.log('widgetclosed:::', this.g.conversationsBadge, this.conversationsHandlerService.countIsNew())
                    }
                // });
            });
            //this.authService.initialize();
            this.subscriptions.push(subAddedConversation);
              
            const subArchivedConversations = this.archivedConversationsService.archivedConversationAdded.subscribe((conversation) => {
                // that.ngZone.run(() => {
                if(conversation){
                    that.triggerOnConversationUpdated(conversation);
                }
                // });
            });
            this.subscriptions.push(subArchivedConversations);

        });
        // this.authService.initialize()
        this.authService2.initialize(this.setStoragePrefix());
        this.chatManager.initialize();
        this.typingService.initialize();
        this.presenceService.initialize();
    }

    setStoragePrefix(): string{
        let prefix = STORAGE_PREFIX;
        try {
            const sv = 'sv' + environment.shemaVersion + '_';
            prefix = prefix + sv;
        } catch (e) {
            this.g.wdLog(['> Error :' + e]);
        }
        return prefix + this.g.projectid + '_';
    }

    // ========= begin:: SUBSCRIPTIONS ============//
    /** login subscription
    * GET CURRENT USER
    * recupero il current user se esiste
    * https://forum.ionicframework.com/t/firebase-auth-currentuser-shows-me-null-but-it-logged-in/68411/4
    */
    setAuthSubscription() {
        this.g.wdLog(['setLoginSubscription : ']);
        const that = this;
        /**
         * SUBSCRIBE TO ASYNC LOGIN FUNCTION
         * RESP
         * -2: ho fatto il reinit
         * -1: ho fatto il logout
         * 0: non sono loggato
         * 200: sono loggato
         * 400: errore nel login
         * 410: errore login (firebase)
         */
        // const obsLoggedUser = this.authService.obsLoggedUser.subscribe((resp) => {
        //     this.g.wdLog(['obsLoggedUser ------------> ', resp]);
        //     // if autostart == false don't autenticate!
        //     // after called signInWithCustomToken need set autostart == true
        //     // this.ngZone.run(() => {
        //         // const tiledeskTokenTEMP = that.storageService.getItemWithoutProjectId('tiledeskToken');

        //         const tiledeskTokenTEMP = that.storageService.getItem('tiledeskToken');
        //         if (tiledeskTokenTEMP && tiledeskTokenTEMP !== undefined) {
        //             that.g.tiledeskToken = tiledeskTokenTEMP;
        //         }
        //         const firebaseTokenTEMP = that.storageService.getItemWithoutProjectId('firebaseToken');
        //         if (firebaseTokenTEMP && firebaseTokenTEMP !== undefined) {
        //             that.g.firebaseToken = firebaseTokenTEMP;
        //         }
        //         const autoStart = this.g.autoStart;
        //         that.g.wdLog(['tiledeskToken ------------> ', that.g.tiledeskToken]);
        //         if (resp === -2) {
        //             that.stateLoggedUser = resp;
        //             /** ho fatto un reinit */
        //             that.g.wdLog(['sono nel caso reinit -2']);
        //             that.g.setParameter('isLogged', false);
        //             that.hideAllWidget();
        //             // that.g.setParameter('isShown', false, true);
        //             that.storageService.removeItem('tiledeskToken');
        //             that.g.isLogout = true;
        //             // that.triggerOnAuthStateChanged(resp);
        //             if (autoStart !== false) {
        //                 that.setAuthentication();
        //                 that.initAll();
        //             }
        //         } else if (resp === -1) {
        //             that.stateLoggedUser = resp;
        //             /** ho effettuato il logout: nascondo il widget */
        //             that.g.wdLog(['sono nel caso logout -1']);
        //             // that.g.wdLog(['obsLoggedUser', obsLoggedUser);
        //             // that.g.wdLog(['this.subscriptions', that.subscriptions);
        //             that.g.setParameter('isLogged', false);
        //             that.hideAllWidget();
        //             // that.g.setParameter('isShown', false, true);
        //             that.storageService.removeItem('tiledeskToken');
        //             that.g.isLogout = true;
        //             that.triggerOnAuthStateChanged(that.stateLoggedUser);
        //         } else if (resp === 0) {
        //             that.stateLoggedUser = resp;
        //             /** non sono loggato */
        //             that.g.wdLog(['sono nel caso in cui non sono loggato 0']);
        //             that.g.wdLog(['NO CURRENT USER AUTENTICATE: ']);
        //             that.g.setParameter('isLogged', false);
        //             that.hideAllWidget();
        //             // that.g.setParameter('isShown', false, true);
        //             that.triggerOnAuthStateChanged(that.stateLoggedUser);
        //             if (autoStart !== false) {
        //                 that.setAuthentication();
        //             }
        //         } else if (resp === 200) {
        //             if (that.stateLoggedUser === 0) {
        //                 that.stateLoggedUser = 201;
        //             } else {
        //                 that.stateLoggedUser = resp;
        //             }
        //             /** sono loggato */
        //             const user = that.authService.getCurrentUser();
        //             that.g.wdLog(['sono nel caso in cui sono loggato']);
        //             that.g.wdLog([' anonymousAuthenticationInNewProject']);
        //             // that.authService.resigninAnonymousAuthentication();
        //             // confronto id utente tiledesk con id utente di firebase
        //             // senderid deve essere == id di firebase
        //             that.g.setParameter('senderId', user.uid);
        //             that.g.setParameter('isLogged', true);
        //             that.g.setParameter('attributes', that.setAttributesFromStorageService());
        //             /* faccio scattare il trigger del login solo una volta */
        //             // if (that.isBeingAuthenticated) {
        //             //     that.triggerOnLoggedIn();
        //             //     that.isBeingAuthenticated = false;
        //             // }
        //             that.triggerOnAuthStateChanged(that.stateLoggedUser);
        //             that.startUI();
        //             that.g.wdLog([' 1 - IMPOSTO STATO CONNESSO UTENTE ', autoStart]);
        //             that.presenceService.setPresence(user.uid);
        //             if (autoStart !== false) {
        //                 that.showAllWidget();
        //                 // that.g.setParameter('isShown', true, true);
        //             }
        //         } else if (resp >= 400) {
        //             that.g.wdLog([' ERRORE LOGIN ']);
        //             // that.storageService.removeItem('tiledeskToken');
        //             return;
        //         } else {
        //             that.g.wdLog([' INIT obsLoggedUser']);
        //             return;
        //         }   
        //         // that.triggerOnAuthStateChanged();
        //     // });
        //     this.initConversationsHandler(environment.tenant, that.g.senderId)
        // });
        // // that.g.wdLog(['onAuthStateChanged ------------> ']);
        // this.subscriptions.push(obsLoggedUser);
        // // this.authService.onAuthStateChanged();

        const subAuthStateChanged = this.authService2.BSAuthStateChanged.subscribe(state => {

            //const tiledeskTokenTEMP = that.storageService.getItem('tiledeskToken');
            const tiledeskTokenTEMP = localStorage.getItem(this.setStoragePrefix() + 'tiledeskToken')
            //const tiledeskTokenTEMP = this.authService2.getTiledeskToken();
            if (tiledeskTokenTEMP && tiledeskTokenTEMP !== undefined) {
                that.g.tiledeskToken = tiledeskTokenTEMP;
            }
            
            const firebaseTokenTEMP = this.authService2.getToken();
            if (firebaseTokenTEMP && firebaseTokenTEMP !== undefined) {
                that.g.firebaseToken = firebaseTokenTEMP;
            }

            const autoStart = this.g.autoStart;
            that.stateLoggedUser = state;
            if(state && state === 'online'){
                 /** sono loggato */
                const user = that.authService2.getCurrentUser();
                that.g.wdLog(['sono nel caso in cui sono loggato', user]);
                that.g.wdLog([' anonymousAuthenticationInNewProject']);
                // that.authService.resigninAnonymousAuthentication();
                // confronto id utente tiledesk con id utente di firebase
                // senderid deve essere == id di firebase
                
                // const fullName = user.firstname + ' ' + user.lastname;
                that.g.setParameter('senderId', user.uid);
                // this.g.setParameter('userFullname', fullName);
                // this.g.setAttributeParameter('userFullname', fullName);
                // this.g.setParameter('userEmail', user.email);
                // this.g.setAttributeParameter('userEmail', user.email);
                that.g.setParameter('isLogged', true);
                that.g.setParameter('attributes', that.setAttributesFromStorageService());
                /* faccio scattare il trigger del login solo una volta */
                // if (that.isBeingAuthenticated) {
                //     that.triggerOnLoggedIn();
                //     that.isBeingAuthenticated = false;
                // }
                that.triggerOnAuthStateChanged(that.stateLoggedUser);
                that.startUI();
                that.g.wdLog([' 1 - IMPOSTO STATO CONNESSO UTENTE ', autoStart]);
                that.presenceService.setPresence(user.uid);
                this.initConversationsHandler(environment.tenant, that.g.senderId);
                
                if (autoStart !== false) {
                    that.showWidget();
                    // that.g.setParameter('isShown', true, true);
                }

            }else if( state && state === 'offline'){
                /** non sono loggato */
                that.g.wdLog(['sono nel caso in cui non sono loggato 0']);
                that.g.wdLog(['NO CURRENT USER AUTENTICATE: ']);
                that.g.setParameter('isLogged', false);
                that.hideWidget();
                // that.g.setParameter('isShown', false, true);
                that.triggerOnAuthStateChanged(that.stateLoggedUser);
                if (autoStart !== false) {
                    that.authenticate();
                }
            }
            

        });
        this.subscriptions.push(subAuthStateChanged);

        

        const subUserLogOut = this.authService2.BSSignOut.subscribe((state) => {
            // that.ngZone.run(() => {
            if(state === true){ //state = true -> user has logged out
                /** ho effettuato il logout: nascondo il widget */
                that.g.wdLog(['sono nel caso logout -1']);
                // that.g.wdLog(['obsLoggedUser', obsLoggedUser);
                // that.g.wdLog(['this.subscriptions', that.subscriptions);
                that.g.setParameter('isLogged', false);
                that.hideWidget();
                // that.g.setParameter('isShown', false, true);
                // that.storageService.removeItem('tiledeskToken'); //-> non c'è bisogno perchè lo fa il service
                that.g.isLogout = true;
                that.triggerOnAuthStateChanged(state);
            }
            // });
        });
        this.subscriptions.push(subUserLogOut);
    }
    // ========= end:: SUBSCRIPTIONS ============//


    private initWidgetParamiters() {
        // that.g.wdLog(['---------------- initWidgetParamiters ---------------- ');
        const that = this;
       // ------------------------------- //
       /**
        * SET WIDGET PARAMETERS
        * when globals is setting (loaded paramiters from server):
        * 1 - init widget
        * 2 - setLoginSubscription
       */
       const obsSettingsService = this.globalSettingsService.obsSettingsService.subscribe((resp) => {
            this.ngZone.run(() => {
                if (resp) {
                    // that.g.wdLog(['obsSettingsService');
                    // that.g.wdLog(['---------------- obsSettingsService ---------------- ');
                    // ------------------------------- //
                    // /** INIT  */
                    // that.initAll();
                    // aggiungo nel local storage e mi autentico
                    // this.g.wdLog(['controllo se è stato passato un token: ', this.g.customToken]);
                    // if (this.g.customToken) {
                    //   // mi loggo con custom token passato nell'url
                    //   this.g.wdLog([' ----------------  mi loggo con custom token passato nell url  ---------------- ']);
                    //   this.storageService.setItem('tiledeskToken', this.g.customToken)
                    //   this.g.tiledeskToken = this.g.customToken;
                    // }
                    this.translatorService.initI18n().then((result) => {
                        this.g.wdLog(['»»»» APP-COMPONENT.TS initI18n result', result]);
                        this.translatorService.translate(this.g);
                    }).then(()=> {
                        /** INIT  */
                        that.initAll();
                        /** AUTH */
                        that.setAuthSubscription();
                    })
                    // /** AUTH */
                    // that.setLoginSubscription();
                }
            });
        });
        this.subscriptions.push(obsSettingsService);
        this.globalSettingsService.initWidgetParamiters(this.g, this.el);
        
        // SET AUDIO
        this.audio = new Audio();
        this.audio.src = URL_SOUND;
        this.audio.load();
       // ------------------------------- //
    }
    /**
     * INITIALIZE:
     * 1 - set traslations
     * 2 - set attributes
     * 4 - triggerLoadParamsEvent
     * 4 - subscription to runtime changes in globals
     * add Component to Window
     * 4 - trigget Load Params Event
     * 5 - set Is Widget Open Or Active
     * 6 - get MongDb Departments
     * 7 - set isInitialized and enable principal button
     */
    private initAll() {
        // that.g.wdLog(['---------------- initAll ---------------- ');
        this.addComponentToWindow(this.ngZone);

        //INIT TRIGGER-HANDLER
        this.triggerHandler.setElement(this.el)
        this.triggerHandler.setWindowContext(this.g.windowContext)

        // /** TRANSLATION LOADER: */
        // //  this.translatorService.translate(this.g);
        // this.translatorService.initI18n().then((result) => {
        //     this.g.wdLog(['»»»» APP-COMPONENT.TS initI18n result', result]);
        //     this.translatorService.translate(this.g);
        // });

        /** SET ATTRIBUTES */
        const attributes = this.setAttributesFromStorageService();
        if (attributes) {
            this.g.attributes = attributes;
        }
        this.setStyleMap()

        /**
         * SUBSCRIPTION :
         * Subscription to runtime changes in globals
         * and save changes in localstorage
        */
        this.settingsSaverService.initialize();
        // ------------------------------- //

        // ------------------------------- //
        /**
         * INIZIALIZE GLOBALS :
         * create settings object used in trigger
         * set isMobile
         * set attributes
        */
        this.g.initialize();
        // ------------------------------- //

        this.g.wdLog([' ---------------- A1 ---------------- ']);
        this.removeFirebasewebsocketFromLocalStorage();
        // this.triggerLoadParamsEvent();
        // this.addComponentToWindow(this.ngZone); // forse dovrebbe stare prima di tutti i triggers

        this.initLauncherButton();
        this.triggerLoadParamsEvent(); // first trigger 
        //this.setAvailableAgentsStatus();

        
    }

    /** initLauncherButton
     * posiziono e visualizzo il launcher button
    */
    initLauncherButton() {
        this.isInitialized = true;
        this.marginBottom = +this.g.marginY + 70;
    }

    initConversationsHandler(tenant: string, senderId: string){
        this.g.wdLog(['initialize: ListConversationsComponent']);
        const keys = [ 'YOU' ];
        const translationMap = this.translateService.translateLanguage(keys);
        this.listConversations = [];
        this.archivedConversations = [];
        //this.availableAgents = this.g.availableAgents.slice(0, 5);

        this.g.wdLog(['senderId: ', senderId]);
        this.g.wdLog(['tenant: ', tenant]);

        // 1 - init chatConversationsHandler and  archviedConversationsHandler
        this.conversationsHandlerService.initialize(tenant,senderId, translationMap)
        this.archivedConversationsService.initialize(tenant, senderId, translationMap)
        // 2 - get conversations from storage
        // this.chatConversationsHandler.getConversationsFromStorage();
        // 5 - connect conversationHandler and archviedConversationsHandler to firebase event (add, change, remove)
        this.conversationsHandlerService.connect();
        this.archivedConversationsService.connect();
        this.listConversations = this.conversationsHandlerService.conversations;
        this.archivedConversations = this.archivedConversationsService.archivedConversations;
        // 6 - save conversationHandler in chatManager
        this.chatManager.setConversationsHandler(this.conversationsHandlerService);
        this.chatManager.setArchivedConversationsHandler(this.archivedConversationsService);

        this.g.wdLog(['this.listConversations.length', this.listConversations.length]);
        this.g.wdLog(['this.listConversations appcomponent', this.listConversations, this.archivedConversations]);
        
    }

    /** initChatSupportMode
     * se è una chat supportMode:
     * carico i dipartimenti
     * carico gli agenti disponibili
     */
    // initChatSupportMode() {
    //     this.g.wdLog([' ---------------- B1: supportMode ---------------- ', this.g.supportMode]);
    //     if (this.g.supportMode) {
    //         // this.getMongDbDepartments();
    //         // this.setAvailableAgentsStatus();
    //     }
    // }

    /**
     *
     */
    removeFirebasewebsocketFromLocalStorage() {
        this.g.wdLog([' ---------------- A1 ---------------- ']);
        // Related to https://github.com/firebase/angularfire/issues/970
        if (supports_html5_storage()) {
            localStorage.removeItem('firebase:previous_websocket_failure');
        }
    }

    /** setAttributesFromStorageService
     *
    */
    private setAttributesFromStorageService(): any {
        const CLIENT_BROWSER = navigator.userAgent;
        const projectid = this.g.projectid;
        const userEmail = this.g.userEmail;
        const userFullname = this.g.userFullname;
        const senderId = this.g.senderId;
        let attributes: any = {};
        try {
            attributes = JSON.parse(this.storageService.getItem('attributes'));
            // this.g.wdLog(['> attributes: ', attributes]);
        } catch (error) {
            this.g.wdLog(['> Error :' + error]);
        }
        if (!attributes && attributes === null ) {
            if ( this.g.attributes ) {
                attributes = this.g.attributes;
            } else {
                attributes = {};
            }
        }
        // that.g.wdLog(['attributes: ', attributes);
        // that.g.wdLog(['CLIENT_BROWSER: ', CLIENT_BROWSER);
        if (CLIENT_BROWSER) {
            attributes['client'] = CLIENT_BROWSER;
        }
        if (location.href) {
            attributes['sourcePage'] = location.href;
        }
        if (projectid) {
            attributes['projectId'] = projectid;
        }
        if (userEmail) {
            attributes['userEmail'] = userEmail;
        }
        if (userFullname) {
            attributes['userFullname'] = userFullname;
        }
        if (senderId) {
            attributes['requester_id'] = senderId;
        }
        try {
            // attributes['payload'] = this.g.customAttributes.payload;
            attributes['payload'] = this.g.customAttributes;
        } catch (error) {
            this.g.wdLog(['> Error is handled payload: ', error]);
        }

        this.storageService.setItem('attributes', JSON.stringify(attributes));
        // this.g.wdLog([' ---------------- setAttributes ---------------- ', attributes]);
        // that.g.wdLog([' ---------------- setAttributes ---------------- ', attributes);
        return attributes;
    }

    /** setAvailableAgentsStatus
     * mi sottoscrivo al nodo /projects/' + projectId + '/users/availables
     * per verificare se c'è un agent disponibile
     */
    // private setAvailableAgentsStatus() {
    //     const that = this;
    //     const projectid = this.g.projectid;
    //     this.g.wdLog(['projectId->', projectid]);
    //     this.agentAvailabilityService.getAvailableAgents(projectid).subscribe( (availableAgents) => {
    //         that.g.wdLog(['availableAgents->', availableAgents]);
    //         if (availableAgents.length <= 0) {
    //             that.g.setParameter('areAgentsAvailable', false);
    //             that.g.setParameter('areAgentsAvailableText', that.g.AGENT_NOT_AVAILABLE);
    //             that.g.setParameter('availableAgents', null);
    //             that.storageService.removeItem('availableAgents');
    //         } else {
    //             that.g.setParameter('areAgentsAvailable', true);
    //             that.g.setParameter('areAgentsAvailableText', that.g.AGENT_AVAILABLE);
    //             that.g.setParameter('availableAgents', availableAgents);
    //             availableAgents.forEach(element => {
    //                 element.imageurl = getImageUrlThumb(element.id);
    //             });
    //             // that.addFirstMessage(that.g.LABEL_FIRST_MSG);
    //         }
    //         that.g.setParameter('availableAgentsStatus', true);
    //     }, (error) => {
    //         console.error('setOnlineStatus::setAvailableAgentsStatus', error);
    //     }, () => {
    //     });
    // }

    // ========= begin:: DEPARTEMENTS ============//
    /** GET DEPARTEMENTS
     * recupero elenco dipartimenti
     * - mi sottoscrivo al servizio
     * - se c'è un solo dipartimento la setto di default
     * - altrimenti visualizzo la schermata di selezione del dipartimento
    */
    // getMongDbDepartments() {
    //     const that = this;
    //     const projectid = this.g.projectid;
    //     this.g.wdLog(['getMongDbDepartments ::::', projectid]);
    //     this.messagingService.getMongDbDepartments(projectid)
    //     .subscribe(response => {
    //         that.g.wdLog(['response DEP ::::', response]);
    //         that.g.setParameter('departments', response);
    //         that.initDepartments();
    //     },
    //     errMsg => {
    //          this.g.wdLog(['http ERROR MESSAGE', errMsg]);
    //     },
    //     () => {
    //          this.g.wdLog(['API ERROR NESSUNO']);
    //     });
    // }

    /**
     * INIT DEPARTMENT:
     * get departments list
     * set department default
     * CALL AUTHENTICATION
    */
    // initDepartments() {
    //     const departments = this.g.departments;
    //     this.g.setParameter('departmentSelected', null);
    //     this.g.setParameter('departmentDefault', null);
    //     this.g.wdLog(['SET DEPARTMENT DEFAULT ::::', departments[0]]);
    //     this.setDepartment(departments[0]);
    //     let i = 0;
    //     departments.forEach(department => {
    //         if (department['default'] === true) {
    //             this.g.setParameter('departmentDefault', department);
    //             departments.splice(i, 1);
    //             return;
    //         }
    //         i++;
    //     });
    //     if (departments.length === 1) {
    //         // UN SOLO DEPARTMENT
    //         this.g.wdLog(['DEPARTMENT FIRST ::::', departments[0]]);
    //         this.setDepartment(departments[0]);
    //         // return false;
    //     } else if (departments.length > 1) {
    //         // CI SONO + DI 2 DIPARTIMENTI
    //         this.g.wdLog(['CI SONO + DI 2 DIPARTIMENTI ::::', departments[0]]);
    //     } else {
    //         // DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI !!!!
    //         this.g.wdLog(['DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI ::::', departments[0]]);
    //     }
    // }

    /**
     * SET DEPARTMENT:
     * set department selected
     * save department selected in attributes
     * save attributes in this.storageService
    */
    // setDepartment(department) {
    //     this.g.setParameter('departmentSelected', department);
    //     const attributes = this.g.attributes;
    //     if (department && attributes) {
    //         attributes.departmentId = department._id;
    //         attributes.departmentName = department.name;
    //         this.g.setParameter('attributes', attributes);
    //         this.g.setParameter('departmentSelected', department);
    //         this.g.wdLog(['setAttributes setDepartment: ', JSON.stringify(attributes)]);
    //         this.storageService.setItem('attributes', JSON.stringify(attributes));
    //     }
    // }
    // ========= end:: GET DEPARTEMENTS ============//


    // ========= begin:: AUTHENTICATION ============//
    /**
     * SET AUTHENTICATION:
     * authenticate in chat
     */
    private authenticate() {
        // that.g.wdLog(['---------------- setAuthentication ----------------');
        // this.g.wdLog([' ---------------- setAuthentication ---------------- ']);
        /**
         * 0 - controllo se è stato passato email e psw -> UNUSED
         *  SI - mi autentico con email e psw
         * 1 - controllo se è stato passato userId -> UNUSED
         *  SI - vado avanti senza autenticazione
         * 2 - controllo se esiste un token -> UNUSED
         *  SI - sono già autenticato
         * 3 - controllo se esiste currentUser
         *  SI - sono già autenticato
         *  NO - mi autentico
         *  4 - controllo se esiste currentUser
         */
        // this.userEmail = 'czone555@gmail.com';
        // this.userPassword = '123456';
        // this.userId = 'LmBT2IKjMzeZ3wqyU8up8KIRB6J3';
        // tslint:disable-next-line:max-line-length
        // this.g.userToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdhMWViNTE2YWU0MTY4NTdiM2YwNzRlZDQxODkyZTY0M2MwMGYyZTUifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2hhdC12Mi1kZXYiLCJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImF1ZCI6ImNoYXQtdjItZGV2IiwiYXV0aF90aW1lIjoxNTM5OTQ4MDczLCJ1c2VyX2lkIjoid0RScm54SG0xQ01MMVhJd29MbzJqdm9lc040MiIsInN1YiI6IndEUnJueEhtMUNNTDFYSXdvTG8yanZvZXNONDIiLCJpYXQiOjE1Mzk5NDgwNzMsImV4cCI6MTUzOTk1MTY3MywiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJhbm9ueW1vdXMifX0.gNtsfv1b5LFxxqwnmJI4jnGFq7760Eu_rR2Neargs6Q3tcNge1oTf7CPjd9pJxrOAeErEX6Un_E7tjIGqKidASZH7RJwKzfWT3-GZdr7j-LR6FgBVl8FgufDGo0DcVhw9Zajik0vuFM9b2PULmSAeDeNMLAhsvPOWPJMFMGIrewTk7Im-6ncm75QH241O4KyGKPWsC5slN9lckQP4j432xVUj1ss0TYVqBpkDP9zzgekuLIvL-qFpuqGI0yLjb-SzPev2eTO-xO48wlYK_s_GYOZRwWi4SZvSA8Sw54X7HUyDvw5iXLboEJEFMU6gJJWR6YPQMa69cjQlFS8mjPG6w";

        const userEmail = this.g.userEmail;
        const userPassword = this.g.userPassword;
        // this.isBeingAuthenticated = true;
        const tiledeskToken = this.g.tiledeskToken;
        if (userEmail && userPassword) { //TODO:GAB deprecato ma in fase di eliminazione
             this.g.wdLog([' ---------------- 10 ---------------- ']);
            // se esistono email e psw faccio un'autenticazione firebase con email
            this.authService2.signInWithEmailAndPassword(userEmail, userPassword)
            // this.authService.authenticateFirebaseWithEmailAndPassword(userEmail, userPassword);
        // } else if (userId) {
        //     // SE PASSO LO USERID NON EFFETTUO NESSUNA AUTENTICAZIONE
        //     this.g.wdLog([' ---------------- 11 ---------------- ']);
        //     this.g.wdLog(['this.userId:: ', userId]);
        //     this.g.senderId = userId;
        //     this.g.setParameter('senderId', userId);
        //     this.g.setParameter('isLogged', true);
        //     this.g.setParameter('attributes', this.setAttributesFromStorageService());
        //     // this.startNwConversation();
        //     this.startUI();
        //     this.g.wdLog([' 11 - IMPOSTO STATO CONNESSO UTENTE ']);
        //     // this.chatPresenceHandlerService.setupMyPresence(userId);
        // } else if (userToken) {
        //     // SE PASSO IL TOKEN NON EFFETTUO NESSUNA AUTENTICAZIONE
        //     // !!! DA TESTARE NON FUNZIONA !!! //
        //     this.g.wdLog([' ---------------- 12 ---------------- ']);
        //     this.g.wdLog(['this.g.userToken:: ', userToken]);
        //     //this.authService.authenticateFirebaseCustomToken(userToken);
         } else if (this.authService2.getCurrentUser() && tiledeskToken) {
        //     //  SONO GIA' AUTENTICATO
               this.g.wdLog([' ---------------- 13 ---------------- ']);
               this.g.wdLog([' ----------- sono già loggato ------- ']);
            // const currentUser = this.authService2.getCurrentUser();
        //     this.g.senderId = currentUser.uid;
        //     this.g.setParameter('senderId', currentUser.uid);

            // const fullName = currentUser.firstname + ' ' + currentUser.lastname;
            // this.g.setParameter('userFullname', fullName);
            // this.g.setAttributeParameter('userFullname', fullName);
            // this.g.setParameter('userEmail', currentUser.email);
            // this.g.setAttributeParameter('userEmail', currentUser.email);

        //     // if(currentUser.firstname || currentUser.lastname){
        //     //     this.g.wdLog([' ---------------- 13 fullname ---------------- ']);
        //     //     const fullName = currentUser.firstname + ' ' + currentUser.lastname;
        //     //     this.g.setParameter('userFullname', fullName);
        //     //     this.g.setAttributeParameter('userFullname', fullName);
        //     // }
        //     // if(currentUser.email){
        //     //     this.g.wdLog([' ---------------- 13 email ---------------- ']);
        //     //     this.g.setParameter('userEmail', currentUser.email);
        //     //     this.g.setAttributeParameter('userEmail', currentUser.email);
        //     // }

        //     // this.g.setParameter('isLogged', true);
        //     // this.g.setParameter('attributes', this.setAttributesFromStorageService());
        //     // this.startNwConversation();
        //     //this.startUI();
        //     // this.g.wdLog([' 13 - IMPOSTO STATO CONNESSO UTENTE ']);
        //     // this.presenceService.setPresence(currentUser.uid);
        // 
        } else {
            //  AUTENTICAZIONE ANONIMA
            this.g.wdLog([' ---------------- 14 ---------------- ']);
            this.g.wdLog([' authenticateFirebaseAnonymously']);
            this.authService2.signInAnonymously(this.g.projectid);
            // this.authService.anonymousAuthentication();
            // this.g.wdLog([' authenticateFirebaseAnonymously']);
            // this.authService.authenticateFirebaseAnonymously();
        }
    }
    // ========= end:: AUTHENTICATION ============//


    // ========= begin:: START UI ============//
    /**
     * set opening priority widget
     */
    private startUI() {
        this.g.wdLog([' ============ startUI ===============']);
        const departments = this.g.departments;
        const attributes = this.g.attributes;
        const preChatForm = this.g.preChatForm;
        this.isOpenHome = true;
        this.isOpenConversation = false;
        this.g.setParameter('isOpenPrechatForm', false);
        this.isOpenSelectionDepartment = false;
        this.isOpenAllConversation = false;
        const conversationActive: ConversationModel = JSON.parse(this.storageService.getItem('activeConversation'));
        this.g.wdLog([' ============ idConversation ===============', conversationActive ]);
        // this.g.recipientId = null;
        if (conversationActive) { //
            // console.log('77777');
            if(this.g.isOpen){
                this.isOpenConversation = true;
            }
            this.g.recipientId = conversationActive.recipient;
            this.conversationSelected = conversationActive;
            this.g.setParameter('recipientId', conversationActive.recipient);
            // this.returnSelectedConversation(conversationActive);
        } else if (this.g.startFromHome) {
            // console.log('66666');
            this.isOpenConversation = false;
            this.g.setParameter('isOpenPrechatForm', false);
            this.isOpenSelectionDepartment = false;
        } else if (preChatForm && (!attributes || !attributes.userFullname || !attributes.userEmail)) {
            // console.log('55555');
            this.g.setParameter('isOpenPrechatForm', true);
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;
            if (departments.length > 1 && this.g.departmentID == null) {
                // console.log('44444');
                this.isOpenSelectionDepartment = true;
            }
        } else {
            // console.log('33333');
            this.g.setParameter('isOpenPrechatForm', false);
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;

            
            if (departments.length > 1 && !this.g.departmentID == null) {
                // console.log('22222');
                this.isOpenSelectionDepartment = true;
            } else {
                // console.log('11111', this.g.isOpen, this.g.recipientId);
                this.isOpenConversation = false;
                if (!this.g.recipientId && this.g.isOpen) {
                    // this.startNwConversation();
                    this.openNewConversation();
                }
            }
        }

        // visualizzo l'iframe!!!
        this.triggerOnViewInit();
        
        // mostro il widget
        // setTimeout(() => {
        //     const divWidgetContainer = this.g.windowContext.document.getElementById('tiledesk-container');
        //     if (divWidgetContainer) {
        //         divWidgetContainer.style.display = 'block';
        //     }
        // }, 500);
    }
    // ========= end:: START UI ============//


    private openNewConversation() {
        this.g.wdLog(['openNewConversation in APP COMPONENT']);
        this.g.newConversationStart = true;
       // controllo i dipartimenti se sono 1 o 2 seleziono dipartimento e nascondo modale dipartimento
       // altrimenti mostro modale dipartimenti
       const preChatForm = this.g.preChatForm;
       const attributes = this.g.attributes;
       const departments = this.g.departments;

       // that.g.wdLog(['departments: ', departments, departments.length);
       if (preChatForm && (!attributes || !attributes.userFullname || !attributes.userEmail)) {
           // if (preChatForm && (!attributes.userFullname || !attributes.userEmail)) {
           this.isOpenConversation = false;
           this.g.setParameter('isOpenPrechatForm', true);
           // this.settingsSaverService.setVariable('isOpenPrechatForm', true);
           this.isOpenSelectionDepartment = false;
           if (departments && departments.length > 1 && this.g.departmentID == null) {
               this.isOpenSelectionDepartment = true;
           }
       } else {
           // this.g.isOpenPrechatForm = false;
           this.g.setParameter('isOpenPrechatForm', false);
           // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
           this.isOpenConversation = false;
           this.isOpenSelectionDepartment = false;
           if (departments && departments.length > 1 && this.g.departmentID == null) {
               this.isOpenSelectionDepartment = true;
           } else {
               this.isOpenConversation = true;
           }
       }

       this.g.wdLog(['isOpenPrechatForm', this.g.isOpenPrechatForm, ' isOpenSelectionDepartment:', this.isOpenSelectionDepartment]);
       if (this.g.isOpenPrechatForm === false && this.isOpenSelectionDepartment === false) {
           this.startNwConversation();
       }
   }

    // ========= begin:: COMPONENT TO WINDOW ============//
    /**
     * http://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
     */
    private addComponentToWindow(ngZone) {
        const that = this;
        const windowContext = this.g.windowContext;
        if (windowContext['tiledesk']) {
            windowContext['tiledesk']['angularcomponent'] = { component: this, ngZone: ngZone };
           /** */
            windowContext['tiledesk'].setUserInfo = function (userInfo) {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.setUserInfo(userInfo);
                });
            };
            /** loggin with token */
            windowContext['tiledesk'].signInWithCustomToken = function (response) {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.signInWithCustomToken(response);
                });
            };
            /** loggin anonymous */
            windowContext['tiledesk'].signInAnonymous = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.signInAnonymous();
                });
            };
            // window['tiledesk'].on = function (event_name, handler) {
            //      this.g.wdLog(["addEventListener for "+ event_name);
            //     this.el.nativeElement.addEventListener(event_name, e =>  handler());
            // };
            /** show all widget */
            windowContext['tiledesk'].show = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.showAllWidget();
                });
            };
            /** hidden all widget */
            windowContext['tiledesk'].hide = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.hideAllWidget();
                });
            };
            /** close window chat */
            windowContext['tiledesk'].close = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.f21_close();
                });
            };
            /** open window chat */
            windowContext['tiledesk'].open = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.f21_open();
                });
            };
            /** set state PreChatForm close/open */
            windowContext['tiledesk'].setPreChatForm = function (state) {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.setPreChatForm(state);
                });
            };
            windowContext['tiledesk'].setPrivacyPolicy = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.setPrivacyPolicy();
                });
            };

            /** send first message */
            windowContext['tiledesk'].sendMessage = function (
                    tenant,
                    senderId,
                    senderFullname,
                    message,
                    type,
                    metadata,
                    recipientId,
                    recipientFullname,
                    additional_attributes,
                    projectid,
                    channel_type
                ) {
                const _globals = windowContext['tiledesk'].angularcomponent.component.g;

                if (!tenant) {
                    tenant = _globals.tenant;
                }
                if (!senderId) {
                    senderId = _globals.senderId;
                }
                if (!senderFullname) {
                    senderFullname = _globals.senderFullname;
                }
                if (!message) {
                    message = 'hello';
                }
                if (!type) {
                    type = 'text';
                }
                if (!metadata) {
                    metadata = '';
                }
                if (!recipientId) {
                    recipientId = _globals.recipientId;
                }
                if (!recipientFullname) {
                    recipientFullname = _globals.recipientFullname;
                }
                if (!projectid) {
                    projectid = _globals.projectId;
                }
                if (!channel_type || channel_type === undefined) {
                    channel_type = 'group';
                }
                // set default attributes
                const g_attributes = _globals.attributes;
                const attributes = <any>{};
                if (g_attributes) {
                    for (const [key, value] of Object.entries(g_attributes)) {
                    attributes[key] = value;
                    }
                }
                if (additional_attributes) {
                    for (const [key, value] of Object.entries(additional_attributes)) {
                        attributes[key] = value;
                    }
                }
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component
                    .sendMessage(
                        tenant,
                        senderId,
                        senderFullname,
                        message,
                        type,
                        metadata,
                        recipientId,
                        recipientFullname,
                        attributes,
                        projectid,
                        channel_type
                    );
                });
            };


            /** send custom message from html page */
            windowContext['tiledesk'].sendSupportMessage = function (
                message,
                recipientId,
                type,
                metadata,
                additional_attributes
            ) {
                const _globals = windowContext['tiledesk'].angularcomponent.component.g;
                if (!message) {
                    message = 'hello';
                }
                if (!recipientId) {
                    recipientId = _globals.recipientId;
                }
                if (!type) {
                    type = 'text';
                }
                if (!metadata) {
                    metadata = {};
                }
                const g_attributes = _globals.attributes;
                const attributes = <any>{};
                if (g_attributes) {
                    for (const [key, value] of Object.entries(g_attributes)) {
                        attributes[key] = value;
                    }
                }
                if (additional_attributes) {
                    for (const [key, value] of Object.entries(additional_attributes)) {
                        attributes[key] = value;
                    }
                }
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component
                    .sendMessage(
                        _globals.tenant,
                        _globals.senderId,
                        _globals.senderFullname,
                        message,
                        type,
                        metadata,
                        recipientId,
                        _globals.recipientFullname,
                        attributes,
                        _globals.projectid,
                        _globals.channelType
                    );
                });
            };



            /** set state PreChatForm close/open */
            windowContext['tiledesk'].endMessageRender = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.endMessageRender();
                });
            };

            /** set state reinit */
            windowContext['tiledesk'].reInit = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.reInit();
                });
            };

            /** set logout */
            windowContext['tiledesk'].logout = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.logout();
                });
            };

            /** show callout */
            windowContext['tiledesk'].showCallout = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.showCallout();
                });
            };

        }
    }


    initConversationHandler(conversationWith: string ): ConversationHandlerService{
        const tenant = this.g.tenant;
        const keys = [
            // 'LABEL_AVAILABLE',
            // 'LABEL_NOT_AVAILABLE',
            // 'LABEL_TODAY',
            // 'LABEL_TOMORROW',
            // 'LABEL_TO',
            // 'LABEL_LAST_ACCESS',
            // 'ARRAY_DAYS',
            // 'LABEL_ACTIVE_NOW',
            // 'LABEL_WRITING',
            'INFO_SUPPORT_USER_ADDED_SUBJECT',
            'INFO_SUPPORT_USER_ADDED_YOU_VERB',
            'INFO_SUPPORT_USER_ADDED_COMPLEMENT',
            'INFO_SUPPORT_USER_ADDED_VERB',
            'INFO_SUPPORT_CHAT_REOPENED',
            'INFO_SUPPORT_CHAT_CLOSED',
            'LABEL_TODAY',
            'LABEL_TOMORROW',
            'LABEL_TO',
            'ARRAY_DAYS',
          ];
          
        const translationMap= this.translateService.translateLanguage(keys);

        //TODO-GAB: da sistemare loggedUser in firebase-conversation-handler.service
        const loggedUser = { uid: this.g.senderId}
        const conversationWithFullname = this.g.recipientFullname;
        let handler: ConversationHandlerService = this.chatManager.getConversationHandlerByConversationId(conversationWith);
        console.log('DETTAGLIO CONV - handler **************', handler, conversationWith);
        if (!handler) {
             const conversationHandlerService = this.conversationHandlerBuilderService.build();
             conversationHandlerService.initialize(
                conversationWith,
                conversationWithFullname,
                loggedUser,
                tenant,
                translationMap
            );

            console.log('DETTAGLIO CONV - NEW handler **************', conversationHandlerService);
            this.chatManager.addConversationHandler(conversationHandlerService);
            handler = conversationHandlerService

        }

        return handler
    }

    /** */
    private endMessageRender() {
        this.obsEndRenderMessage.next();
    }

    /** */
    private sendMessage(
        tenant,
        senderId,
        senderFullname,
        msg,
        type,
        metadata,
        conversationWith,
        recipientFullname,
        attributes,
        projectid,
        channel_type) {
            this.g.wdLog(['*********** ',
            tenant,
            senderId,
            senderFullname,
            msg,
            type,
            metadata,
            conversationWith,
            recipientFullname,
            attributes,
            projectid,
            channel_type]);
        const messageSent = this.initConversationHandler(conversationWith)
                                .sendMessage(
                                        msg,
                                        type,
                                        metadata,
                                        conversationWith,
                                        recipientFullname,
                                        senderId,
                                        senderFullname,
                                        channel_type
                                )
        // const messageSent = this.messagingService
        //     .sendMessageFull(
        //         tenant,
        //         senderId,
        //         senderFullname,
        //         msg,
        //         type,
        //         metadata,
        //         conversationWith,
        //         recipientFullname,
        //         attributes,
        //         projectid,
        //         channel_type);
            this.g.wdLog([messageSent]);
            // sendMessage(senderFullname, msg, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type)
    }


    /**
     * Custom Auth called from the test-custom-auth.html
     * note: https://tiledesk.atlassian.net/browse/TD-42?atlOrigin=eyJpIjoiMGMyZmVmNDgzNTFjNGZkZjhiMmM2Y2U1MmYyNzkwODMiLCJwIjoiaiJ9
    */
    private signInWithCustomToken(token: string) {
        const that = this;
        try {
            // this.authService.signInWithCustomToken(token).subscribe(resp => {
            //     that.g.wdLog(['signInWithCustomToken token ', resp]);
            //      if (resp.success === true && resp.token) {
            //          if (resp.user) {
            //             const fullName = resp.user.firstname + ' ' + resp.user.lastname;
            //             that.g.setParameter('userFullname', fullName);
            //             that.g.setParameter('userEmail', resp.user.email);
            //             //that.g.setParameter('userId', resp.user._id);
            //             that.g.setAttributeParameter('userEmail', resp.user.email);
            //             that.g.setAttributeParameter('userFullname', fullName);
            //          }
            //         that.authService.createFirebaseToken(resp.token).subscribe(firebaseToken => {
            //             that.g.firebaseToken = firebaseToken;
            //             that.authService.authenticateFirebaseCustomToken(firebaseToken);
            //         }, error => {
            //             console.error('Error creating firebase token: ', error);
            //             that.signOut();
            //         });
            //      }
            // }, error => {
            //     console.error('Error creating firebase token: ', error);
            //     that.signOut();
            // });
            this.authService2.signInWithCustomToken(token).then(resp => {
                this.showWidget()
                console.log('userlogged customtoken', resp)
                const fullName = resp.firstname + ' ' + resp.lastname;
                that.g.setParameter('userFullname', fullName);
                that.g.setParameter('userEmail', resp.email);
                //that.g.setParameter('userId', resp.user._id);
                that.g.setAttributeParameter('userEmail', resp.email);
                that.g.setAttributeParameter('userFullname', fullName);
            })
        } catch (error) {
            this.g.wdLog(['> Error :' + error]);
            that.signOut();
        }
    }

    // UNUSED
    // private signInWithCustomTokenUniLe(token) {
    //     this.g.wdLog(['signInWithCustomToken token ', token]);
    //     const that = this;
    //     const projectid = this.g.projectid;
    //     this.authService.createFirebaseToken(token, projectid).subscribe(response => {
    //             that.authService.decode(token, projectid).subscribe(resDec => {
    //                     const attributes = that.g.attributes;
    //                     const firebaseToken = response;
    //                     this.g.wdLog(['firebaseToken', firebaseToken]);
    //                     this.g.wdLog(['resDec', resDec.decoded]);
    //                     that.g.setParameter('signInWithCustomToken', true);
    //                     that.g.setParameter('userEmail', resDec.decoded.email);
    //                     that.g.setParameter('userFullname', resDec.decoded.name);
    //                     that.g.setParameter('userToken', firebaseToken);
    //                     that.g.setParameter('signInWithCustomToken', true);
    //                     that.g.setParameter('signInWithCustomToken', true);
    //                     that.g.setParameter('signInWithCustomToken', true);
    //                     that.authService.authenticateFirebaseCustomToken(firebaseToken);
    //                     that.g.setAttributeParameter('userEmail', resDec.decoded.email);
    //                     that.g.setAttributeParameter('userFullname', resDec.decoded.name);
    //                     // attributes.userEmail = resDec.decoded.email;
    //                     // attributes.userFullname = resDec.decoded.name;
    //                     // that.g.setParameter('attributes', attributes);
    //                     // attributes = that.setAttributesFromStorageService(); ?????????????+
    //                     // ????????????????????
    //                 }, error => {
    //                     console.error('Error decoding token: ', error);
    //                    // that.g.wdLog(['call signout');
    //                    that.signOut();
    //                 });
    //                 // , () => {
    //                 //     that.g.wdLog(['!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV * COMPLETE *');
    //                 // });
    //         }, error => {
    //             console.error('Error creating firebase token: ', error);
    //             // that.g.wdLog(['call signout');
    //             that.signOut();
    //         });
    //         // , () => {
    //             // that.g.wdLog(['!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV * COMPLETE *');
    //         // });
    // }

    /** */
    private signInAnonymous() {
        this.g.wdLog(['signInAnonymous']);
        this.authService2.signInAnonymously(this.g.projectid)
        // this.authService.anonymousAuthentication();
        // this.authService.authenticateFirebaseAnonymously();
    }

    /** */
    private setPreChatForm(state: boolean) {
        if (state != null) {
            this.g.setParameter('preChatForm', state);
            if ( state === true ) {
                this.storageService.setItem('preChatForm', state);
            } else {
                this.storageService.removeItem('preChatForm');
            }
        }
    }

    private setPrivacyPolicy() {
        this.g.privacyApproved = true;
        this.g.setAttributeParameter('privacyApproved', this.g.privacyApproved);
        this.storageService.setItem('attributes', JSON.stringify(this.g.attributes));
        this.g.setParameter('preChatForm', false);
        this.storageService.removeItem('preChatForm');
    }

    /** show widget */
    private showWidget() {
        const startHidden = this.g.startHidden;
        const divWidgetContainer = this.g.windowContext.document.getElementById('tiledesk-container');
        if (divWidgetContainer && startHidden === false) {
            divWidgetContainer.style.display = 'block';
            this.g.setParameter('isShown', true, true);
        } else {
            this.g.startHidden = false;
            this.g.setParameter('isShown', false, true);
        }
    }

    /** hide widget */
    private hideWidget() {
        const divWidgetContainer = this.g.windowContext.document.getElementById('tiledesk-container');
        if (divWidgetContainer) {
            divWidgetContainer.style.display = 'none';
        }
        this.g.setParameter('isShown', false, true);
    }

    /** open popup conversation */
    private f21_open() {
        const senderId = this.g.senderId;
        this.g.wdLog(['f21_open senderId: ', senderId]);
        if (senderId) {
            // chiudo callout
            this.g.setParameter('displayEyeCatcherCard', 'none');
            // this.g.isOpen = true; // !this.isOpen;
            this.g.setIsOpen(true);
            this.isInitialized = true;
            this.storageService.setItem('isOpen', 'true');
            // this.g.displayEyeCatcherCard = 'none';
            this.triggerOnOpenEvent();
            // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
        }
    }

    /** close popup conversation */
    private f21_close() {
        this.g.setIsOpen(false);
        this.g.isOpenNewMessage = false;
        this.storageService.setItem('isOpen', 'false');
        this.triggerOnCloseEvent();
    }

    /**open widget in conversation when is closed */
    private _f21_open() {
        // const senderId = this.g.senderId;
        // console.log('f21_open senderId' , senderId) 
        // console.log()
        // this.g.wdLog(['f21_open senderId: ', senderId]);
        // if (senderId) {
            // chiudo callout
            // this.g.setParameter('displayEyeCatcherCard', 'none');
            // this.g.isOpen = true; // !this.isOpen;
            this.g.setIsOpen(true);
            // this.isInitialized = true;
            this.storageService.setItem('isOpen', 'true');
            // this.g.displayEyeCatcherCard = 'none';
            this.triggerOnOpenEvent();
            // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
        // }
    }


    /**
     * 1 - cleare local storage
     * 2 - remove div iframe widget
     * 3 - reinit widget
    */
    private reInit() {
        // if (!firebase.auth().currentUser) {
        if (!this.authService2.getCurrentUser()) {
            this.g.wdLog(['reInit ma NON SONO LOGGATO!']);
        } else {
            this.authService2.logout();
            // this.authService.signOut(-2);
            /** ho fatto un reinit */
            this.g.wdLog(['sono nel caso reinit -2']);
            this.g.setParameter('isLogged', false);
            this.hideWidget();
            // that.g.setParameter('isShown', false, true);
            this.storageService.removeItem('tiledeskToken');
            this.g.isLogout = true;
            // that.triggerOnAuthStateChanged(resp);
            if (this.g.autoStart !== false) {
                this.authenticate();
                this.initAll();
            }
            this.storageService.clear();
        }
        const divWidgetRoot = this.g.windowContext.document.getElementsByTagName('tiledeskwidget-root')[0];
        const divWidgetContainer = this.g.windowContext.document.getElementById('tiledesk-container');
        divWidgetContainer.remove();
        divWidgetRoot.remove();
        this.g.windowContext.initWidget();
    }


    // private reInit_old() {
    //     // this.isOpenHome = false;
    //     this.storageService.clear();
    //     let currentUser = this.authService.getCurrentUser();
    //     this.authService.reloadCurrentUser().then(() => {
    //         // location.reload();
    //         currentUser = this.authService.getCurrentUser();
    //         // alert(currentUser.uid);
    //         this.initAll();
    //         /** sono loggato */
    //         this.g.wdLog(['reInit_old USER AUTENTICATE: ', currentUser.uid]);
    //         this.g.setParameter('senderId', currentUser.uid);
    //         this.g.setParameter('isLogged', true);
    //         this.g.setParameter('attributes', this.setAttributesFromStorageService());
    //         this.g.wdLog([' this.g.senderId', currentUser.uid]);
    //         // this.startNwConversation();
    //         this.startUI();
    //         this.g.wdLog([' 1 - IMPOSTO STATO CONNESSO UTENTE ']);
    //         this.presenceService.setPresence(currentUser.uid);
    //     });

    // }

    private logout() {
        this.signOut();
    }

    /** show callout */
    private showCallout() {
        if (this.g.isOpen === false) {
            this.g.setParameter('displayEyeCatcherCard', 'block');
            this.triggerOnOpenEyeCatcherEvent();
        }
    }

    // ========= end:: COMPONENT TO WINDOW ============//



    // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
    /** elimino tutte le sottoscrizioni */
    ngOnDestroy() {
        this.g.wdLog(['this.subscriptions', this.subscriptions]);
        const windowContext = this.g.windowContext;
        if (windowContext['tiledesk']) {
            windowContext['tiledesk']['angularcomponent'] = null;
            // this.g.setParameter('windowContext', windowContext);
            this.g.windowContext = windowContext;
        }
        this.unsubscribe();
    }

    /** */
    unsubscribe() {
        this.subscriptions.forEach(function (subscription) {
            subscription.unsubscribe();
        });
        this.subscriptions = [];
        this.g.wdLog(['this.subscriptions', this.subscriptions]);
    }
    // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//



    // ========= begin:: FUNCTIONS ============//
    /**
     * 1 - clear local storage
     * 2 - remove user in firebase
    */
    signOut() {
        this.g.wdLog(['SIGNOUT']);
        if (this.g.isLogged === true) {
            this.g.wdLog(['prima ero loggato allora mi sloggo!']);
            this.g.setIsOpen(false);
            this.storageService.clear();
            this.presenceService.removePresence();
            this.authService2.logout()
            // this.authService.signOut(-2);
        }
        // this.storageService.removeItem('attributes');
    }

    /**
     * get status window chat from this.storageService
     * set status window chat open/close
     */
    // SET IN LOCAL SETTINGS setVariableFromStorage IMPOSTA IL VALORE DI TUTTE LE VARIABILI
    // setIsWidgetOpenOrActive() {
    //     if (this.storageService.getItem('isOpen') === 'true') {
    //         // this.g.isOpen = true;
    //         this.g.setIsOpen(true);
    //     } else if (this.storageService.getItem('isOpen') === 'false') {
    //         // this.g.isOpen = false;
    //         this.g.setIsOpen(false);
    //     }
    //     // this.isWidgetActive = (this.storageService.getItem('isWidgetActive')) ? true : false;
    // }

    /**
     * attivo sound se è un msg nuovo
     */
    private soundMessage() {
        console.log('****** soundMessage *****', this.audio);
        const that = this;
        this.audio.pause();
        this.audio.currentTime = 0;
        clearTimeout(this.setTimeoutSound);
        this.setTimeoutSound = setTimeout(() => {
            that.audio.play()
            .then(() => {
                console.log('****** soundMessage played *****');
            })
            .catch((error: any) => {
                console.log('***soundMessage error*', error);
            });
        }, 1000);
    }


    /**
     * genero un nuovo conversationWith
     * al login o all'apertura di una nuova conversazione
     */
    generateNewUidConversation() {
        this.g.wdLog(['generateUidConversation **************: senderId= ', this.g.senderId]);
        return UID_SUPPORT_GROUP_MESSAGES + uuidv4()
        //return this.messagingService.generateUidConversation(this.g.senderId);
    }

    /**
     * premendo sul pulsante 'APRI UNA NW CONVERSAZIONE'
     * attivo una nuova conversazione
     */
    startNwConversation() {
        this.g.wdLog(['AppComponent::startNwConversation']);
        const newConvId = this.generateNewUidConversation();
        this.g.setParameter('recipientId', newConvId);
        this.g.wdLog([' recipientId: ', this.g.recipientId]);
        this.triggerNewConversationEvent(newConvId);
    }

    // ========= end:: FUNCTIONS ============//




    // ========= begin:: CALLBACK FUNCTIONS ============//
    /**
     * MOBILE VERSION:
     * onClick button close widget
     */
    returnCloseWidget() {
        this.isOpenConversation = false;
        // this.g.isOpen = false;
        // this.g.setIsOpen(false);
        this.f21_close();
    }

    returnSoundChange(isSoundActive){
        this.g.setParameter('isSoundActive', isSoundActive);
    }

    /**
     * LAUNCHER BUTTON:
     * onClick button open/close widget
     */
    openCloseWidget($event) {
        this.g.setParameter('displayEyeCatcherCard', 'none');
        const conversationActive: ConversationModel = JSON.parse(this.storageService.getItem('activeConversation'));
        console.log('openCloseWidget', conversationActive, this.g.isOpen, this.g.startFromHome);
        if ( this.g.isOpen === true ) {
            if(!conversationActive){
                if(this.g.startFromHome){
                    this.isOpenHome = true;
                    this.isOpenConversation = false;
                }else{
                    this.isOpenHome = false;
                    this.isOpenConversation = true;
                    this.returnNewConversation()
                    // this.startNwConversation();
                }
            }else { //conversation is present in localstorage
                this.isOpenHome = false;
                this.isOpenConversation = true;
            }
            // if (!conversationActive && !this.g.startFromHome) {
            //     this.isOpenHome = false;
            //     this.isOpenConversation = true;
            //     this.startNwConversation();
            // } else if (conversationActive) {
            //     this.isOpenHome = false;
            //     this.isOpenConversation = true;
            // }
            // this.g.startFromHome = true;
            this.triggerOnOpenEvent();
        } else {
            this.triggerOnCloseEvent();
        }

    }

    /**
     * MODAL SELECTION DEPARTMENT:
     * selected department
     */
    public returnDepartmentSelected($event) {
        if ($event) {
            this.g.wdLog(['onSelectDepartment: ', $event]);
            this.g.setParameter('departmentSelected', $event);
            // this.settingsSaverService.setVariable('departmentSelected', $event);
            this.isOpenHome = true;
            this.isOpenSelectionDepartment = false;
            if (this.g.isOpenPrechatForm === false && this.isOpenSelectionDepartment === false) {
                this.isOpenConversation = true;
                this.startNwConversation();
            }
        }
    }

    /**
     * MODAL SELECTION DEPARTMENT:
     * close modal
     */
    public returnCloseModalDepartment() {
        this.g.wdLog(['returnCloseModalDepartment']);
        this.isOpenHome = true;
        this.isOpenSelectionDepartment = false;
        this.isOpenConversation = false;
    }


    /**
     * MODAL PRECHATFORM:
     * completed prechatform
     */
    public returnPrechatFormComplete() {
        this.g.wdLog(['returnPrechatFormComplete']);
        this.isOpenHome = true;
        this.g.setParameter('isOpenPrechatForm', false);
        if (this.g.isOpenPrechatForm === false && this.isOpenSelectionDepartment === false) {
            this.isOpenConversation = true;
            this.startNwConversation();
        }
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
    }

    /**
     * MODAL PRECHATFORM:
     * close modal
     */
    public returnCloseModalPrechatForm() {
         this.g.wdLog(['returnCloseModalPrechatForm']);
        this.isOpenHome = true;
        this.isOpenSelectionDepartment = false;
        this.isOpenConversation = false;
        this.g.setParameter('isOpenPrechatForm', false);
        this.g.newConversationStart = false;
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
    }

    /**
     * MODAL HOME:
     * @param $event
     * return conversation selected
     */
    private returnSelectedConversation($event) {
        if ($event) {
            if (this.g.isOpen === false) {
                //this.f21_open();
                this._f21_open()
            }
            this.conversationSelected = $event;
            this.g.setParameter('recipientId', $event.recipient);
            this.isOpenConversation = true;
             this.g.wdLog(['onSelectConversation in APP COMPONENT: ', $event]);
            // this.messagingService.initialize(this.senderId, this.tenant, this.channelType);
            // this.messages = this.messagingService.messages;
        }
    }

    /**
     * MODAL HOME:
     * controllo se prechat form è attivo e lo carico - stack 3
     * controllo se departments è attivo e lo carico - stack 2
     * carico conversazione - stack 1
     * home - stack 0
     */
    private returnNewConversation() {
         this.g.wdLog(['returnNewConversation in APP COMPONENT']);
         this.g.newConversationStart = true;
        // controllo i dipartimenti se sono 1 o 2 seleziono dipartimento e nascondo modale dipartimento
        // altrimenti mostro modale dipartimenti
        const preChatForm = this.g.preChatForm;
        const attributes = this.g.attributes;
        const departments = this.g.departments;

        // that.g.wdLog(['departments: ', departments, departments.length);
        if (preChatForm && (!attributes || !attributes.userFullname || !attributes.userEmail)) {
            // if (preChatForm && (!attributes.userFullname || !attributes.userEmail)) {
            this.isOpenConversation = false;
            this.g.setParameter('isOpenPrechatForm', true);
            // this.settingsSaverService.setVariable('isOpenPrechatForm', true);
            this.isOpenSelectionDepartment = false;
            if (departments && departments.length > 1 && this.g.departmentID == null) {
                this.isOpenSelectionDepartment = true;
            }
        } else {
            // this.g.isOpenPrechatForm = false;
            this.g.setParameter('isOpenPrechatForm', false);
            // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;
            if (departments && departments.length > 1 && this.g.departmentID == null) {
                this.isOpenSelectionDepartment = true;
            } else {
                this.isOpenConversation = true;
            }
        }

        this.g.wdLog(['isOpenPrechatForm', this.g.isOpenPrechatForm, ' isOpenSelectionDepartment:', this.isOpenSelectionDepartment]);
        if (this.g.isOpenPrechatForm === false && this.isOpenSelectionDepartment === false) {
            this.startNwConversation();
        }
    }

    /**
     * MODAL HOME:
     * open all-conversation
     */
    private returnOpenAllConversation() {
        this.isOpenHome = true;
        this.isOpenConversation = false;
        this.isOpenAllConversation = true;
    }

    /**
     * MODAL EYE CATCHER CARD:
     * open chat
     */
    private returnOpenChat() {
        this.f21_open();
    }

    /**
     * MODAL CONVERSATION:
     * close conversation
     */
    private returnCloseConversation() {
        console.log('returnCloseConversation')
        this.storageService.removeItem('activeConversation');
        this.g.setParameter('activeConversation', null, false);
        this.isOpenHome = true;
        this.isOpenAllConversation = false;
        this.isOpenConversation = false;
        setTimeout(() => {
            // this.isOpenAllConversation = isOpenAllConversationTEMP;
            // this.isOpenHome = isOpenHomeTEMP;
            // this.isOpenConversation = false;
        }, 200);
        // this.startNwConversation();
    }

    /**
     * MODAL ALL CONVERSATION:
     * close all-conversation
     */
    private returnCloseAllConversation() {
        this.g.wdLog(['Close all conversation']);
        const isOpenHomeTEMP = this.isOpenHome;
        const isOpenConversationTEMP = this.isOpenConversation;
        this.isOpenHome = false;
        this.isOpenConversation = false;
        setTimeout(() => {
            this.isOpenHome = isOpenHomeTEMP;
            this.isOpenConversation = isOpenConversationTEMP;
            this.isOpenAllConversation = false;
        }, 200);
    }

    /**
     * MODAL MENU SETTINGS:
     * logout
     */
    returnSignOut() {
        this.signOut();
    }

    /**
     * MODAL RATING WIDGET:
     * close modal page
     */
    returnCloseModalRateChat() {
        this.isOpenHome = true;
        this.g.setParameter('isOpenPrechatForm', false);
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
        this.isOpenConversation = false;
        this.isOpenSelectionDepartment = false;
        this.g.setParameter('isOpenStartRating', false);
        // this.settingsSaverService.setVariable('isOpenStartRating', false);
        // this.startNwConversation();
        this.returnCloseConversation();
    }

    /**
     * MODAL RATING WIDGET:
     * complete rate chat
     */
    returnRateChatComplete() {
        this.isOpenHome = true;
        this.g.setParameter('isOpenPrechatForm', false);
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
        this.isOpenConversation = false;
        this.isOpenSelectionDepartment = false;
        this.g.setParameter('isOpenStartRating', false);
        // this.settingsSaverService.setVariable('isOpenStartRating', false);
        // this.startNwConversation();
        this.returnCloseConversation();
    }

    returneventOpenEyeCatcher($e) {
        if ($e === true) {
            this.triggerOnOpenEyeCatcherEvent();
        } else {
            this.triggerOnClosedEyeCatcherEvent();
        }
    }
    // ========= end:: CALLBACK FUNCTIONS ============//



    // ========= START:: TRIGGER FUNCTIONS ============//
    private triggerOnViewInit() {
        const detailOBJ = {  global: this.g, default_settings: this.g.default_settings, appConfigs: this.appConfigService.getConfig()  }
        this.triggerHandler.triggerOnViewInit(detailOBJ)

        // const default_settings = this.g.default_settings;
        // const appConfigs = this.appConfigService.getConfig();
        // // that.g.wdLog(['appConfigs', appConfigs);
        // const windowContext = this.g.windowContext;
        // this.g.wdLog([' ---------------- triggerOnInit ---------------- ', default_settings]);
        // // tslint:disable-next-line:max-line-length
        // const onInit = new CustomEvent('onInit', { detail: {  global: this.g, default_settings: default_settings, appConfigs: appConfigs  } });

        // if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //     windowContext.tiledesk.tiledeskroot.dispatchEvent(onInit);
        //     this.g.windowContext = windowContext;
        // } else {
        //     this.el.nativeElement.dispatchEvent(onInit);
        // }
    }

    private triggerOnOpenEvent() {
        const detailOBJ = { default_settings: this.g.default_settings}
        this.triggerHandler.triggerOnOpenEvent(detailOBJ)

        // const default_settings = this.g.default_settings;
        // this.g.wdLog([' ---------------- triggerOnOpenEvent ---------------- ', default_settings]);
        // const onOpen = new CustomEvent('onOpen', { detail: { default_settings: default_settings } });
        // const windowContext = this.g.windowContext;
        // if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //     windowContext.tiledesk.tiledeskroot.dispatchEvent(onOpen);
        //     this.g.windowContext = windowContext;
        // } else {
        //     this.el.nativeElement.dispatchEvent(onOpen);
        // }

    }
    private triggerOnCloseEvent() {
        const detailOBJ = { default_settings: this.g.default_settings}
        this.triggerHandler.triggerOnCloseEvent(detailOBJ)

        // const default_settings = this.g.default_settings;
        // this.g.wdLog([' ---------------- triggerOnCloseEvent ---------------- ', default_settings]);
        // const onClose = new CustomEvent('onClose', { detail: { default_settings: default_settings } });
        // const windowContext = this.g.windowContext;
        // if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //     windowContext.tiledesk.tiledeskroot.dispatchEvent(onClose);
        //     this.g.windowContext = windowContext;
        // } else {
        //     this.el.nativeElement.dispatchEvent(onClose);
        // }

    }

    private triggerOnOpenEyeCatcherEvent() {
        const detailOBJ = { default_settings: this.g.default_settings}
        this.triggerHandler.triggerOnOpenEyeCatcherEvent(detailOBJ)

        // const default_settings = this.g.default_settings;
        // this.g.wdLog([' ---------------- triggerOnOpenEyeCatcherEvent ---------------- ', default_settings]);
        // const onOpenEyeCatcher = new CustomEvent('onOpenEyeCatcher', { detail: { default_settings: default_settings } });
        // const windowContext = this.g.windowContext;
        // if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //     windowContext.tiledesk.tiledeskroot.dispatchEvent(onOpenEyeCatcher);
        //     this.g.windowContext = windowContext;
        // } else {
        //     this.el.nativeElement.dispatchEvent(onOpenEyeCatcher);
        // }
    }

    private triggerOnClosedEyeCatcherEvent() {
        this.triggerHandler.triggerOnClosedEyeCatcherEvent()

        // this.g.wdLog([' ---------------- triggerOnClosedEyeCatcherEvent ---------------- ']);
        // const onClosedEyeCatcher = new CustomEvent('onClosedEyeCatcher', { detail: { } });
        // const windowContext = this.g.windowContext;
        // if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //     windowContext.tiledesk.tiledeskroot.dispatchEvent(onClosedEyeCatcher);
        //     this.g.windowContext = windowContext;
        // } else {
        //     this.el.nativeElement.dispatchEvent(onClosedEyeCatcher);
        // }
    }



    /** */
    private triggerOnLoggedIn() {
        const detailOBJ = {user_id: this.g.senderId, global: this.g, default_settings: this.g.default_settings, appConfigs: this.appConfigService.getConfig() }
        this.triggerHandler.triggerOnOpenEvent(detailOBJ)

        // const appConfigs = this.appConfigService.getConfig();
        // const default_settings = this.g.default_settings;

        // this.g.wdLog([' ---------------- triggerOnLoggedIn ---------------- ', this.g.isLogged]);
        // // tslint:disable-next-line:max-line-length
        // const onLoggedIn = new CustomEvent('onLoggedIn', { detail: {user_id: this.g.senderId, global: this.g, default_settings: default_settings, appConfigs: appConfigs }});
        // const windowContext = this.g.windowContext;
        // if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //     windowContext.tiledesk.tiledeskroot.dispatchEvent(onLoggedIn);
        //     this.g.windowContext = windowContext;
        // } else {
        //     this.el.nativeElement.dispatchEvent(onLoggedIn);
        // }
    }

     /** */
     private triggerOnLoggedOut() {
        const detailOBJ = { isLogged: this.g.isLogged, global: this.g, default_settings: this.g.default_settings, appConfigs: this.appConfigService.getConfig() }
        this.triggerHandler.triggerOnLoggedOut(detailOBJ)
        
        // const appConfigs = this.appConfigService.getConfig();
        // const default_settings = this.g.default_settings;

        // this.g.wdLog([' ---------------- triggerOnLoggedOut ---------------- ', this.g.isLogged]);
        // // tslint:disable-next-line:max-line-length
        // const onLoggedOut = new CustomEvent('onLoggedOut', { detail: {isLogged: this.g.isLogged, global: this.g, default_settings: default_settings, appConfigs: appConfigs }});
        // const windowContext = this.g.windowContext;
        // if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //     windowContext.tiledesk.tiledeskroot.dispatchEvent(onLoggedOut);
        //     this.g.windowContext = windowContext;
        // } else {
        //     this.el.nativeElement.dispatchEvent(onLoggedOut);
        // }
    }

    /** */
    private triggerOnAuthStateChanged(event) {
        const detailOBJ = {event: event, isLogged: this.g.isLogged, user_id: this.g.senderId, global: this.g, default_settings: this.g.default_settings, appConfigs: this.appConfigService.getConfig() }
        this.triggerHandler.triggerOnAuthStateChanged(detailOBJ)
        
        // const appConfigs = this.appConfigService.getConfig();
        // const default_settings = this.g.default_settings;
        // this.g.wdLog([' ---------------- triggerOnAuthStateChanged ---------------- ', this.g.isLogged]);
        // // tslint:disable-next-line:max-line-length
        // const onAuthStateChanged = new CustomEvent('onAuthStateChanged', { detail: {event: event, isLogged: this.g.isLogged, user_id: this.g.senderId, global: this.g, default_settings: default_settings, appConfigs: appConfigs }});
        // const windowContext = this.g.windowContext;
        // if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //     windowContext.tiledesk.tiledeskroot.dispatchEvent(onAuthStateChanged);
        //     this.g.windowContext = windowContext;
        // } else {
        //     this.el.nativeElement.dispatchEvent(onAuthStateChanged);
        // }
    }

    private triggerNewConversationEvent(newConvId) {
        const detailOBJ = {global: this.g, default_settings: this.g.default_settings, newConvId: newConvId, appConfigs: this.appConfigService.getConfig() }
        this.triggerHandler.triggerNewConversationEvent(detailOBJ)
        // const default_settings = this.g.default_settings;
        // const appConfigs = this.appConfigService.getConfig();
        // this.g.wdLog([' ---------------- triggerNewConversationEvent ---------------- ', default_settings, newConvId]);
        // // tslint:disable-next-line:max-line-length
        // const onNewConversation = new CustomEvent('onNewConversation', { detail: { global: this.g, default_settings: default_settings, newConvId: newConvId, appConfigs: appConfigs } });
        // const windowContext = this.g.windowContext;

        // if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //     windowContext.tiledesk.tiledeskroot.dispatchEvent(onNewConversation);
        //     this.g.windowContext = windowContext;
        // } else {
        //     this.el.nativeElement.dispatchEvent(onNewConversation);
        // }

    }


    /** */
    private triggerLoadParamsEvent() {
        const detailOBJ = { default_settings: this.g.default_settings}
        this.triggerHandler.triggerLoadParamsEvent(detailOBJ)
        
        // this.g.wdLog([' ---------------- triggerOnLoadParamsEvent ---------------- ', this.g.default_settings]);
        // const default_settings = this.g.default_settings;
        // const onLoadParams = new CustomEvent('onLoadParams', { detail: { default_settings: default_settings } });
        // const windowContext = this.g.windowContext;
        // if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //     windowContext.tiledesk.tiledeskroot.dispatchEvent(onLoadParams);
        //     this.g.windowContext = windowContext;
        // } else {
        //     this.el.nativeElement.dispatchEvent(onLoadParams);
        // }
    }

    /** */
    private triggerOnConversationUpdated(conversation: ConversationModel) {
        this.triggerHandler.triggerOnConversationUpdated(conversation)

        // this.g.wdLog([' ---------------- triggerOnChangedConversation ---------------- ', conversation]);
        // try {
        //     const triggerChangedConversation = new CustomEvent('onChangedConversation', { detail: { conversation: conversation } });
        //     const windowContext = this.g.windowContext;
        //     if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //         windowContext.tiledesk.tiledeskroot.dispatchEvent(triggerChangedConversation);
        //         this.g.windowContext = windowContext;
        //     } else {
        //         this.el.nativeElement.dispatchEvent(triggerChangedConversation);
        //     }
        // } catch (e) {
        //     this.g.wdLog(['> Error :' + e]);
        // }
    }

    /** */
    private triggerOnCloseMessagePreview() {
        this.triggerHandler.triggerOnCloseMessagePreview();

        // this.g.wdLog([' ---------------- triggerOnCloseMessagePreview ---------------- ']);
        // try {
        //     const triggerCloseMessagePreview = new CustomEvent('onCloseMessagePreview', { detail: { } });
        //     const windowContext = this.g.windowContext;
        //     if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //         windowContext.tiledesk.tiledeskroot.dispatchEvent(triggerCloseMessagePreview);
        //         this.g.windowContext = windowContext;
        //     } else {
        //         this.el.nativeElement.dispatchEvent(triggerCloseMessagePreview);
        //     }
        //     this.g.isOpenNewMessage = false;
        // } catch (e) {
        //     this.g.wdLog(['> Error :' + e]);
        // }
    }

    // ========= END:: TRIGGER FUNCTIONS ============//

    // setSound() {
    //     if (this.storageService.getItem('isSoundActive')) {
    //         this.g.setParameter('isSoundActive', this.storageService.getItem('isSoundActive'));
    //         // this.settingsSaverService.setVariable('isSoundActive', this.storageService.getItem('isSoundActive'));
    //       }
    // }

    //   /**
//    * carico url immagine profilo passando id utente
//    */
//   setProfileImage(contact) {
//     const that = this;
//     // that.g.wdLog([' ********* displayImage::: ');
//     this.contactService.profileImage(contact.id, 'thumb')
//     .then((url) => {
//         contact.imageurl = url;
//     })
//     .catch((error) => {
//       // that.g.wdLog(["displayImage error::: ",error);
//     });
//   }

// ============ begin: functions pass values to external ============//
    // private setSubscriptionNewMsg() {
    //     const that = this;
    //     const obsAddedMsg: Subscription = this.messagingService.obsAddedMsg
    //     .subscribe(msg => {
    //         that.g.wdLog(['msg:::::' + msg);
    //         const beforeMessageRender = new CustomEvent('beforeMessageRender', { detail: msg });
    //         this.el.nativeElement.dispatchEvent(beforeMessageRender);
    //     });
    // }


    /** */
    // private triggerBeforeMessageRender(text) {
    //     this.g.wdLog([' ---------------- triggerBeforeMessageRender ---------------- ', this.g.default_settings]);
    //     const beforeMessageRender = new CustomEvent('beforeMessageRender', { detail: '{json}' });
    //     this.el.nativeElement.dispatchEvent(beforeMessageRender);
    // }
    // ============ end: functions pass values to external ============//

   private setStyleMap(){
        this.styleMapConversation.set('backgroundColor', this.g.colorBck)
        this.styleMapConversation.set('foregroundColor', this.g.themeForegroundColor)
        this.styleMapConversation.set('themeColor', this.g.themeColor)  
  }


}
