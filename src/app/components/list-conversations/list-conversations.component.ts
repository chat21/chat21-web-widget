import { Component, NgZone, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
// services
import { ConversationsService } from '../../providers/conversations.service';
import { Globals } from '../../utils/globals';
import { setColorFromString, avatarPlaceholder, convertMessage } from '../../utils/utils';

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
  subOpenConversations;
  subAllConversations;
  // ========= end:: sottoscrizioni ======= //
  // ========= begin:: dichiarazione funzioni ======= //
  convertMessage = convertMessage;
  setColorFromString = setColorFromString;
  avatarPlaceholder = avatarPlaceholder;
  // ========= end:: dichiarazione funzioni ========= //


  // ========= begin:: variabili del componente ======= //
  conversations: ConversationModel[];
  allConversations: ConversationModel[];
  tenant = '';
  themeColor = '';
  themeForegroundColor = '';
  LABEL_START_NW_CONV: string;
  // ========= end:: variabili del componente ======== //


  constructor(
    public g: Globals,
    private ngZone: NgZone,
    public conversationsService: ConversationsService
  ) {
    this.initialize();
  }

  ngOnInit() {
    // this.initialize();
  }

  initialize() {
    this.g.wdLog(['initialize: ListConversationsComponent']);
    this.senderId = this.g.senderId;
    this.tenant = this.g.tenant;
    this.LABEL_START_NW_CONV = this.g.LABEL_START_NW_CONV;

     this.g.wdLog(['senderId: ', this.senderId]);
     this.g.wdLog(['tenant: ', this.tenant]);
     this.g.wdLog(['themeColor: ', this.g.themeColor]);
     this.g.wdLog(['themeForegroundColor: ', this.g.themeForegroundColor]);

    this.conversationsService.initialize(this.senderId, this.tenant);
    this.conversationsService.checkListConversations(3);
    this.conversationsService.checkListArchivedConversations();

    // this.conversations = this.conversationsService.openConversations;

    const that = this;
    if (!this.subOpenConversations) {
      this.subOpenConversations = this.conversationsService.obsOpenConversations.subscribe((conversations) => {
        this.ngZone.run(() => {
          that.conversations = conversations;
          that.g.wdLog([' conversations:::: ', that.conversations]);
        });
      });
      this.subscriptions.push(this.subOpenConversations);
    }

    if (!this.subAllConversations) {
      this.subAllConversations = this.conversationsService.obsAllConversations.subscribe((conversations) => {
        this.ngZone.run(() => {
          that.allConversations = conversations;
          that.g.wdLog([' allConversations:::: ', that.allConversations]);
        });
      });
      this.subscriptions.push(this.subAllConversations);
    }

  }


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
     this.subscriptions = [];
     this.subOpenConversations = null;
     this.subAllConversations = null;
     this.g.wdLog(['this.subscriptions', this.subscriptions]);
 }
 // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//

}
