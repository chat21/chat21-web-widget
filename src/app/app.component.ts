import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { setHeaderDate, searchIndexInArrayForUid, urlify } from './utils/utils';
// tslint:disable-next-line:max-line-length
import { CLIENT_BROWSER, CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, MSG_STATUS_SENDING, MAX_WIDTH_IMAGES, UID_SUPPORT_GROUP_MESSAGES, TYPE_MSG_TEXT, TYPE_MSG_IMAGE, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER, BCK_COLOR_CONVERSATION_SELECTED } from './utils/constants';

// https://www.davebennett.tech/subscribe-to-variable-change-in-angular-4-service/
import { Subscription } from 'rxjs/Subscription';
import { UploadModel } from '../models/upload';
import { UploadService } from './providers/upload.service';
import { ContactService } from './providers/contact.service';
import { StarRatingWidgetService } from './components/star-rating-widget/star-rating-widget.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy, OnInit  {
    isShowed: boolean; /** indica se il pannello conversazioni è aperto o chiuso */
    loggedUser: any;
    subscriptions: Subscription[] = [];
    arrayImages4Load: Array<any>;
    attributes: any;

    messages: MessageModel[];
    conversationWith: string;
    senderId: string;
    nameImg: string;
    tenant: string;
    chat21_agentId: string;

    myForm: FormGroup;
    public events: any[] = [];
    public submitted: boolean;

    isSelected = false;
    isConversationOpen = true;

    preChatForm = false;
    userEmail = '';
    userName = '';


    MSG_STATUS_SENT = MSG_STATUS_SENT;
    MSG_STATUS_SENT_SERVER = MSG_STATUS_SENT_SERVER;
    MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;

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

    departments: DepartmentModel[];
    attributes_message: any;
    openSelectionDepartment: boolean;
    departmentSelected: DepartmentModel;

    constructor(
        public authService: AuthService,
        public messagingService: MessagingService,
        public starRatingWidgetService: StarRatingWidgetService,
        public upSvc: UploadService,
        public contactService: ContactService,
        public formBuilder: FormBuilder
    ) {

        this.setForm();

        if (location.search) {
            let TEMP = location.search.split('chat21_tenant=')[1];
            if (TEMP) { this.tenant = TEMP.split('&')[0]; }
            TEMP = (location.search.split('chat21_agentId=')[1]);
            if (TEMP) { this.chat21_agentId = TEMP.split('&')[0]; }
            TEMP = (location.search.split('chat21_preChatForm=')[1]);
            if (TEMP) { this.preChatForm = (TEMP.split('&')[0] === 'true' || TEMP.split('&')[0] === '1'); }

            // this.chat21_agentId = (location.search.split('chat21_agentId=')[1]).split('&')[0];
        }
        this.isWidgetActive = false;
        this.authService.authenticateFirebaseAnonymously();
    }

    /**
     * creo sottoscrizione ad array messaggi del provider
     * inizializzo la pagina
     */
    ngOnInit() {
        this.initialize();
        this.openSelectionDepartment = true;
        this.isShowed = false;
        moment.locale('it');
        this.setSubscriptions();
    }

    // START FORM
    // https://scotch.io/tutorials/using-angular-2s-model-driven-forms-with-formgroup-and-formcontrol
    /** */
    setForm() {
        // SET FORM
        const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
        this.myForm = this.formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
            name: ['', Validators.compose([Validators.minLength(5), Validators.required])]
        });
        this.subcribeToFormChanges();
    }
    /** */
    subcribeToFormChanges() {
        const that = this;
        const myFormValueChanges$ = this.myForm.valueChanges;
        myFormValueChanges$.subscribe(x => {
            that.userName = x.name;
            that.userEmail = x.email;
        });
    }
    /** */
    closeForm() {
        this.attributes.userName = this.userName;
        this.attributes.userEmail = this.userEmail;
        this.preChatForm = false;
    }
    // END FORM

    /**
     * imposto le sottoscrizioni
     * 1 - messaggio aggiunto
     * 2 - messaggio modificato
     * 3 - utente eliminato dal gruppo (CHAT CHIUSA)
     */
    setSubscriptions() {
        const that = this;

        // USER AUTENTICATE
        const subLoggedUser: Subscription = this.authService.obsLoggedUser
        .subscribe(user => {
            if (user) {
                console.log('USER AUTENTICATE: ', user);
                that.loggedUser = user;
                that.initConversation();
                that.createConversation();
            }
        });

        // MSG ADDED
        const subMsgAdded: Subscription = this.messagingService.obsAdded
        .subscribe(message => {
            console.log('ADD NW MSG:', message);
            if (message && message.sender === this.senderId && message.type !== TYPE_MSG_TEXT) {
                // se è un'immagine che ho inviato io nn fare nulla
                // aggiorno la stato del messaggio e la data
                that.updateMessage(message);
            } else if (message) {
                that.messages.push(message);
                that.scrollToBottom();
            }
        });
        this.subscriptions.push(subMsgAdded);

        // MSG CHANGED
        const subMsgChanged: Subscription = this.messagingService.obsChanged
        .subscribe(message => {
            console.log('CHANGED NW MSG:', message);
            if (message) {
                const index = searchIndexInArrayForUid(that.messages, message.uid);
                that.messages.splice(index, 1, message);
            }
        });
        this.subscriptions.push(subMsgChanged);

        // MSG REMOVED
        const subMsgRemoved: Subscription = this.messagingService.obsRemoved
        .subscribe(uid => {
            console.log('REMOVED MSG:', uid);
            if (uid) {
                const index = searchIndexInArrayForUid(that.messages, uid);
                that.messages.splice(index, 1);
            }
        });
        this.subscriptions.push(subMsgRemoved);

        // CHIUSURA CONVERSAZIONE (ELIMINAZIONE UTENTE DAL GRUPPO)
        const subscriptionIsWidgetActive: Subscription = this.starRatingWidgetService.observable
        .subscribe(isWidgetActive => {
            that.isWidgetActive = isWidgetActive;
            if (isWidgetActive === false) {
                this.conversationWith = null;
                this.generateNewUidConversation();
                console.log('CHIUDOOOOO!!!!:', that.isConversationOpen, isWidgetActive);
            } else if (isWidgetActive === true) {
                console.log('APROOOOOOOO!!!!:', );
                this.isConversationOpen = false;
            }
        });
        this.subscriptions.push(subscriptionIsWidgetActive);
    }


    /**
     * elimino tutte le sottoscrizioni
     */
    ngOnDestroy() {
        this.subscriptions.forEach(function(subscription) {
            subscription.unsubscribe();
        });
    }

    /**
     * inizializzo variabili
     * effettuo il login anonimo su firebase
     * se il login è andato a buon fine recupero id utente
     */
    initialize() {
        this.messages = [];
        this.arrayImages4Load = [];
        this.attributes = {
            client: CLIENT_BROWSER,
            sourcePage: location.href,
            departmentId: '',
            departmentName: '',
            userEmail: '',
            userName: ''
        };
    }

    /**
     * genero un nuovo conversationWith
     * al login o all'apertura di una nuova conversazione
     * @param user
     */
    generateNewUidConversation() {
        console.log('generateUidConversation **************', this.conversationWith, this.loggedUser.uid);
        if (!this.conversationWith) {
            this.conversationWith = this.messagingService.generateUidConversation(this.loggedUser.uid);
        }
    }

    /** */
    initConversation() {
        // set this.conversationWith
        if (this.chat21_agentId) {
            this.conversationWith = this.chat21_agentId;
        } else {
            const key = sessionStorage.getItem(this.loggedUser.uid);
            console.log('key:', key, this.loggedUser.uid, sessionStorage);
            if (key) {
                this.conversationWith = key;
            } else {
                this.conversationWith = this.messagingService.generateUidConversation(this.loggedUser.uid);
            }
            console.log('this.conversationWith:', this.conversationWith);
        }
        // set tenant
        if (!this.tenant) {
            this.tenant = environment.tenant;
        }
        console.log('INIT VAR:', this.tenant, this.chat21_agentId, this.conversationWith);
    }

    /**
     * IMPOSTO: senderId, recipientId, conversationId, conversationWith
     * 1 - recupero il senderId dell'utente loggato che scrive
     * 2 - recupero recipientId impostato nel file environment
     * 3 - inizializzo messagingService
     * 4 - recupero messaggi conversazione
     */
    createConversation() {
        const that = this;
        this.senderId = this.loggedUser.uid;
        if (this.chat21_agentId) {
            this.messagingService.initialize(this.loggedUser,  this.tenant, CHANNEL_TYPE_DIRECT);
        } else {
            this.messagingService.initialize(this.loggedUser,  this.tenant, CHANNEL_TYPE_GROUP);
        }
        const token = this.authService.token;
        console.log('createConversation: ', this.tenant, this.conversationWith);
        this.upSvc.initialize(this.loggedUser.uid,  this.tenant, this.conversationWith);
        this.contactService.initialize(this.loggedUser.uid, this.tenant, this.conversationWith);
        this.messagingService.checkListMessages(this.conversationWith)
        .then(function(snapshot) {
            console.log('checkListMessages: ', snapshot);
            if (snapshot.exists()) {
                that.openSelectionDepartment = false;
                that.messagingService.listMessages(that.conversationWith);
            } else {
                that.getMongDbDepartments();
            }
        });
    }
    /** */
    getMongDbDepartments() {
        const token = this.authService.token;
        this.messagingService.getMongDbDepartments(token)
        .subscribe(
            response => {
                console.log('OK DEPARTMENTS ::::', response);
                this.departments = response;
                if (this.departments.length > 1) {
                    this.openSelectionDepartment = true;
                } else {
                    this.openSelectionDepartment = false;
                    this.setDepartment(this.departments[0]);
                }
            },
            errMsg => {
                console.log('http ERROR MESSAGE', errMsg);
                window.alert('MSG_GENERIC_SERVICE_ERROR');
            },
            () => {
                console.log('API ERROR NESSUNO');
            }
        );
    }
    /** */
    setDepartment(department) {
        this.openSelectionDepartment = false;
        this.attributes.departmentId = department._id;
        this.attributes.departmentName = department.name;
        this.messagingService.listMessages(this.conversationWith);
        //this.preChatForm = true;
    }


    //// ACTIONS ////
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
        this.isShowed = !this.isShowed;
        // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
        console.log('isShowed::', this.isShowed);
        if (this.isShowed) {
            this.scrollToBottom();
        }
    }

    /**
    * chiudo il popup conversazioni
    */
    f21_close() {
        console.log('isShowed::', this.isShowed);
        this.isShowed = false;
    }

    /**
     * srollo la lista messaggi all'ultimo
     * chiamato in maniera ricorsiva sino a quando non risponde correttamente
     */
    scrollToBottom() {
        const that = this;
        setTimeout(function() {
            try {
                const objDiv = document.getElementById('scrollMe');
                console.log('scrollTop1 ::', objDiv.scrollTop,  objDiv.scrollHeight);
                // if (objDiv.scrollTop !== objDiv.scrollHeight) {
                //     objDiv.scrollTop = objDiv.scrollHeight + 10;
                //     console.log('scrollTop1 ::', objDiv.scrollTop);
                // }
                //// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
                document.getElementById('scrollMe').scrollIntoView(false);
            } catch (err) {
                console.log('RIPROVO ::', that.isShowed);
                if (that.isShowed === true) {
                    that.scrollToBottom();
                }
            }
        }, 300);
    }

    /**
     * ridimensiona la textarea
     * chiamato ogni volta che cambia il contenuto della textarea
     */
    resizeInputField() {
        const target = document.getElementById('chat21-main-message-context');
        // tslint:disable-next-line:max-line-length
        // console.log('H:: this.textInputTextArea', (document.getElementById('chat21-main-message-context') as HTMLInputElement).value , target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
        target.style.height = '100%';
        if ( (document.getElementById('chat21-main-message-context') as HTMLInputElement).value === '\n' ) {
            console.log('PASSO 0');
            (document.getElementById('chat21-main-message-context') as HTMLInputElement).value = null;
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
            this.textInputTextArea = null;
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
        const message = new MessageModel(
            metadata.uid, // uid
            language, // language
            this.conversationWith, // recipient
            'Support Group', // recipient_fullname
            this.senderId, // sender
            'Ospite', // sender_fullname
            '', // status
            metadata, // metadata
            '', // text
            timestamp, // timestamp
            '', // headerDate
            TYPE_MSG_IMAGE // type
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
        console.log('SEND MESSAGE: ', msg, type, metadata);
        if (msg && msg.trim() !== '' || type !== TYPE_MSG_TEXT ) {
          // tslint:disable-next-line:max-line-length
          this.messagingService.sendMessage(msg, type, metadata, this.conversationWith, this.attributes);
        //   const resultSendMsgKey = this.messagingService.sendMessage(msg, type, metadata, this.conversationWith);
        //   console.log('resultSendMsgKey: ', resultSendMsgKey);
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
        const profile = this.contactService.getContactProfile(uid);
        if (profile && profile.imageurl) {
            return profile.imageurl;
        } else {
            return '';
        }
    }

    /**
     * premendo sul pulsante 'APRI UNA NW CONVERSAZIONE'
     * attivo una nuova conversazione
     */
    startNwConversation() {
        console.log('this.startNwConversation');
        this.isConversationOpen = true;
        this.initialize();
        this.resizeInputField();
    }
}
