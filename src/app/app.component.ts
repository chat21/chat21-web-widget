import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from 'angular-2-local-storage';
import { UUID } from 'angular2-uuid';
import * as moment from 'moment';
import { environment } from '../environments/environment';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked  {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  messages: FirebaseListObservable<any>;
  db: AngularFireDatabase;
  newMessageText: string;
  senderId: string;
  recipientId: string;
  conversationId: string;
  tenant: string;
  public chat21_tenant:string;
  public panelBodyOpen: boolean;
 

  constructor(
      db: AngularFireDatabase, 
      private localStorageService: LocalStorageService
    ) {

    

   // console.log('nameXXX ', name);
    console.log('chat21_tenant ',  this.chat21_tenant);
    moment.locale('it');
    
    this.db = db;

    this.tenant = environment.tenant;
    console.log('this.tenant ',  this.tenant);

    this.senderId = localStorageService.get<string>('senderId');
    console.log('this.senderId', this.senderId);


    if (!this.senderId) {
      let uuid = UUID.UUID();
     // uuid = uuid.replace('-', '_');
      uuid = uuid.split('-').join('_');
      localStorageService.set('senderId', uuid);
      this.senderId = uuid;
       console.log('generated new senderId :', uuid);
    }

    this.recipientId = environment.agentId;

    if (this.senderId.localeCompare(this.recipientId) < 0) {
        this.conversationId = this.senderId + '-' + this.recipientId;
    }else {
        this.conversationId = this.recipientId + '-' + this.senderId;
    }
    console.log('this.conversationId  :', this.conversationId );

    // se esiste la conversazione apro il popup!!!!
    // Determine which child keys in DataSnapshot have data.
    let url = '/apps/' + this.tenant + '/messages/';
    var ref = firebase.database().ref(url);
    let that = this;
    ref.once("value")
    .then(function(snapshot) {
        if(snapshot.child(that.conversationId).exists()){
            that.panelBodyOpen = true;
            console.log('LA CONVERSAZIONE ESISTE');
        }
        else {
            that.panelBodyOpen = false;
            console.log('LA CONVERSAZIONE NON ESISTE');
        }
    });

    this.messages = db.list(url+this.conversationId);
    // this.messages.$ref
    // .on("child_added", (child) => {
    //   console.log("child_added", child.key, child.val());
    //   that.scrollToBottom();
    // });
    console.log('this.messages', this.messages);
  }


ngOnInit() {
    //this.scrollToBottom();
}

ngAfterViewChecked() {
    //this.scrollToBottom();
}

scrollToBottom(): void {
  // https://stackoverflow.com/questions/35232731/angular2-scroll-to-bottom-chat-style
  console.log('scrollToBottom');
  try {
    this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
  } catch(err) { }
}


sendMessage() {
    console.log('text:', this.newMessageText);
    const now: Date = new Date();
    const timestamp = now.valueOf();
    // creo messaggio e lo aggiungo all'array
    // cambio lo stato da 0 a 1 e lo invio
    // quando lo ricevo cambio lo stato a 2
    const message = {
        conversationId: this.conversationId,
        recipient: this.recipientId,
        sender: this.senderId,
        //sender_fullname: this.user.displayName,
        status: 2,
        text: this.newMessageText,
        timestamp: timestamp,
        type: 'text'
    };
    console.log('messaggio **************', message);
    this.newMessageText = '';
    this.messages.push(message);

    this.createSenderConversation(message);
    this.createReceiverConversation(message);
    this.panelBodyOpen = true;
}


createSenderConversation(message:any) {
  const senderIdNormalized = message.sender.replace('.', '_');
  const conversationsPathDb = '/apps/' + this.tenant + '/users/' + senderIdNormalized + '/conversations/' + this.conversationId;
  console.log('createSenderConversation.conversationsPathDb: ', conversationsPathDb);
  const converationsObj = this.db.object(conversationsPathDb);
  const conversation = {
            convers_with: message.recipient,
            is_new: true,
            last_message_text: message.text,
            recipient: message.recipient,
            sender: message.sender,
            status: 2,
            timestamp: message.timestamp,
        };
  converationsObj.set(conversation);
}

createReceiverConversation(message:any) {
  const receiverIdNormalized = message.recipient.replace('.', '_');
  const conversationsPathDb = '/apps/' + this.tenant + '/users/' + receiverIdNormalized + '/conversations/' + this.conversationId;
  console.log('createReceiverConversation.conversationsPathDb: ', conversationsPathDb);
  const  converationsObj = this.db.object(conversationsPathDb);
  const conversation = {
            convers_with: message.sender,
            is_new: true,
            last_message_text: message.text,
            recipient: message.recipient,
            sender: message.sender,
            status: 2,
            timestamp: message.timestamp,
        };
  converationsObj.set(conversation);
}


}
