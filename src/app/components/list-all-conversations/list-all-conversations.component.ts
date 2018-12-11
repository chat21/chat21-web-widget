import { Component, NgZone, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// services
import { ConversationsService } from '../../providers/conversations.service';
import { Globals } from '../../utils/globals';
import { convertMessage } from '../../utils/utils';

// models
import { ConversationModel } from '../../../models/conversation';


@Component({
  selector: 'tiledeskwidget-list-all-conversations',
  templateUrl: './list-all-conversations.component.html',
  styleUrls: ['./list-all-conversations.component.scss']
})

export class ListAllConversationsComponent implements OnInit, OnDestroy {

  // ========= begin:: Input/Output values ============//
  @Output() eventSelctedConv = new EventEmitter<string>();
  @Output() eventClosePage = new EventEmitter();
  @Input() senderId: string; // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  // ========= end:: Input/Output values ============//


  // ========= begin:: dichiarazione funzioni ======= //
  convertMessage = convertMessage;
  // ========= end:: dichiarazione funzioni ========= //

  // ========= begin:: sottoscrizioni ======= //
  subscriptions: Subscription[] = []; /** */


  // ========= begin:: variabili del componente ======= //
  conversations: ConversationModel[];
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

  }

  ngOnInit() {
    this.initialize();
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
    // this.conversations = this.conversationsService.allConversations;

    this.conversationsService.checkListConversations();
    this.conversationsService.checkListArchivedConversations();

    const that = this;
    const subAllConversations = this.conversationsService.obsAllConversations.subscribe((conversations) => {
      this.ngZone.run(() => {
        that.conversations = conversations;
        that.g.wdLog([' conversations:::: ', that.conversations]);
      });
    });
    this.subscriptions.push(subAllConversations);
  }


  // ========= begin:: ACTIONS ============//

  returnClosePage() {
    this.eventClosePage.emit();
  }

  private openConversationByID(conversation) {
     this.g.wdLog(['openConversationByID: ', conversation]);
    if ( conversation ) {
      this.conversationsService.updateIsNew(conversation);
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
       this.conversations = [];
       this.g.wdLog(['this.subscriptions', this.subscriptions]);
   }
   // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//

}

