import { Component, OnInit, OnDestroy } from '@angular/core';

import * as moment from 'moment';
import { environment } from '../environments/environment';

// services
import { AuthService } from './core/auth.service';
import { MessagingService } from './providers/messaging.service';
// models
import { MessageModel } from '../models/message';
// utils
// import { setHeaderDate, searchIndexInArrayForUid, urlify } from './utils/utils';
import { MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT } from './utils/constants';


// https://www.davebennett.tech/subscribe-to-variable-change-in-angular-4-service/
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy, OnInit  {
    isShowed: boolean; /** indica se il pannello conversazioni è aperto o chiuso */
    loggedUser: any;
    subscription: Subscription;
    messages: MessageModel[];
    conversationWith: string;
    senderId: string;
    recipientId: string;
    conversationId: string;

    MSG_STATUS_SENT = MSG_STATUS_SENT;
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
    constructor(
        public authService: AuthService,
        public messagingService: MessagingService
    ) {
    }

    /**
     * creo sottoscrizione ad array messaggi del provider
     * inizializzo la pagina
     */
    ngOnInit() {
        this.subscription = this.messagingService.observable
        .subscribe(messages => {
            this.messages = messages;
        });
        this.initialize();
    }

    /**
     * elimino tutte le sottoscrizioni
     */
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    /**
     * inizializzo variabili
     * effettuo il login anonimo su firebase
     * se il login è andato a buon fine recupero id utente
     */
    initialize() {
        const that = this;
        moment.locale('it');
        this.isShowed = false;
        this.messages = [];

        this.authService.authenticateFirebaseAnonymously()
        .then(function(user) {
            that.loggedUser = user;
            that.createConversation(user);
        })
        .catch(function(error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            that.messages = [];
            console.log('22222 signInAnonymously KO:', errorCode, errorMessage);
            // devo scrivere un messaggio di errore e aggiungere un pulsante riprova
        });
    }

    /**
     * IMPOSTO: senderId, recipientId, conversationId, conversationWith
     * 1 - recupero il senderId dell'utente loggato che scrive
     * 2 - recupero recipientId impostato nel file environment
     * 3 - inizializzo messagingService
     * 4 - recupero messaggi conversazione
     */
    createConversation(user) {
        console.log('createConversation: ', user.uid);
        this.senderId = user.uid;
        this.recipientId = environment.agentId;
        this.conversationId = environment.agentId;
        this.conversationWith = environment.agentId;
        this.messagingService.initialize(user);
        this.messagingService.listMessages();
    }

    //// ACTIONS ////
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
    // /**
    //  * f21_update_view_height
    // */
    // f21_update_view_height() {
    //     const target = document.getElementById('chat21-main-message-context');
    //     console.log('f21_update_view_height::', target.style, target.offsetHeight);
    //     // const messageString = document.getElementsByTagName('f21textarea')[0].value;
    //     const messageString = document.getElementsByClassName('f21textarea')[0].nodeValue;
    //     console.log('f21_update_view_height::', messageString);
    //     // console.log('************ $messageString2', messageString.trim());
    //     if (messageString === '') {
    //         document.getElementsByClassName('f21textarea')[0].nodeValue = '';
    //         console.log('************ messageString ----->', document.getElementsByClassName('f21textarea')[0].nodeValue, '<-----');
    //         return;
    //     }
    // }

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
        console.log('H:: this.textInputTextArea', (document.getElementById('chat21-main-message-context') as HTMLInputElement).value , target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
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
        console.log('onkeypress **************', keyCode, msg);
        if (keyCode === 13) {

            // const target = document.getElementById('chat21-main-message-context');
            // target.style.height = this.HEIGHT_DEFAULT;
            // target.blur();
            // setTimeout(function() {
            //     target.focus();
            // }, 500);

            if (msg && msg.trim() !== '') {
                console.log('sendMessage -> ', this.textInputTextArea);
                // this.resizeInputField();
                this.messagingService.sendMessage(msg);
                this.scrollToBottom();
            }
            this.textInputTextArea = null;
        }
    }


}
