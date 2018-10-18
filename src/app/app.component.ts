import { ElementRef, Component, OnInit, OnDestroy, AfterViewInit, ViewChild, HostListener, NgZone, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../environments/environment';
// import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

// services
import { Globals } from './utils/globals';
import { AuthService } from './core/auth.service';
import { MessagingService } from './providers/messaging.service';
import { AgentAvailabilityService } from './providers/agent-availability.service';
// models
import { MessageModel } from '../models/message';
import { DepartmentModel } from '../models/department';

// utils
import { strip_tags, isPopupUrl, popupUrl, setHeaderDate, searchIndexInArrayForUid, urlify, encodeHTML } from './utils/utils';
import { detectIfIsMobile} from './utils/utils';
// tslint:disable-next-line:max-line-length
import { CALLOUT_TIMER_DEFAULT, CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, MSG_STATUS_SENDING, MAX_WIDTH_IMAGES, UID_SUPPORT_GROUP_MESSAGES, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, TYPE_MSG_FILE, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER, BCK_COLOR_CONVERSATION_SELECTED } from './utils/constants';

// https://www.davebennett.tech/subscribe-to-variable-change-in-angular-4-service/
import { Subscription } from 'rxjs/Subscription';
import { UploadModel } from '../models/upload';
import { UploadService } from './providers/upload.service';
import { ContactService } from './providers/contact.service';
// import { StarRatingWidgetService } from './components/star-rating-widget/star-rating-widget.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import 'rxjs/add/operator/takeWhile';

import { CURR_VER_DEV, CURR_VER_PROD } from '../../current_version';
import { TranslatorService } from './providers/translator.service';

import { trigger, state, style, animate, transition } from '@angular/animations';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None, /* it allows to customize 'Powered By' */
    animations: [
        trigger('rotatedState', [
            state('default', style({ transform: 'scale(0)' })),
            state('rotated', style({ transform: 'scale(1)' })),
            transition('rotated => default', animate('1000ms ease-out')),
            transition('default => rotated', animate('1000ms ease-in'))
        ])
    ]
    //   providers: [AgentAvailabilityService, TranslatorService]
})

export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

    // ========= begin:: parametri di stato widget ======= //
    token: string;
    state = 'default'; /** gestore animazione default/rotated -> displayEyeCatcherCard */
    // isOpen: boolean; /** indica se il pannello conversazioni è aperto o chiuso */
    isWidgetActive: boolean; /** */
    isModalLeaveChatActive = false; /** */
    isLogged = false; /** */
    isOpenSelectionDepartment = true;
    filterSystemMsg = true; /** se è true i messaggi inviati da system non vengono visualizzati */
    isOpenHome = true; /** gestore visualizzazione comp home ( sempre visibile xchè il primo dello stack ) */
    isOpenPrechatForm = false;
    isOpenConversation = false;
    BUILD_VERSION = 'v.' + CURR_VER_PROD + ' b.' + CURR_VER_DEV; // 'b.0.5';
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


    // ========= begin:: variabili widget ======= //
    attributes: any;
    conversationWith: string;
    senderId: string;
    nameFile: string;
    // lang: string;
    messages: MessageModel[];
    departmentSelected: DepartmentModel;
    // ========= begin:: variabili widget ======= //


    // ========= begin:: DA SPOSTARE ======= //
    // ????????//
    IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
    private aliveSubLoggedUser = true; /** ????? */
    // EYE-CATCHER CARD & EYE-CATCHER CARD CLOSE BTN
    displayEyeCatcherCard = 'none';
    displayEyeCatcherCardCloseBtnWrapper = 'none';
    displayEyeCatcherCardCloseBtnIsMobileWrapper = 'none';
    displayEyeCatcherCardCloseBtn = 'none';
    /* EYE-CATCHER CLOSE BUTTON SWITCH */
    // THERE ARE TWO 'CARD CLOSE BUTTONS' THAT ARE DISPLAYED ON THE BASIS OF PLATFORM
    isMobile: boolean;
    // ========= end:: DA SPOSTARE ========= //


    // ========= begin:: parametri configurabili widget ======= //
    isOpen: boolean; /** indica se il pannello conversazioni è aperto o chiuso */
    tenant: string;
    recipientId: string;
    projectid: string;
    widgetTitle: string;
    poweredBy: string;
    userId: string;
    userFullname: string;
    userEmail: string;
    userPassword: string;
    preChatForm: boolean;
    startFromHome: boolean; // !!!!! da aggiungere come parametro !!!!
    channelType: string;
    lang: string;
    align: string;
    hideHeaderCloseButton: boolean;
    wellcomeMsg: string;
    themeColor: string;
    themeForegroundColor: string;
    calloutTimer: number;
    calloutTitle: string;
    calloutMsg: string;
    fullscreenMode: boolean;
    allowTranscriptDownload: boolean;
    firebaseCustomToken: string;
    // ========= end:: parametri configurabili widget ========= //

    constructor(
        private el: ElementRef,
        private g: Globals,
        private ngZone: NgZone,
        private translatorService: TranslatorService,
        public authService: AuthService,
        public messagingService: MessagingService,
        // public starRatingWidgetService: StarRatingWidgetService,
        public upSvc: UploadService,
        public contactService: ContactService
    ) {
        this.initAll();
    }


    private initAll() {
        const that = this;

        this.isOpen = false;
        this.isOpenHome = false;
        this.isOpenPrechatForm = false;
        this.isOpenConversation = false;
        this.preChatForm = true;
        this.isOpenSelectionDepartment = true;
        this.BUILD_VERSION = this.BUILD_VERSION;

        // set lang and in global variables
        this.lang = this.setLanguage();
        this.g.lang = this.lang;
        moment.locale(this.lang);

        // detect is mobile
        this.isMobile = detectIfIsMobile();

        // Related to https://github.com/firebase/angularfire/issues/970
        localStorage.removeItem('firebase:previous_websocket_failure');
        console.log(' ---------------- CONSTRUCTOR ---------------- ');

        // this.initParameters();
        this.g.initialize(this.el);
        console.log(' ---------------- A1 ---------------- ');

        //ATTENZIONE TESTAREREEEE QUESTO SPOSTAMENTO.. 
        this.addComponentToWindow(this.ngZone);

        this.triggetLoadParamsEvent();
        console.log(' ---------------- A2 ---------------- ');

        this.setIsWidgetOpenOrActive();
        console.log(' ---------------- A3 ---------------- ');

        // set auth
        if (this.userEmail && this.userPassword) {
            console.log(' ---------------- 10 ---------------- ');
            // se esistono email e psw faccio un'autenticazione firebase con email
            // this.authService.authenticateFirebaseEmail(this.userEmail, this.userPassword);
        } else if (this.userId) {
            console.log(' ---------------- 11 ---------------- ');
            // SE PASSO LO USERID NON EFFETTUO NESSUNA AUTENTICAZIONE
            // this.authService.getCurrentUser();
            this.senderId = this.userId;
            // this.conversation.createConversation();
            console.log(' ---------------- 12 ---------------- ');
            // this.initializeChatManager();
            console.log(' ---------------- 13 ---------------- ');
            this.aliveSubLoggedUser = false;
            console.log('USER userId: this.isOpen:', this.senderId, this.isOpen);
        } else if (this.g.userToken) {
            console.log(' authenticateFirebaseCustoToken this.firebaseCustomToken', this.firebaseCustomToken);
            // this.authService.authenticateFirebaseCustoToken(this.firebaseCustomToken);
        } else {
            // // faccio un'autenticazione anonima
            // console.log(' authenticateFirebaseAnonymously');
            // this.authService.authenticateFirebaseAnonymously();
            console.log(' ---------------- 14 ---------------- ');
            /** faccio un'autenticazione anonima e
             * visualizzo il widgwt una volta autenticato
             */
            // this.authService.authenticateFirebaseAnonymously();
            // this.authService.obsToken.subscribe((token) => {
            //     this.ngZone.run(() => {
            //         if (token) {
            //             console.log(' ---------------- TOKEN OK  ---------------- ');
            //             that.token = token;
            //             that.isOpen = true;
            //         }
            //     });
            // });


        }

        // SET FORM
        // this.preChatFormGroup = this.createForm(this.formBuilder);
        console.log(' ---------------- 15 ---------------- ');
        // USER AUTENTICATE
        // http://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

        const subLoggedUser: Subscription = this.authService.obsLoggedUser
            .takeWhile(() => that.aliveSubLoggedUser)
            .subscribe(user => {
                console.log(' ---------------- 16 ---------------- ');
                // real time detection of the user authentication status
                this.ngZone.run(() => {
                    // console.log('subLoggedUser: ');
                    if (user) {
                        console.log('USER AUTENTICATE: ', user);
                        // console.log("constructor.subLoggedUser", user);
                        // that.senderId = user.uid;
                        that.senderId = user.user.uid;
                        console.log('USER senderId: ', that.senderId);
                        // that.g.senderId = user.user.uid;
                        // console.log("that.globals.senderId", that.globals.senderId);
                        // that.initConversation();

                        // that.createConversation();
                        // that.initializeChatManager();
                        that.aliveSubLoggedUser = false;
                        that.isLogged = true;
                        console.log('IS_LOGGED', 'AppComponent:constructor:zone-if', that.isLogged);
                        console.log('isLogged', that.isLogged);
                        
                        //attenzione dario
                        that.isOpen = true;

                        this.openIfCallOutTimer();

                    } else {
                        that.isLogged = false;
                        console.log('IS_NOT_LOGGED', that.isLogged);
                        
                        //attenzione dario
                          // faccio un'autenticazione anonima
                        console.log(' authenticateFirebaseAnonymously');
                        this.authService.authenticateFirebaseAnonymously();
                        console.log(' ---------------- 14 ---------------- ');



                    }
                });
            });
            
        this.setOrderComponents();
    }

    setOrderComponents() {
        this.startFromHome = true;
        this.preChatForm = true;

        this.isOpenHome = true;
        this.isOpenConversation = false;
        this.isOpenPrechatForm = false;
        this.isOpenSelectionDepartment = false;

        if (this.startFromHome) {
            this.isOpenHome = true;
            this.isOpenConversation = false;
            this.isOpenPrechatForm = false;
            this.isOpenSelectionDepartment = false;
        } else if (this.preChatForm) {
            this.isOpenConversation = false;
            this.isOpenPrechatForm = true;
            this.isOpenSelectionDepartment = false;
        } else {
            this.isOpenConversation = false;
            this.isOpenPrechatForm = false;
            this.isOpenSelectionDepartment = true;
        }
    }

    private setLanguage() {
        if ( this.translatorService.getBrowserLanguage() ) {
            return this.translatorService.getBrowserLanguage();
        }
        return this.translatorService.getDefaultLanguage();
    }

    private openIfCallOutTimer() {
        const that = this;
        if (this.calloutTimer >= 0) {
            const waitingTime = this.calloutTimer * 1000;
            setTimeout(function () {
                // that.f21_open();
                that.openEyeCatcher();
            }, waitingTime);
        }
    }

    /**
     * OPEN THE EYE-CATCHER CARD (aka CALLOUT) ONLY IF THE CHAT IS CLOSED */
    openEyeCatcher() {
        if (this.g.isOpen === false) {
            console.log('»»»»»»» CALLING OPEN-EYE-CATCHER AND DISPLAY THE CARD ');
            this.displayEyeCatcherCard = 'block';
            this.displayEyeCatcherCardCloseBtnWrapper = 'block';
            this.displayEyeCatcherCardCloseBtnIsMobileWrapper = 'block';
            this.rotateCalloutEmoticon();
        } else {
            console.log('»»»»»»» CALLING OPEN-EYE-CATCHER BUT NOT DISPLAY THE CARD BECAUSE THE CHAT IS ALREADY OPEN ');
        }
    }

    rotateCalloutEmoticon() {
        // this.state = (this.state === 'default' ? 'rotated' : 'default');
        if (this.state === 'default') {
            setTimeout(() => this.state = 'rotated');
        }
    }

    /**
     * *** EYE-CATCHER CARD ***
     * THE CLICK OVER THE EYE-CATCHER CARD OPENS THE CHAT AND CLOSE THE EYE-CATCHER CARD */
    openChatFromEyeCatcherCard() {
        this.f21_open();
        this.displayEyeCatcherCard = 'none';
    }

    /**
     * *** DISPLAY THE EYE-CATCHER CARD CLOSE BTN ***
     * DISPLAY EYE-CATCHER CARD CLOSE BTN THE WHEN THE MOUSE IS OVER EYE-CATCHER CARD OR
     * OVER THE EYE-CATCHER CARD CLOSE BTN WRAPPER */
    mouseEnter() {
        // console.log('MOUSE ENTER THE CARD OR THE CLOSE BTN CONTAINER');
        this.displayEyeCatcherCardCloseBtn = 'block';
    }

    /**
     * *** HIDE THE EYE-CATCHER CARD CLOSE BTN ***
     * HIDE THE EYE-CATCHER CARD CLOSE BTN THE WHEN THE MOUSE LEAVE THE EYE-CATCHER CARD OR
     * LEAVE THE EYE-CATCHER CARD CLOSE BTN WRAPPER */
    mouseLeave() {
        // console.log('MOUSE LEAVE THE CARD OR THE CLOSE BTN CONTAINER');
        this.displayEyeCatcherCardCloseBtn = 'none';
    }

    /**
     * EYE-CATCHER CARD CLOSE BTN */
    closeEyeCatcherCard() {
        console.log('HAS CLICKED CLOSE EYE-CATCHER CARD');
        this.displayEyeCatcherCard = 'none';
        this.displayEyeCatcherCardCloseBtnWrapper = 'none';
    }

    /**
     * EYE-CATCHER CARD CLOSE BTN ON MOBILE DEVICE */
    closeEyeCatcherCardWhenMobile() {

        console.log('HAS CLICKED CLOSE EYE CATCHER CARD WHEN MOBILE ');
        this.displayEyeCatcherCard = 'none';
        this.displayEyeCatcherCardCloseBtnIsMobileWrapper = 'none';
    }

    private addComponentToWindow(ngZone) {
        if (window['tiledesk']) {
            window['tiledesk']['angularcomponent'] = { component: this, ngZone: ngZone };

            window['tiledesk'].close = function () {
                // this.f21_close();
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.f21_close();
                });
            };
            window['tiledesk'].open = function () {
                // this.f21_close();
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.f21_open();
                });
            };
            window['tiledesk'].setUserInfo = function (userInfo) {
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.setUserInfo(userInfo);
                });
            };

            window['tiledesk'].signInWithCustomToken = function (token) {
                ngZone.run(() => {
                    window['tiledesk']['angularcomponent'].component.signInWithCustomToken(token);
                });
            };

            // window['tiledesk'].on = function (event_name, handler) {
            //     console.log("addEventListener for "+ event_name);
            //     this.el.nativeElement.addEventListener(event_name, e =>  handler());
            // };
        }
    }

    private signInWithCustomToken(token) {
        console.log('token', token);
        this.g.userToken = token;

        this.authService.createToken(token, '123').subscribe(
            response => {
                const firebaseToken = response.firebaseToken;
                console.log('firebaseToken', firebaseToken);
                this.firebaseCustomToken = firebaseToken;
                this.authService.authenticateFirebaseCustoToken(this.firebaseCustomToken);
            });




    }

    private setUserInfo(userInfo) {
        console.log('this.attributes', this.attributes);
        console.log('userInfo', userInfo);
        if (userInfo) {
            Object.assign(this.attributes, userInfo);
            // if (userInfo.userFullname) {
            //     this.attributes.userFullname = userInfo.userFullname;
            // }
            // if (userInfo.userEmail) {
            //     this.attributes.userEmail = userInfo.userEmail;
            // }
        }
    }

    private triggetLoadParamsEvent() {
        console.log(' ---------------- 2a ---------------- ');
        const default_settings = {
            'tenant': this.tenant, 'recipientId': this.recipientId, 'projectid': this.projectid,
            'widgetTitle': this.widgetTitle, 'poweredBy': this.poweredBy,
            'userId': this.userId, 'userEmail': this.userEmail, 'userPassword': this.userPassword,
            'userFullname': this.userFullname, 'preChatForm': this.preChatForm, 'isOpen': this.isOpen,
            'channelType': this.channelType, 'lang': this.lang, 'calloutTimer': this.calloutTimer,
            'align': this.align, 'hideHeaderCloseButton': this.hideHeaderCloseButton, 'wellcomeMsg': this.wellcomeMsg,
            'calloutTitle': this.calloutTitle, 'calloutMsg': this.calloutMsg, 'fullscreenMode': this.fullscreenMode,
            'themeColor': this.themeColor, 'themeForegroundColor': this.themeForegroundColor,
            'allowTranscriptDownload': this.allowTranscriptDownload,
            'userToken': this.g.userToken
        };
        const loadParams = new CustomEvent('loadParams', { detail: { default_settings: this.g } });
        console.log(' ---------------- 2b ---------------- ');
        this.el.nativeElement.dispatchEvent(loadParams);
        console.log(' ---------------- 2d ---------------- ');
    }

    /** */
    setIsWidgetOpenOrActive() {
        if (localStorage.getItem('isOpen') === 'true') {
            this.g.isOpen = true;
        } else if (localStorage.getItem('isOpen') === 'false') {
            this.g.isOpen = false;
        }
        this.isWidgetActive = (localStorage.getItem('isWidgetActive')) ? true : false;
    }



    private getParameterByName(name) {
        // if (!url) url = window.location.href;

        const url = window.location.href;

        name = name.replace(/[\[\]]/g, '\\$&');
        // console.log('»»» getParameterByName NAME ', name);
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);

        // console.log('»»» getParameterByName RESULT ', results);
        if (!results) { return null; }

        if (!results[2]) { return ''; }

        // console.log('»»» getParameterByName RESULT[2] ', results[2]);
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }


    ngOnInit() {
        // this.setSubscriptions();
    }

    ngAfterViewInit() {
    }

    /**
     * elimino tutte le sottoscrizioni
     */
    ngOnDestroy() {
        if (window['tiledesk']) {
            window['tiledesk']['angularcomponent'] = null;
        }
        this.unsubscribe();
    }

    unsubscribe() {
        this.subscriptions.forEach(function (subscription) {
            subscription.unsubscribe();
        });
        this.subscriptions.length = 0;
        console.log('this.subscriptions', this.subscriptions);
    }

    /**
     * genero un nuovo conversationWith
     * al login o all'apertura di una nuova conversazione
     */
    generateNewUidConversation() {
        console.log('generateUidConversation **************', this.conversationWith, this.senderId);
        return this.messagingService.generateUidConversation(this.senderId);
    }


    /** */
    setDepartment() {
        // this.openSelectionDepartment = false;
        // this.departmentSelected = department;
        if (!this.attributes.departmentId && this.departmentSelected) {
            this.attributes.departmentId = this.departmentSelected._id;
            this.attributes.departmentName = this.departmentSelected.name;
            console.log('setAttributes setDepartment: ', JSON.stringify(this.attributes));
            if (this.attributes) {
                sessionStorage.setItem('attributes', JSON.stringify(this.attributes));
                localStorage.setItem('attributes', JSON.stringify(this.attributes));
            }
            // JSON.stringify(this.attributes)
        }
    }


    //// ACTIONS ////

    setFocusOnId(id) {
        // id = 'chat21-main-message-context';
        if (this.preChatForm) {
            id = 'form-field-name';
        }
        // console.log('-------------> setFocusOnId: ', id);
        setTimeout(function () {
            const textarea = document.getElementById(id);
            if (textarea) {
                // console.log('1--------> FOCUSSSSSS : ', textarea);
                textarea.setAttribute('value', ' ');
                textarea.focus();
            }
        }, 500);
    }

    /** */
    onSelectDepartment(department) {
        console.log('onSelectDepartment: ', department);
        // this.departmentSelected = department;
        // this.setDepartment(department);
        // this.openSelectionDepartment = false;
        this.departmentSelected = department;
        this.setFocusOnId('chat21-main-message-context');
    }


    open_close_handler() {
        // this.isOpen = isOpen;
        console.log('open_close_handlerHP: ', this.g.isOpen);
        this.displayEyeCatcherCard = 'none';
        this.displayEyeCatcherCardCloseBtnWrapper = 'none';
        this.displayEyeCatcherCardCloseBtnIsMobileWrapper = 'none';
        this.displayEyeCatcherCardCloseBtn = 'none';
        if (this.g.isOpen) {
            this.f21_close();
        } else {
            this.f21_open();
        }
    }
    /**
     * apro il popup conversazioni
     */
    f21_open() {
        // console.log('f21_open senderId: ', this.senderId);
        if (this.senderId) {
            this.g.isOpen = true; // !this.isOpen;
            sessionStorage.setItem('isOpen', 'true');
            localStorage.setItem('isOpen', 'true');
            // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
            // console.log('f21_open   ---- isOpen::', this.isOpen, this.attributes.departmentId);
            this.scrollToBottom();
            // console.log('FOCUSSSSSS 5: ', document.getElementById('chat21-main-message-context'));
            if (this.attributes.departmentId) {
                this.setFocusOnId('chat21-main-message-context');
            }
            // }
        }
    }

    /**
    * chiudo il popup conversazioni
    */
    f21_close() {
        console.log('isOpen::', this.g.isOpen);
        // this.restoreTextArea();
        this.g.isOpen = false;
        sessionStorage.setItem('isOpen', 'false');
        localStorage.setItem('isOpen', 'false');
        // sessionStorage.removeItem('isOpen');
    }

    /**
     * srollo la lista messaggi all'ultimo
     * chiamato in maniera ricorsiva sino a quando non risponde correttamente
     */
    scrollToBottom() {
        const that = this;
        setTimeout(function () {
            try {
                const objDiv = document.getElementById('chat21-contentScroll');
                // console.log('scrollTop1 ::', objDiv.scrollTop, objDiv.scrollHeight);
                //// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
                objDiv.scrollIntoView(false);
                // that.badgeNewMessages = 0;
            } catch (err) {
                // console.log('RIPROVO ::', that.isOpen);
                if (that.isOpen === true) {
                    that.scrollToBottom();
                }
            }
        }, 300);
    }





    // tslint:disable-next-line:max-line-length
    private triggerBeforeSendMessageEvent(senderFullname, text, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type) {
        try {
            // tslint:disable-next-line:max-line-length
            const loadEvent = new CustomEvent('beforeMessageSend', { detail: { senderFullname: senderFullname, text: text, type: type, metadata, conversationWith: conversationWith, recipientFullname: recipientFullname, attributes: attributes, projectid: projectid, channelType: channel_type } });
            this.el.nativeElement.dispatchEvent(loadEvent);
        } catch (e) {
            console.error('Error triggering triggerBeforeSendMessageEvent', e);
        }
    }
    // tslint:disable-next-line:max-line-length
    private triggerAfterSendMessageEvent(message) {

        try {
            // tslint:disable-next-line:max-line-length
            const loadEvent = new CustomEvent('afterMessageSend', { detail: { message: message } });

            this.el.nativeElement.dispatchEvent(loadEvent);
        } catch (e) {
            console.error('Error triggering triggerAfterSendMessageEvent', e);
        }
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
        this.ngOnDestroy();
        console.log('unsubscribe OK', this.subscriptions);
        this.recipientId = this.generateNewUidConversation();
        console.log(' recipientId: ', this.recipientId);
        console.log(' senderId: ', this.senderId);
        console.log(' projectid: ', this.g.projectid);
        console.log(' channelType: ', this.g.channelType);
        console.log('NEW conversationWith:', this.conversationWith);
    }


    convertMessage(msg) {
        let messageText = encodeHTML(msg);
        messageText = urlify(messageText);
        // console.log('messageText: ' + messageText);
        return messageText;
    }


    openModal(id) {
        if ( id === 'isModalLeaveChatActive' ) {
            this.isModalLeaveChatActive = (this.isModalLeaveChatActive ? false : true);
        }
    }
    leaveChat() {
        this.openModal('isModalLeaveChatActive');
        this.messagingService.closeConversation();
    }

    dowloadTranscript() {
        const url = 'https://api.tiledesk.com/v1/public/requests/' + this.conversationWith + '/messages.html';
        window.open(url, '_blank');
    }

    checkChatClosed(attributes) {
        // console.log('ADD BUTTON VALUTA *****', attributes);
        if ( attributes['subtype'] === 'info/support' && attributes['messagelabel'].key === 'CHAT_CLOSED' ) {
            return true;
        }
        return false;
    }


    // DYNAMIC COLOR CSS BUTTON  //
    styleButtonLeave(event) {
        event.target.style.backgroundColor =  this.themeForegroundColor;
        event.target.style.borderColor = this.themeColor;
        event.target.style.color  = this.themeColor;
    }
    styleButtonOver(event) {
        event.target.style.backgroundColor = this.themeColor;
        event.target.style.borderColor = this.themeForegroundColor;
        event.target.style.color  = this.themeForegroundColor;
    }





    // ========= begin:: CALLBACK FUNCTIONS ============//
    private openHP() {
        this.g.isOpenHome = true;
    }

    /**
     * MODAL SELECTION DEPARTMENT:
     * selected department
     */
    private returnDepartmentSelected($event) {
        if ( $event ) {
            console.log('onSelectDepartment: ', $event);
            this.departmentSelected = $event;
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
        setTimeout(() => {
            // console.log('hide');
            this.isOpenPrechatForm = false;
        }, 300);

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


    private returnSelectedConversation($event) {
        if ( $event ) {
            this.recipientId = $event.recipient;
            this.isOpenConversation = true;
            console.log('onSelectConversation in APP COMPONENT: ', $event);
            // this.messagingService.initialize(this.senderId, this.tenant, this.channelType);
            // this.messages = this.messagingService.messages;
        }
    }


    /**
     * controllo se prechat form è attivo e lo carico - stack 3
     * controllo se departments è attivo e lo carico - stack 2
     * carico conversazione - stack 1
     * home - stack 0
     */
    private returnNewConversation() {
        console.log('returnNewConversation in APP COMPONENT');
        if (this.preChatForm) {
            this.isOpenPrechatForm = true;
            this.isOpenSelectionDepartment = false;
        } else {
            this.isOpenPrechatForm = false;
            this.isOpenSelectionDepartment = true;
        }
        this.startNwConversation();
        // setTimeout(function () {
        //     this.isOpenConversation = true;
        // }, 200);
    }

    private returnClose() {
        this.f21_close();
    }

    private returnCloseConversation() {
        const that = this;
        // parte animazione per chiudere conversazione
        this.isOpenHome = false;
        setTimeout(function () {
            // cache conversazioni
            // aggiorno cache dopo load
            that.isOpenHome = true;
        }, 1);
        this.isOpenConversation = false;
    }

    private returnToHome() {
        this.isOpenSelectionDepartment = false;
        this.isOpenPrechatForm = false;
        // this.g.isOpenConversation = false;
    }

    private returnCloseForm() {
        this.attributes.userFullname = this.g.userFullname;
        this.attributes.userEmail = this.g.userEmail;
        if (this.attributes) {
            localStorage.setItem('attributes', JSON.stringify(this.attributes));
        }
        this.isOpenPrechatForm = false;
    }
    // ========= end:: CALLBACK FUNCTIONS ============//

}
