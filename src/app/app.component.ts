import { ElementRef, Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewEncapsulation } from '@angular/core';
// import * as moment from 'moment';
import * as moment from 'moment/moment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// https://www.davebennett.tech/subscribe-to-variable-change-in-angular-4-service/
import 'rxjs/add/operator/takeWhile';
import { Subscription } from 'rxjs/Subscription';

// services
import { Globals } from './utils/globals';


// import { AuthService } from './core/auth.service';
import { AuthService } from './providers/auth.service';
import { MessagingService } from './providers/messaging.service';
import { ContactService } from './providers/contact.service';
import { StorageService } from './providers/storage.service';
import { TranslatorService } from './providers/translator.service';
import { ChatPresenceHandlerService } from './providers/chat-presence-handler.service';
import { AgentAvailabilityService } from './providers/agent-availability.service';
import * as firebase from 'firebase';
import { environment } from '../environments/environment';


// utils
// tslint:disable-next-line:max-line-length
import { wdLog, getImageUrlThumb, strip_tags, isPopupUrl, popupUrl, detectIfIsMobile, setLanguage, supports_html5_storage } from './utils/utils';
import { ConversationModel } from '../models/conversation';
import { AppConfigService } from './providers/app-config.service';


import { LocalSettingsService } from './providers/local-settings.service';
import { SettingsSaverService } from './providers/settings-saver.service';

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


    // ========= begin:: DA SPOSTARE ======= //
    // ????????//
    IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
    // private aliveSubLoggedUser = true; /** ????? */
    // THERE ARE TWO 'CARD CLOSE BUTTONS' THAT ARE DISPLAYED ON THE BASIS OF PLATFORM
    // isMobile: boolean;
    // ========= end:: DA SPOSTARE ========= //

    constructor(
        private el: ElementRef,
        private ngZone: NgZone,
        public g: Globals,
        public translatorService: TranslatorService,
        public authService: AuthService,
        public messagingService: MessagingService,
        public contactService: ContactService,
        public chatPresenceHandlerService: ChatPresenceHandlerService,
        private agentAvailabilityService: AgentAvailabilityService,
        private storageService: StorageService,
        public appConfigService: AppConfigService,
        public localSettingsService: LocalSettingsService,
        public settingsSaverService: SettingsSaverService
    ) {
        // firebase.initializeApp(environment.firebase);  // here shows the error
        // console.log('appConfigService.getConfig().firebase', appConfigService.getConfig().firebase);
        firebase.initializeApp(appConfigService.getConfig().firebase);  // here shows the error
        this.obsEndRenderMessage = new BehaviorSubject(null);
    }


    /**
     * 1 - init
     * 2 - auth
     * 3 - start
     */
    ngOnInit() {
        this.initAll();
        const supportMode = this.g.supportMode;
        if (supportMode) {
            this.getMongDbDepartments();
        }
        this.setLoginSubscription();
        // this.triggerOnInit();
        wdLog(' ---------------- A4 ---------------- ');
    }

    private triggerOnViewInit() {
        const default_settings = this.g.default_settings;
        const windowContext = this.g.windowContext;
        wdLog([' ---------------- triggerOnInit ---------------- ', default_settings]);
        const onInit = new CustomEvent('onInit', { detail: { default_settings: default_settings } });
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onInit);
        } else {
            this.el.nativeElement.dispatchEvent(onInit);
        }
    }


    /**
     *
     */
    setLoginSubscription() {
        // this.setSubscriptions();
        const that = this;
        /**
         * GET CURRENT USER
         * recupero il current user se esiste
         * https://forum.ionicframework.com/t/firebase-auth-currentuser-shows-me-null-but-it-logged-in/68411/4
        */
        this.authService.onAuthStateChanged();
        /**
         * SUBSCRIBE TO ASINC LOGIN FUNCTION
         */
        const obsLoggedUser = this.authService.obsLoggedUser.subscribe((user) => {
            this.ngZone.run(() => {
                const autoStart = that.g.autoStart;
                if (user === -1) {
                    /** ho effettuato il logout: nascondo il widget */
                    that.g.setParameters('isLogged', false);
                    that.g.setParameters('isShown', false);
                    wdLog(['LOGOUT : ', user]);
                    that.triggeisLoggedInEvent();
                } else if (user === 0) {
                    /** non sono loggato */
                    // that.g.isLogged = false;
                    that.g.setParameters('isLogged', false);
                    // that.settingsSaverService.setVariable('isLogged', false);
                    wdLog(['NO CURRENT USER AUTENTICATE: ', user]);
                    if (autoStart === true) {
                        that.setAuthentication();
                    }
                    that.triggeisLoggedInEvent();
                } else if (user) {
                    /** sono loggato */
                    wdLog(['USER AUTENTICATE: ', user.uid]);
                    that.g.setParameters('senderId', user.uid);
                    that.g.setParameters('isLogged', true);
                    that.g.setParameters('attributes', that.setAttributesFromStorageService());

                    wdLog([' this.g.senderId', user.uid]);
                    // that.openIfCallOutTimer();
                    that.startNwConversation();
                    that.startUI();
                    that.triggeisLoggedInEvent();
                    wdLog([' 1 - IMPOSTO STATO CONNESSO UTENTE ']);
                    that.chatPresenceHandlerService.setupMyPresence(user.uid);
                }
            });
        });
        this.subscriptions.push(obsLoggedUser);
    }

    /**
     * INITIALIZE:
     * 1 - set LANG
     * 2 - set MOBILE
     * 3 - add Component to Window
     * 4 - trigget Load Params Event
     * 5 - set Is Widget Open Or Active
     * 6 - get MongDb Departments
     * 7 - set isInitialized and enable principal button
     */
    private initAll() {
        // ------------------------------- //
        /**
        * SETTING LOCAL DEFAULT:
        */
        this.g.initDefafultParameters();
        // ------------------------------- //


        // ------------------------------- //
        /**
         * LOCAL SETTINGS:
         * 1 - setVariablesFromSettings
         * 2 - setVariableFromUrlParameters
         * 3 - setVariableFromlocalstorage
        */
        this.localSettingsService.load(this.g, this.el);
        // ------------------------------- //

        // ------------------------------- //
        /**
         * TRANSLATION LOADER:
        */
       this.translatorService.translate(this.g);
       // ------------------------------- //

        // ------------------------------- //
        /**
         * SUBSCRIPTION :
         *
        */
       this.settingsSaverService.initialize();
        // ------------------------------- //


        // // ------------------------------- //
        // // set lang and in global variables
        // wdLog([' ---------------- SET LANG ---------------- ']);
        // console.log('lang: ', this.g.windowContext, this.translatorService);
        // this.g.lang = setLanguage(this.g.windowContext, this.translatorService);
        // console.log('lang: ', this.g.lang);
        // moment.locale(this.g.lang);
        // wdLog([' lang: ', this.g.lang]);


        this.g.initialize(this.el);

        const windowContext = this.g.windowContext;
        this.g.setParameters('isMobile', detectIfIsMobile(windowContext));
        // this.settingsSaverService.setVariable('isMobile', detectIfIsMobile(windowContext));

        // Related to https://github.com/firebase/angularfire/issues/970
        if (supports_html5_storage()) {
            localStorage.removeItem('firebase:previous_websocket_failure');
        }
        wdLog([' ---------------- CONSTRUCTOR ---------------- ']);
        this.g.setParameters('attributes', this.setAttributesFromStorageService());
        // this.settingsSaverService.setVariable('attributes', this.setAttributesFromStorageService());
        // this.setSound();

        wdLog([' ---------------- A3 ---------------- ']);
        this.setIsWidgetOpenOrActive();

        this.triggerLoadParamsEvent();
        wdLog([' ---------------- A2 ---------------- ']);


        wdLog([' ---------------- A0 ---------------- ']);

        this.addComponentToWindow(this.ngZone);
        wdLog([' ---------------- A1 ---------------- ']);


        // this.startNwConversation();

        /** mostro il pulsante principale dopo l'init */
        this.isInitialized = true;
        this.marginBottom = +this.g.marginY + 70;
        this.chatPresenceHandlerService.initialize();
        wdLog([' ---------------- B1: setAvailableAgentsStatus ---------------- ']);

        if (this.g.supportMode) {
            this.setAvailableAgentsStatus();
        }

        // da spostare!!
        const TEMP = this.storageService.getItem('preChatForm');
        wdLog([' ---------------- TEMP:', TEMP]);
        if (TEMP !== undefined && TEMP !== null) {
            this.g.setParameters('preChatForm', TEMP);
            // this.settingsSaverService.setVariable('preChatForm', TEMP);
        }
        wdLog([' ---------------- this.g.preChatForm:', this.g.preChatForm]);

    }

    // setSound() {
    //     if (this.storageService.getItem('isSoundActive')) {
    //         this.g.setParameters('isSoundActive', this.storageService.getItem('isSoundActive'));
    //         // this.settingsSaverService.setVariable('isSoundActive', this.storageService.getItem('isSoundActive'));
    //       }
    // }


/**
   * 9: setAttributes
   */
  private setAttributesFromStorageService(): any {
    const CLIENT_BROWSER = navigator.userAgent;
    const projectid = this.g.projectid;
    const userEmail = this.g.userEmail;
    const userFullname = this.g.userFullname;
    const senderId = this.g.senderId;
    let attributes: any = JSON.parse(this.storageService.getItem('attributes'));
    if (!attributes || attributes === 'undefined') {
      attributes = {
        client: CLIENT_BROWSER,
        sourcePage: location.href,
        projectId: projectid
      };
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
    this.storageService.setItem('attributes', JSON.stringify(attributes));
    // wdLog([' ---------------- setAttributes ---------------- ', attributes]);
    console.log(' ---------------- setAttributes ---------------- ', attributes);
    return attributes;
  }

    /**
   * mi sottoscrivo al nodo /projects/' + projectId + '/users/availables
   * per verificare se c'è un agent disponibile
   */
  private setAvailableAgentsStatus() {
    const that = this;
    const projectid = this.g.projectid;
    this.agentAvailabilityService
    .getAvailableAgents(projectid)
    .subscribe( (availableAgents) => {
      wdLog(['availableAgents->', availableAgents]);
      if (availableAgents.length <= 0) {
        that.g.setParameters('areAgentsAvailable', false);
        that.g.setParameters('areAgentsAvailableText', that.g.AGENT_NOT_AVAILABLE);
        // that.settingsSaverService.setVariable('areAgentsAvailable', false);
        // that.settingsSaverService.setVariable('areAgentsAvailableText', that.g.AGENT_NOT_AVAILABLE);
      } else {
        that.g.setParameters('areAgentsAvailable', true);
        that.g.setParameters('areAgentsAvailableText', that.g.AGENT_AVAILABLE);
        // that.settingsSaverService.setVariable('areAgentsAvailable', true);
        // that.settingsSaverService.setVariable('areAgentsAvailableText', that.g.AGENT_AVAILABLE);
        // add first message
        that.g.setParameters('availableAgents', availableAgents);
        // that.settingsSaverService.setVariable('availableAgents', availableAgents);
        availableAgents.forEach(element => {
            // that.setProfileImage(element);
            element.imageurl = getImageUrlThumb(element.id);
        });
        // that.addFirstMessage(that.g.LABEL_FIRST_MSG);
      }
        that.g.setParameters('availableAgentsStatus', true);
        // that.settingsSaverService.setVariable('availableAgentsStatus', true);
    }, (error) => {
      console.error('setOnlineStatus::setAvailableAgentsStatus', error);
    }, () => {
    });
  }

//   /**
//    * carico url immagine profilo passando id utente
//    */
//   setProfileImage(contact) {
//     const that = this;
//     // console.log(' ********* displayImage::: ');
//     this.contactService.profileImage(contact.id, 'thumb')
//     .then((url) => {
//         contact.imageurl = url;
//     })
//     .catch((error) => {
//       // console.log("displayImage error::: ",error);
//     });
//   }

    // ========= begin:: GET DEPARTEMENTS ============//
    /**
     * recupero elenco dipartimenti
     * - mi sottoscrivo al servizio
     * - se c'è un solo dipartimento la setto di default
     * - altrimenti visualizzo la schermata di selezione del dipartimento
    */
    getMongDbDepartments() {
        const that = this;
        const projectid = this.g.projectid;
        wdLog(['getMongDbDepartments ::::', projectid]);
        this.messagingService.getMongDbDepartments(projectid)
        .subscribe(response => {
            wdLog(['response DEP ::::', response]);
            that.g.setParameters('departments', response);
            that.initDepartments();
        },
        errMsg => {
             wdLog(['http ERROR MESSAGE', errMsg]);
        },
        () => {
             wdLog(['API ERROR NESSUNO']);
        });
    }

    /**
     * INIT DEPARTMENT:
     * get departments list
     * set department default
     * CALL AUTHENTICATION
    */
    initDepartments() {
        const departments = this.g.departments;
        this.g.setParameters('departmentSelected', null);
        this.g.setParameters('departmentDefault', null);
        wdLog(['SET DEPARTMENT DEFAULT ::::', departments[0]]);
        this.setDepartment(departments[0]);
        let i = 0;
        departments.forEach(department => {
            if (department['default'] === true) {
                this.g.setParameters('departmentDefault', department);
                departments.splice(i, 1);
                return;
            }
            i++;
        });
        if (departments.length === 1) {
            // UN SOLO DEPARTMENT
            wdLog(['DEPARTMENT FIRST ::::', departments[0]]);
            this.setDepartment(departments[0]);
            // return false;
        } else if (departments.length > 1) {
            // CI SONO + DI 2 DIPARTIMENTI
            wdLog(['CI SONO + DI 2 DIPARTIMENTI ::::', departments[0]]);
        } else {
            // DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI !!!!
            wdLog(['DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI ::::', departments[0]]);
        }

        /********** LOGIN  ***********/
        // vedi init -> this.setLoginSubscription();
    }

    /**
     * SET DEPARTMENT:
     * set department selected
     * save department selected in attributes
     * save attributes in this.storageService
    */
    setDepartment(department) {
        this.g.setParameters('departmentSelected', department);
        const attributes = this.g.attributes;
        if (department && attributes) {
            attributes.departmentId = department._id;
            attributes.departmentName = department.name;
            this.g.setParameters('attributes', attributes);
            this.g.setParameters('departmentSelected', department);
            wdLog(['setAttributes setDepartment: ', JSON.stringify(attributes)]);
            this.storageService.setItem('attributes', JSON.stringify(attributes));
        }
    }
    // ========= end:: GET DEPARTEMENTS ============//


    // ========= begin:: AUTHENTICATION ============//
    /**
     * SET AUTHENTICATION:
     * authenticate in chat
     */
    private setAuthentication() {
        wdLog([' ---------------- setAuthentication ---------------- ']);
        /**
         * 0 - controllo se è stato passato email e psw
         *  SI - mi autentico con email e psw
         * 1 - controllo se è stato passato userId
         *  SI - vado avanti senza autenticazione
         * 2 - controllo se esiste un token
         *  SI - sono già autenticato
         * 3 - controllo se esiste currentUser
         *  SI - sono già autenticato
         *  NO - mi autentico
         */
        // this.userEmail = 'czone555@gmail.com';
        // this.userPassword = '123456';
        // this.userId = 'LmBT2IKjMzeZ3wqyU8up8KIRB6J3';
        // tslint:disable-next-line:max-line-length
        // this.g.userToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdhMWViNTE2YWU0MTY4NTdiM2YwNzRlZDQxODkyZTY0M2MwMGYyZTUifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2hhdC12Mi1kZXYiLCJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImF1ZCI6ImNoYXQtdjItZGV2IiwiYXV0aF90aW1lIjoxNTM5OTQ4MDczLCJ1c2VyX2lkIjoid0RScm54SG0xQ01MMVhJd29MbzJqdm9lc040MiIsInN1YiI6IndEUnJueEhtMUNNTDFYSXdvTG8yanZvZXNONDIiLCJpYXQiOjE1Mzk5NDgwNzMsImV4cCI6MTUzOTk1MTY3MywiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJhbm9ueW1vdXMifX0.gNtsfv1b5LFxxqwnmJI4jnGFq7760Eu_rR2Neargs6Q3tcNge1oTf7CPjd9pJxrOAeErEX6Un_E7tjIGqKidASZH7RJwKzfWT3-GZdr7j-LR6FgBVl8FgufDGo0DcVhw9Zajik0vuFM9b2PULmSAeDeNMLAhsvPOWPJMFMGIrewTk7Im-6ncm75QH241O4KyGKPWsC5slN9lckQP4j432xVUj1ss0TYVqBpkDP9zzgekuLIvL-qFpuqGI0yLjb-SzPev2eTO-xO48wlYK_s_GYOZRwWi4SZvSA8Sw54X7HUyDvw5iXLboEJEFMU6gJJWR6YPQMa69cjQlFS8mjPG6w";
        const currentUser = this.authService.getCurrentUser();
        const userEmail = this.g.userEmail;
        const userPassword = this.g.userPassword;
        const userId = this.g.userId;
        const userToken = this.g.userToken;

        if (userEmail && userPassword) {
             wdLog([' ---------------- 10 ---------------- ']);
            // se esistono email e psw faccio un'autenticazione firebase con email
            this.authService.authenticateFirebaseWithEmailAndPassword(userEmail, userPassword);
        } else if (userId) {
            // SE PASSO LO USERID NON EFFETTUO NESSUNA AUTENTICAZIONE
            wdLog([' ---------------- 11 ---------------- ']);
            wdLog(['this.userId:: ', userId]);
            this.g.senderId = userId;
            this.g.setParameters('senderId', userId);
            this.g.setParameters('isLogged', true);
            this.g.setParameters('attributes', this.setAttributesFromStorageService());

            this.startNwConversation();
            this.startUI();
            wdLog([' 11 - IMPOSTO STATO CONNESSO UTENTE ']);
            this.chatPresenceHandlerService.setupMyPresence(userId);
        } else if (userToken) {
            // SE PASSO IL TOKEN NON EFFETTUO NESSUNA AUTENTICAZIONE
            // !!! DA TESTARE NON FUNZIONA !!! //
            wdLog([' ---------------- 12 ---------------- ']);
            wdLog(['this.g.userToken:: ', userToken]);
            this.authService.authenticateFirebaseCustomToken(userToken);
        } else if (currentUser) {
            //  SONO GIA' AUTENTICATO
            wdLog([' ---------------- 13 ---------------- ']);
            this.g.senderId = currentUser.uid;
            this.g.setParameters('senderId', currentUser.uid);
            this.g.setParameters('isLogged', this.setAttributesFromStorageService());
            this.g.setParameters('attributes', userId);
            this.startNwConversation();
            this.startUI();
             wdLog([' 13 - IMPOSTO STATO CONNESSO UTENTE ']);
            this.chatPresenceHandlerService.setupMyPresence(currentUser.uid);
        } else {
            //  AUTENTICAZIONE ANONIMA
            wdLog([' ---------------- 14 ---------------- ']);
            wdLog([' authenticateFirebaseAnonymously']);
            this.authService.authenticateFirebaseAnonymously();
        }
    }
    // ========= end:: AUTHENTICATION ============//


    // ========= begin:: START UI ============//
    /**
     * set opening priority widget
     */
    private startUI() {
        wdLog([' ============ startUI ===============']);
        const departments = this.g.departments;
        const attributes = this.g.attributes;
        const preChatForm = this.g.preChatForm;
        this.isOpenHome = true;
        this.isOpenConversation = false;
        this.g.setParameters('isOpenPrechatForm', false);
        this.isOpenSelectionDepartment = false;
        this.isOpenAllConversation = false;
        if (this.g.startFromHome) {
            this.isOpenConversation = false;
            this.g.setParameters('isOpenPrechatForm', false);
            this.isOpenSelectionDepartment = false;
        } else if (preChatForm && !attributes.userFullname && !attributes.email) {
            this.g.setParameters('isOpenPrechatForm', true);
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;
            if (departments.length > 1) {
                this.isOpenSelectionDepartment = true;
            }
        } else {
            this.g.setParameters('isOpenPrechatForm', false);
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;
            if (departments.length > 1) {
                this.isOpenSelectionDepartment = true;
            } else {
                this.isOpenConversation = true;
            }
        }

        // visualizzo l'iframe!!!
        this.triggerOnViewInit();
    }
    // ========= end:: START UI ============//


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
            windowContext['tiledesk'].signInWithCustomToken = function (token) {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.signInWithCustomToken(token);
                });
            };
            /** loggin anonymous */
            windowContext['tiledesk'].signInAnonymous = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.signInAnonymous();
                });
            };
            // window['tiledesk'].on = function (event_name, handler) {
            //      wdLog(["addEventListener for "+ event_name);
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
            // tslint:disable-next-line:max-line-length
            windowContext['tiledesk'].sendMessage = function (senderFullname, recipient, recipientFullname, text, type, channel_type, attributes) {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component
                        .sendMessage(senderFullname, recipient, recipientFullname, text, type, channel_type, attributes);
                });
            };
            /** set state PreChatForm close/open */
            windowContext['tiledesk'].endMessageRender = function () {
                ngZone.run(() => {
                    windowContext['tiledesk']['angularcomponent'].component.endMessageRender();
                });
            };

        }
    }


    endMessageRender() {
        // console.log('endMessageRender');
        this.obsEndRenderMessage.next();
    }

    private sendMessage(senderFullname, recipient, recipientFullname, text, type, channel_type, attributes) {
        // sendMessage(senderFullname, msg, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type)
        const messageSent = this.messagingService
            .sendMessage(senderFullname, text, type, '', recipient, recipientFullname, attributes, null, channel_type);
            wdLog([messageSent]);
    }
    /** */

    private signInWithCustomToken(token) {
        wdLog(['signInWithCustomToken token ', token]);
        const that = this;
        const projectid = this.g.projectid;
        this.authService.createFirebaseToken(token, projectid)
            .subscribe(response => {
                that.authService.decode(token, projectid)
                    .subscribe(resDec => {
                        const attributes = that.g.attributes;
                        const firebaseToken = response.firebaseToken;
                        wdLog(['firebaseToken', firebaseToken]);
                        wdLog(['resDec', resDec.decoded]);
                        that.g.setParameters('signInWithCustomToken', true);
                        that.g.setParameters('userEmail', resDec.decoded.email);
                        that.g.setParameters('userFullname', resDec.decoded.name);
                        that.g.setParameters('userToken', firebaseToken);

                        that.g.setParameters('signInWithCustomToken', true);
                        that.g.setParameters('signInWithCustomToken', true);
                        that.g.setParameters('signInWithCustomToken', true);

                        that.authService.authenticateFirebaseCustomToken(firebaseToken);

                        attributes.userEmail = resDec.decoded.email;
                        attributes.userFullname = resDec.decoded.name;
                        that.g.setParameters('attributes', attributes);
                        // attributes = that.setAttributesFromStorageService(); ?????????????+
                        // ????????????????????
                    }, error => {
                        console.error('Error decoding token: ', error);
                       // console.log('call signout');
                        that.signOut();
                    });
                    // , () => {
                    //     console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV * COMPLETE *');
                    // });
            }, error => {
                console.error('Error creating firebase token: ', error);
                // console.log('call signout');
                that.signOut();
            });
            // , () => {
                // console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV * COMPLETE *');
            // });
    }

    /** */
    private signInAnonymous() {
         wdLog(['signInAnonymous ']);
        this.authService.authenticateFirebaseAnonymously();
    }

    /** */
    private setPreChatForm(state: boolean) {
        if (state != null) {
            this.g.setParameters('preChatForm', state);
            if ( state === true ) {
                this.storageService.setItem('preChatForm', state);
            } else {
                this.storageService.removeItem('preChatForm');
            }
        }
    }

    /** show all widget */
    private showAllWidget() {
        this.g.setParameters('isShown', true);
    }

    /** hide all widget */
    private hideAllWidget() {
        this.g.setParameters('isShown', false);
    }

    /** open popup conversation */
    private f21_open() {
        const senderId = this.g.senderId;
        wdLog(['f21_open senderId: ', senderId]);
        if (senderId) {
            // this.g.isOpen = true; // !this.isOpen;
            this.g.setIsOpen(true);
            this.isInitialized = true;
            this.storageService.setItem('isOpen', 'true');
            // this.g.displayEyeCatcherCard = 'none';
            this.triggerOnOpenEvent();
            // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
        }
    }

    private triggerOnOpenEvent() {
        const default_settings = this.g.default_settings;
        wdLog([' ---------------- triggerOnOpenEvent ---------------- ', default_settings]);
        const onOpen = new CustomEvent('onOpen', { detail: { default_settings: default_settings } });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onOpen);
            this.g.setParameters('windowContext', windowContext);
        } else {
            this.el.nativeElement.dispatchEvent(onOpen);
        }

    }
    private triggerOnCloseEvent() {
        const default_settings = this.g.default_settings;
        wdLog([' ---------------- triggerOnCloseEvent ---------------- ', default_settings]);
        const onClose = new CustomEvent('onClose', { detail: { default_settings: default_settings } });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onClose);
            this.g.setParameters('windowContext', windowContext);
        } else {
            this.el.nativeElement.dispatchEvent(onClose);
        }

    }

    private triggerOnOpenEyeCatcherEvent() {
        const default_settings = this.g.default_settings;
        wdLog([' ---------------- triggerOnOpenEyeCatcherEvent ---------------- ', default_settings]);
        const onOpenEyeCatcher = new CustomEvent('onOpenEyeCatcher', { detail: { default_settings: default_settings } });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onOpenEyeCatcher);
            this.g.setParameters('windowContext', windowContext);
        } else {
            this.el.nativeElement.dispatchEvent(onOpenEyeCatcher);
        }
    }

    private triggerOnClosedEyeCatcherEvent() {
        wdLog([' ---------------- triggerOnClosedEyeCatcherEvent ---------------- ']);
        const onClosedEyeCatcher = new CustomEvent('onClosedEyeCatcher', { detail: { } });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onClosedEyeCatcher);
            this.g.setParameters('windowContext', windowContext);
        } else {
            this.el.nativeElement.dispatchEvent(onClosedEyeCatcher);
        }

    }



    /** close popup conversation */
    private f21_close() {
        this.g.setIsOpen(false);
        this.storageService.setItem('isOpen', 'false');
        this.triggerOnCloseEvent();
    }

    // ========= end:: COMPONENT TO WINDOW ============//



    // ============ begin: functions pass values to external ============//
    // private setSubscriptionNewMsg() {
    //     const that = this;
    //     const obsAddedMsg: Subscription = this.messagingService.obsAddedMsg
    //     .subscribe(msg => {
    //         console.log('msg:::::' + msg);
    //         const beforeMessageRender = new CustomEvent('beforeMessageRender', { detail: msg });
    //         this.el.nativeElement.dispatchEvent(beforeMessageRender);
    //     });
    // }

    /** */
    private triggeisLoggedInEvent() {
        wdLog([' ---------------- triggeisLoggedInEvent ---------------- ', this.g.isLogged]);
        const isLoggedIn = new CustomEvent('isLoggedIn', { detail: this.g.isLogged });
        this.el.nativeElement.dispatchEvent(isLoggedIn);
    }

    /** */
    private triggerLoadParamsEvent() {
        wdLog([' ---------------- triggerLoadParamsEvent ---------------- ', this.g.default_settings]);
        const default_settings = this.g.default_settings;
        const loadParams = new CustomEvent('loadParams', { detail: { default_settings: default_settings } });
        this.el.nativeElement.dispatchEvent(loadParams);
    }

    /** */
    // private triggerBeforeMessageRender(text) {
    //     wdLog([' ---------------- triggerBeforeMessageRender ---------------- ', this.g.default_settings]);
    //     const beforeMessageRender = new CustomEvent('beforeMessageRender', { detail: '{json}' });
    //     this.el.nativeElement.dispatchEvent(beforeMessageRender);
    // }
    // ============ end: functions pass values to external ============//


    // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
    /** elimino tutte le sottoscrizioni */
    ngOnDestroy() {
        wdLog(['this.subscriptions', this.subscriptions]);
        const windowContext = this.g.windowContext;
        if (windowContext['tiledesk']) {
            windowContext['tiledesk']['angularcomponent'] = null;
            this.g.setParameters('windowContext', windowContext);
        }
        this.unsubscribe();
    }

    /** */
    unsubscribe() {
        this.subscriptions.forEach(function (subscription) {
            subscription.unsubscribe();
        });
        this.subscriptions.length = 0;
         wdLog(['this.subscriptions', this.subscriptions]);
    }
    // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//



    // ========= begin:: FUNCTIONS ============//
    /**
     * 1 - clear local storage
     * 2 - remove user in firebase
    */
    signOut() {
         wdLog([' SIGNOUT ']);
        // this.storageService.removeItem('attributes');
        this.storageService.clear();
        this.chatPresenceHandlerService.goOffline();
        this.authService.signOut();

    }

    /**
     * get status window chat from this.storageService
     * set status window chat open/close
     */
    setIsWidgetOpenOrActive() {
        if (this.storageService.getItem('isOpen') === 'true') {
            // this.g.isOpen = true;
            this.g.setIsOpen(true);
        } else if (this.storageService.getItem('isOpen') === 'false') {
            // this.g.isOpen = false;
            this.g.setIsOpen(false);
        }
        // this.isWidgetActive = (this.storageService.getItem('isWidgetActive')) ? true : false;
    }

    /**
     * genero un nuovo conversationWith
     * al login o all'apertura di una nuova conversazione
     */
    generateNewUidConversation() {
        wdLog(['generateUidConversation **************: senderId= ', this.g.senderId]);
        return this.messagingService.generateUidConversation(this.g.senderId);
    }

    /**
     * premendo sul pulsante 'APRI UNA NW CONVERSAZIONE'
     * attivo una nuova conversazione
     */
    startNwConversation() {
        wdLog(['AppComponent::startNwConversation']);
        this.g.setParameters('recipientId', this.generateNewUidConversation());
        wdLog([' recipientId: ', this.g.recipientId]);
    }
    // ========= end:: FUNCTIONS ============//




    // ========= begin:: CALLBACK FUNCTIONS ============//
    /**
     * MOBILE VERSION:
     * onClick button close widget
     */
    returnCloseWidget() {
        // this.g.isOpen = false;
        // this.g.setIsOpen(false);
        this.f21_close();
    }

    /**
     * LAUNCHER BUTTON:
     * onClick button open/close widget
     */
    openCloseWidget($event) {
        this.g.setParameters('displayEyeCatcherCard', 'none');
        if ( this.g.isOpen === true ) {
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
            wdLog(['onSelectDepartment: ', $event]);
            this.g.setParameters('departmentSelected', $event);
            // this.settingsSaverService.setVariable('departmentSelected', $event);
            this.startNwConversation();
            this.isOpenHome = true;
            this.isOpenConversation = true;
            this.isOpenSelectionDepartment = false;
        }
    }

    /**
     * MODAL SELECTION DEPARTMENT:
     * close modal
     */
    public returnCloseModalDepartment() {
        wdLog(['returnCloseModalDepartment']);
        this.isOpenHome = true;
        this.isOpenSelectionDepartment = false;
        this.isOpenConversation = false;
    }


    /**
     * MODAL PRECHATFORM:
     * completed prechatform
     */
    public returnPrechatFormComplete() {
         wdLog(['returnPrechatFormComplete']);
        this.isOpenHome = true;
        this.isOpenConversation = true;
        this.g.setParameters('isOpenPrechatForm', false);
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
    }

    /**
     * MODAL PRECHATFORM:
     * close modal
     */
    public returnCloseModalPrechatForm() {
         wdLog(['returnCloseModalPrechatForm']);
        this.isOpenHome = true;
        this.isOpenSelectionDepartment = false;
        this.isOpenConversation = false;
        this.g.setParameters('isOpenPrechatForm', false);
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
    }

    /**
     * MODAL HOME:
     * @param $event
     * return conversation selected
     */
    private returnSelectedConversation($event) {
        if ($event) {
            this.conversationSelected = $event;
            // this.g.recipientId = $event.recipient;
            // this.g.setVariable('recipientId', $event.recipient);
            this.g.setParameters('recipientId', $event.recipient);
            // this.settingsSaverService.setVariable('recipientId', $event.recipient);

            this.isOpenConversation = true;
             wdLog(['onSelectConversation in APP COMPONENT: ', $event]);
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

         wdLog(['returnNewConversation in APP COMPONENT']);
        // controllo i dipartimenti se sono 1 o 2 seleziono dipartimento e nascondo modale dipartimento
        // altrimenti mostro modale dipartimenti
        const preChatForm = this.g.preChatForm;
        const attributes = this.g.attributes;
        const departments = this.g.departments;

        if (preChatForm && !attributes.userFullname && !attributes.email) {
            this.isOpenConversation = false;
            this.g.setParameters('isOpenPrechatForm', true);
            // this.settingsSaverService.setVariable('isOpenPrechatForm', true);
            this.isOpenSelectionDepartment = false;
            if (departments.length > 1) {
                this.isOpenSelectionDepartment = true;
            }
        } else {
            // this.g.isOpenPrechatForm = false;
            this.g.setParameters('isOpenPrechatForm', false);
            // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;
            if (departments.length > 1) {
                this.isOpenSelectionDepartment = true;
            } else {
                this.isOpenConversation = true;
            }
        }
        this.startNwConversation();
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
        this.isOpenHome = true;
        this.isOpenConversation = false;
        this.startNwConversation();
    }

    /**
     * MODAL ALL CONVERSATION:
     * close all-conversation
     */
    private returnCloseAllConversation() {
        this.isOpenHome = true;
        this.isOpenConversation = false;
        this.isOpenAllConversation = false;
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
        this.g.setParameters('isOpenPrechatForm', false);
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
        this.isOpenConversation = false;
        this.isOpenSelectionDepartment = false;
        this.g.setParameters('isOpenStartRating', false);
        // this.settingsSaverService.setVariable('isOpenStartRating', false);
        this.startNwConversation();
    }

    /**
     * MODAL RATING WIDGET:
     * complete rate chat
     */
    returnRateChatComplete() {
        this.isOpenHome = true;
        this.g.setParameters('isOpenPrechatForm', false);
        // this.settingsSaverService.setVariable('isOpenPrechatForm', false);
        this.isOpenConversation = false;
        this.isOpenSelectionDepartment = false;
        this.g.setParameters('isOpenStartRating', false);
        // this.settingsSaverService.setVariable('isOpenStartRating', false);
        this.startNwConversation();
    }

    returneventOpenEyeCatcher($e) {
        if ($e === true) {
            this.triggerOnOpenEyeCatcherEvent();
        } else {
            this.triggerOnClosedEyeCatcherEvent();
        }
    }
    // ========= end:: CALLBACK FUNCTIONS ============//
}
