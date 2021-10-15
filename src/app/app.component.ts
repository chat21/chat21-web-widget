import { EyeeyeCatcherCardComponent } from './components/eyeeye-catcher-card/eyeeye-catcher-card.component';
import { LoggerInstance } from './../chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from './../chat21-core/providers/tiledesk/tiledesk-auth.service';
import { AppStorageService } from '../chat21-core/providers/abstract/app-storage.service';
import { StarRatingWidgetService } from './components/star-rating-widget/star-rating-widget.service';
import { StarRatingWidgetComponent } from './components/star-rating-widget/star-rating-widget.component';
import { UserModel } from '../../src/chat21-core/models/user';

import { ElementRef, Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewEncapsulation, HostListener, ViewChild } from '@angular/core';
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
import { strip_tags, isPopupUrl, popupUrl, detectIfIsMobile, supports_html5_storage, getImageUrlThumb, isJustRecived } from './utils/utils';
import { ConversationModel } from '../chat21-core/models/conversation';
import { AppConfigService } from './providers/app-config.service';


import { GlobalSettingsService } from './providers/global-settings.service';
import { SettingsSaverService } from './providers/settings-saver.service';
import { User } from '../models/User';
import { CustomTranslateService } from '../chat21-core/providers/custom-translate.service';
import { ConversationsHandlerService } from '../chat21-core/providers/abstract/conversations-handler.service';
import { ChatManager } from '../chat21-core/providers/chat-manager';
import { TypingService } from '../chat21-core/providers/abstract/typing.service';
import { MessagingAuthService } from '../chat21-core/providers/abstract/messagingAuth.service';
import { v4 as uuidv4 } from 'uuid';
import { FIREBASESTORAGE_BASE_URL_IMAGE, STORAGE_PREFIX, UID_SUPPORT_GROUP_MESSAGES } from './utils/constants';
import { ConversationHandlerBuilderService } from '../chat21-core/providers/abstract/conversation-handler-builder.service';
import { ConversationHandlerService } from '../chat21-core/providers/abstract/conversation-handler.service';
import { Triggerhandler } from '../chat21-core/utils/triggerHandler';
import { PresenceService } from '../chat21-core/providers/abstract/presence.service';
import { ArchivedConversationsHandlerService } from '../chat21-core/providers/abstract/archivedconversations-handler.service';
import { AUTH_STATE_OFFLINE, AUTH_STATE_ONLINE, URL_SOUND_LIST_CONVERSATION } from '../chat21-core/utils/constants';
import { ImageRepoService } from '../chat21-core/providers/abstract/image-repo.service';
import { UploadService } from '../chat21-core/providers/abstract/upload.service';
import { LoggerService } from '../chat21-core/providers/abstract/logger.service';

@Component({
    selector: 'chat-root',
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
    isConversationArchived: boolean = false;
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
    private setIntervalTime: any;
    private isTabVisible: boolean = true;
    private tabTitle: string;
    // ========= end:: variabili del componente ======== //

    // ========= begin:: DA SPOSTARE ======= //
    IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
    // private aliveSubLoggedUser = true; /** ????? */
    // THERE ARE TWO 'CARD CLOSE BUTTONS' THAT ARE DISPLAYED ON THE BASIS OF PLATFORM
    // isMobile: boolean;
    // ========= end:: DA SPOSTARE ========= //

    styleMapConversation: Map<string, string> = new Map();
    @ViewChild(EyeeyeCatcherCardComponent) eyeeyeCatcherCardComponent: EyeeyeCatcherCardComponent
    private logger: LoggerService = LoggerInstance.getInstance();

    constructor(
        private el: ElementRef,
        private ngZone: NgZone,
        public g: Globals,
        public triggerHandler: Triggerhandler,
        public translatorService: TranslatorService,
        private translateService: CustomTranslateService,
        public messagingAuthService: MessagingAuthService,
        public tiledeskAuthService: TiledeskAuthService,
        //public messagingService: MessagingService,
        public contactService: ContactService,
        //public chatPresenceHandlerService: ChatPresenceHandlerService,
        public presenceService: PresenceService,
        private agentAvailabilityService: AgentAvailabilityService,
        // private storageService: StorageService,
        private appStorageService: AppStorageService,
        public appConfigService: AppConfigService,
        public globalSettingsService: GlobalSettingsService,
        public settingsSaverService: SettingsSaverService,
        //public conversationsService: ConversationsService,
        public conversationsHandlerService: ConversationsHandlerService,
        public archivedConversationsService: ArchivedConversationsHandlerService,
        public conversationHandlerBuilderService: ConversationHandlerBuilderService,
        public chatManager: ChatManager,
        public typingService: TypingService,
        public imageRepoService: ImageRepoService,
        public uploadService: UploadService
    ) {
        // if (!appConfigService.getConfig().firebaseConfig || appConfigService.getConfig().firebaseConfig.apiKey === 'CHANGEIT') {
        //     throw new Error('firebase config is not defined. Please create your widget-config.json. See the Chat21-Web_widget Installation Page');
        // }

        // firebase.initializeApp(appConfigService.getConfig().firebaseConfig);  // here shows the error
        this.obsEndRenderMessage = new BehaviorSubject(null);
    }

    /** */
    ngOnInit() {
        this.logger.info('[APP-CONF]---------------- ngOnInit: APP.COMPONENT ---------------- ')
        this.initWidgetParamiters();
    }

    @HostListener('document:visibilitychange')
    visibilitychange() {
        // this.logger.printDebug("document TITLE", this.g.windowContext.window.document.title);
        if (document.hidden) {
            this.isTabVisible = false
            // this.g.windowContext.window.document.title = this.tabTitle
        } else {
            // TAB IS ACTIVE --> restore title and DO NOT SOUND
            clearInterval(this.setIntervalTime)
            this.setIntervalTime = null;
            this.isTabVisible = true;
            this.g.windowContext.window.document.title = this.tabTitle;
            // this.g.windowContext.parent.title = "SHOWING"
            // this.g.windowContext.title = "SHOWING2"
        }
    }

    private manageTabNotification() {
        if (!this.isTabVisible) {
            // TAB IS HIDDEN --> manage title and SOUND 
            // this.g.windowContext.parent.title = "HIDDEN"
            // this.g.windowContext.title = "HIDDEN2"

            let badgeNewConverstionNumber = this.conversationsHandlerService.countIsNew()
            this.logger.debug('[APP-COMP] badgeNewConverstionNumber::', badgeNewConverstionNumber)
            badgeNewConverstionNumber > 0 ? badgeNewConverstionNumber : badgeNewConverstionNumber= 1
            this.g.windowContext.window.document.title = "(" + badgeNewConverstionNumber + ") " + this.tabTitle
            clearInterval(this.setIntervalTime)
            const that = this
            this.setIntervalTime = window.setInterval(function () {
                if (that.g.windowContext.window.document.title.charAt(0) === '(') {
                    that.g.windowContext.window.document.title = that.tabTitle
                } else {
                    that.g.windowContext.window.document.title = "(" + badgeNewConverstionNumber + ") " + that.tabTitle;
                }
            }, 1000);
            this.soundMessage()
        }
    }


    /** */
    ngAfterViewInit() {
        // this.triggerOnViewInit();
        this.ngZone.run(() => {
            const that = this;
            const subChangedConversation = this.conversationsHandlerService.conversationChanged.subscribe((conversation) => {
                // that.ngZone.run(() => {
                if (conversation) {
                    this.onImageLoaded(conversation)
                    this.onConversationLoaded(conversation)

                    if(conversation.sender !== this.g.senderId){
                        that.manageTabNotification();
                    }
                    that.triggerOnConversationUpdated(conversation);
                } else {
                    this.logger.debug('[APP-COMP] oBSconversationChanged null: errorrr')
                    return;
                }
                if (that.g.isOpen === true) {
                    that.g.setParameter('displayEyeCatcherCard', 'none');

                    this.logger.debug('[APP-COMP] obsChangeConversation ::: ', conversation);
                    if (conversation.attributes && conversation.attributes['subtype'] === 'info') {
                        return;
                    }
                    if (conversation.is_new && !this.isOpenConversation) {
                        // this.soundMessage();
                    }


                } else {
                    // if(conversation.is_new && isJustRecived(this.g.startedAt.getTime(), conversation.timestamp)){
                    //widget closed
                    that.lastConversation = conversation;
                    that.g.isOpenNewMessage = true;
                    that.logger.debug('[APP-COMP] lastconversationnn', that.lastConversation)

                    let badgeNewConverstionNumber = that.conversationsHandlerService.countIsNew()
                    that.g.setParameter('conversationsBadge', badgeNewConverstionNumber);
                    // }
                }
                // });
            });
            this.subscriptions.push(subChangedConversation);

            const subAddedConversation = this.conversationsHandlerService.conversationAdded.subscribe((conversation) => {
                // that.ngZone.run(() => {
                if (that.g.isOpen === true && conversation) {
                    that.g.setParameter('displayEyeCatcherCard', 'none');
                    that.triggerOnConversationUpdated(conversation);
                    that.logger.debug('[APP-COMP] obsAddedConversation ::: ', conversation);
                    if (conversation && conversation.attributes && conversation.attributes['subtype'] === 'info') {
                        return;
                    }
                    if (conversation.is_new) {
                        that.manageTabNotification()
                        // this.soundMessage(); 
                    }
                    if(this.g.isOpen === false){
                        that.lastConversation = conversation;
                        that.g.isOpenNewMessage = true;
                    }
                } else {
                    //widget closed

                    let badgeNewConverstionNumber = that.conversationsHandlerService.countIsNew()
                    that.g.setParameter('conversationsBadge', badgeNewConverstionNumber);
                }
                // that.manageTabNotification()
                // });
                if(conversation){
                    this.onImageLoaded(conversation)
                    this.onConversationLoaded(conversation)
                }
                
            });
            this.subscriptions.push(subAddedConversation);

            const subArchivedConversations = this.archivedConversationsService.archivedConversationAdded.subscribe((conversation) => {
                // that.ngZone.run(() => {
                if (conversation) {
                    that.triggerOnConversationUpdated(conversation);
                    this.onImageLoaded(conversation)
                    this.onConversationLoaded(conversation)
                }
                // });
            });
            this.subscriptions.push(subArchivedConversations);

        });
        // this.authService.initialize()
        this.appStorageService.initialize(environment.storage_prefix, this.g.persistence, this.g.projectid)
        this.tiledeskAuthService.initialize(this.appConfigService.getConfig().apiUrl)
        this.messagingAuthService.initialize();
        this.chatManager.initialize();
        this.uploadService.initialize();

    }

    // setStoragePrefix(): string{
    //     let prefix = STORAGE_PREFIX;
    //     try {
    //         prefix = environment.storage_prefix + '_';
    //     } catch (e) {
    //         this.g.wdLog(['> Error :' + e]);
    //     }
    //     return prefix + this.g.projectid + '_';
    // }

    // ========= begin:: SUBSCRIPTIONS ============//
    /** login subscription
    * GET CURRENT USER
    * recupero il current user se esiste
    * https://forum.ionicframework.com/t/firebase-auth-currentuser-shows-me-null-but-it-logged-in/68411/4
    */
    setAuthSubscription() {
        this.logger.debug('[APP-COMP] setLoginSubscription : ');
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
        //         // const tiledeskTokenTEMP = that.appStorageService.getItemWithoutProjectId('tiledeskToken');

        //         const tiledeskTokenTEMP = that.appStorageService.getItem('tiledeskToken');
        //         if (tiledeskTokenTEMP && tiledeskTokenTEMP !== undefined) {
        //             that.g.tiledeskToken = tiledeskTokenTEMP;
        //         }
        //         const firebaseTokenTEMP = that.appStorageService.getItemWithoutProjectId('firebaseToken');
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
        //             that.appStorageService.removeItem('tiledeskToken');
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
        //             that.appStorageService.removeItem('tiledeskToken');
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
        //             // that.appStorageService.removeItem('tiledeskToken');
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

        const subAuthStateChanged = this.messagingAuthService.BSAuthStateChanged.subscribe(state => {

            //const tiledeskTokenTEMP = that.appStorageService.getItem('tiledeskToken');
            const tiledeskTokenTEMP = this.appStorageService.getItem('tiledeskToken')
            //const tiledeskTokenTEMP = this.authService2.getTiledeskToken();
            if (tiledeskTokenTEMP && tiledeskTokenTEMP !== undefined) {
                that.g.tiledeskToken = tiledeskTokenTEMP;
            }

            const firebaseTokenTEMP = this.messagingAuthService.getToken();
            if (firebaseTokenTEMP && firebaseTokenTEMP !== undefined) {
                that.g.firebaseToken = firebaseTokenTEMP;
            }

            const autoStart = this.g.autoStart;
            that.stateLoggedUser = state;
            if (state && state === AUTH_STATE_ONLINE) {
                /** sono loggato */
                // const user = that.authService.getCurrentUser();
                const user = that.tiledeskAuthService.getCurrentUser()
                that.logger.debug('[APP-COMP] sono nel caso in cui sono loggato', user);
                // that.g.wdLog([' anonymousAuthenticationInNewProject']);
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
                that.startUI();
                that.triggerOnAuthStateChanged(that.stateLoggedUser);
                that.logger.debug('[APP-COMP]  1 - IMPOSTO STATO CONNESSO UTENTE ', autoStart);
                this.typingService.initialize(this.g.tenant);
                this.presenceService.initialize(this.g.tenant);
                that.presenceService.setPresence(user.uid);
                this.initConversationsHandler(this.g.tenant, that.g.senderId);
                if (autoStart) {
                    that.showWidget();
                    // that.g.setParameter('isShown', true, true);
                }

            } else if (state && state === AUTH_STATE_OFFLINE) {
                /** non sono loggato */
                that.logger.debug('[APP-COMP] sono nel caso in cui non sono loggato 0');
                that.logger.debug('[APP-COMP] NO CURRENT USER AUTENTICATE: ');
                that.g.setParameter('isLogged', false);
                that.hideWidget();
                // that.g.setParameter('isShown', false, true);
                that.triggerOnAuthStateChanged(that.stateLoggedUser);
                if (autoStart) {
                    that.authenticate();
                }
            }


        });
        this.subscriptions.push(subAuthStateChanged);


        const subUserLogOut = this.messagingAuthService.BSSignOut.subscribe((state) => {
            // that.ngZone.run(() => {
            if (state === true) { //state = true -> user has logged out
                /** ho effettuato il logout: nascondo il widget */
                that.logger.debug('[APP-COMP] sono nel caso logout -1');
                // that.g.wdLog(['obsLoggedUser', obsLoggedUser);
                // that.g.wdLog(['this.subscriptions', that.subscriptions);
                that.g.tiledeskToken = null; //reset token to restart widget with different tildeskToken
                that.g.setParameter('isLogged', false);
                that.g.setParameter('isOpenPrechatForm', false);
                that.g.setParameter('userFullname', null); //clar parameter to enable preChatForm on logout with other token
                that.g.setParameter('userEmail', null);//clar parameter to enable preChatForm on logout with other token
                that.g.setAttributeParameter('userFullname', null);//clar parameter to enable preChatForm on logout with other token
                that.g.setAttributeParameter('userEmail', null);//clar parameter to enable preChatForm on logout with other token
                this.g.setAttributeParameter('preChatForm', null)
                this.g.setParameter('conversationsBadge', 0);
                this.g.setParameter('recipientId', null, false)
                that.hideWidget();
                // that.g.setParameter('isShown', false, true);
                that.g.isLogout = true;
                that.triggerOnAuthStateChanged('offline');
                // that.triggerOnLoggedOut()
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

                    // /** INIT  */
                    // that.initAll();
                    this.logger.setLoggerConfig(this.g.isLogEnabled, this.g.logLevel)
                    // (this.g.logLevel === 0 || this.g.logLevel !== 0) && this.g.logLevel !== undefined? this.logger.setLoggerConfig(this.g.isLogEnabled, this.g.logLevel) : this.logger.setLoggerConfig(this.g.isLogEnabled, this.appConfigService.getConfig().logLevel)
                    this.tabTitle = this.g.windowContext.window.document.title
                    this.appStorageService.initialize(environment.storage_prefix, this.g.persistence, this.g.projectid)
                    this.logger.debug('[APP-COMP] controllo se è stato passato un token: ', this.g.jwt);
                    if (this.g.jwt) {
                        // mi loggo con custom token passato nell'url
                        //aggiungo nel local storage e mi autentico
                        this.logger.debug('[APP-COMP] token passato da url. isShown:', this.g.isShown, 'autostart:', this.g.autoStart)
                        this.logger.debug('[APP-COMP]  ----------------  mi loggo con custom token passato nell url  ---------------- ');
                        //   this.g.autoStart = false;
                        this.appStorageService.setItem('tiledeskToken', this.g.jwt)
                        this.g.tiledeskToken = this.g.jwt;
                        // this.signInWithCustomToken(this.g.jwt) // moved to authenticate() in else(tiledeskToken)
                    }
                    this.translatorService.initI18n().then((result) => {
                        this.logger.debug('[APP-COMP] »»»» APP-COMPONENT.TS initI18n result', result);
                        const browserLang = this.translatorService.getLanguage();
                        moment.locale(browserLang)
                        this.translatorService.translate(this.g);
                    }).then(() => {
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
        this.audio.src = this.g.baseLocation + URL_SOUND_LIST_CONVERSATION;
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

    initConversationsHandler(tenant: string, senderId: string) {
        this.logger.debug('[APP-COMP] initialize: ListConversationsComponent');
        const keys = ['YOU'];
        const translationMap = this.translateService.translateLanguage(keys);
        this.listConversations = [];
        this.archivedConversations = [];
        //this.availableAgents = this.g.availableAgents.slice(0, 5);

        this.logger.debug('[APP-COMP] senderId: ', senderId);
        this.logger.debug('[APP-COMP] tenant: ', tenant);

        // 1 - init chatConversationsHandler and  archviedConversationsHandler
        this.conversationsHandlerService.initialize(tenant, senderId, translationMap)
        this.archivedConversationsService.initialize(tenant, senderId, translationMap)
        // 2 - get conversations from storage
        // this.chatConversationsHandler.getConversationsFromStorage();
        // 5 - connect conversationHandler and archviedConversationsHandler to firebase event (add, change, remove)
        this.conversationsHandlerService.subscribeToConversations(() => { })
        this.archivedConversationsService.subscribeToConversations(() => { })
        this.listConversations = this.conversationsHandlerService.conversations;
        this.archivedConversations = this.archivedConversationsService.archivedConversations;
        // 6 - save conversationHandler in chatManager
        this.chatManager.setConversationsHandler(this.conversationsHandlerService);
        this.chatManager.setArchivedConversationsHandler(this.archivedConversationsService);

        this.logger.debug('[APP-COMP] this.listConversations.length', this.listConversations.length);
        this.logger.debug('[APP-COMP] this.listConversations appcomponent', this.listConversations, this.archivedConversations);

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
        this.logger.debug('[APP-COMP]  ---------------- A1 ---------------- ');
        // Related to https://github.com/firebase/angularfire/issues/970
        if (supports_html5_storage()) {
            this.appStorageService.removeItem('firebase:previous_websocket_failure');
        }
    }

    /** setAttributesFromStorageService
     *
    */
    private setAttributesFromStorageService(): any {
        let attributes: any = {};
        try {
            attributes = JSON.parse(this.appStorageService.getItem('attributes'));
            if (attributes.preChatForm) {
                const preChatForm = attributes.preChatForm;
                if(preChatForm.userEmail) this.g.userEmail = preChatForm.userEmail;
                if(preChatForm.userFullname) this.g.userFullname = preChatForm.userFullname 
            }
            // this.g.wdLog(['> attributes: ', attributes]);
        } catch (error) {
            this.logger.debug('[APP-COMP] > Error :' + error);
        }

        const CLIENT_BROWSER = navigator.userAgent;
        const projectid = this.g.projectid;
        const userEmail = this.g.userEmail;
        const userFullname = this.g.userFullname;
        const senderId = this.g.senderId;

        if (!attributes && attributes === null) {
            if (this.g.attributes) {
                attributes = this.g.attributes;
            } else {
                attributes = {};
            }
        }
        // this.g.wdLog(['attributes: ', attributes, this.g.attributes]);
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
            attributes['payload'] = []
            if (this.g.customAttributes) {
                attributes['payload'] = this.g.customAttributes;
            }
        } catch (error) {
            this.logger.debug('[APP-COMP] > Error is handled payload: ', error);
        }

        this.appStorageService.setItem('attributes', JSON.stringify(attributes));
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
    //             that.appStorageService.removeItem('availableAgents');
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
     * save attributes in this.appStorageService
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
    //         this.appStorageService.setItem('attributes', JSON.stringify(attributes));
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

        const tiledeskToken = this.g.tiledeskToken;
        const user = this.appStorageService.getItem('currentUser')
        this.logger.debug('[APP-COMP] tiledesktokennn', tiledeskToken, user)
        if (tiledeskToken) {
            //     //  SONO GIA' AUTENTICATO
            this.logger.debug('[APP-COMP]  ---------------- 13 ---------------- ');
            this.logger.debug('[APP-COMP]  ----------- sono già loggato ------- ');
            this.signInWithCustomToken(tiledeskToken)
            // this.tiledeskAuthService.signInWithCustomToken(tiledeskToken).then(user => {
            //     this.messagingAuthService.createCustomToken(tiledeskToken)
            // }).catch(error => { console.error('SIGNINWITHCUSTOMTOKEN error::' + error) })


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
            this.logger.debug('[APP-COMP]  ---------------- 14 ---------------- ');
            this.logger.debug('[APP-COMP]  authenticateFirebaseAnonymously');
            this.tiledeskAuthService.signInAnonymously(this.g.projectid).then(tiledeskToken => {
                this.messagingAuthService.createCustomToken(tiledeskToken)
                const user = this.tiledeskAuthService.getCurrentUser();
                //check if tiledesk_userFullname exist (passed from URL or tiledeskSettings) before update userFullname parameter
                //if tiledesk_userFullname not exist--> update parameter with tiledesk user returned from auth
                if ((user.firstname || user.lastname) && !this.g.userFullname) {
                    const fullName = user.firstname + ' ' + user.lastname;
                    this.g.setParameter('userFullname', fullName);
                    this.g.setAttributeParameter('userFullname', fullName);
                }
                //check if tiledesk_userEmail exist (passed from URL or tiledeskSettings) before update userEmail parameter
                //if tiledesk_userEmail not exist--> update parameter with tiledesk user returned from auth
                if (user.email && !this.g.userEmail) {
                    this.g.setParameter('userEmail', user.email);
                    this.g.setAttributeParameter('userEmail', user.email);
                }
            });
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
        this.logger.debug('[APP-COMP]  ============ startUI ===============');
        const departments = this.g.departments;
        const attributes = this.g.attributes;
        const preChatForm = this.g.preChatForm;
        this.isOpenHome = true;
        this.isOpenConversation = false;
        this.g.setParameter('isOpenPrechatForm', false);
        this.isOpenSelectionDepartment = false;
        this.isOpenAllConversation = false;
        // const conversationActive: ConversationModel = JSON.parse(this.appStorageService.getItem('activeConversation'));
        const recipientId : string = this.appStorageService.getItem('recipientId')
        this.logger.debug('[APP-COMP]  ============ idConversation ===============', recipientId);
        // this.g.recipientId = null;
        if(this.g.recipientId){
            this.logger.debug('[APP-COMP]  conv da urll', this.g.recipientId)
            if (this.g.isOpen) {
                this.isOpenConversation = true;
            }
            this.g.setParameter('recipientId', this.g.recipientId);
            this.appStorageService.setItem('recipientId', this.g.recipientId)
        }else if(recipientId){ 
            this.logger.debug('[APP-COMP]  conv da storagee', recipientId)
            if (this.g.isOpen) {
                this.isOpenConversation = true;
            }
            this.g.recipientId = recipientId;
            this.g.setParameter('recipientId', recipientId);
            // this.returnSelectedConversation(conversationActive);
        } else if (this.g.startFromHome) {
            // this.logger.debug('[APP-COMP] 66666');
            this.isOpenConversation = false;
            this.g.setParameter('isOpenPrechatForm', false);
            this.isOpenSelectionDepartment = false;
        } else if (preChatForm && (!attributes || !attributes.userFullname || !attributes.userEmail)) {
            // this.logger.debug('[APP-COMP] 55555');
            this.g.setParameter('isOpenPrechatForm', true);
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;
            if (departments.length > 1 && this.g.departmentID == null) {
                // this.logger.debug('[APP-COMP] 44444');
                this.isOpenSelectionDepartment = true;
            }
        } else {
            // this.logger.debug('[APP-COMP] 33333');
            this.g.setParameter('isOpenPrechatForm', false);
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;


            if (departments.length > 1 && !this.g.departmentID == null) {
                // this.logger.debug('[APP-COMP] 22222');
                this.isOpenSelectionDepartment = true;
            } else {
                // this.logger.debug('[APP-COMP] 11111', this.g.isOpen, this.g.recipientId);
                this.isOpenConversation = false;
                if (!this.g.recipientId && this.g.isOpen) {
                    // this.startNwConversation();
                    this.openNewConversation();
                }
            }
        }
        
        // visualizzo l'iframe!!!
        this.triggerOnViewInit();
        // this.triggerOnAuthStateChanged(true)
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
        this.logger.debug('[APP-COMP] openNewConversation in APP COMPONENT');
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

        this.logger.debug('[APP-COMP] isOpenPrechatForm', this.g.isOpenPrechatForm, ' isOpenSelectionDepartment:', this.isOpenSelectionDepartment);
        if (this.g.isOpenPrechatForm === false && this.isOpenSelectionDepartment === false) {
            this.startNewConversation();
        }
    }

    // ========= begin:: COMPONENT TO WINDOW ============//
    /**
     * http://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
     */
    private addComponentToWindow(ngZone) {
        const that = this;
        const windowContext = this.g.windowContext;
        if (windowContext && windowContext['tiledesk']) {
            windowContext['tiledesk']['angularcomponent'] = { component: this, ngZone: ngZone };
    
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
                    windowContext['tiledesk']['angularcomponent'].component.showWidget();
                });
            };
            /** hidden all widget */
            windowContext['tiledesk'].hide = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.hideWidget();
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
                recipientFullname,
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
                            _globals.userFullname,
                            message,
                            type,
                            metadata,
                            recipientId,
                            recipientFullname,
                            attributes,
                            _globals.projectid,
                            _globals.channelType
                        );
                });
            };

            /** set state PreChatForm close/open */
            // windowContext['tiledesk'].endMessageRender = function () {
            //     ngZone.run(() => {
            //         windowContext['tiledesk']['angularcomponent'].component.endMessageRender();
            //     });
            // };

            /** set state reinit */
            windowContext['tiledesk'].reInit = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.reInit();
                });
            };

            /** set state reStart */
            windowContext['tiledesk'].restart = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.restart();
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

            /** setPrechatForm  */
            windowContext['tiledesk'].setPreChatFormJson = function (form: Array<any>) {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.setPreChatFormJson(form);
                });
            };

            /** getPreChatForm  */
            windowContext['tiledesk'].getPreChatFormJson = function () {
                let preChatForm = {}
                ngZone.run(() => {
                    preChatForm = windowContext['tiledesk']['angularcomponent'].component.getPreChatFormJson();
                });
                return preChatForm
            };

        }
    }


    initConversationHandler(conversationWith: string): ConversationHandlerService {
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

        const translationMap = this.translateService.translateLanguage(keys);

        //TODO-GAB: da sistemare loggedUser in firebase-conversation-handler.service
        const loggedUser = { uid: this.g.senderId }
        const conversationWithFullname = this.g.recipientFullname;
        let handler: ConversationHandlerService = this.chatManager.getConversationHandlerByConversationId(conversationWith);
        this.logger.debug('[APP-COMP] DETTAGLIO CONV - handler **************', handler, conversationWith);
        if (!handler) {
            const conversationHandlerService = this.conversationHandlerBuilderService.build();
            conversationHandlerService.initialize(
                conversationWith,
                conversationWithFullname,
                loggedUser,
                tenant,
                translationMap
            );

            this.logger.debug('[APP-COMP] DETTAGLIO CONV - NEW handler **************', conversationHandlerService);
            this.chatManager.addConversationHandler(conversationHandlerService);
            handler = conversationHandlerService

        }

        return handler
    }

    /** */
    // private endMessageRender() {
    //     this.obsEndRenderMessage.next();
    // }

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
        this.logger.debug('[APP-COMP] sendMessage from window.tiledesk *********** ',tenant,senderId,senderFullname,
                                msg,type,metadata,conversationWith,recipientFullname,
                                attributes,projectid,channel_type);
        const messageSent = this.initConversationHandler(conversationWith).sendMessage(
            msg,
            type,
            metadata,
            conversationWith,
            recipientFullname,
            senderId,
            senderFullname,
            channel_type,
            attributes)
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
        // sendMessage(senderFullname, msg, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type)
    }


    /**
     * Custom Auth called from the test-custom-auth.html
     * note: https://tiledesk.atlassian.net/browse/TD-42?atlOrigin=eyJpIjoiMGMyZmVmNDgzNTFjNGZkZjhiMmM2Y2U1MmYyNzkwODMiLCJwIjoiaiJ9
    */
    private signInWithCustomToken(token: string) {
        const that = this;
        this.tiledeskAuthService.signInWithCustomToken(token).then((user: UserModel) => {
            this.messagingAuthService.createCustomToken(token)
            this.logger.debug('[APP-COMP] signInWithCustomToken user::', user)
            //check if tiledesk_userFullname exist (passed from URL or tiledeskSettings) before update userFullname parameter
            //if tiledesk_userFullname not exist--> update parameter with tiledesk user returned from auth
            if ((user.firstname || user.lastname) && !this.g.userFullname) {
                const fullName = user.firstname + ' ' + user.lastname;
                this.g.setParameter('userFullname', fullName);
                this.g.setAttributeParameter('userFullname', fullName);
            }
            //check if tiledesk_userEmail exist (passed from URL or tiledeskSettings) before update userEmail parameter
            //if tiledesk_userEmail not exist--> update parameter with tiledesk user returned from auth
            if (user.email && !this.g.userEmail) {
                this.g.setParameter('userEmail', user.email);
                this.g.setAttributeParameter('userEmail', user.email);
            }
            // this.showWidget()
        }).catch(error => {
            this.logger.debug('[APP-COMP] signInWithCustomToken ERR ',error);
            that.signOut();
        });
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
        this.logger.debug('[APP-COMP] signInAnonymous');
        this.tiledeskAuthService.signInAnonymously(this.g.projectid).then((tiledeskToken) => {
            this.messagingAuthService.createCustomToken(tiledeskToken)
            const user = this.tiledeskAuthService.getCurrentUser();
            if (user.firstname || user.lastname) {
                const fullName = user.firstname + ' ' + user.lastname;
                this.g.setParameter('userFullname', fullName);
                this.g.setAttributeParameter('userFullname', fullName);
            }
            if (user.email) {
                this.g.setParameter('userEmail', user.email);
                this.g.setAttributeParameter('userEmail', user.email);
            }
        });
        // this.authService.anonymousAuthentication();
        // this.authService.authenticateFirebaseAnonymously();
    }

    /** */
    private setPreChatForm(state: boolean) {
        if (state != null) {
            this.g.setParameter('preChatForm', state);
            if (state === true) {
                this.appStorageService.setItem('preChatForm', state);
            } else {
                this.appStorageService.removeItem('preChatForm');
            }
        }
    }

    private setPreChatFormJson(form: Array<any>) {
        if(form){
            this.g.setParameter('preChatFormJson', form);
        }
    }

    private getPreChatFormJson() {
        let preChatForm = {}
        if(this.g.preChatFormJson){
            preChatForm = this.g.preChatFormJson
        }
        console.log('prechatformmm', preChatForm)
        return preChatForm
    }

    private setPrivacyPolicy() {
        this.g.privacyApproved = true;
        this.g.setAttributeParameter('privacyApproved', this.g.privacyApproved);
        this.appStorageService.setItem('attributes', JSON.stringify(this.g.attributes));
        this.g.setParameter('preChatForm', false);
        this.appStorageService.removeItem('preChatForm');
    }

    /** show widget */
    private showWidget() {
        this.logger.debug('[APP-COMP] show widget--> autoStart:', this.g.autoStart, 'startHidden', this.g.startHidden, 'isShown', this.g.isShown)
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
        this.logger.debug('[APP-COMP] f21_open senderId: ', senderId);
        if (senderId) {
            // chiudo callout
            this.g.setParameter('displayEyeCatcherCard', 'none');
            // this.g.isOpen = true; // !this.isOpen;
            this.g.setIsOpen(true);
            this.isInitialized = true;
            this.appStorageService.setItem('isOpen', 'true');
            // this.g.displayEyeCatcherCard = 'none';
            this.triggerOnOpenEvent();
            // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
        }
    }

    /** close popup conversation */
    private f21_close() {
        this.g.setIsOpen(false);
        this.g.isOpenNewMessage = false;
        this.appStorageService.setItem('isOpen', 'false');
        this.triggerOnCloseEvent();
    }

    /**open widget in conversation when is closed */
    private _f21_open() {
        // const senderId = this.g.senderId;
        // this.logger.debug('[APP-COMP] f21_open senderId' , senderId) 
        // this.logger.printDebug()
        // this.g.wdLog(['f21_open senderId: ', senderId]);
        // if (senderId) {
        // chiudo callout
        this.g.setParameter('displayEyeCatcherCard', 'none');
        // this.g.isOpen = true; // !this.isOpen;
        this.g.setIsOpen(true);
        // this.isInitialized = true;
        this.appStorageService.setItem('isOpen', 'true');
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
        if (!this.tiledeskAuthService.getCurrentUser()) {
            this.logger.debug('[APP-COMP] reInit ma NON SONO LOGGATO!');
        } else {
            this.tiledeskAuthService.logOut();
            this.messagingAuthService.logout();
            // this.authService.signOut(-2);
            /** ho fatto un reinit */
            this.logger.debug('[APP-COMP] sono nel caso reinit -2');
            this.g.setParameter('isLogged', false);
            this.hideWidget();
            // that.g.setParameter('isShown', false, true);
            this.appStorageService.removeItem('tiledeskToken');
            this.g.isLogout = true;
            if (this.g.autoStart !== false) {
                this.authenticate();
                this.initAll();
            }
            this.appStorageService.clear();
        }
        const divWidgetRoot = this.g.windowContext.document.getElementsByTagName('chat-root')[0];
        const divWidgetContainer = this.g.windowContext.document.getElementById('tiledesk-container');
        divWidgetContainer.remove();
        divWidgetRoot.remove();
        this.g.windowContext.initWidget();
    }

    /**
     * 1 - cleare local storage
     * 2 - remove div iframe widget
     * 3 - reinit widget
    */
   private restart() {
    // if (!firebase.auth().currentUser) {
    
    this.hideWidget();
    // that.triggerOnAuthStateChanged(resp);
    if (this.g.autoStart !== false) {
        this.authenticate();
        this.initAll();
    }
    const divWidgetRoot = this.g.windowContext.document.getElementsByTagName('chat-root')[0];
    const divWidgetContainer = this.g.windowContext.document.getElementById('tiledesk-container');
    divWidgetContainer.remove();
    divWidgetRoot.remove();
    this.g.windowContext.initWidget();
}


    // private reInit_old() {
    //     // this.isOpenHome = false;
    //     this.appStorageService.clear();
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
            // this.g.setParameter('calloutTimer', 1)
            this.eyeeyeCatcherCardComponent.openEyeCatcher();
            this.g.setParameter('displayEyeCatcherCard', 'block');
            this.triggerOnOpenEyeCatcherEvent();
        }
    }

    // ========= end:: COMPONENT TO WINDOW ============//



    // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
    /** elimino tutte le sottoscrizioni */
    ngOnDestroy() {
        this.logger.debug('[APP-COMP] this.subscriptions', this.subscriptions);
        const windowContext = this.g.windowContext;
        if (windowContext && windowContext['tiledesk']) {
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
        this.logger.debug('[APP-COMP] this.subscriptions', this.subscriptions);
    }
    // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//



    // ========= begin:: FUNCTIONS ============//
    /**
     * 1 - clear local storage
     * 2 - remove user in firebase
    */
    signOut() {
        this.logger.debug('[APP-COMP] SIGNOUT');
        if (this.g.isLogged === true) {
            this.g.wdLog(['prima ero loggato allora mi sloggo!']);
            this.g.setIsOpen(false);
            // this.g.setAttributeParameter('userFullname', null);
            // this.g.setAttributeParameter('userEmail', null);
            // this.g.setParameter('userFullname', null);
            // this.g.setParameter('userEmail', null);
            this.appStorageService.clear();
            this.presenceService.removePresence();
            this.tiledeskAuthService.logOut();
            this.messagingAuthService.logout();
            // this.authService.signOut(-2);
        }
    }

    /**
     * get status window chat from this.appStorageService
     * set status window chat open/close
     */
    // SET IN LOCAL SETTINGS setVariableFromStorage IMPOSTA IL VALORE DI TUTTE LE VARIABILI
    // setIsWidgetOpenOrActive() {
    //     if (this.appStorageService.getItem('isOpen') === 'true') {
    //         // this.g.isOpen = true;
    //         this.g.setIsOpen(true);
    //     } else if (this.appStorageService.getItem('isOpen') === 'false') {
    //         // this.g.isOpen = false;
    //         this.g.setIsOpen(false);
    //     }
    //     // this.isWidgetActive = (this.appStorageService.getItem('isWidgetActive')) ? true : false;
    // }

    /**
     * attivo sound se è un msg nuovo
     */
    private soundMessage() {
        this.logger.debug('[APP-COMP] ****** soundMessage *****', this.audio);
        const that = this;
        const soundEnabled = this.g.soundEnabled;
        if (soundEnabled) {
            this.audio.pause();
            this.audio.currentTime = 0;
            clearTimeout(this.setTimeoutSound);
            this.setTimeoutSound = setTimeout(() => {
                that.audio.play().then(() => {
                    this.logger.debug('[APP-COMP] ****** soundMessage played *****');
                }).catch((error: any) => {
                    this.logger.debug('[APP-COMP] ***soundMessage error*', error);
                });
            }, 1000);
        }
    }

    // soundMessage() {
    //     const soundEnabled = this.g.soundEnabled;
    //     const baseLocation = this.g.baseLocation;
    //     if (soundEnabled) {
    //       const that = this;
    //       this.audio = new Audio();
    //       this.audio.src = baseLocation + '/assets/sounds/justsaying.mp3';
    //       this.audio.load();
    //       // this.logger.debug('[APP-COMP] conversation play');
    //       clearTimeout(this.setTimeoutSound);
    //       this.setTimeoutSound = setTimeout(function () {
    //         that.audio.play();
    //         that.g.wdLog(['****** soundMessage 1 *****', that.audio.src]);
    //       }, 1000);
    //     }
    // }


    /**
     * genero un nuovo conversationWith
     * al login o all'apertura di una nuova conversazione
     */
    generateNewUidConversation() {
        this.logger.debug('[APP-COMP] generateUidConversation **************: senderId= ', this.g.senderId);
        return UID_SUPPORT_GROUP_MESSAGES + this.g.projectid + '-' + uuidv4().replace(/-/g, '');
        // return UID_SUPPORT_GROUP_MESSAGES + uuidv4(); >>>>>OLD 
    }

    /**
     * premendo sul pulsante 'APRI UNA NW CONVERSAZIONE'
     * attivo una nuova conversazione
     */
    startNewConversation() {
        this.logger.debug('[APP-COMP] AppComponent::startNwConversation');
        const newConvId = this.generateNewUidConversation();
        this.g.setParameter('recipientId', newConvId);
        this.appStorageService.setItem('recipientId', newConvId)
        this.logger.debug('[APP-COMP]  recipientId: ', this.g.recipientId);
        this.isConversationArchived = false;
        this.triggerNewConversationEvent(newConvId);
    }

    // ========= end:: FUNCTIONS ============//




    // ========= begin:: CALLBACK FUNCTIONS ============//
    /**
     * MOBILE VERSION:
     * onClick button close widget
     */
    onCloseWidget() {
        this.isOpenConversation = false;
        let badgeNewConverstionNumber = this.conversationsHandlerService.countIsNew()
        this.g.setParameter('conversationsBadge', badgeNewConverstionNumber);
        this.logger.debug('[APP-COMP] widgetclosed:::', this.g.conversationsBadge, this.conversationsHandlerService.countIsNew())
        // this.g.isOpen = false;
        // this.g.setIsOpen(false);
        this.f21_close();
    }

    onSoundChange(soundEnabled) {
        this.g.setParameter('soundEnabled', soundEnabled);
    }

    /**
     * LAUNCHER BUTTON:
     * onClick button open/close widget
     */
    onOpenCloseWidget($event) {
        this.g.setParameter('displayEyeCatcherCard', 'none');
        // const conversationActive: ConversationModel = JSON.parse(this.appStorageService.getItem('activeConversation'));
        const recipientId : string = this.appStorageService.getItem('recipientId')
        this.logger.debug('[APP-COMP] openCloseWidget', recipientId, this.g.isOpen, this.g.startFromHome);
        if (this.g.isOpen === true) {
            if (!recipientId) {
                if (this.g.startFromHome) {
                    this.isOpenHome = true;
                    this.isOpenConversation = false;
                } else {
                    this.isOpenHome = false;
                    this.isOpenConversation = true;
                    this.onNewConversation()
                    // this.startNwConversation();
                }
            } else { //conversation is present in localstorage
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
    onDepartmentSelected($event) {
        if ($event) {
            this.logger.debug('[APP-COMP] onSelectDepartment: ', $event);
            this.g.setParameter('departmentSelected', $event);
            // this.settingsSaverService.setVariable('departmentSelected', $event);
            this.isOpenHome = true;
            this.isOpenSelectionDepartment = false;
            if (this.g.isOpenPrechatForm === false && this.isOpenSelectionDepartment === false) {
                this.isOpenConversation = true;
                this.startNewConversation();
            }
        }
    }

    /**
     * MODAL SELECTION DEPARTMENT:
     * close modal
     */
    onCloseModalDepartment() {
        this.logger.debug('[APP-COMP] returnCloseModalDepartment');
        this.isOpenHome = true;
        this.isOpenSelectionDepartment = false;
        this.isOpenConversation = false;
    }


    /**
     * MODAL PRECHATFORM:
     * completed prechatform
     */
    onPrechatFormComplete() {
        this.logger.debug('[APP-COMP] onPrechatFormComplete');
        this.isOpenHome = true;
        this.g.setParameter('isOpenPrechatForm', false);
        if (this.g.isOpenPrechatForm === false && this.isOpenSelectionDepartment === false) {
            this.isOpenConversation = true;
            this.startNewConversation();
        }
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
    }

    /**
     * MODAL PRECHATFORM:
     * close modal
     */
    onCloseModalPrechatForm() {
        this.logger.debug('[APP-COMP] onCloseModalPrechatForm');
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
     * return conversation selected from chat-last-message output event
     */
    public onSelectedConversation($event: ConversationModel) {
        if ($event) {
            if (this.g.isOpen === false) {
                //this.f21_open();
                this._f21_open()
            }
            // this.conversationSelected = $event;
            this.g.setParameter('recipientId', $event.recipient);
            this.appStorageService.setItem('recipientId', $event.recipient)
            this.isOpenConversation = true;
            $event.archived? this.isConversationArchived = $event.archived : this.isConversationArchived = false;
            this.logger.debug('[APP-COMP] onSelectConversation in APP COMPONENT: ', $event);
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
    onNewConversation() {
        this.logger.debug('[APP-COMP] returnNewConversation in APP COMPONENT');
        this.g.newConversationStart = true;
        // controllo i dipartimenti se sono 1 o 2 seleziono dipartimento e nascondo modale dipartimento
        // altrimenti mostro modale dipartimenti
        const preChatForm = this.g.preChatForm;
        const attributes = this.g.attributes;
        const departments = this.g.departments;
        // that.g.wdLog(['departments: ', departments, departments.length);
        this.logger.debug('[APP-COMP] attributesssss', this.g.attributes, this.g.preChatForm)
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

        this.logger.debug('[APP-COMP] isOpenPrechatForm', this.g.isOpenPrechatForm, ' isOpenSelectionDepartment:', this.isOpenSelectionDepartment);
        if (this.g.isOpenPrechatForm === false && this.isOpenSelectionDepartment === false) {
            this.startNewConversation();
        }
    }

    /**
     * MODAL HOME:
     * open all-conversation
     */
    onOpenAllConversation() {
        this.isOpenHome = true;
        this.isOpenConversation = false;
        this.isOpenAllConversation = true;
    }

    /**
     * MODAL EYE CATCHER CARD:
     * open chat
     */
    onOpenChatEyeEyeCatcherCard() {
        this.f21_open();
    }

    /**
     * MODAL EYE CATCHER CARD:
     * close button
     */
    onCloseEyeCatcherCard($e) {
        if ($e === true) {
            this.triggerOnOpenEyeCatcherEvent();
        } else {
            this.triggerOnClosedEyeCatcherEvent();
        }
    }

    /**
     * MODAL CONVERSATION:
     * close conversation
     */
    onCloseConversation() {
        this.logger.debug('[APP-COMP] onCloseConversation')
        this.appStorageService.removeItem('recipientId');
        this.g.setParameter('recipientId', null, false)
        // this.g.setParameter('activeConversation', null, false);
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
    onCloseAllConversation() {
        this.logger.debug('[APP-COMP] Close all conversation');
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

    onImageLoaded(conversation: ConversationModel) {
        this.logger.debug('[APP-COMP] onLoadImage convvvv:::', conversation)
        conversation.image = this.imageRepoService.getImagePhotoUrl(conversation.sender)
    }

    onConversationLoaded(conversation: ConversationModel) {
        this.logger.debug('[APP-COMP] onConversationLoaded convvvv:::', conversation)
        const keys = ['YOU', 'SENT_AN_IMAGE', 'SENT_AN_ATTACHMENT'];
        const translationMap = this.translateService.translateLanguage(keys);
        if(conversation.sender === this.g.senderId){
            if (conversation.type === "image") {

                this.logger.log('[CONVS-LIST-PAGE] HAS SENT AN IMAGE');
                const SENT_AN_IMAGE = conversation['last_message_text'] = translationMap.get('SENT_AN_IMAGE')
                conversation.last_message_text = SENT_AN_IMAGE;
      
            // } else if (conversation.type !== "image" && conversation.type !== "text") {
            } else if (conversation.type === 'file') {
                this.logger.log('[CONVS-LIST-PAGE] HAS SENT FILE')
                const SENT_AN_ATTACHMENT = conversation['last_message_text'] = translationMap.get('SENT_AN_ATTACHMENT')
                conversation.last_message_text =  SENT_AN_ATTACHMENT;
            }
        } else {
            if (conversation.type === "image") {

                this.logger.log('[CONVS-LIST-PAGE] HAS SENT AN IMAGE');
                const SENT_AN_IMAGE = conversation['last_message_text'] = translationMap.get('SENT_AN_IMAGE')
                conversation.last_message_text = SENT_AN_IMAGE;
      
            // } else if (conversation.type !== "image" && conversation.type !== "text") {
            } else if (conversation.type === 'file') {
                this.logger.log('[CONVS-LIST-PAGE] HAS SENT FILE')
                const SENT_AN_ATTACHMENT = conversation['last_message_text'] = translationMap.get('SENT_AN_ATTACHMENT')
                conversation.last_message_text =  SENT_AN_ATTACHMENT;
            }
        }
    }

    /**
     * MODAL MENU SETTINGS:
     * logout
     */
    onSignOut() {
        this.signOut();
    }

    /**
     * MODAL RATING WIDGET:
     * close modal page
     */
    onCloseModalRateChat() {
        this.isOpenHome = true;
        this.g.setParameter('isOpenPrechatForm', false);
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
        this.isOpenConversation = false;
        this.isOpenSelectionDepartment = false;
        this.g.setParameter('isOpenStartRating', false);
        // this.settingsSaverService.setVariable('isOpenStartRating', false);
        // this.startNwConversation();
        this.onCloseConversation();
    }

    /**
     * MODAL RATING WIDGET:
     * complete rate chat
     */
    onRateChatComplete() {
        this.isOpenHome = true;
        this.g.setParameter('isOpenPrechatForm', false);
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
        this.isOpenConversation = false;
        this.isOpenSelectionDepartment = false;
        this.g.setParameter('isOpenStartRating', false);
        // this.settingsSaverService.setVariable('isOpenStartRating', false);
        // this.startNwConversation();
        this.onCloseConversation();
    }
    // ========= end:: CALLBACK FUNCTIONS ============//



    // ========= START:: TRIGGER FUNCTIONS ============//
    private triggerOnViewInit() {
        const detailOBJ = { global: this.g, default_settings: this.g.default_settings, appConfigs: this.appConfigService.getConfig() }
        this.triggerHandler.triggerOnViewInit(detailOBJ)
    }

    private triggerOnOpenEvent() {
        const detailOBJ = { default_settings: this.g.default_settings }
        this.triggerHandler.triggerOnOpenEvent(detailOBJ)
    }
    private triggerOnCloseEvent() {
        const detailOBJ = { default_settings: this.g.default_settings }
        this.triggerHandler.triggerOnCloseEvent(detailOBJ)
    }

    private triggerOnOpenEyeCatcherEvent() {
        const detailOBJ = { default_settings: this.g.default_settings }
        this.triggerHandler.triggerOnOpenEyeCatcherEvent(detailOBJ)
    }

    private triggerOnClosedEyeCatcherEvent() {
        this.triggerHandler.triggerOnClosedEyeCatcherEvent()
    }

    /** */
    // private triggerOnLoggedIn() {
    //     const detailOBJ = { user_id: this.g.senderId, global: this.g, default_settings: this.g.default_settings, appConfigs: this.appConfigService.getConfig() }
    //     this.triggerHandler.triggerOnOpenEvent(detailOBJ)
    // }

    /** */
    // private triggerOnLoggedOut() {
    //     const detailOBJ = { isLogged: this.g.isLogged, global: this.g, default_settings: this.g.default_settings, appConfigs: this.appConfigService.getConfig() }
    //     this.triggerHandler.triggerOnLoggedOut(detailOBJ)
    // }

    /** */
    private triggerOnAuthStateChanged(event) {
        const detailOBJ = { event: event, isLogged: this.g.isLogged, user_id: this.g.senderId, global: this.g, default_settings: this.g.default_settings, appConfigs: this.appConfigService.getConfig() }
        this.triggerHandler.triggerOnAuthStateChanged(detailOBJ)
    }

    private triggerNewConversationEvent(newConvId) {
        const detailOBJ = { global: this.g, default_settings: this.g.default_settings, newConvId: newConvId, appConfigs: this.appConfigService.getConfig() }
        this.triggerHandler.triggerNewConversationEvent(detailOBJ)
    }

    /** */
    private triggerLoadParamsEvent() {
        const detailOBJ = { default_settings: this.g.default_settings }
        this.triggerHandler.triggerLoadParamsEvent(detailOBJ)
    }

    /** */
    private triggerOnConversationUpdated(conversation: ConversationModel) {
        this.triggerHandler.triggerOnConversationUpdated(conversation)
    }

    /** */
    private triggerOnCloseMessagePreview() {
        this.triggerHandler.triggerOnCloseMessagePreview();
    }

    // ========= END:: TRIGGER FUNCTIONS ============//

    // setSound() {
    //     if (this.appStorageService.getItem('soundEnabled')) {
    //         this.g.setParameter('soundEnabled', this.appStorageService.getItem('soundEnabled'));
    //         // this.settingsSaverService.setVariable('soundEnabled', this.appStorageService.getItem('soundEnabled'));
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

    private setStyleMap() {
        this.styleMapConversation.set('backgroundColor', this.g.colorBck)
        this.styleMapConversation.set('foregroundColor', this.g.themeForegroundColor)
        this.styleMapConversation.set('themeColor', this.g.themeColor)
        this.styleMapConversation.set('colorGradient', this.g.colorGradient180)

    }


}
