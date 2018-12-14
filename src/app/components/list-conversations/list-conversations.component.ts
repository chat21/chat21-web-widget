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
  subArchivedConversations;
  // ========= end:: sottoscrizioni ======= //
  // ========= begin:: dichiarazione funzioni ======= //
  convertMessage = convertMessage;
  setColorFromString = setColorFromString;
  avatarPlaceholder = avatarPlaceholder;
  // ========= end:: dichiarazione funzioni ========= //


  // ========= begin:: variabili del componente ======= //
  // conversations: ConversationModel[];
  listConversations: Array<ConversationModel>;
  archivedConversations: Array<ConversationModel>;
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
    this.g.wdLog([' ngOnInit:::: ', this.listConversations]);
  }


  showConversations() {
    this.g.wdLog([' showConversations:::: ', this.listConversations.length]);
    const that = this;
    if (!this.subListConversations) {
      this.subListConversations = this.conversationsService.obsListConversations.subscribe((conversations) => {
          that.ngZone.run(() => {
            if (conversations && conversations.length > 3) {
              that.listConversations = conversations.slice(0, 3);
              that.g.wdLog([' >3 :::: ', that.listConversations.length]);
            } else if (conversations && conversations.length > 0) {
              that.listConversations = conversations;
            }
            that.g.wdLog([' conversations = 0 :::: ', that.listConversations]);
          });
      });
      this.subscriptions.push(this.subListConversations);
    }

    if (!this.subArchivedConversations) {
      this.subArchivedConversations = this.conversationsService.obsArchivedConversations.subscribe((conversations) => {
        that.ngZone.run(() => {
          that.archivedConversations = conversations;
          that.g.wdLog([' archivedConversations:::: ', that.archivedConversations]);
        });
      });
      this.subscriptions.push(this.subArchivedConversations);
    }
  }

  initialize() {
    this.g.wdLog(['initialize: ListConversationsComponent']);
    this.senderId = this.g.senderId;
    this.tenant = this.g.tenant;
    this.LABEL_START_NW_CONV = this.g.LABEL_START_NW_CONV;
    this.listConversations = [];
    this.archivedConversations = [];

    this.g.wdLog(['senderId: ', this.senderId]);
    this.g.wdLog(['tenant: ', this.tenant]);
    this.g.wdLog(['themeColor: ', this.g.themeColor]);
    this.g.wdLog(['themeForegroundColor: ', this.g.themeForegroundColor]);

    this.conversationsService.initialize(this.senderId, this.tenant);
    this.conversationsService.checkListConversations();
    this.conversationsService.checkListArchivedConversations();
    this.listConversations = this.conversationsService.listConversations;
    this.g.wdLog(['this.listConversations.length', this.listConversations.length]);
    this.g.wdLog(['this.listConversations', this.listConversations]);
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
     this.subArchivedConversations = null;
     this.g.wdLog(['this.subscriptions', this.subscriptions]);
 }
 // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//

}
