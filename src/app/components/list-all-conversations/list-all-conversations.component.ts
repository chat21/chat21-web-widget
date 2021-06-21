import { ChatManager } from './../../../chat21-core/providers/chat-manager';
import { Component, NgZone, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, SimpleChanges, IterableDiffers } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// services
import { ConversationsService } from '../../providers/conversations.service';
import { Globals } from '../../utils/globals';
import { getUrlImgProfile, convertMessage, compareValues } from '../../utils/utils';
import { ConversationsHandlerService } from '../../../chat21-core/providers/abstract/conversations-handler.service';

// models
import { ConversationModel } from '../../../chat21-core/models/conversation';
import { take } from 'rxjs/operators';

import {
  IMG_PROFILE_BOT, IMG_PROFILE_DEFAULT
} from '../../utils/constants';
import { ArchivedConversationsHandlerService } from '../../../chat21-core/providers/abstract/archivedconversations-handler.service';
import { AmdDependency } from 'typescript';
import { CustomTranslateService } from '../../../chat21-core/providers/custom-translate.service';
import { LoggerService } from '../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../chat21-core/providers/logger/loggerInstance';


@Component({
  selector: 'chat-list-all-conversations',
  templateUrl: './list-all-conversations.component.html',
  styleUrls: ['./list-all-conversations.component.scss']
})


export class ListAllConversationsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('afallconv') private afallconv: ElementRef;
  // ========= begin:: Input/Output values ============//
  @Input() listConversations: Array<ConversationModel>;
  @Input() archivedConversations: Array<ConversationModel>;
  @Input() stylesMap: Map<string, string>;
  @Output() onConversationSelected = new EventEmitter<ConversationModel>();
  @Output() onCloseWidget = new EventEmitter();
  // ========= end:: Input/Output values ============//


  // ========= begin:: dichiarazione funzioni ======= //
  convertMessage = convertMessage;
  getUrlImgProfile = getUrlImgProfile;
  // ========= end:: dichiarazione funzioni ========= //

  // ========= begin:: sottoscrizioni ======= //
  subscriptions: Subscription[] = []; /** */


  // ========= begin:: variabili del componente ======= //
  allConversations: Array<ConversationModel>;


  themeColor = '';
  colorBck = '';
  themeForegroundColor = '';
  LABEL_START_NW_CONV: string;
  translationMapConversation: Map<string, string>;
  iterableDifferListConv: any;
  iterableDifferListArchivedConv: any;
  // ========= end:: variabili del componente ======== //
  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(public g: Globals,
              private iterableDiffers: IterableDiffers,
              private customTranslateService: CustomTranslateService,) {
      this.iterableDifferListConv = this.iterableDiffers.find([]).create(null);
      this.iterableDifferListArchivedConv = this.iterableDiffers.find([]).create(null);
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

  ngDoCheck() {
    let changesListConversation = this.iterableDifferListConv.diff(this.listConversations);
    let changesListArchivedConversation = this.iterableDifferListArchivedConv.diff(this.archivedConversations);
    if (changesListConversation || changesListArchivedConversation) {
        this.concatAndOrderArray();
    }
  }

  public initTranslations() {
    const keysConversation = ['CLOSED'];
    this.translationMapConversation = this.customTranslateService.translateLanguage(keysConversation);
  }


  initialize() {
    this.logger.printDebug('LISTALLCONVERSATIONS:: initialize');
    this.initTranslations();
    this.LABEL_START_NW_CONV = this.g.LABEL_START_NW_CONV; // is used ?? LABEL_START_NW_CONV there isn't in the template
    // this.subscriptions = [];
    this.allConversations = [];

    this.colorBck = '#000000';


    //this.conversationsService.initialize(this.senderId, this.tenant);
    // this.conversations = this.conversationsService.allConversations;
    // this.conversationsHandlerService = this.chatManager.conversationsHandlerService;
    // this.archivedConversationsService = this.chatManager.archivedConversationsService;
    // this.listConversations = this.conversationsHandlerService.conversations
    // this.archivedConversations = this.archivedConversationsService.archivedConversations;
    // this.conversationsService.checkListConversations();
    // this.conversationsService.checkListArchivedConversations();
    this.logger.printDebug('LISTALLCONVERSATIONS:: listconversations', this.listConversations, this.archivedConversations)
    this.concatAndOrderArray();
  }

  // initSubscriptions(){
  //   const that = this;
  //   const subListConversations = this.conversationsHandlerService.conversationsAdded.subscribe((conversation) => {
  //     that.ngZone.run(() => {
  //       if(conversation){
  //         that.listConversations.push(conversation);
  //         that.concatAndOrderArray();
  //         that.logger.printDebug(' ListAllConversationsComponent conversations:::: ', that.listConversations]);
  //       }
        
  //     });
  //   });
  //   this.subscriptions.push(subListConversations);
    

  //   const subArchivedConversations = this.archivedConversationsService.archivedConversationAdded.subscribe((conversation) => {
  //     that.ngZone.run(() => {
  //       if(conversation){
  //         that.archivedConversations.push(conversation);
  //         that.concatAndOrderArray();
  //       }
  //       that.logger.printDebug(' ListAllConversationsComponent archivedConversations:::: ', that.allConversations]);
  //     });
  //   });
  //   this.subscriptions.push(subArchivedConversations);
  // }

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
    this.logger.printDebug('LISTALLCONVERSATIONS:: concatAndOrderArray ', this.allConversations);
    // this.obsAllConversations.next(this.allConversations);
  }

  // ========= begin:: ACTIONS ============//
  returnClosePage() {
    this.onCloseWidget.emit();
  }

  onConversationSelectedFN(conversation: ConversationModel){
    this.logger.printDebug('LISTALLCONVERSATIONS:: openConversationByID: ', conversation);
    if ( conversation ) {
      // this.conversationsService.updateIsNew(conversation);
      this.onConversationSelected.emit(conversation);
    }
  }

  onImageLoadedFN(conversation: ConversationModel){
    this.logger.printDebug('LISTALLCONVERSATIONS:: onImageLoadedFN', conversation)
  }

  onConversationLoadedFN(conversation: ConversationModel){
    this.logger.printDebug('LISTALLCONVERSATIONS:: onImageLoadedFN', conversation)
  }

  // private openConversationByID(conversation) {
  //   this.logger.printDebug('openConversationByID: ', conversation]);
  //   if ( conversation ) {
  //     // this.conversationsService.updateIsNew(conversation);
  //     this.onConversationSelected.emit(conversation);
  //   }
  // }

  /** */
  // getUrlImgProfile(uid?: string): string {
  //   const baseLocation = this.g.baseLocation;
  //   if (!uid || uid === 'system' ) {
  //       return baseLocation + IMG_PROFILE_BOT;
  //     } else if (uid === 'error') {
  //       return baseLocation + IMG_PROFILE_DEFAULT;
  //   } else {
  //       return baseLocation + IMG_PROFILE_DEFAULT;
  //   }
  // }
  // ========= end:: ACTIONS ============//


  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
    /** elimino tutte le sottoscrizioni */
    ngOnDestroy() {
      this.logger.printDebug('LISTALLCONVERSATIONS:: ngOnDestroy ->list conv subscriptions', this.subscriptions);
      //this.unsubscribe();
    }

   /** */
   unsubscribe() {
       this.subscriptions.forEach(function (subscription) {
           subscription.unsubscribe();
       });
       this.subscriptions = [];
       this.allConversations = [];
       this.listConversations = [];
       this.archivedConversations = [];
   }
   // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//

}

