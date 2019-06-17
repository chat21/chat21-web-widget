import { Component, NgZone, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// services
import { ConversationsService } from '../../providers/conversations.service';
import { Globals } from '../../utils/globals';
import { convertMessage, compareValues } from '../../utils/utils';

// models
import { ConversationModel } from '../../../models/conversation';
import { take } from 'rxjs/operators';

import {
  IMG_PROFILE_BOT, IMG_PROFILE_DEFAULT
} from '../../utils/constants';

@Component({
  selector: 'tiledeskwidget-list-all-conversations',
  templateUrl: './list-all-conversations.component.html',
  styleUrls: ['./list-all-conversations.component.scss']
})


export class ListAllConversationsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('afallconv') private afallconv: ElementRef;
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

  allConversations: ConversationModel[];
  listConversations: ConversationModel[];
  archivedConversations: ConversationModel[];


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

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.afallconv) {
        this.afallconv.nativeElement.focus();
      }
    }, 1000);
  }


  initialize() {
    this.g.wdLog(['initialize: ListConversationsComponent']);
    this.senderId = this.g.senderId;
    this.tenant = this.g.tenant;
    this.LABEL_START_NW_CONV = this.g.LABEL_START_NW_CONV;
    this.subscriptions = [];
    this.listConversations = [];
    this.archivedConversations = [];
    this.allConversations = [];


    this.g.wdLog(['senderId: ', this.senderId]);
    this.g.wdLog(['tenant: ', this.tenant]);

    this.conversationsService.initialize(this.senderId, this.tenant);
    // this.conversations = this.conversationsService.allConversations;

    // this.conversationsService.checkListConversations();
    // this.conversationsService.checkListArchivedConversations();

    const that = this;
    const subListConversations = this.conversationsService.obsListConversations.subscribe((conversations) => {
      that.ngZone.run(() => {
        that.listConversations = conversations;
        that.concatAndOrderArray();
        that.g.wdLog([' ListAllConversationsComponent conversations:::: ', that.listConversations]);
      });
    });
    this.subscriptions.push(subListConversations);


    const subArchivedConversations = this.conversationsService.obsArchivedConversations.subscribe((conversations) => {
      that.ngZone.run(() => {
        that.archivedConversations = conversations;
        that.concatAndOrderArray();
        that.g.wdLog([' ListAllConversationsComponent archivedConversations:::: ', that.allConversations]);
      });
    });
    this.subscriptions.push(subArchivedConversations);

  }

  /**
   * 1 - concat array conversations
   * 2 - order array
   * 3 - aggiorno stato conversazione
   */
  concatAndOrderArray() {
    let TEMP;
    if (this.listConversations && this.listConversations.length > 0 ) {
      if ( this.archivedConversations && this.archivedConversations.length > 0 ) {
        TEMP = this.listConversations.concat(this.archivedConversations);
      } else {
        TEMP = this.listConversations;
      }
    } else if ( this.archivedConversations && this.archivedConversations.length > 0 ) {
      TEMP = this.archivedConversations;
    }
    if (!TEMP) { return; }
    const result = [];
    const map = new Map();

    for (const item of TEMP) {
      if (!map.has(item.uid)) {
        map.set(item.uid, true);    // set any value to Map
        result.push(item);
      }
    }
    this.allConversations = result;
    this.allConversations.sort(compareValues('timestamp', 'desc'));
    this.g.wdLog([' concatAndOrderArray:::: ', this.allConversations]);
    // this.obsAllConversations.next(this.allConversations);
  }

  // ========= begin:: ACTIONS ============//

  returnClosePage() {
    this.eventClosePage.emit();
  }

  private openConversationByID(conversation) {
    this.g.wdLog(['openConversationByID: ', conversation]);
    if ( conversation ) {
      // this.conversationsService.updateIsNew(conversation);
      this.eventSelctedConv.emit(conversation);
    }
  }

  /** */
  getUrlImgProfile(uid?: string): string {
    const baseLocation = this.g.baseLocation;
    if (!uid || uid === 'system' ) {
        return baseLocation + IMG_PROFILE_BOT;
      } else if (uid === 'error') {
        return baseLocation + IMG_PROFILE_DEFAULT;
    } else {
        return baseLocation + IMG_PROFILE_DEFAULT;
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
       this.allConversations = [];
       this.g.wdLog(['this.subscriptions', this.subscriptions]);
   }
   // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//

}

