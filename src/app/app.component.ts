import { ElementRef, Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../environments/environment';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
// services
import { AuthService } from './core/auth.service';
import { MessagingService } from './providers/messaging.service';
// models
import { MessageModel } from '../models/message';
import { DepartmentModel } from '../models/department';

// utils
import { strip_tags, isPopupUrl, popupUrl, setHeaderDate, searchIndexInArrayForUid, urlify } from './utils/utils';
// tslint:disable-next-line:max-line-length
import { CLIENT_BROWSER, CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, MSG_STATUS_SENDING, MAX_WIDTH_IMAGES, UID_SUPPORT_GROUP_MESSAGES, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER, BCK_COLOR_CONVERSATION_SELECTED } from './utils/constants';

// https://www.davebennett.tech/subscribe-to-variable-change-in-angular-4-service/
import { Subscription } from 'rxjs/Subscription';
import { UploadModel } from '../models/upload';
import { UploadService } from './providers/upload.service';
import { ContactService } from './providers/contact.service';
import { StarRatingWidgetService } from './components/star-rating-widget/star-rating-widget.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

import 'rxjs/add/operator/takeWhile';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})



export class AppComponent implements OnInit, OnDestroy  {
    @ViewChild('scrollMe') private scrollMe: ElementRef;
    @ViewChild('chat21Content') private chatContent: ElementRef;

    isShowed: boolean; /** indica se il pannello conversazioni è aperto o chiuso */
    //loggedUser: any;
    //loggedUserUid: string;
    subscriptions: Subscription[] = [];
    arrayImages4Load: Array<any>;
    attributes: any;

    messages: MessageModel[];
    conversationWith: string;
    senderId: string;
    nameImg: string;
    tenant: string;
    recipientId: string;


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
    LABEL_PLACEHOLDER = 'Scrivi la tua domanda...'; // 'Type your message...';  // type your message...
    LABEL_START_NW_CONV = 'INIZIA UNA NUOVA CONVERSAZIONE'; // 'START NEW CONVERSATION'; //
    // tslint:disable-next-line:max-line-length
    LABEL_FIRST_MSG = 'Descrivi sinteticamente il tuo problema, ti metteremo in contatto con un operatore specializzato'; // 'Describe shortly your problem, you will be contacted by an agent';
    LABEL_SELECT_TOPIC = 'Seleziona un argomento'; // 'Select a topic';
    // tslint:disable-next-line:max-line-length
    LABLEL_COMPLETE_FORM = 'Completa il form per iniziare una conversazione con il prossimo agente disponibile.'; // 'Complete the form to start a conversation with the next available agent.';
    LABEL_FIELD_NAME = '* Nome'; // '* Name';
    LABEL_ERROR_FIELD_NAME = 'Nome richiesto (minimo 5 caratteri).'; // 'Required field (minimum 5 characters).';
    LABEL_FIELD_EMAIL = '* Email';
    // tslint:disable-next-line:max-line-length
    LABEL_ERROR_FIELD_EMAIL = 'Inserisci un indirizzo email valido.'; // 'Enter a valid email address.';
    LABEL_WRITING = 'sta scrivendo...'; // 'is writing...';

    BUILD_VERSION = environment.build; // 'b.0.5';


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

    IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/38661877-a44476dc-3e32-11e8-913d-747a8527b2b5.png';
    filterSystemMsg =  true; // se è true i messaggi inviati da system non vengono visualizzati

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

    private aliveSubLoggedUser = true;
    private isNewConversation = false;

    showButtonToBottom = false;
    contentScroll: any;
    NUM_BADGES = 0;

    constructor(
        public authService: AuthService,
        public messagingService: MessagingService,
        public starRatingWidgetService: StarRatingWidgetService,
        public upSvc: UploadService,
        public contactService: ContactService,
        public formBuilder: FormBuilder,
        public el: ElementRef
    ) {
        console.log(' ---------------- COSTRUCTOR ---------------- ');

        this.getVariablesFromAttributeHtml();
        this.settingParams();

        // set auth
        if (this.userEmail && this.userPassword) {
            // se esistono email e psw faccio un'autenticazione firebase con email
            // this.authService.authenticateFirebaseEmail(this.userEmail, this.userPassword);
        } else if (this.userId) {
            // SE PASSO LO USERID NON EFFETTUO NESSUNA AUTENTICAZIONE
            //this.authService.getCurrentUser();

            this.senderId = this.userId;
            this.createConversation();
            this.initialize();
            this.aliveSubLoggedUser = false;
            console.log('USER userId: this.isShowed:', this.senderId, this.isShowed);
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
            if (user) {
                console.log('USER AUTENTICATE: ', user);
                that.senderId = user.uid;
                // that.initConversation();
                that.createConversation();
                that.initialize();
                that.aliveSubLoggedUser = false;
            } else {
                that.isLogged = false;
            }
        });
    }

    /** */
    settingParams() {
        // SETTINGS
        //// setto widget language
        moment.locale('it');
        //// get isShowed from storage;
        this.isShowed = (sessionStorage.getItem('isShowed')) ? true : false;
        //// get isWidgetActive (poll) from storage;
        this.isWidgetActive = (sessionStorage.getItem('isWidgetActive')) ? true : false;
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
     *
    */
    getVariablesFromAttributeHtml() {
        // https://stackoverflow.com/questions/45732346/externally-pass-values-to-an-angular-application
        let TEMP;
        TEMP = this.el.nativeElement.getAttribute('tenant');
        this.tenant = (TEMP) ? TEMP : environment.tenant;
        TEMP = this.el.nativeElement.getAttribute('recipientId');
        this.recipientId = (TEMP) ? TEMP : null;
        TEMP = this.el.nativeElement.getAttribute('projectid');
        this.projectid = (TEMP) ? TEMP : null; // '5ad5bd52c975820014ba900a'; // di default id di frontiere21
        TEMP = this.el.nativeElement.getAttribute('projectname');
        this.projectname = (TEMP) ? TEMP : null;
        TEMP = this.el.nativeElement.getAttribute('chatName');
        this.chatName =  (TEMP) ? TEMP : 'TileDesk'; // di default TileDesk
        TEMP = this.el.nativeElement.getAttribute('poweredBy');
        this.poweredBy = (TEMP) ? TEMP : '<a target="_blank" href="http://www.tiledesk.com/">Powered by <b>TileDesk</b></a>';
        TEMP = this.el.nativeElement.getAttribute('userId');
        this.userId = (TEMP) ? TEMP : null;
        TEMP = this.el.nativeElement.getAttribute('userEmail');
        this.userEmail = (TEMP) ? TEMP : null;
        TEMP = this.el.nativeElement.getAttribute('userPassword');
        this.userPassword = (TEMP) ? TEMP : null;
        TEMP = this.el.nativeElement.getAttribute('userFullname');
        this.userFullname = (TEMP) ? TEMP : null;
        TEMP = this.el.nativeElement.getAttribute('preChatForm');
        this.preChatForm = (TEMP == null) ? false : true;
        TEMP = this.el.nativeElement.getAttribute('isShowed');
        this.isShowed = (TEMP == null) ? false : true;
    }

    // START FORM
    // https://scotch.io/tutorials/using-angular-2s-model-driven-forms-with-formgroup-and-formcontrol
    /** */
    setForm(formBuilder): FormGroup  {
        // SET FORM
        // const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
        // tslint:disable-next-line:max-line-length
        const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const myForm = formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
            name: ['', Validators.compose([Validators.minLength(5), Validators.required])]
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
        });
    }
    /** */
    closeForm() {
        // recupero email inserita nel form e fullname
        // salvo tutto nello storage e successivamente le invio con il messaggio!!!!
        this.attributes.userName = this.userFullname;
        this.attributes.userEmail = this.userEmail;
        if (this.attributes) {
            sessionStorage.setItem('attributes', JSON.stringify(this.attributes));
        }
        this.preChatForm = false;
        this.setFocusOnId();
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
                this.conversationWith = null;
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
            const divScrollMe = this.scrollMe.nativeElement;
            const checkContentScrollPosition = this.checkContentScrollPosition(divScrollMe);
            if (checkContentScrollPosition ) {
                // https://developer.mozilla.org/it/docs/Web/API/Element/scrollHeight
                console.log('------->sono alla fine dello scrooll: ');
                setTimeout(function() {
                    that.scrollToBottom();
                }, 500);

            } else {
                // mostro badge
                that.NUM_BADGES ++;
            }

        });
        this.subscriptions.push(obsAddedMessage);
    }

    ngOnInit() {
    }

    // ngAfterViewInit() {
    //     this.scrollToBottom();
    // }

    /**
     * elimino tutte le sottoscrizioni
     */
    ngOnDestroy() {
        this.unsubscribe();
    }

    unsubscribe() {
        this.subscriptions.forEach(function(subscription) {
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
        this.arrayImages4Load = [];
        this.attributes = this.setAttributes();
        this.openSelectionDepartment = false;
        console.log('RESET MESSAGES AND ADD SUBSCRIBES: ', this.messages);
        this.setSubscriptions();

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

    }

    setAttributes(): any {
        let attributes: any = JSON.parse(sessionStorage.getItem('attributes'));
        // let attributes: any = JSON.parse(sessionStorage.getItem('attributes'));
        if (!attributes || attributes === 'undefined') {
            attributes = {
                client: CLIENT_BROWSER,
                sourcePage: location.href,
                departmentId: '',
                departmentName: '',
                userEmail: this.userEmail,
                userName: this.userFullname
            };
            console.log('setAttributes: ', JSON.stringify(attributes));
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
        // this.senderId = this.loggedUserUid;
        let channelType = CHANNEL_TYPE_DIRECT;


        if (this.recipientId) {
            if (this.recipientId.indexOf('group') !== -1) {
                channelType = CHANNEL_TYPE_GROUP;
            }
            // (this.recipientId) ? CHANNEL_TYPE_DIRECT : CHANNEL_TYPE_GROUP
            this.conversationWith = this.recipientId;
        } else {
            channelType = CHANNEL_TYPE_GROUP;
            this.conversationWith = sessionStorage.getItem(this.senderId);
            if (!this.conversationWith) {
                this.conversationWith = this.messagingService.generateUidConversation(this.senderId);
            }
        }
        // tslint:disable-next-line:max-line-length

        this.messagingService.initialize(this.senderId,  this.tenant, channelType);
        this.upSvc.initialize(this.senderId,  this.tenant, this.conversationWith);
        this.contactService.initialize(this.senderId, this.tenant, this.conversationWith);
        this.messagingService.checkListMessages(this.conversationWith)
        .then(function(snapshot) {
            console.log('checkListMessages: ', snapshot);
            // that.preChatForm = false;
            // recupero nodo conversazione se è già presente
            // 1 - se presente significa che:
            //  1a - ho aggiornato la pg;
            //      - recupero la lista dei messaggi
            //  1b - ho concluso una prec conv?!?!?!
            // 2 - se non è presente:
            //  carico i dipartimenti!!!

            if (snapshot.exists()) {
                that.isNewConversation = false;
                that.isLogged = true;
                // console.log('FOCUSSSSSS 2: ', document.getElementById('chat21-main-message-context'));
                //this.openSelectionDepartment = false;
                //aggiungo loading...
                //that.messagingService.listMessages(that.conversationWith);
            } else {
                that.isNewConversation = true;
                //that.preChatForm = false;
                //that.messagingService.listMessages(that.conversationWith);
                if (that.projectid) {
                    that.isLogged = false;
                    that.getMongDbDepartments();
                } else {
                    that.isLogged = true;
                }
            }
            that.setFocusOnId();
            that.messagingService.listMessages(that.conversationWith);
            //that.scrollToBottom();
        }).catch(function(error) {
            console.log('checkListMessages ERROR: ', error);
        });
    }

    checkWritingMessages() {
        this.messagingService.checkWritingMessages();
        const that = this;
        const subscription: Subscription = this.messagingService.obsCheckWritingMessages
        // .takeWhile(() => that.subscriptionIsWriting)
        .subscribe(resp => {
            console.log('2 - subscribe IS: ', resp + ' ****************');
            //this.scrollToBottom();
            if (resp) {
                setTimeout(function() {
                    that.writingMessage = that.LABEL_WRITING;
                }, 500);
            } else {
                that.writingMessage = '';
            }
        });

    }

    // checkWritingMessages_old() {
    //     const that = this;
    //     const messagesRef = this.messagingService.checkWritingMessages(this.conversationWith);
    //     messagesRef.on('value', function(writing) {
    //     //.then(function(writing) {
    //         console.log('checkWritingMessages >>>>>>>>>: ', writing);
    //         if (writing.exists()) {
    //             console.log('WritingMessages >>>>>>>>> OKKKK ');
    //             that.writingMessage = that.LABEL_WRITING;
    //         } else {
    //             console.log('WritingMessages >>>>>>>>> NOOOOO ');
    //             that.writingMessage = '';
    //         }
    //     });
    // }

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
                    this.setDepartment(this.departments[0]);
                } else if (this.departments.length > 0) {
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
                    this.openSelectionDepartment = false;
                }
                this.isLogged = true;
                this.setFocusOnId();
            },
            errMsg => {
                console.log('http ERROR MESSAGE', errMsg);
                window.alert('MSG_GENERIC_SERVICE_ERROR');
            },
            () => {
                console.log('API ERROR NESSUNO');
                //attivo pulsante aprichat!!!!!
            }
        );
    }

    /** */
    setDepartment(department) {
        this.openSelectionDepartment = false;
        this.attributes.departmentId = department._id;
        this.attributes.departmentName = department.name;
        console.log('setAttributes setDepartment: ', JSON.stringify(this.attributes));
        if (this.attributes) {sessionStorage.setItem('attributes',  JSON.stringify(this.attributes)); } // JSON.stringify(this.attributes)

        //this.messagingService.listMessages(this.conversationWith);
        //this.preChatForm = false;
    }


    //// ACTIONS ////

    setFocusOnId() {
        let id = 'chat21-main-message-context';
        if (this.preChatForm) {
            id = 'form-field-name';
        }
        console.log('-------------> setFocusOnId: ', id);
        setTimeout(function() {
            const textarea = document.getElementById(id);
            // console.log('1--------> FOCUSSSSSS : ', textarea);
            if (textarea) {
                textarea.focus();
                textarea.setAttribute('value', ' ');
            }
        }, 1000);
    }

    /** */
    onSelectDepartment(department) {
        console.log('onSelectDepartment: ', department);
        this.departmentSelected = department;
        this.setDepartment(department);
    }
    /**
     * apro il popup conversazioni
     */
    f21_open() {
        if (this.senderId) {
            this.isShowed = true; // !this.isShowed;
            sessionStorage.setItem('isShowed', 'true');
            // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
            console.log('f21_open   ---- isShowed::', this.isShowed);
            this.scrollToBottom();
            // console.log('FOCUSSSSSS 5: ', document.getElementById('chat21-main-message-context'));
            this.setFocusOnId();
            // }
        }
    }

    /**
    * chiudo il popup conversazioni
    */
    f21_close() {
        console.log('isShowed::', this.isShowed);
        this.isShowed = false;
        sessionStorage.removeItem('isShowed');
    }

    /**
     * srollo la lista messaggi all'ultimo
     * chiamato in maniera ricorsiva sino a quando non risponde correttamente
     */
    scrollToBottom() {
        const that = this;
        setTimeout(function() {
            try {
                const objDiv = document.getElementById('contentScroll');
                console.log('scrollTop1 ::', objDiv.scrollTop,  objDiv.scrollHeight);
                //// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
                objDiv.scrollIntoView(false);
                // that.badgeNewMessages = 0;
            } catch (err) {
                console.log('RIPROVO ::', that.isShowed);
                if (that.isShowed === true) {
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

    /**
     *
     * @param divScrollMe
     */
    checkContentScrollPosition(divScrollMe): boolean {
        // console.log('checkContentScrollPosition ::', divScrollMe);
        // console.log('divScrollMe.diff ::', divScrollMe.scrollHeight - divScrollMe.scrollTop);
        // console.log('divScrollMe.clientHeight ::', divScrollMe.clientHeight);
        if (divScrollMe.scrollHeight - divScrollMe.scrollTop <= (divScrollMe.clientHeight + 60)) {
            //console.log('SONO ALLA FINE ::');
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
        if ( (document.getElementById('chat21-main-message-context') as HTMLInputElement).value === '\n' ) {
            console.log('PASSO 0');
            (document.getElementById('chat21-main-message-context') as HTMLInputElement).value = '';
            target.style.height = this.HEIGHT_DEFAULT;
        } else if (target.scrollHeight > target.offsetHeight ) {
            console.log('PASSO 2');
            target.style.height = target.scrollHeight + 2 + 'px';
        } else {
            console.log('PASSO 3');
            target.style.height = this.HEIGHT_DEFAULT; // target.offsetHeight - 15 + 'px';
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
        // const msg = document.getElementsByClassName('f21textarea')[0];
        const msg = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);
        const keyCode = event.which || event.keyCode;
        // console.log('onkeypress **************', keyCode, msg);
        if (keyCode === 13) {
            if (msg && msg.trim() !== '') {
                // console.log('sendMessage -> ', this.textInputTextArea);
                this.resizeInputField();
                // this.messagingService.sendMessage(msg, TYPE_MSG_TEXT);
                this.sendMessage(msg, TYPE_MSG_TEXT);
                this.scrollToBottom();
            }
            (<HTMLInputElement>document.getElementById('chat21-main-message-context')).value = '';
            // this.textInputTextArea = '';
        }
    }

    // START LOAD IMAGE //
    /**
     *
     * @param event
     */
    detectFiles(event) {
        if (event) {
            this.selectedFiles = event.target.files;
            console.log('fileChange: ', event.target.files);
            const that = this;
            if (event.target.files && event.target.files[0]) {
                this.nameImg = event.target.files[0].name;
                const reader  = new FileReader();
                reader.addEventListener('load', function () {
                    that.isSelected = true;
                    const imageXLoad = new Image;
                    imageXLoad.src = reader.result;
                    imageXLoad.title = that.nameImg;
                    imageXLoad.onload = function() {
                        // that.arrayImages4Load.push(imageXLoad);
                        const uid = imageXLoad.src.substring(imageXLoad.src.length - 16);
                        that.arrayImages4Load[0] = {uid: uid, image: imageXLoad};
                        console.log('OK: ', that.arrayImages4Load[0]);
                    };
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
    loadImage() {
        // al momento gestisco solo il caricamento di un'immagine alla volta
        const imageXLoad = this.arrayImages4Load[0].image;
        const uid = this.arrayImages4Load[0].uid;
        console.log('that.imageXLoad: ', imageXLoad);
        const metadata = {
            'src': imageXLoad.src,
            'width': imageXLoad.width,
            'height': imageXLoad.height,
            'uid': uid
        };
        // 1 - aggiungo messaggio localmente
        this.addLocalMessageImage(metadata);
        // 2 - carico immagine
        const file = this.selectedFiles.item(0);
        this.uploadSingle(metadata, file);
        this.isSelected = false;
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
        let recipientFullname = 'Guest';
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
            ''
        );
        this.messages.push(message);
        // message.metadata.uid = message.uid;
        console.log('addLocalMessageImage: ', this.messages);
        this.isSelected = true;
        this.scrollToBottom();
    }

    /**
     *
     */
    resetLoadImage() {
        console.log('resetLoadImage: ');
        this.nameImg = '';
        delete this.arrayImages4Load[0];
        document.getElementById('chat21-file').nodeValue = null;
        // event.target.files[0].name, event.target.files
        this.isSelected = false;
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

    /**
     *
     * @param metadata
     * @param file
     */
    uploadSingle(metadata, file) {
        const that = this;
        const send_order_btn = <HTMLInputElement>document.getElementById('chat21-start-upload-doc');
        send_order_btn.disabled = true;

        console.log('uploadSingle: ', metadata, file);
        // const file = this.selectedFiles.item(0);
        const currentUpload = new UploadModel(file);
        this.upSvc.pushUpload(currentUpload)
        .then(function(snapshot) {
            console.log('Uploaded a file! ', snapshot.downloadURL);
            metadata.src = snapshot.downloadURL;
            that.sendMessage('', TYPE_MSG_IMAGE, metadata);
        })
        .catch(function(error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log('error: ', errorCode, errorMessage);
        });
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
        if (msg && msg.trim() !== '' || type !== TYPE_MSG_TEXT ) {

            // set recipientFullname
            let recipientFullname = 'Guest';
            if (this.userFullname) {
                recipientFullname = this.userFullname;
            } else if (this.userEmail) {
                recipientFullname = this.userEmail;
            }
            const projectname = (this.projectname) ? this.projectname : this.projectid;
            recipientFullname += ' - ' + projectname;

            // set senderFullname
            const senderFullname = recipientFullname;

            // tslint:disable-next-line:max-line-length
            this.messagingService.sendMessage(recipientFullname, msg, type, metadata, this.conversationWith, recipientFullname, this.attributes, this.projectid);
            this.isNewConversation = false;
            this.checkWritingMessages();
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
        console.log('this.startNwConversation 2');

        this.constructor();

        this.ngOnDestroy();
        console.log('unsubscribe OK', this.subscriptions);

        this.generateNewUidConversation();
        console.log('NEW conversationWith:', this.conversationWith);

        this.createConversation();
        console.log('NEW createConversation: ');

        this.initialize();
        console.log('NEW initialize: ');

        this.isConversationOpen = true;
        console.log('NEW SUBSRIBE -->' + this.isConversationOpen + ' <--');

    }


    convertMessage(msg) {
        const messageText = urlify(msg);
        return messageText;
        // window.alert('ciao');
        // window.open("http://www.google.it", 'Video Chat', 'width=100%,height=300');
    }


}
