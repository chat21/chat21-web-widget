import { Component, NgZone, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
// services
import { ConversationsService } from '../../providers/conversations.service';
import { Globals } from '../../utils/globals';
import { setColorFromString, avatarPlaceholder, convertMessage, compareValues } from '../../utils/utils';
import { ContactService } from '../../providers/contact.service';

// models
import { ConversationModel } from '../../../models/conversation';


@Component({
  selector: 'tiledeskwidget-list-conversations',
  templateUrl: './list-conversations.component.html',
  styleUrls: ['./list-conversations.component.scss']
})

export class ListConversationsComponent implements OnInit, OnDestroy {

  // ========= begin:: Input/Output values ============//
  @Output() eventNewConv = new EventEmitter<string>();
  @Output() eventSelctedConv = new EventEmitter<string>();
  @Output() eventClose = new EventEmitter();
  @Output() eventOpenAllConv = new EventEmitter();
  @Input() senderId: string; // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  // ========= end:: Input/Output values ============//

  // ========= begin:: sottoscrizioni ======= //
  subscriptions: Subscription[] = []; /** */
  // subOpenConversations;
  subListConversations;

  // usata per fare la count delle conversazioni totali e se maggiore di 0 mostrare il pulsante Vedi tutte altrimenti disabilitato
  subAllConversations;
  
  // ========= end:: sottoscrizioni ======= //
  // ========= begin:: dichiarazione funzioni ======= //
  convertMessage = convertMessage;
  setColorFromString = setColorFromString;
  avatarPlaceholder = avatarPlaceholder;
  // ========= end:: dichiarazione funzioni ========= //


  // ========= begin:: variabili del componente ======= //
  // conversations: ConversationModel[];
  firtsConversations: ConversationModel[];
  allConversations: ConversationModel[];
  tenant = '';
  themeColor = '';
  themeForegroundColor = '';
  LABEL_START_NW_CONV: string;
  // ========= end:: variabili del componente ======== //


  constructor(
    public g: Globals,
    private ngZone: NgZone,
    public conversationsService: ConversationsService,
    public contactService: ContactService
  ) {
    this.initialize();
    this.showConversations();
  }

  ngOnInit() {
    this.g.wdLog([' ngOnInit:::: ', this.firtsConversations]);
  }


  showConversations() {
    // this.g.wdLog([' showConversations:::: ', this.firtsConversations.length]);
    const that = this;
    if (!this.subListConversations) {
      this.subListConversations = this.conversationsService.obsListConversations.subscribe((conversations) => {
        this.ngZone.run(() => {
          // that.conversations = conversations;
          if (conversations && conversations.lenght > 3) {
            that.firtsConversations = conversations.slice(0, 3);
          } else {
            that.firtsConversations = conversations;
          }
          that.g.wdLog([' conversations:::: ', that.firtsConversations]);
          if ( that.firtsConversations && that.firtsConversations.length > 0 ) {
            that.firtsConversations.sort(compareValues('timestamp', 'desc'));
          }
        });
      });
      this.subscriptions.push(this.subListConversations);
    }

    if (!this.subAllConversations) {
      this.subAllConversations = this.conversationsService.obsAllConversations.subscribe((conversations) => {
        this.ngZone.run(() => {
          that.allConversations = conversations;
          that.g.wdLog([' allConversations:::: ', that.allConversations]);
          if ( that.allConversations && that.allConversations.length > 0 ) {
            that.firtsConversations.sort(compareValues('timestamp', 'desc'));
          }
        });
      });
      this.subscriptions.push(this.subAllConversations);
    }
  }

  initialize() {
    this.g.wdLog(['initialize: ListConversationsComponent']);
    this.senderId = this.g.senderId;
    this.tenant = this.g.tenant;
    this.LABEL_START_NW_CONV = this.g.LABEL_START_NW_CONV;
    this.firtsConversations = [];

     this.g.wdLog(['senderId: ', this.senderId]);
     this.g.wdLog(['tenant: ', this.tenant]);
     this.g.wdLog(['themeColor: ', this.g.themeColor]);
     this.g.wdLog(['themeForegroundColor: ', this.g.themeForegroundColor]);

    this.conversationsService.initialize(this.senderId, this.tenant);
    this.conversationsService.checkListConversationsLimit(3);
    this.conversationsService.checkListArchivedConversations();

    // this.conversations = this.conversationsService.openConversations;

  }

  // setImageProfile(agent) {
  //   //console.log(agent);
  //   this.contactService.setImageProfile(agent)
  //   .then(function (snapshot) {
  //     if (snapshot.val().trim()) {
  //       agent.image = snapshot.val();
  //     }
  //   })
  //   .catch(function (err) {
  //       console.log(err);
  //   });
  // }



  // ========= begin:: ACTIONS ============//
  openNewConversation() {
    this.eventNewConv.emit();
  }
  returnOpenAllConversation() {
    this.eventOpenAllConv.emit();
  }

  private openConversationByID(conversation) {
     this.g.wdLog(['openConversationByID: ', conversation]);
    if ( conversation ) {
      // this.conversationsService.updateBadge(conversation, 0);
      this.conversationsService.updateIsNew(conversation);
      this.conversationsService.updateConversationBadge();
      this.eventSelctedConv.emit(conversation);
    }
  }
  // ========= end:: ACTIONS ============//


  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
    /** elimino tutte le sottoscrizioni */
  ngOnDestroy() {
    this.g.wdLog(['list conv destroy subscriptions', this.subscriptions]);
    this.unsubscribe();
  }

 /** */
 unsubscribe() {
     this.subscriptions.forEach(function (subscription) {
         subscription.unsubscribe();
     });
     this.subscriptions = [];
     // this.subOpenConversations = null;
     this.subListConversations = null;
     this.subAllConversations = null;
     this.g.wdLog(['this.subscriptions', this.subscriptions]);
 }
 // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//

}
