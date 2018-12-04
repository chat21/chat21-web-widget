import { ElementRef, Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewEncapsulation } from '@angular/core';
// import * as moment from 'moment';
import * as moment from 'moment/moment';

// https://www.davebennett.tech/subscribe-to-variable-change-in-angular-4-service/
import 'rxjs/add/operator/takeWhile';
import { Subscription } from 'rxjs/Subscription';

// services
import { Globals } from './utils/globals';
import { AuthService } from './core/auth.service';
import { MessagingService } from './providers/messaging.service';
import { ContactService } from './providers/contact.service';
import { TranslatorService } from './providers/translator.service';
import { ChatPresenceHandlerService } from './providers/chat-presence-handler.service';
import { AgentAvailabilityService } from './providers/agent-availability.service';


// utils
import { strip_tags, isPopupUrl, popupUrl, detectIfIsMobile, setLanguage } from './utils/utils';


@Component({
    selector: 'tiledeskwidget-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None /* it allows to customize 'Powered By' */
    // providers: [AgentAvailabilityService, TranslatorService]
})

export class AppComponent implements OnInit, OnDestroy {

    // ========= begin:: parametri di stato widget ======= //
    isInitialized = false;              /** if true show button */
    isOpenHome = true;                  /** check open/close component home ( sempre visibile xchè il primo dello stack ) */
    isOpenConversation = false;         /** check open/close component conversation if is true  */
    isOpenAllConversation = false;
    isOpenSelectionDepartment = false;  /** check open/close modal select department */
    isOpenPrechatForm = false;          /** check open/close modal prechatform if g.preChatForm is true  */
    isOpenStartRating = false;          /** check open/close modal start rating chat if g.isStartRating is true  */

    // isWidgetActive: boolean;            /** var bindata sullo stato conv aperta/chiusa !!!! da rivedere*/
    // isModalLeaveChatActive = false;     /** ???? */
    departments = [];
    marginBottom: number;
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
        private agentAvailabilityService: AgentAvailabilityService
    ) {

    }


    /**
     * 1 - init
     * 2 - auth
     * 3 - start
     */
    ngOnInit() {
        this.initAll();
        this.getMongDbDepartments();
        this.g.wdLog(' ---------------- A4 ---------------- ');
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
                this.g.wdLog([' currentUser:::: ' + user]);
                if (user === -1) {
                    /** ho effettuato il logout: nascondo il widget */
                    that.g.isLogged = false;
                    that.g.isShown = false;
                    this.g.wdLog(['LOGOUT : ', user, that.g.autoStart]);
                    that.triggeisLoggedInEvent();
                } else if (user === 0) {
                    /** non sono loggato */
                    that.g.isLogged = false;
                    this.g.wdLog(['NO CURRENT USER AUTENTICATE: ', user, that.g.autoStart]);
                    if (that.g.autoStart === true) {
                        that.setAuthentication();
                    }
                    that.triggeisLoggedInEvent();
                } else if (user) {
                    /** sono loggato */
                    this.g.wdLog(['USER AUTENTICATE: ', user.uid]);
                    that.g.senderId = user.uid;
                    that.g.isLogged = true;
                    this.g.wdLog([' this.g.senderId', that.g.senderId]);
                    this.g.wdLog([' this.g.isLogged', that.g.isLogged]);
                    // that.openIfCallOutTimer();
                    that.startUI();
                    that.triggeisLoggedInEvent();
                    this.g.wdLog([' 1 - IMPOSTO STATO CONNESSO UTENTE ']);
                    that.chatPresenceHandlerService.setupMyPresence(that.g.senderId);
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

        this.startNwConversation();
        // set lang and in global variables
        this.g.wdLog([' ---------------- SET LANG ---------------- ']);
        this.g.lang = setLanguage(this.translatorService);
        moment.locale(this.g.lang);
        this.g.wdLog([' lang: ', this.g.lang]);

        // detect is mobile
        this.g.isMobile = detectIfIsMobile();

        // Related to https://github.com/firebase/angularfire/issues/970
        localStorage.removeItem('firebase:previous_websocket_failure');
        this.g.wdLog([' ---------------- CONSTRUCTOR ---------------- ']);

        this.g.initialize(this.el);
         this.g.wdLog([' ---------------- A0 ---------------- ']);

        this.addComponentToWindow(this.ngZone);
         this.g.wdLog([' ---------------- A1 ---------------- ']);

        this.triggetLoadParamsEvent();
         this.g.wdLog([' ---------------- A2 ---------------- ']);

        /** mostro il pulsante principale dopo l'init */
        this.isInitialized = true;

        this.marginBottom = +this.g.marginY + 70;

        this.chatPresenceHandlerService.initialize();


        this.g.wdLog([' ---------------- B1: setAvailableAgentsStatus ---------------- ']);
        this.setAvailableAgentsStatus();

    }



    /**
   * mi sottoscrivo al nodo /projects/' + projectId + '/users/availables
   * per verificare se c'è un agent disponibile
   */
  private setAvailableAgentsStatus() {
    const that = this;
    this.agentAvailabilityService
    .getAvailableAgents(this.g.projectid)
    .subscribe( (availableAgents) => {
      this.g.wdLog(['availableAgents->', availableAgents]);
      if (availableAgents.length <= 0) {
        that.g.areAgentsAvailable = false;
        that.g.areAgentsAvailableText = that.g.AGENT_NOT_AVAILABLE;
        //that.addFirstMessage(that.g.LABEL_FIRST_MSG_NO_AGENTS);
      } else {
        that.g.areAgentsAvailable = true;
        that.g.areAgentsAvailableText = that.g.AGENT_AVAILABLE;
        // add first message
        this.g.availableAgents = availableAgents;
        //that.addFirstMessage(that.g.LABEL_FIRST_MSG);
      }
      that.g.availableAgentsStatus = true;
      that.g.wdLog(['AppComponent::setAvailableAgentsStatus::areAgentsAvailable:', that.g.areAgentsAvailableText]);
    }, (error) => {
      console.error('setOnlineStatus::setAvailableAgentsStatus', error);
    }, () => {
    });
  }


    // ========= begin:: GET DEPARTEMENTS ============//
    /**
     * recupero elenco dipartimenti
     * - mi sottoscrivo al servizio
     * - se c'è un solo dipartimento la setto di default
     * - altrimenti visualizzo la schermata di selezione del dipartimento
    */
    getMongDbDepartments() {
        const that = this;
         this.g.wdLog(['getMongDbDepartments ::::', this.g.projectid]);
        this.messagingService.getMongDbDepartments(this.g.projectid)
        .subscribe(response => {
            that.g.wdLog(['response DEP ::::', response]);
            that.g.departments = response;
            that.initDepartments();
        },
        errMsg => {
             this.g.wdLog(['http ERROR MESSAGE', errMsg]);
        },
        () => {
             this.g.wdLog(['API ERROR NESSUNO']);
        });
    }

    /**
     * INIT DEPARTMENT:
     * get departments list
     * set department default
     * CALL AUTHENTICATION
    */
    initDepartments() {
        this.g.departmentSelected = null;
        this.g.departmentDefault = null;
        this.g.wdLog(['SET DEPARTMENT DEFAULT ::::', this.g.departments[0]]);
        this.setDepartment(this.g.departments[0]);
        let i = 0;
        this.g.departments.forEach(department => {
            if (department['default'] === true) {
                this.g.departmentDefault = department;
                this.g.departments.splice(i, 1);
                return;
            }
            i++;
        });
        if (this.g.departments.length === 1) {
            // UN SOLO DEPARTMENT
            this.g.wdLog(['DEPARTMENT FIRST ::::', this.g.departments[0]]);
            this.setDepartment(this.g.departments[0]);
            //return false;
        } else if (this.g.departments.length > 1) {
            // CI SONO + DI 2 DIPARTIMENTI
            this.g.wdLog(['CI SONO + DI 2 DIPARTIMENTI ::::', this.g.departments[0]]);
        } else {
            // DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI !!!!
            this.g.wdLog(['DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI ::::', this.g.departments[0]]);
        }

        /********** LOGIN  ***********/
        this.setLoginSubscription();
    }

    /**
     * SET DEPARTMENT:
     * set department selected
     * save department selected in attributes
     * save attributes in localstorage
    */
    setDepartment(department) {
        this.g.departmentSelected = department;
        if (this.g.attributes) {
            this.g.attributes.departmentId = department._id;
            this.g.attributes.departmentName = department.name;
             this.g.wdLog(['setAttributes setDepartment: ', JSON.stringify(this.g.attributes)]);
            localStorage.setItem('attributes', JSON.stringify(this.g.attributes));
        }
    }
    // ========= end:: GET DEPARTEMENTS ============//


    // ========= begin:: AUTHENTICATION ============//
    /**
     * SET AUTHENTICATION:
     * authenticate in chat
     */
    private setAuthentication() {
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

        if (this.g.userEmail && this.g.userPassword) {
             this.g.wdLog([' ---------------- 10 ---------------- ']);
            // se esistono email e psw faccio un'autenticazione firebase con email
            this.authService.authenticateFirebaseWithEmailAndPassword(this.g.userEmail, this.g.userPassword);
        } else if (this.g.userId) {
            // SE PASSO LO USERID NON EFFETTUO NESSUNA AUTENTICAZIONE
             this.g.wdLog([' ---------------- 11 ---------------- ']);
             this.g.wdLog(['this.userId:: ', this.g.userId]);
            this.g.senderId = this.g.userId;
            this.g.isLogged = true;
            this.startUI();
             this.g.wdLog([' 11 - IMPOSTO STATO CONNESSO UTENTE ']);
            this.chatPresenceHandlerService.setupMyPresence(this.g.senderId);
        } else if (this.g.userToken) {
            // SE PASSO IL TOKEN NON EFFETTUO NESSUNA AUTENTICAZIONE
            // !!! DA TESTARE NON FUNZIONA !!! //
             this.g.wdLog([' ---------------- 12 ---------------- ']);
             this.g.wdLog(['this.g.userToken:: ', this.g.userToken]);
            this.authService.authenticateFirebaseCustomToken(this.g.userToken);

        } else if (currentUser) {
            //  SONO GIA' AUTENTICATO
             this.g.wdLog([' ---------------- 13 ---------------- ']);
            this.g.senderId = currentUser.uid;
            this.g.isLogged = true;
             this.g.wdLog([' this.g.senderId', this.g.senderId]);
             this.g.wdLog([' this.g.isLogged', this.g.isLogged]);
            this.startUI();
             this.g.wdLog([' 13 - IMPOSTO STATO CONNESSO UTENTE ']);
            this.chatPresenceHandlerService.setupMyPresence(this.g.senderId);

        } else {
            //  AUTENTICAZIONE ANONIMA
             this.g.wdLog([' ---------------- 14 ---------------- ']);
             this.g.wdLog([' authenticateFirebaseAnonymously']);
            this.authService.authenticateFirebaseAnonymously();
        }
    }
    // ========= end:: AUTHENTICATION ============//


    // ========= begin:: START UI ============//
    /**
     * set opening priority widget
     */
    private startUI() {
         this.g.wdLog([' ---------------- A3 ---------------- ']);
        this.setIsWidgetOpenOrActive();

         this.g.wdLog([' ============ startUI ===============', this.g.departmentSelected, this.g.isLogged]);

        this.isOpenHome = true;
        this.isOpenConversation = false;
        this.isOpenPrechatForm = false;
        this.isOpenSelectionDepartment = false;
        this.isOpenAllConversation = false;
        if (this.g.startFromHome) {
            this.isOpenConversation = false;
            this.isOpenPrechatForm = false;
            this.isOpenSelectionDepartment = false;
        } else if (this.g.preChatForm && !this.g.attributes.userFullname && !this.g.attributes.email) {
            this.isOpenPrechatForm = true;
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;
            if (this.g.departments.length > 1) {
                this.isOpenSelectionDepartment = true;
            }
        } else {
            this.isOpenPrechatForm = false;
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;
            if (this.g.departments.length > 1) {
                this.isOpenSelectionDepartment = true;
            } else {
                this.isOpenConversation = true;
            }
        }

    }
    // ========= end:: START UI ============//


    // ========= begin:: COMPONENT TO WINDOW ============//
    /**
     * http://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
     */
    private addComponentToWindow(ngZone) {
        if (window['tiledesk']) {
            window['tiledesk']['angularcomponent'] = { component: this, ngZone: ngZone };
            /** */
            window['tiledesk'].setUserInfo = function (userInfo) {
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.setUserInfo(userInfo);
                });
            };
            /** loggin with token */
            window['tiledesk'].signInWithCustomToken = function (token) {
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.signInWithCustomToken(token);
                });
            };
            /** loggin anonymous */
            window['tiledesk'].signInAnonymous = function () {
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.signInAnonymous();
                });
            };
            // window['tiledesk'].on = function (event_name, handler) {
            //      this.g.wdLog(["addEventListener for "+ event_name);
            //     this.el.nativeElement.addEventListener(event_name, e =>  handler());
            // };
            /** show all widget */
            window['tiledesk'].show = function () {
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.showAllWidget();
                });
            };
            /** hidden all widget */
            window['tiledesk'].hide = function () {
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.hideAllWidget();
                });
            };
            /** close window chat */
            window['tiledesk'].close = function () {
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.f21_close();
                });
            };
            /** open window chat */
            window['tiledesk'].open = function () {
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.f21_open();
                });
            };
            /** set state PreChatForm close/open */
            window['tiledesk'].setStatePreChatForm = function (state) {
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.setStatePreChatForm(state);
                });
            };
        }
    }

    /** */
    private signInWithCustomToken(token) {
         this.g.wdLog(['signInWithCustomToken token ', token]);
        const that = this;
        this.authService.createFirebaseToken(token, this.g.projectid)
            .subscribe(response => {
                that.authService.decode(token, that.g.projectid)
                    .subscribe(resDec => {
                         this.g.wdLog(['resDec', resDec.decoded]);
                        that.g.signInWithCustomToken = true;
                        that.g.userEmail = resDec.decoded.email;
                        that.g.userFullname = resDec.decoded.name;
                        that.g.attributes.userEmail = resDec.decoded.email;
                        that.g.attributes.userFullname = resDec.decoded.name;
                        const firebaseToken = response.firebaseToken;
                         this.g.wdLog(['firebaseToken', firebaseToken]);
                        that.g.userToken = firebaseToken;
                        that.authService.authenticateFirebaseCustomToken(firebaseToken);
                    }, error => {
                        console.error('Error decoding token: ', error);
                        console.log('call signout');
                        that.signOut();
                    });
                    // , () => {
                    //     console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV * COMPLETE *');
                    // });
            }, error => {
                console.error('Error creating firebase token: ', error);
                console.error('Error decoding token: ', error);
                console.log('call signout');
                that.signOut();
            });
            // , () => {
                // console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV * COMPLETE *');
            // });
    }

    /** */
    private signInAnonymous() {
         this.g.wdLog(['signInAnonymous ']);
        this.authService.authenticateFirebaseAnonymously();
    }

    /** */
    private setStatePreChatForm(state) {
        if (state != null) {
            this.g.preChatForm = state;
            // this.isOpenPrechatForm = state;
        }
        //  this.g.wdLog(['this.isOpenPrechatForm ', this.isOpenPrechatForm);
    }

    /** show all widget */
    private showAllWidget() {
        this.g.isShown = true;
    }

    /** hide all widget */
    private hideAllWidget() {
        this.g.isShown = false;
    }

    /** open popup conversation */
    private f21_open() {
        this.g.wdLog(['f21_open senderId: ', this.g.senderId]);
        if (this.g.senderId) {
            this.g.isOpen = true; // !this.isOpen;
            this.isInitialized = true;
            localStorage.setItem('isOpen', 'true');
            // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
        }
    }

    /** close popup conversation */
    private f21_close() {
         this.g.wdLog(['isOpen::', this.g.isOpen]);
        this.g.isOpen = false;
        localStorage.setItem('isOpen', 'false');
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
         this.g.wdLog([' ---------------- triggeisLoggedInEvent ---------------- ', this.g.isLogged]);
        const isLoggedIn = new CustomEvent('isLoggedIn', { detail: this.g.isLogged });
        this.el.nativeElement.dispatchEvent(isLoggedIn);
    }

    /** */
    private triggetLoadParamsEvent() {
        this.g.wdLog([' ---------------- triggetLoadParamsEvent ---------------- ', this.g.default_settings]);
        const default_settings = this.g.default_settings;
        const loadParams = new CustomEvent('loadParams', { detail: { default_settings: default_settings } });
        this.el.nativeElement.dispatchEvent(loadParams);
    }

    /** */
    // private triggetBeforeMessageRender(text) {
    //     this.g.wdLog([' ---------------- triggetBeforeMessageRender ---------------- ', this.g.default_settings]);
    //     const beforeMessageRender = new CustomEvent('beforeMessageRender', { detail: '{json}' });
    //     this.el.nativeElement.dispatchEvent(beforeMessageRender);
    // }
    // ============ end: functions pass values to external ============//


    // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
    /** elimino tutte le sottoscrizioni */
    ngOnDestroy() {
         this.g.wdLog(['this.subscriptions', this.subscriptions]);
        if (window['tiledesk']) {
            window['tiledesk']['angularcomponent'] = null;
        }
        this.unsubscribe();
    }

    /** */
    unsubscribe() {
        this.subscriptions.forEach(function (subscription) {
            subscription.unsubscribe();
        });
        this.subscriptions.length = 0;
         this.g.wdLog(['this.subscriptions', this.subscriptions]);
    }
    // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//



    // ========= begin:: FUNCTIONS ============//
    /**
     * 1 - clear local storage
     * 2 - remove user in firebase
    */
    signOut() {
         this.g.wdLog([' SIGNOUT ']);
        // localStorage.removeItem('attributes');
        localStorage.clear();
        this.chatPresenceHandlerService.goOffline();
        this.authService.signOut();

    }

    /**
     * get status window chat from localStorage
     * set status window chat open/close
     */
    setIsWidgetOpenOrActive() {
        if (localStorage.getItem('isOpen') === 'true') {
            this.g.isOpen = true;
        } else if (localStorage.getItem('isOpen') === 'false') {
            this.g.isOpen = false;
        }
        // this.isWidgetActive = (localStorage.getItem('isWidgetActive')) ? true : false;
    }

    /**
     * genero un nuovo conversationWith
     * al login o all'apertura di una nuova conversazione
     */
    generateNewUidConversation() {
         this.g.wdLog(['generateUidConversation **************', this.g.senderId]);
        return this.messagingService.generateUidConversation(this.g.senderId);
    }

    /**
     * premendo sul pulsante 'APRI UNA NW CONVERSAZIONE'
     * attivo una nuova conversazione
     */
    startNwConversation() {
         this.g.wdLog(['AppComponent::startNwConversation']);
        // this.ngOnDestroy();
        this.g.recipientId = this.generateNewUidConversation();
         this.g.wdLog([' recipientId: ', this.g.recipientId]);
         this.g.wdLog([' senderId: ', this.g.senderId]);
         this.g.wdLog([' projectid: ', this.g.projectid]);
         this.g.wdLog([' channelType: ', this.g.channelType]);
    }
    // ========= end:: FUNCTIONS ============//




    // ========= begin:: CALLBACK FUNCTIONS ============//
    /**
     * MOBILE VERSION:
     * onClick button close widget
     */
    returnCloseWidget() {
        this.g.isOpen = false;
    }

    /**
     * LAUNCHER BUTTON:
     * onClick button open/close widget
     */
    openCloseWidget($event) {
        this.g.displayEyeCatcherCard = 'none';
        this.g.isOpen = $event;
         this.g.wdLog(['openCloseWidget: ', this.g.isOpen, this.isOpenHome, this.g.senderId]);
    }

    /**
     * MODAL SELECTION DEPARTMENT:
     * selected department
     */
    private returnDepartmentSelected($event) {
        if ($event) {
             this.g.wdLog(['onSelectDepartment: ', $event]);
            // this.g.departmentSelected = $event;
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
    private returnCloseModalDepartment() {
         this.g.wdLog(['returnCloseModalDepartment', this.g.senderId]);
        this.isOpenHome = true;
        this.isOpenSelectionDepartment = false;
        this.isOpenConversation = false;
    }


    /**
     * MODAL PRECHATFORM:
     * completed prechatform
     */
    private returnPrechatFormComplete() {
         this.g.wdLog(['returnPrechatFormComplete']);
        this.isOpenHome = true;
        this.isOpenConversation = true;
        this.isOpenPrechatForm = false;
    }

    /**
     * MODAL PRECHATFORM:
     * close modal
     */
    private returnCloseModalPrechatForm() {
         this.g.wdLog(['returnCloseModalPrechatForm']);
        this.isOpenHome = true;
        this.isOpenSelectionDepartment = false;
        this.isOpenConversation = false;
        this.isOpenPrechatForm = false;
    }

    /**
     * MODAL HOME:
     * @param $event
     * return conversation selected
     */
    private returnSelectedConversation($event) {
        if ($event) {
            this.g.recipientId = $event.recipient;
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
        // controllo i dipartimenti se sono 1 o 2 seleziono dipartimento e nascondo modale dipartimento
        // altrimenti mostro modale dipartimenti
        if (this.g.preChatForm && !this.g.attributes.userFullname && !this.g.attributes.email) {
            this.isOpenConversation = false;
            this.isOpenPrechatForm = true;
            this.isOpenSelectionDepartment = false;
            if (this.g.departments.length > 1) {
                this.isOpenSelectionDepartment = true;
            }
        } else {
            this.isOpenPrechatForm = false;
            this.isOpenConversation = false;
            this.isOpenSelectionDepartment = false;
            if (this.g.departments.length > 1) {
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
        this.isOpenPrechatForm = false;
        this.isOpenConversation = false;
        this.isOpenSelectionDepartment = false;
        this.g.isOpenStartRating = false;
        this.startNwConversation();
    }

    /**
     * MODAL RATING WIDGET:
     * complete rate chat
     */
    returnRateChatComplete() {
        this.isOpenHome = true;
        this.isOpenPrechatForm = false;
        this.isOpenConversation = false;
        this.isOpenSelectionDepartment = false;
        this.g.isOpenStartRating = false;
        this.startNwConversation();
    }

    // ========= end:: CALLBACK FUNCTIONS ============//
}
