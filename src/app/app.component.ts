import { ElementRef, Component, OnInit, OnDestroy, AfterViewInit, ViewChild, HostListener, NgZone } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../environments/environment';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

// services
import { AuthService } from './core/auth.service';
import { MessagingService } from './providers/messaging.service';
import { AgentAvailabilityService } from './providers/agent-availability.service';
// models
import { MessageModel } from '../models/message';
import { DepartmentModel } from '../models/department';

// utils
import { strip_tags, isPopupUrl, popupUrl, setHeaderDate, searchIndexInArrayForUid, urlify, encodeHTML } from './utils/utils';
// tslint:disable-next-line:max-line-length
import { CALLOUT_TIMER_DEFAULT, CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, MSG_STATUS_SENDING, MAX_WIDTH_IMAGES, UID_SUPPORT_GROUP_MESSAGES, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, TYPE_MSG_FILE, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER, BCK_COLOR_CONVERSATION_SELECTED } from './utils/constants';

// https://www.davebennett.tech/subscribe-to-variable-change-in-angular-4-service/
import { Subscription } from 'rxjs/Subscription';
import { UploadModel } from '../models/upload';
import { UploadService } from './providers/upload.service';
import { ContactService } from './providers/contact.service';
import { StarRatingWidgetService } from './components/star-rating-widget/star-rating-widget.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import 'rxjs/add/operator/takeWhile';

import { CURR_VER_DEV, CURR_VER_PROD } from '../../current_version';
import { TranslatorService } from './providers/translator.service';

import { trigger, style, animate, transition } from '@angular/animations';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    animations: [
        trigger(
            'enterCloseAnimation', [
                transition(':enter', [
                    style({ transform: 'rotate(0deg)', opacity: 0 }),
                    animate('400ms ease-out', style({ transform: 'rotate(90deg)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'rotate(90deg)', opacity: 1 }),
                    animate('400ms ease-in', style({ transform: 'rotate(0deg)', opacity: 0 }))
                ])
            ]
        ),
        trigger(
            'enterBubbleAnimation', [
                transition(':enter', [
                    style({ transform: 'scale(0.5)', opacity: 0 }),
                    animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'scale(1)', opacity: 1 }),
                    animate('200ms ease-in', style({ transform: 'scale(0.5)', opacity: 0 }))
                ])
            ]
        )

    ]
    //   providers: [AgentAvailabilityService, TranslatorService]
})

export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('scrollMe') private scrollMe: ElementRef;
    @ViewChild('chat21Content') private chatContent: ElementRef;

    isOpen: boolean; /** indica se il pannello conversazioni è aperto o chiuso */
    // loggedUser: any;
    // loggedUserUid: string;
    subscriptions: Subscription[] = [];
    arrayFiles4Load: Array<any>;
    attributes: any;

    messages: MessageModel[];
    conversationWith: string;
    senderId: string;
    nameFile: string;
    tenant: string;
    recipientId: string;
    lang: string;


    myForm: FormGroup;
    public events: any[] = [];
    public submitted: boolean;

    isSelected = false;
    isConversationOpen = true;

    isPopupUrl = isPopupUrl;
    popupUrl = popupUrl;
    strip_tags = strip_tags;

    MSG_STATUS_SENT = MSG_STATUS_SENT;
    MSG_STATUS_SENT_SERVER = MSG_STATUS_SENT_SERVER;
    MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;

    BUILD_VERSION = 'v.' + CURR_VER_PROD + ' b.' + CURR_VER_DEV; // 'b.0.5';
    CLIENT_BROWSER = navigator.userAgent;

    textInputTextArea: String;
    HEIGHT_DEFAULT = '40px';
    myStyles = {
        'overflow-x': 'hidden',
        'word-wrap': 'break-word',
        'resize': 'none',
        'overflow-y': 'auto',
        'height': this.HEIGHT_DEFAULT,
        'max-height': '100px',
        'border': 'none',
        'padding': '10px'
    };
    selectedFiles: FileList;
    isWidgetActive: boolean;
    isLogged = false;

    departments: DepartmentModel[];
    attributes_message: any;
    openSelectionDepartment: boolean;
    departmentSelected: DepartmentModel;

    IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
    // '../assets/images/c21-customer-service.svg';
    // 'https://user-images.githubusercontent.com/32448495/38661877-a44476dc-3e32-11e8-913d-747a8527b2b5.png';
    filterSystemMsg = true; // se è true i messaggi inviati da system non vengono visualizzati

    writingMessage = '';

    userId: string;
    userFullname: string;
    userEmail: string;
    userPassword: string;
    projectid: string;
    projectname: string;
    preChatForm: boolean;
    chatName: string;
    poweredBy: string;
    channelType: string;
    calloutTimer: number;
    align: string;
    hideHeaderCloseButton: boolean;
    wellcomeMsg: string;

    private aliveSubLoggedUser = true;
    private isNewConversation = true;

    showButtonToBottom = false;
    contentScroll: any;
    NUM_BADGES = 0;

    // ========= begin::agent availability
    private areAgentsAvailableText: string;
    private areAgentsAvailable: boolean = false;
    // ========= end::agent availability

    // text used within the html
    private LABEL_PLACEHOLDER: string;
    private LABEL_START_NW_CONV: string;
    private LABEL_FIRST_MSG: string;
    private LABEL_SELECT_TOPIC: string;
    private LABEL_COMPLETE_FORM: string;
    private LABEL_FIELD_NAME: string;
    private LABEL_ERROR_FIELD_NAME: string;
    private LABEL_FIELD_EMAIL: string;
    private LABEL_ERROR_FIELD_EMAIL: string;
    private LABEL_WRITING: string;
    private AGENT_NOT_AVAILABLE: string;
    private AGENT_AVAILABLE: string;
    private GUEST_LABEL: string;
    private ALL_AGENTS_OFFLINE_LABEL: string;


    // // ========= begin::hardcoded translations
    // LABEL_PLACEHOLDER = 'Scrivi la tua domanda...'; // 'Type your message...';  // type your message...
    // LABEL_START_NW_CONV = 'INIZIA UNA NUOVA CONVERSAZIONE'; // 'START NEW CONVERSATION'; //
    // tslint:disable-next-line:max-line-length
    // LABEL_FIRST_MSG = 'Descrivi sinteticamente il tuo problema, ti metteremo in contatto con un operatore specializzato'; // 'Describe shortly your problem, you will be contacted by an agent';
    // LABEL_SELECT_TOPIC = 'Seleziona un argomento'; // 'Select a topic';
    // tslint:disable-next-line:max-line-length
    // LABLEL_COMPLETE_FORM = 'Completa il form per iniziare una conversazione con il prossimo agente disponibile.'; // 'Complete the form to start a conversation with the next available agent.';
    // LABEL_FIELD_NAME = '* Nome'; // '* Name';
    // LABEL_ERROR_FIELD_NAME = 'Nome richiesto (minimo 2 caratteri).'; // 'Required field (minimum 5 characters).';
    // LABEL_FIELD_EMAIL = '* Email';
    // // tslint:disable-next-line:max-line-length
    // LABEL_ERROR_FIELD_EMAIL = 'Inserisci un indirizzo email valido.'; // 'Enter a valid email address.';
    // LABEL_WRITING = 'sta scrivendo...'; // 'is writing...';
    // private AGENT_NOT_AVAILABLE: string = " - Offline";
    // private AGENT_AVAILABLE: string = " - Online";
    // // ========= end::hardcoded translations
    // private GUEST_LABEL = "Guest";
    // private ALL_AGENTS_OFFLINE_LABEL = "Tutti gli operatori sono offline al momento";

    private window: Window;
    private isFilePendingToUpload: boolean = false;
    private baseLocation: string;

    constructor(
        private zone: NgZone,
        public authService: AuthService,
        public messagingService: MessagingService,
        public starRatingWidgetService: StarRatingWidgetService,
        public upSvc: UploadService,
        public contactService: ContactService,
        public formBuilder: FormBuilder,
        public el: ElementRef,
        private agentAvailabilityService: AgentAvailabilityService,
        private translatorService: TranslatorService,
        private ngZone: NgZone
    ) {
        this.initAll();
    }

    private initAll() {

        // RElated to https://github.com/firebase/angularfire/issues/970
        localStorage.removeItem('firebase:previous_websocket_failure');

        console.log(' ---------------- COSTRUCTOR ---------------- ');

        this.lang = this.translatorService.getBrowserLanguage() ?
            this.translatorService.getBrowserLanguage() :
            this.translatorService.getDefaultLanguage();

        this.initParameters();
        this.triggetLoadParamsEvent();

        this.getVariablesFromAttributeHtml();
        this.getVariablesFromSettings();
        this.getVariableUrlParameters();

        this.settingParams();

        console.log('tenant', this.tenant);
        console.log('recipientId', this.recipientId);
        console.log('projectid', this.projectid);
        console.log('projectname', this.projectname);
        console.log('chatName', this.chatName);
        console.log('poweredBy', this.poweredBy);
        console.log('userId', this.userId);
        console.log('userEmail', this.userEmail);
        console.log('userPassword', this.userPassword);
        console.log('userFullname', this.userFullname);
        console.log('preChatForm', this.preChatForm);
        console.log('isOpen', this.isOpen);
        console.log('channelType', this.channelType);
        console.log('lang', this.lang);
        console.log('calloutTimer', this.calloutTimer);
        console.log('align ', this.align);
        console.log('hideHeaderCloseButton ', this.hideHeaderCloseButton);
        console.log('wellcomeMsg ', this.wellcomeMsg);



        this.setAvailableAgentsStatus();

        // if the lang is passed as parameter use it, oterwise use a default language ("en")
        this.translatorService.setLanguage(!this.lang ? 'en' : this.lang);
        this.translate();

        // set auth
        if (this.userEmail && this.userPassword) {
            // se esistono email e psw faccio un'autenticazione firebase con email
            // this.authService.authenticateFirebaseEmail(this.userEmail, this.userPassword);
        } else if (this.userId) {
            // SE PASSO LO USERID NON EFFETTUO NESSUNA AUTENTICAZIONE
            // this.authService.getCurrentUser();

            this.senderId = this.userId;
            this.createConversation();
            this.initialize();
            this.aliveSubLoggedUser = false;
            console.log('USER userId: this.isOpen:', this.senderId, this.isOpen);
        } else {
            // faccio un'autenticazione anonima
            this.authService.authenticateFirebaseAnonymously();
        }

        // SET FORM
        this.myForm = this.setForm(this.formBuilder);

        // USER AUTENTICATE
        // http://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
        const that = this;
        const subLoggedUser: Subscription = this.authService.obsLoggedUser
            .takeWhile(() => that.aliveSubLoggedUser)
            .subscribe(user => {

                // real time detection of the user authentication status
                this.zone.run(() => {
                    if (user) {
                        console.log('USER AUTENTICATE: ', user);
                        // console.log("constructor.subLoggedUser", user);
                        // that.senderId = user.uid;
                        that.senderId = user.user.uid;
                        // console.log("constructor.subLoggedUser", that.senderId);
                        // that.initConversation();

                        that.createConversation();
                        that.initialize();
                        that.aliveSubLoggedUser = false;
                        that.isLogged = true;
                        console.log('IS_LOGGED', 'AppComponent:constructor:zone-if', that.isLogged);
                        console.log('isLogged', that.isLogged);

                        this.openIfCallOutTimer();

                    } else {
                        that.isLogged = false;
                        console.log('IS_LOGGED', 'AppComponent:constructor:zone-else', that.isLogged);
                    }
                });

                // if (user) {
                //     console.log('USER AUTENTICATE: ', user);
                //     // console.log("constructor.subLoggedUser", user);
                //     // that.senderId = user.uid;
                //     that.senderId = user.user.uid;
                //     // console.log("constructor.subLoggedUser", that.senderId);
                //     // that.initConversation();

                //     that.createConversation();
                //     that.initialize();
                //     that.aliveSubLoggedUser = false;
                //     that.isLogged = true;
                //     console.log("isLogged", that.isLogged);
                // } else {
                //     that.isLogged = false;
                // }
            });

        this.addComponentToWindow(this.ngZone);

    }

    private openIfCallOutTimer() {
        const that = this;
        if (this.calloutTimer >= 0) {
            const waitingTime = this.calloutTimer * 1000;
            setTimeout(function () {
                that.f21_open();
            }, waitingTime);
        }
    }
    private initParameters() {
        this.tenant = environment.tenant;
        this.preChatForm = false;
        this.chatName = 'TileDesk';
        this.poweredBy = '<a target="_blank" href="http://www.tiledesk.com/">Powered by <b>TileDesk</b></a>';
        this.isOpen = false;
        this.channelType = CHANNEL_TYPE_GROUP;
        this.align = 'right';
        this.calloutTimer = -1;
        this.hideHeaderCloseButton = false;
        this.wellcomeMsg = '';
        // for retrocompatibility 0.9 (without tiledesk.js)
        this.baseLocation = 'https://widget.tiledesk.com';

        if (window['tiledesk']) {
            this.baseLocation = window['tiledesk'].getBaseLocation();
        }
        console.log('baseLocation', this.baseLocation);
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
            // window['tiledesk'].on = function (event_name, handler) {
            //     console.log("addEventListener for "+ event_name);
            //     this.el.nativeElement.addEventListener(event_name, e =>  handler());
            // };
        }
    }


    private triggetLoadParamsEvent() {
        const loadParams = new CustomEvent('loadParams', { detail: {} });

        this.el.nativeElement.dispatchEvent(loadParams);

    }

    private translate() {
        this.LABEL_PLACEHOLDER = this.translatorService.translate('LABEL_PLACEHOLDER');
        this.LABEL_START_NW_CONV = this.translatorService.translate('LABEL_START_NW_CONV');
        this.LABEL_FIRST_MSG = this.translatorService.translate('LABEL_FIRST_MSG');
        this.LABEL_SELECT_TOPIC = this.translatorService.translate('LABEL_SELECT_TOPIC');
        this.LABEL_COMPLETE_FORM = this.translatorService.translate('LABEL_COMPLETE_FORM');
        this.LABEL_FIELD_NAME = this.translatorService.translate('LABEL_FIELD_NAME');
        this.LABEL_ERROR_FIELD_NAME = this.translatorService.translate('LABEL_ERROR_FIELD_NAME');
        this.LABEL_FIELD_EMAIL = this.translatorService.translate('LABEL_FIELD_EMAIL');
        this.LABEL_ERROR_FIELD_EMAIL = this.translatorService.translate('LABEL_ERROR_FIELD_EMAIL');
        this.LABEL_WRITING = this.translatorService.translate('LABEL_WRITING');
        this.AGENT_NOT_AVAILABLE = this.translatorService.translate('AGENT_NOT_AVAILABLE');
        this.AGENT_AVAILABLE = this.translatorService.translate('AGENT_AVAILABLE');
        this.GUEST_LABEL = this.translatorService.translate('GUEST_LABEL');
        this.ALL_AGENTS_OFFLINE_LABEL = this.translatorService.translate('ALL_AGENTS_OFFLINE_LABEL');
    }

    /** */
    settingParams() {
        // SETTINGS
        //// setto widget language
        moment.locale('it');
        //// get isOpen from storage;
        if (sessionStorage.getItem('isOpen') === 'true') {
            this.isOpen = true;
        } else if (sessionStorage.getItem('isOpen') === 'false') {
            this.isOpen = false;
        }
        //// get isWidgetActive (poll) from storage;
        this.isWidgetActive = (sessionStorage.getItem('isWidgetActive')) ? true : false;
    }

    private getVariableUrlParameters() {
        // console.log("getUrlParameters");

        if (this.getParameterByName('tiledesk_tenant')) {
            this.tenant = this.getParameterByName('tiledesk_tenant');
            // console.log("getUrlParameters.tenant",  this.tenant);
        }

        if (this.getParameterByName('tiledesk_recipientid')) {
            this.recipientId = this.getParameterByName('tiledesk_recipientid');
            // console.log("getUrlParameters.recipientId", this.recipientId);
        }

        if (this.getParameterByName('tiledesk_projectid')) {
            this.projectid = this.getParameterByName('tiledesk_projectid');
            // console.log("getUrlParameters.projectid", this.projectid);
        }

        if (this.getParameterByName('tiledesk_projectname')) {
            this.projectname = this.getParameterByName('tiledesk_projectname');
            // console.log("getUrlParameters.projectname", this.projectname);
        }

        if (this.getParameterByName('tiledesk_chatname')) {
            this.chatName = this.getParameterByName('tiledesk_chatname');
            // console.log("getUrlParameters.chatName", this.chatName);
        }

        if (this.getParameterByName('tiledesk_poweredby')) {
            this.poweredBy = this.getParameterByName('tiledesk_poweredby');
            // console.log("getUrlParameters.poweredBy", this.poweredBy);
        }

        if (this.getParameterByName('tiledesk_userid')) {
            this.userId = this.getParameterByName('tiledesk_userid');
            // console.log("getUrlParameters.userId", this.userId);
        }

        if (this.getParameterByName('tiledesk_useremail')) {
            this.userEmail = this.getParameterByName('tiledesk_useremail');
            // console.log("getUrlParameters.userEmail", this.userEmail);
        }

        if (this.getParameterByName('tiledesk_userpassword')) {
            this.userPassword = this.getParameterByName('tiledesk_userpassword');
            // console.log("getUrlParameters.userPassword", this.userPassword);
        }

        if (this.getParameterByName('tiledesk_userfullname')) {
            this.userFullname = this.getParameterByName('tiledesk_userfullname');
            // console.log("getUrlParameters.userFullname", this.userFullname);
        }

        // console.log('this.getParameterByName(tiledesk_prechatform)', this.getParameterByName('tiledesk_prechatform'));
        if (this.getParameterByName('tiledesk_prechatform')) {
            this.preChatForm = true;
            // console.log("getUrlParameters.preChatForm", this.preChatForm);
        }

        if (this.getParameterByName('tiledesk_isopen')) {
            this.isOpen = true;
            // console.log("getUrlParameters.isOpen", this.isOpen);
        }

        if (this.getParameterByName('tiledesk_channeltype')) {
            this.channelType = this.getParameterByName('tiledesk_channeltype');
            // console.log("getUrlParameters.channelType", this.channelType);
        }

        if (this.getParameterByName('tiledesk_lang')) {
            this.lang = this.getParameterByName('tiledesk_lang');
            // console.log("getUrlParameters.lang", this.lang);
        }
        const cotAsString = this.getParameterByName('tiledesk_callouttimer');
        console.log('cotAsString', cotAsString);
        // if (cotAsString && Number.isNaN(Number(cotAsString))) {
        if (cotAsString) {
            this.calloutTimer = Number(cotAsString);
            // console.log("getUrlParameters.tiledesk_callouttimer", this.calloutTimer);
        }

        // nk: chat21-launcher-button alignment
        if (this.getParameterByName('tiledesk_align')) {
            this.align = this.getParameterByName('tiledesk_align');
            console.log('»»» GET VARIABLE URL PARAMETERS - ALIGN ', this.align);
        }

        // nk
        if (this.getParameterByName('tiledesk_hideheaderclosebutton')) {
            this.hideHeaderCloseButton = true;
            console.log('»»» GET VARIABLE URL PARAMETERS - HIDE HEADER CLOSE BUTTON ', this.hideHeaderCloseButton);
        }

        // nk: USED FOR: if is not empty wellcomeMsg is displayed wellcomeMsg and not LABEL_FIRST_MSG
        if (this.getParameterByName('tiledesk_wellcomemsg')) {
            this.wellcomeMsg = this.getParameterByName('tiledesk_wellcomemsg');
            console.log('»»» GET VARIABLE URL PARAMETERS - WELCOME MSG ', this.wellcomeMsg);
        }
    }

    private setAvailableAgentsStatus() {
        this.agentAvailabilityService
            .getAvailableAgents(this.projectid)
            .subscribe(
                (availableAgents) => {
                    console.log('availableAgents', availableAgents);

                    if (availableAgents.length <= 0) {
                        this.areAgentsAvailable = false;
                        this.areAgentsAvailableText = this.AGENT_NOT_AVAILABLE;
                    } else {
                        this.areAgentsAvailable = true;
                        this.areAgentsAvailableText = this.AGENT_AVAILABLE;
                    }

                    console.log("AppComponent::setAvailableAgentsStatus::areAgentsAvailable:", this.areAgentsAvailable)
                }, (error) => {
                    // console.error("INNER-setOnlineStatus::setAvailableAgentsStatus::error", error);
                    console.error('setOnlineStatus::setAvailableAgentsStatus', error);

                }, () => {

                }
            );
        // , (error) => {
        //     console.log("OUTER-setOnlineStatus::setAvailableAgentsStatus::error", error);
        // },() => {

        // }
    }

    private getParameterByName(name) {
        // if (!url) url = window.location.href;

        var url = window.location.href;

        name = name.replace(/[\[\]]/g, "\\$&");

        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);

        if (!results) return null;

        if (!results[2]) return '';

        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    /**
     * tenant:
     * recipientId:
     * projectid:
     * chatName:
     * poweredBy:
     * userId:
     * userEmail:
     * userPassword:
     * userFullname:
     * preChatForm:
     * align
     * callouTimer
     * hideHeaderCloseButton
    */
    getVariablesFromSettings() {
        // https://stackoverflow.com/questions/45732346/externally-pass-values-to-an-angular-application
        if (!window['tiledesk']) {
            console.log('tiledeskSettings is not defined');
            return 0;
        }

        let TEMP;
        TEMP = window['tiledeskSettings']['tenant'];

        if (TEMP) {
            this.tenant = TEMP;
        }

        TEMP = window['tiledeskSettings']['recipientId'];
        if (TEMP) {
            this.recipientId = TEMP;
        }

        TEMP = window['tiledeskSettings']['projectid'];
        if (TEMP) {
            this.projectid = TEMP;
        }

        TEMP = window['tiledeskSettings']['projectname'];
        if (TEMP) {
            this.projectname = TEMP;
        }

        TEMP = window['tiledeskSettings']['chatName'];
        if (TEMP) {
            this.chatName = TEMP; // di default TileDesk
        }

        TEMP = window['tiledeskSettings']['poweredBy'];
        if (TEMP) {
            this.poweredBy = TEMP;
        }

        TEMP = window['tiledeskSettings']['userId'];
        if (TEMP) {
            this.userId = TEMP;
        }

        TEMP = window['tiledeskSettings']['userEmail'];
        if (TEMP) {
            this.userEmail = TEMP;
        }

        TEMP = window['tiledeskSettings']['userPassword'];
        if (TEMP) {
            this.userPassword = TEMP;
        }

        TEMP = window['tiledeskSettings']['userFullname'];
        if (TEMP) {
            this.userFullname = TEMP;
        }

        TEMP = window['tiledeskSettings']['preChatForm'];
        if (TEMP) {
            this.preChatForm = true;
        }
        //  = (TEMP == null) ? false : true;

        TEMP = window['tiledeskSettings']['isOpen'];
        if (TEMP) {
            this.isOpen = true;
        }
        // this.isOpen = (TEMP == null) ? false : true;

        TEMP = window['tiledeskSettings']['channelType'];
        if (TEMP) {
            this.channelType = TEMP;
        }

        TEMP = window['tiledeskSettings']['lang'];
        if (TEMP) {
            this.lang = TEMP;
        }

        // nk: chat21-launcher-button alignment
        TEMP = window['tiledeskSettings']['align'];
        if (TEMP) {
            this.align = TEMP;
            console.log('»»» GET VARIABLES FROM SETTINGS - ALIGN ', this.align);
        }

        TEMP = window['tiledeskSettings']['calloutTimer'];
        if (TEMP) {
            this.calloutTimer = TEMP;
            console.log('»»» GET VARIABLES FROM SETTINGS - CALLOUT TIMER ', this.calloutTimer);
        }

        // nk
        TEMP = window['tiledeskSettings']['hideHeaderCloseButton'];
        if (TEMP) {
            this.hideHeaderCloseButton = true;
            console.log('»»» GET VARIABLES FROM SETTINGS - HIDE HEADER CLOSE BTN ', this.hideHeaderCloseButton);
        }

        // nk: USED FOR: if is not empty wellcomeMsg is displayed wellcomeMsg and not LABEL_FIRST_MSG
        TEMP = window['tiledeskSettings']['wellcomeMsg'];
        if (TEMP) {
            this.wellcomeMsg = TEMP;
            console.log('»»» GET VARIABLES FROM SETTINGS - WELCOME MSG ', this.wellcomeMsg);
        }
    }

    // /**
    //  * tenant:
    //  * recipientId:
    //  * projectid:
    //  * chatName:
    //  * poweredBy:
    //  * userId:
    //  * userEmail:
    //  * userPassword:
    //  * userFullname:
    //  * preChatForm:
    //  * align
    //  * calloutTimer
    //  * hideHeaderCloseButton
    // */
    getVariablesFromAttributeHtml() {
        // https://stackoverflow.com/questions/45732346/externally-pass-values-to-an-angular-application
        let TEMP;
        TEMP = this.el.nativeElement.getAttribute('tenant');
        if (TEMP) {
            this.tenant = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('recipientId');
        if (TEMP) {
            this.recipientId = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('projectid');
        if (TEMP) {
            this.projectid = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('projectname');
        if (TEMP) {
            this.projectname = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('chatName');
        if (TEMP) {
            this.chatName = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('poweredBy');
        if (TEMP) {
            this.poweredBy = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('userId');
        if (TEMP) {
            this.userId = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('userEmail');
        if (TEMP) {
            this.userEmail = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('userPassword');
        if (TEMP) {
            this.userPassword = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('userFullname');
        if (TEMP) {
            this.userFullname = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('preChatForm');
        if (TEMP) {
            this.preChatForm = true;
        }

        TEMP = this.el.nativeElement.getAttribute('isOpen');
        if (TEMP) {
            this.isOpen = true;
        }

        TEMP = this.el.nativeElement.getAttribute('channelType');
        if (TEMP) {
            this.channelType = TEMP;
        }

        TEMP = this.el.nativeElement.getAttribute('lang');
        if (TEMP) {
            this.lang = TEMP;
        }

        // nk: aligns the chat21-launcher-button
        TEMP = this.el.nativeElement.getAttribute('align');
        if (TEMP) {
            this.align = TEMP;
            console.log('»»» GET VARIABLES FROM ATTRIBUTE HTML - ALIGN ', this.align);
        }

        TEMP = this.el.nativeElement.getAttribute('calloutTimer');
        if (TEMP) {
            this.calloutTimer = TEMP;
            console.log('»»» GET VARIABLES FROM ATTRIBUTE HTML - CALLOUT TIMER ', this.calloutTimer);
        }

        // nk
        TEMP = this.el.nativeElement.getAttribute('hideHeaderCloseButton');
        if (TEMP) {
            this.hideHeaderCloseButton = true;
            console.log('»»» GET VARIABLES FROM ATTRIBUTE HTML - HIDE HEADER CLOSE BTN ', this.hideHeaderCloseButton);
        }

        // nk: USED FOR: if is not empty wellcomeMsg is displayed wellcomeMsg and not LABEL_FIRST_MSG
        TEMP = this.el.nativeElement.getAttribute('wellcomeMsg');
        if (TEMP) {
            this.wellcomeMsg = TEMP;
            console.log('»»» GET VARIABLES FROM ATTRIBUTE HTML - WELLCOME MSG ', this.wellcomeMsg);
        }
    }

    // START FORM
    // https://scotch.io/tutorials/using-angular-2s-model-driven-forms-with-formgroup-and-formcontrol
    /** */
    setForm(formBuilder): FormGroup {
        // SET FORM
        // const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
        // tslint:disable-next-line:max-line-length
        const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const myForm = formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
            name: ['', Validators.compose([Validators.minLength(2), Validators.required])]
        });
        return myForm;
    }
    /** */
    subcribeToFormChanges() {
        const that = this;
        const myFormValueChanges$ = this.myForm.valueChanges;
        myFormValueChanges$.subscribe(x => {
            that.userFullname = x.name;
            that.userEmail = x.email;
            that.attributes.userEmail = x.email;
            that.attributes.userName = x.name;
        });
    }
    /** */
    closeForm() {
        // tslint:disable-next-line:no-debugger
        // debugger;
        // recupero email inserita nel form e fullname
        // salvo tutto nello storage e successivamente le invio con il messaggio!!!!
        this.attributes.userName = this.userFullname;
        this.attributes.userEmail = this.userEmail;
        if (this.attributes) {
            sessionStorage.setItem('attributes', JSON.stringify(this.attributes));
        }
        this.preChatForm = false;
        this.setFocusOnId('chat21-main-message-context');
    }
    // END FORM

    /**
     * imposto le sottoscrizioni
     * 1 - messaggio aggiunto
     * 2 - messaggio modificato
     * 3 - utente eliminato dal gruppo (CHAT CHIUSA)
     */
    setSubscriptions() {
        console.log('setSubscriptions: ');
        const that = this;
        // CHIUSURA CONVERSAZIONE (ELIMINAZIONE UTENTE DAL GRUPPO)
        const subscriptionIsWidgetActive: Subscription = this.starRatingWidgetService.observable
            .subscribe(isWidgetActive => {
                that.isWidgetActive = isWidgetActive;
                if (isWidgetActive === false) {
                    sessionStorage.removeItem('isWidgetActive');
                    // this.conversationWith = null;
                    // this.generateNewUidConversation();
                    console.log('CHIUDOOOOO!!!!:', that.isConversationOpen, isWidgetActive);
                } else if (isWidgetActive === true) {
                    console.log('APROOOOOOOO!!!!:', );
                    sessionStorage.setItem('isWidgetActive', 'true');
                    that.isConversationOpen = false;
                }
            });
        this.subscriptions.push(subscriptionIsWidgetActive);

        // NUOVO MESSAGGIO!!
        const obsAddedMessage: Subscription = this.messagingService.obsAdded
            .subscribe(newMessage => {
                if (that.scrollMe) {
                    const divScrollMe = that.scrollMe.nativeElement;
                    const checkContentScrollPosition = that.checkContentScrollPosition(divScrollMe);
                    if (checkContentScrollPosition) {
                        // https://developer.mozilla.org/it/docs/Web/API/Element/scrollHeight
                        console.log('------->sono alla fine dello scrooll: ');
                        setTimeout(function () {
                            that.scrollToBottom();
                        }, 500);
                    } else {
                        // mostro badge
                        that.NUM_BADGES++;
                    }
                }
            });
        this.subscriptions.push(obsAddedMessage);


        // var textArea = (<HTMLInputElement>document.getElementById('chat21-main-message-context'));
        // var in_dom = document.body.contains(textArea);
        // var observer = new MutationObserver(function (mutations) {
        //     if (document.body.contains(textArea)) {
        //         if (!in_dom) {
        //             console.log("element inserted");
        //         }
        //         in_dom = true;
        //     } else if (in_dom) {
        //         in_dom = false;
        //         console.log("element removed");
        //     }
        // });
        // observer.observe(document.body, { childList: true });
    }

    ngOnInit() {
        // this.setSubscriptions();
    }

    ngAfterViewInit() {
        //     const that = this;
        //     if (this.calloutTimer >= 0) {
        //         const waitingTime = this.calloutTimer * 1000;
        //         setTimeout(function() {
        //             that.f21_open();
        //         }, waitingTime);
        //     }
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
     * inizializzo variabili
     * effettuo il login anonimo su firebase
     * se il login è andato a buon fine recupero id utente
     */
    initialize() {
        this.messages = this.messagingService.messages;
        this.arrayFiles4Load = [];
        this.attributes = this.setAttributes();
        console.log('RESET MESSAGES AND ADD SUBSCRIBES: ', this.messages);
        this.setSubscriptions();

        this.openSelectionDepartment = false;
        if (!this.attributes.departmentId) {
            this.departmentSelected = null;
            // this.openSelectionDepartment = true;
        }
        // configuro il form di autenticazione
        if (!this.attributes.userEmail && !this.attributes.userName && this.preChatForm) {
            if (this.myForm) {
                this.subcribeToFormChanges();
            }
        } else {
            this.userEmail = this.attributes.userEmail;
            this.userFullname = this.attributes.userName;
            this.preChatForm = false;
        }


        this.checkWritingMessages();

    }

    setAttributes(): any {
        let attributes: any = JSON.parse(sessionStorage.getItem('attributes'));
        // let attributes: any = JSON.parse(sessionStorage.getItem('attributes'));
        if (!attributes || attributes === 'undefined') {
            attributes = {
                client: this.CLIENT_BROWSER,
                sourcePage: location.href,
                // departmentId: '',
                // departmentName: '',
                // departmentId: this.departmentSelected._id,
                // departmentName: this.departmentSelected.name,
                // userEmail: this.userEmail,
                // userName: this.userFullname
            };

            if (this.userEmail) {
                attributes['userEmail'] = this.userEmail;
            }
            if (this.userFullname) {
                attributes['userFullname'] = this.userFullname;
            }

            console.log('>>>>>>>>>>>>>> setAttributes: ', JSON.stringify(attributes));
            sessionStorage.setItem('attributes', JSON.stringify(attributes));
        }
        return attributes;
    }
    /**
     * genero un nuovo conversationWith
     * al login o all'apertura di una nuova conversazione
     */
    generateNewUidConversation() {
        console.log('generateUidConversation **************', this.conversationWith, this.senderId);
        this.conversationWith = this.messagingService.generateUidConversation(this.senderId);
    }


    /**
     * IMPOSTO: senderId, recipientId, conversationId, conversationWith
     * 1 - recupero il senderId dell'utente loggato che scrive
     * 2 - recupero recipientId impostato nel file environment
     * 3 - inizializzo messagingService
     * 4 - recupero messaggi conversazione
     */

    // initConversation() {
    //     if (this.recipientId) {
    //         this.conversationWith = this.recipientId;
    //     } else {
    //         const key = sessionStorage.getItem(this.loggedUser.uid);
    //         console.log('key:', key, this.loggedUser.uid, sessionStorage);
    //         if (key) {
    //             this.conversationWith = key;
    //         } else {
    //             this.conversationWith = this.messagingService.generateUidConversation(this.loggedUser.uid);
    //         }
    //     }
    //     // set tenant
    //     if (!this.tenant) {
    //         this.tenant = environment.tenant;
    //     }
    //     console.log('initConversation:  this.conversationWith -> ' + this.conversationWith + '  tenant -> ' + this.tenant);
    // }
    /**
     * SET:
     * token,
     * senderId,
     * channelType: CHANNEL_TYPE_DIRECT / CHANNEL_TYPE_GROUP
     * conversationWith: recipientId / auto generato
     * INIT:
     * messagingService,
     * upSvc,
     * contactService,
     * messagingService
     */
    createConversation() {
        const that = this;
        const token = this.authService.token;

        let channelTypeTEMP = CHANNEL_TYPE_GROUP;
        if (this.recipientId) {
            if (this.recipientId.indexOf('group') !== -1) {
                channelTypeTEMP = CHANNEL_TYPE_GROUP;
            } else if (!this.projectid) {
                channelTypeTEMP = CHANNEL_TYPE_DIRECT;
            }
            this.conversationWith = this.recipientId;
        } else {
            // channelType = CHANNEL_TYPE_GROUP;
            this.conversationWith = sessionStorage.getItem(this.senderId);
            if (!this.conversationWith) {
                this.conversationWith = this.messagingService.generateUidConversation(this.senderId);
            }
        }

        // console.log("createConversation.conversationWith", this.conversationWith);

        if (!this.channelType || (this.channelType !== CHANNEL_TYPE_GROUP && this.channelType !== CHANNEL_TYPE_DIRECT)) {
            this.channelType = channelTypeTEMP;
        }
        this.messagingService.initialize(this.senderId, this.tenant, this.channelType);
        this.upSvc.initialize(this.senderId, this.tenant, this.conversationWith);
        this.contactService.initialize(this.senderId, this.tenant, this.conversationWith);
        this.messagingService.checkListMessages(this.conversationWith)
            .then(function (snapshot) {
                console.log('checkListMessages: ', snapshot);
                if (snapshot.exists()) {
                    that.isNewConversation = false;
                    setTimeout(function () {
                        if (that.messages.length === 0) {
                            that.isNewConversation = true;
                        }
                    }, 2000);
                    that.isLogged = true;
                    console.log('IS_LOGGED', 'AppComponent:createConversation:snapshot.exists-if', that.isLogged);
                    that.setFocusOnId('chat21-main-message-context');
                } else {
                    that.isNewConversation = true;
                    if (that.projectid && !that.attributes.departmentId) {
                        // that.isLogged = false;
                        // console.log("IS_LOGGED", "AppComponent:createConversation:snapshot.exists-else-!department", that.isLogged);
                        that.getMongDbDepartments();
                    } else {
                        that.setFocusOnId('chat21-main-message-context');
                        that.isLogged = true;
                        console.log('IS_LOGGED', 'AppComponent:createConversation:snapshot.exists-else-department', that.isLogged);
                    }
                }

                setTimeout(function () {
                    that.messagingService.listMessages(that.conversationWith);
                }, 500);


            }).catch(function (error) {
                console.error('checkListMessages ERROR: ', error);
            });
    }

    // checkWritingMessages() {
    //     // this.messagingService.checkWritingMessages();
    //     const that = this;
    //     const subscription: Subscription = this.messagingService.obsCheckWritingMessages
    //         // .takeWhile(() => that.subscriptionIsWriting)
    //         .subscribe(resp => {
    //             //console.log('2 - subscribe IS: ', resp + ' ****************');
    //             if (resp) {
    //                 setTimeout(function () {
    //                     that.writingMessage = this.LABEL_WRITING;
    //                 }, 1000);
    //             } else {
    //                 that.writingMessage = '';
    //             }
    //         });

    // }

    checkWritingMessages() {
        const that = this;
        const messagesRef = this.messagingService.checkWritingMessages(this.tenant, this.conversationWith);
        messagesRef.on('value', function (writing) {
            // .then(function(writing) {
            console.log('checkWritingMessages >>>>>>>>>: ', writing);
            if (writing.exists()) {
                console.log('WritingMessages >>>>>>>>> OKKKK ');
                that.writingMessage = that.LABEL_WRITING;
            } else {
                console.log('WritingMessages >>>>>>>>> NOOOOO ');
                that.writingMessage = '';
            }
        });
    }

    /**
     * recupero elenco dipartimenti
     * - recupero il token fisso
     * - mi sottoscrivo al servizio
     * - se c'è un solo dipartimento la setto di default
     * - altrimenti visualizzo la schermata di selezione del dipartimento
    */
    getMongDbDepartments() {
        const token = this.authService.token;
        this.messagingService.getMongDbDepartments(token, this.projectid)
            .subscribe(
                response => {
                    console.log('OK DEPARTMENTS ::::', response);
                    this.departments = response;
                    if (this.departments.length === 1) {
                        // this.setDepartment(this.departments[0]);
                        this.openSelectionDepartment = false;
                        this.departmentSelected = this.departments[0];
                        this.setFocusOnId('chat21-main-message-context');
                        console.log('this.departmentSelected ::::', this.departmentSelected);
                    } else if (this.departments.length > 0) {
                        this.setFocusOnId('chat21-modal-select');
                        // escludo department con default == true
                        let i = 0;
                        this.departments.forEach(department => {
                            // console.log('DEPARTMENT ::::', department);
                            if (department['default'] === true) {
                                // console.log('ELIMINO DEPARTMENT::::', department);
                                this.departments.splice(i, 1);
                                // console.log('DEPARTMENTS::::', this.departments);
                                return;
                            }
                            i++;
                        });
                        this.openSelectionDepartment = true;
                    } else {
                        this.setFocusOnId('chat21-main-message-context');
                        this.openSelectionDepartment = false;
                    }
                    this.isLogged = true;
                    console.log('IS_LOGGED', 'AppComponent:getMongDbDepartments:', this.isLogged);
                },
                errMsg => {
                    console.log('http ERROR MESSAGE', errMsg);
                    // window.alert('MSG_GENERIC_SERVICE_ERROR');
                    this.openSelectionDepartment = false;
                    this.setFocusOnId('chat21-main-message-context');

                    this.isLogged = false;
                    console.log('IS_LOGGED', 'AppComponent:getMongDbDepartments:', this.isLogged);
                },
                () => {
                    console.log('API ERROR NESSUNO');
                    // attivo pulsante aprichat!!!!!
                }
            );
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
        console.log('-------------> setFocusOnId: ', id);
        setTimeout(function () {
            const textarea = document.getElementById(id);
            if (textarea) {
                console.log('1--------> FOCUSSSSSS : ', textarea);
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
        this.openSelectionDepartment = false;
        this.departmentSelected = department;
        this.setFocusOnId('chat21-main-message-context');
    }


    f21_open_close_handler() {

        if (this.isOpen) {
            this.f21_close();
        } else {
            this.f21_open();
        }
    }
    /**
     * apro il popup conversazioni
     */
    f21_open() {
        console.log('f21_open senderId: ', this.senderId);
        if (this.senderId) {
            this.isOpen = true; // !this.isOpen;
            sessionStorage.setItem('isOpen', 'true');
            // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
            console.log('f21_open   ---- isOpen::', this.isOpen, this.attributes.departmentId);
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
        console.log('isOpen::', this.isOpen);
        this.restoreTextArea();
        this.isOpen = false;
        sessionStorage.setItem('isOpen', 'false');
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
                console.log('scrollTop1 ::', objDiv.scrollTop, objDiv.scrollHeight);
                //// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
                objDiv.scrollIntoView(false);
                // that.badgeNewMessages = 0;
            } catch (err) {
                console.log('RIPROVO ::', that.isOpen);
                if (that.isOpen === true) {
                    that.scrollToBottom();
                }
            }
        }, 300);
    }


    /**
     *
     */
    // LISTEN TO SCROLL POSITION
    onScroll(event: any): void {
        if (this.scrollMe) {
            const divScrollMe = this.scrollMe.nativeElement;
            const checkContentScrollPosition = this.checkContentScrollPosition(divScrollMe);
            if (checkContentScrollPosition) {
                this.showButtonToBottom = false;
                this.NUM_BADGES = 0;
                // this.scrollToBottom();
            } else {
                this.showButtonToBottom = true;
            }
        }
    }

    /**
     *
     * @param divScrollMe
     */
    checkContentScrollPosition(divScrollMe): boolean {
        // console.log('checkContentScrollPosition ::', divScrollMe);
        // console.log('divScrollMe.diff ::', divScrollMe.scrollHeight - divScrollMe.scrollTop);
        // console.log('divScrollMe.clientHeight ::', divScrollMe.clientHeight);
        if (divScrollMe.scrollHeight - divScrollMe.scrollTop <= (divScrollMe.clientHeight + 60)) {
            // console.log('SONO ALLA FINE ::');
            return true;
        } else {
            return false;
        }
    }

    /**
     * ridimensiona la textarea
     * chiamato ogni volta che cambia il contenuto della textarea
     */
    resizeInputField() {
        const target = document.getElementById('chat21-main-message-context');
        if (!target) {
            return;
        }
        // tslint:disable-next-line:max-line-length
        // console.log('H:: this.textInputTextArea', (document.getElementById('chat21-main-message-context') as HTMLInputElement).value , target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
        target.style.height = '100%';
        if ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value === '\n') {
            // console.log('PASSO 0');
            (document.getElementById('chat21-main-message-context') as HTMLInputElement).value = '';
            target.style.height = this.HEIGHT_DEFAULT;
        } else if (target.scrollHeight > target.offsetHeight) {
            // console.log('PASSO 2');
            target.style.height = target.scrollHeight + 2 + 'px';
        } else {
            // console.log('PASSO 3');
            target.style.height = this.HEIGHT_DEFAULT;
            // segno sto scrivendo
            // target.offsetHeight - 15 + 'px';
        }
        // tslint:disable-next-line:max-line-length
        console.log('H:: this.textInputTextArea', this.textInputTextArea, target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
    }

    /**
     * quando premo un tasto richiamo questo metodo che:
     * verifica se è stato premuto 'invio'
     * se si azzera testo
     * imposta altezza campo come min di default
     * leva il focus e lo reimposta dopo pochi attimi
     * (questa è una toppa per mantenere il focus e eliminare il br dell'invio!!!)
     * invio messaggio
     * @param event
     */
    onkeypress(event) {

        const keyCode = event.which || event.keyCode;
        // console.log('onkeypress **************', keyCode, msg);
        if (keyCode === 13) {
            this.performSendingMessage();
        }
    }

    private performSendingMessage() {
        // const msg = document.getElementsByClassName('f21textarea')[0];
        const msg = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);

        if (msg && msg.trim() !== '') {
            // console.log('sendMessage -> ', this.textInputTextArea);
            this.resizeInputField();
            // this.messagingService.sendMessage(msg, TYPE_MSG_TEXT);
            this.setDepartment();
            this.sendMessage(msg, TYPE_MSG_TEXT);
            this.scrollToBottom();
        }
        // (<HTMLInputElement>document.getElementById('chat21-main-message-context')).value = '';
        // this.textInputTextArea = '';

        this.restoreTextArea();
    }

    private restoreTextArea() {
        console.log('AppComponent:restoreTextArea::restoreTextArea');

        this.resizeInputField();

        var textArea = (<HTMLInputElement>document.getElementById('chat21-main-message-context'));

        this.textInputTextArea = ''; // clear the textarea

        if (textArea) {
            // textArea.value = '';  // clear the textarea
            textArea.placeholder = this.LABEL_PLACEHOLDER;  // restore the placholder
            console.log('AppComponent:restoreTextArea::restoreTextArea::textArea:', 'restored');
        } else {
            console.error('AppComponent:restoreTextArea::restoreTextArea::textArea:', 'not restored');
        }

    }

    // START LOAD IMAGE //
    /**
     *
     * @param event
     */
    detectFiles(event) {
        console.log('detectFiles: ', event);
        if (event) {
            this.selectedFiles = event.target.files;
            console.log('AppComponent:detectFiles::selectedFiles', this.selectedFiles);

            if (this.selectedFiles == null) {
                this.isFilePendingToUpload = false;
            } else {
                this.isFilePendingToUpload = true;
            }
            console.log('AppComponent:detectFiles::selectedFiles::isFilePendingToUpload', this.isFilePendingToUpload);

            console.log('fileChange: ', event.target.files);

            if (event.target.files.length <=0 ) {
                this.isFilePendingToUpload = false;
            } else {
                this.isFilePendingToUpload = true;
            }

            const that = this;
            if (event.target.files && event.target.files[0]) {
                this.nameFile = event.target.files[0].name;
                const typeFile = event.target.files[0].type;
                const reader = new FileReader();
                console.log('OK preload: ', this.nameFile, typeFile, reader);
                reader.addEventListener('load', function () {
                    console.log('addEventListener load', reader.result);
                    that.isSelected = true;
                    // se inizia con image
                    if (typeFile.startsWith('image')) {
                        const imageXLoad = new Image;
                        imageXLoad.src = reader.result;
                        imageXLoad.title = that.nameFile;
                        imageXLoad.onload = function () {
                            console.log('onload ');
                            // that.arrayFiles4Load.push(imageXLoad);
                            const uid = imageXLoad.src.substring(imageXLoad.src.length - 16);
                            that.arrayFiles4Load[0] = { uid: uid, file: imageXLoad, type: typeFile };
                            console.log('OK: ', that.arrayFiles4Load[0]);
                        };
                    } else {
                        const fileXLoad = {
                            src: reader.result,
                            title: that.nameFile
                        };
                        console.log('onload ');
                        // that.arrayFiles4Load.push(imageXLoad);
                        const uid = fileXLoad.src.substring(fileXLoad.src.length - 16);
                        that.arrayFiles4Load[0] = { uid: uid, file: fileXLoad, type: typeFile };
                        console.log('OK: ', that.arrayFiles4Load[0]);
                    }
                }, false);
                if (event.target.files[0]) {
                    reader.readAsDataURL(event.target.files[0]);
                    console.log('reader-result: ', event.target.files[0]);
                }
            }
        }
    }

    /**
     *
     */

    loadFile() {
        console.log('that.fileXLoad: ', this.arrayFiles4Load);
        // al momento gestisco solo il caricamento di un'immagine alla volta
        if (this.arrayFiles4Load[0] && this.arrayFiles4Load[0].file) {
            const fileXLoad = this.arrayFiles4Load[0].file;
            const uid = this.arrayFiles4Load[0].uid;
            const type = this.arrayFiles4Load[0].type;
            console.log('that.fileXLoad: ', type);
            let metadata;
            if (type.startsWith('image')) {
                metadata = {
                    'name': fileXLoad.title,
                    'src': fileXLoad.src,
                    'width': fileXLoad.width,
                    'height': fileXLoad.height,
                    'type': type,
                    'uid': uid
                };
            } else {
                metadata = {
                    'name': fileXLoad.title,
                    'src': fileXLoad.src,
                    'type': type,
                    'uid': uid
                };
            }
            console.log('metadata -------> ', metadata);
            this.scrollToBottom();
            // 1 - aggiungo messaggio localmente
            // this.addLocalMessageImage(metadata);
            // 2 - carico immagine
            const file = this.selectedFiles.item(0);
            this.uploadSingle(metadata, file);
            this.isSelected = false;
        }
    }

    /**
     * salvo un messaggio localmente nell'array dei msg
     * @param metadata
     */
    addLocalMessageImage(metadata) {

        const now: Date = new Date();
        const timestamp = now.valueOf();
        const language = document.documentElement.lang;

        // set recipientFullname
        // let recipientFullname = 'Guest';
        let recipientFullname = this.GUEST_LABEL;
        if (this.userFullname) {
            recipientFullname = this.userFullname;
        } else if (this.userEmail) {
            recipientFullname = this.userEmail;
        }
        const projectname = (this.projectname) ? this.projectname : this.projectid;
        recipientFullname += ' - ' + projectname;

        // set senderFullname
        const senderFullname = recipientFullname;

        const message = new MessageModel(
            metadata.uid, // uid
            language, // language
            this.conversationWith, // recipient
            recipientFullname, // recipient_fullname
            this.senderId, // sender
            senderFullname, // sender_fullname
            '', // status
            metadata, // metadata
            '', // text
            timestamp, // timestamp
            '', // headerDate
            TYPE_MSG_IMAGE, // type
            '',
            this.channelType,
            this.projectid
        );
        // this.messages.push(message);
        // message.metadata.uid = message.uid;
        console.log('addLocalMessageImage: ', this.messages);
        this.isSelected = true;
        this.scrollToBottom();
    }

    /**
     *
     */
    resetLoadImage() {
        this.nameFile = '';
        this.selectedFiles = null;
        console.log('1 selectedFiles: ', this.selectedFiles);

        delete this.arrayFiles4Load[0];
        document.getElementById('chat21-file').nodeValue = null;
        // event.target.files[0].name, event.target.files
        this.isSelected = false;

        this.isFilePendingToUpload = false;
        console.log('AppComponent::resetLoadImage::isFilePendingToUpload:', this.isFilePendingToUpload);

        this.restoreTextArea();
    }

    /**
     *
     * @param message
     */
    getSizeImg(message): any {
        const metadata = message.metadata;
        // const MAX_WIDTH_IMAGES = 300;
        const sizeImage = {
            width: metadata.width,
            height: metadata.height
        };
        // console.log('message::: ', metadata);
        if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
            const rapporto = (metadata['width'] / metadata['height']);
            sizeImage.width = MAX_WIDTH_IMAGES;
            sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
        }
        return sizeImage; // h.toString();
    }

    // /**
    //  *
    //  * @param metadata
    //  * @param file
    //  */
    // uploadSingle(metadata, file) {
    //     const that = this;
    //     const send_order_btn = <HTMLInputElement>document.getElementById('chat21-start-upload-doc');
    //     send_order_btn.disabled = true;
    //     console.log('uploadSingle: ', metadata, file);
    //     // const file = this.selectedFiles.item(0);
    //     const currentUpload = new UploadModel(file);
    //     this.upSvc.pushUpload(currentUpload)
    //     .then(function(snapshot) {

    //         var fullPath = snapshot.metadata.fullPath;
    //         console.log("fullPath", fullPath);

    //         console.log('Uploaded a file! ', snapshot.downloadURL);
    //         metadata.src = snapshot.downloadURL;
    //         let type_message = TYPE_MSG_TEXT;
    //         let message = 'File: ' + metadata.src;
    //         if (metadata.type.startsWith('image')) {
    //             type_message = TYPE_MSG_IMAGE;
    //             message = 'Image: ' + metadata.src;
    //         }
    //         that.sendMessage(message, type_message, metadata);
    //         that.scrollToBottom();
    //     })
    //     .catch(function(error) {
    //         // Handle Errors here.
    //         const errorCode = error.code;
    //         const errorMessage = error.message;
    //         console.log('error: ', errorCode, errorMessage);
    //     });
    //     // this.resetLoadImage();
    //     console.log('reader-result: ', file);
    // }

    /**
   *
   * @param metadata
   * @param file
   */
    uploadSingle(metadata, file) {
        const that = this;
        const send_order_btn = <HTMLInputElement>document.getElementById('chat21-start-upload-doc');
        send_order_btn.disabled = true;
        console.log('AppComponent::uploadSingle::', metadata, file);
        // const file = this.selectedFiles.item(0);
        const currentUpload = new UploadModel(file);


        let uploadTask = this.upSvc.pushUpload(currentUpload);
        uploadTask.then(snapshot => {
            return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
        })
            .then(downloadURL => {
                console.log('AppComponent::uploadSingle:: downloadURL', downloadURL);
                console.log(`Successfully uploaded file and got download link - ${downloadURL}`);

                metadata.src = downloadURL;
                let type_message = TYPE_MSG_TEXT;
                let message = 'File: ' + metadata.src;
                if (metadata.type.startsWith('image')) {
                    type_message = TYPE_MSG_IMAGE;
                    message = 'Image: ' + metadata.src;
                }
                that.sendMessage(message, type_message, metadata);
                that.scrollToBottom();

                // return downloadURL;
            })
            .catch(error => {
                // Use to signal error if something goes wrong.
                console.error(`AppComponent::uploadSingle:: Failed to upload file and get link - ${error}`);
            });

        // this.resetLoadImage();
        console.log('reader-result: ', file);
    }

    /**
     * invio del messaggio
     * @param msg
     * @param type
     * @param metadata
     */
    sendMessage(msg, type, metadata?) {

        (metadata) ? metadata = metadata : metadata = '';
        console.log('SEND MESSAGE: ', msg, type, metadata, this.attributes);
        if (msg && msg.trim() !== '' || type !== TYPE_MSG_TEXT) {
            // set recipientFullname
            // let recipientFullname = 'Guest';
            let recipientFullname = this.GUEST_LABEL;
            if (this.userFullname) {
                recipientFullname = this.userFullname;
            } else if (this.userEmail) {
                recipientFullname = this.userEmail;
            }
            const projectname = (this.projectname) ? this.projectname : this.projectid;
            if (projectname) {
                recipientFullname += ' - ' + projectname;
            }

            // set senderFullname
            const senderFullname = recipientFullname;

            // tslint:disable-next-line:max-line-length
            this.triggerBeforeSendMessageEvent(recipientFullname, msg, type, metadata, this.conversationWith, recipientFullname, this.attributes, this.projectid, this.channelType);
            // tslint:disable-next-line:max-line-length
            const messageSent = this.messagingService.sendMessage(recipientFullname, msg, type, metadata, this.conversationWith, recipientFullname, this.attributes, this.projectid, this.channelType);

            this.triggerAfterSendMessageEvent(messageSent);

            this.isNewConversation = false;
            // this.checkWritingMessages();
        }
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
     * aggiorno messaggio: uid, status, timestamp, headerDate
     * richiamata alla sottoscrizione dell'aggiunta di un nw messaggio
     * in caso in cui il messaggio è un'immagine ed è stata inviata dall'utente
     */
    updateMessage(message) {
        console.log('UPDATE MSG:', message.metadata.uid);
        const index = searchIndexInArrayForUid(this.messages, message.metadata.uid);
        if (index > -1) {
            this.messages[index].uid = message.uid;
            this.messages[index].status = message.status;
            this.messages[index].timestamp = message.timestamp;
            this.messages[index].headerDate = message.headerDate;
            console.log('UPDATE ok:', this.messages[index]);
        } else {
            this.messages.push(message);
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
        console.log("AppComponent::startNwConversation");

        this.initAll();

        this.ngOnDestroy();
        console.log('unsubscribe OK', this.subscriptions);

        this.generateNewUidConversation();
        console.log('NEW conversationWith:', this.conversationWith);

        this.createConversation();
        console.log('NEW createConversation: ');

        this.getMongDbDepartments();

        this.initialize();
        console.log('NEW initialize: ');

        this.isConversationOpen = true;
        console.log('NEW SUBSRIBE -->' + this.isConversationOpen + ' <--');

        this.restoreTextArea();

    }

    convertMessage(msg) {
        let messageText = encodeHTML(msg);
        messageText = urlify(messageText);
        // console.log('messageText: ' + messageText);
        return messageText;
    }


    private onSendPressed(event) {
        console.log('onSendPressed:event', event);
        console.log('AppComponent::onSendPressed::isFilePendingToUpload:', this.isFilePendingToUpload);
        if (this.isFilePendingToUpload) {
            console.log('AppComponent::onSendPressed', 'is a file');
            // its a file
            this.loadFile();

            this.isFilePendingToUpload = false;
            console.log('AppComponent::onSendPressed::isFilePendingToUpload:', this.isFilePendingToUpload);
        } else {
            console.log('AppComponent::onSendPressed', 'is a message');
            // its a message
            this.performSendingMessage();

            // restore the text area
            this.restoreTextArea();
        }
    }

}
