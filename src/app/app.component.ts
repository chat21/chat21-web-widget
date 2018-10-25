import { ElementRef, Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';

// https://www.davebennett.tech/subscribe-to-variable-change-in-angular-4-service/
import 'rxjs/add/operator/takeWhile';
import { Subscription } from 'rxjs/Subscription';

// services
import { Globals } from './utils/globals';
import { AuthService } from './core/auth.service';
import { MessagingService } from './providers/messaging.service';
import { ContactService } from './providers/contact.service';
import { TranslatorService } from './providers/translator.service';

// utils
import { strip_tags, isPopupUrl, popupUrl, detectIfIsMobile, setLanguage } from './utils/utils';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None /* it allows to customize 'Powered By' */
    // providers: [AgentAvailabilityService, TranslatorService]
})

export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

    // ========= begin:: parametri di stato widget ======= //
    isInitialized = false;              /** if true show button */

    isOpenHome = true;                  /**  check open/close component home ( sempre visibile xchè il primo dello stack ) */
    isOpenConversation = false;         /** check open/close component conversation if is true  */
    isOpenSelectionDepartment = true;   /** check open/close modal select department */
    isOpenPrechatForm = false;          /** check open/close modal prechatform if g.preChatForm is true  */

    isWidgetActive: boolean;            /** var bindata sullo stato conv aperta/chiusa !!!! da rivedere*/
    isModalLeaveChatActive = false;     /** ???? */
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
        public contactService: ContactService
    ) {
        this.initAll();
    }


    ngOnInit() {
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
        this.authService.obsLoggedUser.subscribe((user) => {
            this.ngZone.run(() => {
                console.log(' currentUser:::: ', user);
                if (user === 0) {
                    that.g.isLogged = false;
                    console.log('NO CURRENT USER AUTENTICATE: ', user, that.g.autoStart);
                    if (that.g.autoStart === true) {
                        that.setAuthentication();
                    }
                    that.triggeisLoggedInEvent();
                } else if (user) {
                    console.log('USER AUTENTICATE: ', user.uid);
                    //  SONO GIA' AUTENTICATO
                    that.g.senderId = user.uid;
                    that.g.isLogged = true;
                    console.log(' this.g.senderId', that.g.senderId);
                    console.log(' this.g.isLogged', that.g.isLogged);
                    // that.openIfCallOutTimer();
                    that.startUI();
                    that.triggeisLoggedInEvent();
                }
            });
        });
    }

    ngAfterViewInit() {
    }


    private initAll() {
        // set lang and in global variables
        console.log(' ---------------- SET LANG ---------------- ');
        this.g.lang = setLanguage(this.translatorService);
        moment.locale(this.g.lang);
        console.log(' lang: ', this.g.lang);

        // detect is mobile
        this.g.isMobile = detectIfIsMobile();

        // Related to https://github.com/firebase/angularfire/issues/970
        localStorage.removeItem('firebase:previous_websocket_failure');
        console.log(' ---------------- CONSTRUCTOR ---------------- ');

        this.g.initialize(this.el);
        console.log(' ---------------- A1 ---------------- ');

        // ATTENZIONE TESTAREREEEE QUESTO SPOSTAMENTO..
        this.addComponentToWindow(this.ngZone);

        this.triggetLoadParamsEvent();
        console.log(' ---------------- A2 ---------------- ');

        this.setIsWidgetOpenOrActive();
        console.log(' ---------------- A3 ---------------- ');

        this.isInitialized = true;
        //this.g.isShown = false;

    }

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
        const currentUser =  this.authService.getCurrentUser();

        if (this.g.userEmail && this.g.userPassword) {
            console.log(' ---------------- 10 ---------------- ');
            // se esistono email e psw faccio un'autenticazione firebase con email
            this.authService.authenticateFirebaseWithEmailAndPassword(this.g.userEmail, this.g.userPassword);

        } else if (this.g.userId) {
            // SE PASSO LO USERID NON EFFETTUO NESSUNA AUTENTICAZIONE
            console.log(' ---------------- 11 ---------------- ');
            console.log('this.userId:: ', this.g.userId);
            this.g.senderId = this.g.userId;
            this.g.isLogged = true;
            this.startUI();
        } else if (this.g.userToken) {
            // SE PASSO IL TOKEN NON EFFETTUO NESSUNA AUTENTICAZIONE
            // !!! DA TESTARE NON FUNZIONA !!! //
            console.log(' ---------------- 12 ---------------- ');
            console.log('this.g.userToken:: ', this.g.userToken);
            this.authService.authenticateFirebaseCustomToken(this.g.userToken);

        } else if (currentUser) {
            //  SONO GIA' AUTENTICATO
            console.log(' ---------------- 13 ---------------- ');
            console.log(' currentUser', currentUser);
            this.g.senderId = currentUser.uid;
            this.g.isLogged = true;
            console.log(' this.g.senderId', this.g.senderId);
            console.log(' this.g.isLogged', this.g.isLogged);
            this.startUI();

        } else {
            //  AUTENTICAZIONE ANONIMA
            console.log(' ---------------- 14 ---------------- ');
            console.log(' authenticateFirebaseAnonymously');
            this.authService.authenticateFirebaseAnonymously();
        }

    }


    private startUI() {
        /** TEST  */
        //this.startFromHome = true;
        //this.preChatForm = true;
        this.isOpenHome = true;
        this.isOpenConversation = false;
        this.isOpenPrechatForm = false;
        this.isOpenSelectionDepartment = false;

        if (this.g.startFromHome) {
            this.isOpenConversation = false;
            this.isOpenPrechatForm = false;
            this.isOpenSelectionDepartment = false;
        } else if (this.g.preChatForm) {
            this.isOpenConversation = false;
            this.isOpenPrechatForm = true;
            this.isOpenSelectionDepartment = true;
        } else {
            this.isOpenConversation = false;
            this.isOpenPrechatForm = false;
            this.isOpenSelectionDepartment = true;
        }
    }



    // ========= begin:: COMPONENT TO WINDOW ============//

    // http://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
    /**
     *
     * @param ngZone
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
            //     console.log("addEventListener for "+ event_name);
            //     this.el.nativeElement.addEventListener(event_name, e =>  handler());
            // };

            /** show all widget */
            window['tiledesk'].show = function () {
                console.log('!!!showAllWidget');
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.showAllWidget();
                });
            };

            /** hidden all widget */
            window['tiledesk'].hide = function () {
                console.log('!!!hideAllWidget');
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.hideAllWidget();
                });
            };

            /** close window chat */
            window['tiledesk'].close = function () {
                console.log('!!!f21_close');
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.f21_close();
                });
            };

            /** open window chat */
            window['tiledesk'].open = function () {
                console.log('!!!f21_open');
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.f21_open();
                });
            };

            /** setS tate PreChatForm close/open */
            window['tiledesk'].setStatePreChatForm = function (state) {
                console.log('!!!openClosePreChatForm', state);
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.setStatePreChatForm(state);
                });
            };
        }
    }

    /**
     *
     * @param token
     */
    private signInWithCustomToken(token) {
        console.log('signInWithCustomToken token ', token);
        // console.log('this.g', this.g);
        const that = this;
        this.authService.createFirebaseToken(token, this.g.projectid)
        .subscribe(response => {
            that.authService.decode(token, that.g.projectid)
            .subscribe(resDec => {
                console.log('resDec', resDec.decoded);
                console.log('email', resDec.decoded.email);
                console.log('name', resDec.decoded.name);
                console.log('external_id', resDec.decoded.external_id);
                console.log('iat', resDec.decoded.iat);

                that.g.userEmail = resDec.decoded.email;
                that.g.userFullname = resDec.decoded.name;
                console.log('g', that.g);

                const firebaseToken = response.firebaseToken;
                console.log('firebaseToken', firebaseToken);
                that.g.userToken = firebaseToken;
                that.authService.authenticateFirebaseCustomToken(firebaseToken);
            });
        });
    }

    /**
     *
     */
    private signInAnonymous() {
        console.log('signInAnonymous ');
        this.authService.authenticateFirebaseAnonymously();
    }

    private setStatePreChatForm(state) {
        if ( state != null ) {
            this.g.preChatForm = state;
            this.isOpenPrechatForm = state;
        }
        console.log('this.isOpenPrechatForm ', this.isOpenPrechatForm);
    }

    // private setUserInfo(userInfo) {
    //     console.log('this.attributes', this.g.attributes);
    //     console.log('userInfo', userInfo);
    //     if (userInfo) {
    //         Object.assign(this.g.attributes, userInfo);
    //         // if (userInfo.userFullname) {
    //         //     this.attributes.userFullname = userInfo.userFullname;
    //         // }
    //         // if (userInfo.userEmail) {
    //         //     this.attributes.userEmail = userInfo.userEmail;
    //         // }
    //     }
    // }

    // ========= end:: COMPONENT TO WINDOW ============//



    /** */
    setIsWidgetOpenOrActive() {
        if (localStorage.getItem('isOpen') === 'true') {
            this.g.isOpen = true;
        } else if (localStorage.getItem('isOpen') === 'false') {
            this.g.isOpen = false;
        }
        this.isWidgetActive = (localStorage.getItem('isWidgetActive')) ? true : false;
    }

    /**
     * genero un nuovo conversationWith
     * al login o all'apertura di una nuova conversazione
     */
    generateNewUidConversation() {
        console.log('generateUidConversation **************', this.g.senderId);
        return this.messagingService.generateUidConversation(this.g.senderId);
    }

    /**
     * recupero url immagine profilo
     * @param uid
     */
    getUrlImgProfile(uid): string {
        // tslint:disable-next-line:curly
        if (!uid) return this.IMG_PROFILE_SUPPORT;
        const profile = this.contactService.getContactProfile(uid);
        if (profile && profile.imageurl) {
            return profile.imageurl;
        } else {
            return this.IMG_PROFILE_SUPPORT;
        }
    }

    /**
     * premendo sul pulsante 'APRI UNA NW CONVERSAZIONE'
     * attivo una nuova conversazione
     */
    startNwConversation() {
        console.log('AppComponent::startNwConversation');
        // this.ngOnDestroy();
        this.g.recipientId = this.generateNewUidConversation();
        console.log(' recipientId: ', this.g.recipientId);
        console.log(' senderId: ', this.g.senderId);
        console.log(' projectid: ', this.g.projectid);
        console.log(' channelType: ', this.g.channelType);
    }

    // convertMessage(msg) {
    //     let messageText = encodeHTML(msg);
    //     messageText = urlify(messageText);
    //     // console.log('messageText: ' + messageText);
    //     return messageText;
    // }

    // openModal(id) {
    //     if ( id === 'isModalLeaveChatActive' ) {
    //         this.isModalLeaveChatActive = (this.isModalLeaveChatActive ? false : true);
    //     }
    // }

    // leaveChat() {
    //     this.openModal('isModalLeaveChatActive');
    //     this.messagingService.closeConversation();
    // }

    /**
     * attivo bottone valuta
     */
    // checkChatClosed(attributes) {
    //     // console.log('ADD BUTTON VALUTA *****', attributes);
    //     if ( attributes['subtype'] === 'info/support' && attributes['messagelabel'].key === 'CHAT_CLOSED' ) {
    //         return true;
    //     }
    //     return false;
    // }



    // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
    /**
     * elimino tutte le sottoscrizioni
     */
    ngOnDestroy() {
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
        console.log('this.subscriptions', this.subscriptions);
    }
    // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//






    // ============ begin: functions called on addComponentToWindow ============//

    /** show all widget */
    showAllWidget() {
        this.g.isShown = true;
    }

    /** hide all widget */
    hideAllWidget() {
        this.g.isShown = false;
    }

    /** open popup conversation */
    f21_open() {
        console.log('f21_open senderId: ', this.g.senderId);
        if (this.g.senderId) {
            this.g.isOpen = true; // !this.isOpen;
            this.isInitialized = true;
            localStorage.setItem('isOpen', 'true');
            // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
        }
    }

    /** close popup conversation */
    f21_close() {
        console.log('isOpen::', this.g.isOpen);
        this.g.isOpen = false;
        localStorage.setItem('isOpen', 'false');
    }

    /** */
    private triggeisLoggedInEvent() {
        console.log(' ---------------- triggeisLoggedInEvent ---------------- ', this.g.isLogged);
        const isLoggedIn = new CustomEvent('isLoggedIn', { detail:  this.g.isLogged } );
        this.el.nativeElement.dispatchEvent(isLoggedIn);
    }

    /** */
    private triggetLoadParamsEvent() {
        console.log(' ---------------- triggetLoadParamsEvent ---------------- ', this.g.default_settings);
        const default_settings = this.g.default_settings;
        const loadParams = new CustomEvent('loadParams', { detail: { default_settings: default_settings } });
        this.el.nativeElement.dispatchEvent(loadParams);
    }

    // ============ end: functions called on addComponentToWindow ============//





    // ========= begin:: CALLBACK FUNCTIONS ============//

    /**
     * LAUNCHER BUTTON:
     * onClick button open/close widget
     */
    openCloseWidget($event) {
        this.g.isOpen = $event;
        console.log('openCloseWidget: ', this.g.isOpen, this.isOpenHome, this.g.senderId);
        // this.displayEyeCatcherCard = 'none';
        // this.displayEyeCatcherCardCloseBtnWrapper = 'none';
        // this.displayEyeCatcherCardCloseBtnIsMobileWrapper = 'none';
        // this.displayEyeCatcherCardCloseBtn = 'none';
    }

    /**
     * MODAL SELECTION DEPARTMENT:
     * selected department
     */
    private returnDepartmentSelected($event) {
        if ( $event ) {
            console.log('onSelectDepartment: ', $event);
            // this.g.departmentSelected = $event;
            this.isOpenConversation = true;
            this.isOpenSelectionDepartment = false;
        }
    }

    /**
     * MODAL SELECTION DEPARTMENT:
     * close modal
     */
    private returnCloseModalDepartment() {
        console.log('returnCloseModalDepartment');
        this.isOpenHome = true;
        this.isOpenSelectionDepartment = false;
        this.isOpenConversation = false;
    }

    /**
     * MODAL PRECHATFORM:
     * completed prechatform
     */
    private returnPrechatFormComplete() {
        console.log('returnPrechatFormComplete');
        this.isOpenHome = true;
        this.isOpenSelectionDepartment = true;
        this.isOpenConversation = false;
        this.isOpenPrechatForm = false;
    }

    /**
     * MODAL PRECHATFORM:
     * close modal
     */
    private returnCloseModalPrechatForm() {
        console.log('returnCloseModalPrechatForm');
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
        if ( $event ) {
            this.g.recipientId = $event.recipient;
            this.isOpenConversation = true;
            console.log('onSelectConversation in APP COMPONENT: ', $event);
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
        console.log('returnNewConversation in APP COMPONENT');
        if (this.g.preChatForm) {
            this.isOpenPrechatForm = true;
            this.isOpenSelectionDepartment = true;
        } else {
            this.isOpenPrechatForm = false;
            this.isOpenSelectionDepartment = true;
        }
        this.startNwConversation();
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
        const that = this;
        // parte animazione per chiudere conversazione
        this.isOpenHome = true;
        // setTimeout(function () {
        //     // cache conversazioni
        //     // aggiorno cache dopo load
        //     that.isOpenHome = true;
        // }, 1);
        this.isOpenConversation = false;
    }

    // private returnToHome() {
    //     this.isOpenSelectionDepartment = false;
    //     this.isOpenPrechatForm = false;
    //     // this.g.isOpenConversation = false;
    // }

    // private returnCloseForm() {
    //     this.g.attributes.userFullname = this.g.userFullname;
    //     this.g.attributes.userEmail = this.g.userEmail;
    //     if (this.g.attributes) {
    //         localStorage.setItem('attributes', JSON.stringify(this.g.attributes));
    //     }
    //     this.isOpenPrechatForm = false;
    // }

    // ========= end:: CALLBACK FUNCTIONS ============//
}
