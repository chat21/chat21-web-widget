
import { Component, NgZone, OnInit, AfterViewInit, Input, Output, EventEmitter, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
// services
import { ConversationsService } from '../../providers/conversations.service';
import { ConversationsHandlerService } from '../../../chat21-core/providers/abstract/conversations-handler.service';
import { Globals } from '../../utils/globals';
import {
  getUrlImgProfile,
  setColorFromString,
  avatarPlaceholder,
  convertMessage,
  compareValues
} from '../../utils/utils';
import {
  FIREBASESTORAGE_BASE_URL_IMAGE,
  IMG_PROFILE_BOT, IMG_PROFILE_DEFAULT
} from '../../utils/constants';
import { ContactService } from '../../providers/contact.service';
import { WaitingService } from '../../providers/waiting.service';
import { TranslatorService } from '../../providers/translator.service';


// models
import { ConversationModel } from '../../../chat21-core/models/conversation';
import { User } from '../../../models/User';
// import * as moment from 'moment/moment';
// import 'moment-duration-format';
import {HumanizeDurationLanguage, HumanizeDuration} from 'humanize-duration-ts';
import { CustomTranslateService } from '../../../chat21-core/providers/custom-translate.service';
import { ChatManager } from '../../../chat21-core/providers/chat-manager';
import { ImageRepoService } from '../../../chat21-core/providers/abstract/image-repo.service';


@Component({
  selector: 'tiledeskwidget-home-conversations',
  templateUrl: './home-conversations.component.html',
  styleUrls: ['./home-conversations.component.scss']
})


export class HomeConversationsComponent implements OnInit, OnDestroy {
  
  // ========= begin:: Input/Output values ============//
  @Output() onNewConversation = new EventEmitter<string>();
  @Output() onConversationSelected = new EventEmitter<ConversationModel>();
  @Output() onOpenAllConvesations = new EventEmitter();
  @Output() onImageLoaded = new EventEmitter<ConversationModel>();
  @Output() onConversationLoaded = new EventEmitter<ConversationModel>();
  @Input() listConversations: Array<ConversationModel>; // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  @Input() styleMap: Map<string, string>
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
  getUrlImgProfile = getUrlImgProfile;
  // ========= end:: dichiarazione funzioni ========= //


  // ========= begin:: variabili del componente ======= //
  // conversations: ConversationModel[];
  //listConversations: Array<ConversationModel>;
  archivedConversations: Array<ConversationModel>;
  tenant = '';
  themeColor = '';
  themeForegroundColor = '';
  LABEL_START_NW_CONV: string;
  availableAgents: Array<User> = [];
  // ========= end:: variabili del componente ======== //

  waitingTime: Number;
  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration;
  humanWaitingTime: string;
  WAITING_TIME_FOUND_WITH_REPLYTIME_PLACEHOLDER: string //new

  translationMapConversation: Map<string, string>;
  constructor(
    public g: Globals,
    private ngZone: NgZone,
    // public conversationsService: ConversationsService,
    public conversationsHandlerService: ConversationsHandlerService,
    public imageRepoService: ImageRepoService,
    public chatManager: ChatManager,
    public contactService: ContactService,
    public waitingService: WaitingService,
    public translatorService: TranslatorService,
    private customTranslateService: CustomTranslateService,
  ) {
    // console.log(this.langService);
    // https://www.npmjs.com/package/humanize-duration-ts
    // https://github.com/Nightapes/HumanizeDuration.ts/blob/master/src/humanize-duration.ts
    this.humanizer = new HumanizeDuration(this.langService);
    this.humanizer.setOptions({round: true});
    this.initialize();
  }

  ngOnInit() {
    this.g.wdLog(['-------ngOnInit : home-conversations ------------ ', this.listConversations]);
    
  }

  public initTranslations() {
    const keysConversation = [
      'CLOSED'
    ];
    const keys = [
      'LABEL_TU'
    ];
    const translationMap = this.customTranslateService.translateLanguage(keys);
    this.translationMapConversation = this.customTranslateService.translateLanguage(keysConversation);
  }

  

  // ========= begin:: ACTIONS ============//
  returnSelectedConversation(conversation: ConversationModel) {
    if(conversation){
      // rimuovo classe animazione
      //this.removeAnimation();
      this.onConversationSelected.emit(conversation);
    }
  }

  // ========= end:: ACTIONS ============//

  // showConversations() {
  //   this.g.wdLog([' showConversations:::: ', this.listConversations.length]);
  //   const that = this;
  //   let subListConversations;
  //   if (!subListConversations) {
  //     subListConversations = this.conversationsService.obsListConversations.subscribe((conversations) => {
  //         that.ngZone.run(() => {
  //           if (conversations && conversations.length > 3) {
  //             that.listConversations = conversations.slice(0, 3);
  //             that.g.wdLog([' >3 :::: ', that.listConversations.length]);
  //           } else if (conversations && conversations.length > 0) {
  //             that.listConversations = conversations;
  //           }
  //           that.g.wdLog([' conversations = 0 :::: ', that.listConversations]);
  //         });
  //     });
  //     this.subscriptions.push(subListConversations);
  //   }

  //   if (!this.subArchivedConversations) {
  //     this.subArchivedConversations = this.conversationsService.obsArchivedConversations.subscribe((conversations) => {
  //       that.ngZone.run(() => {
  //         that.archivedConversations = conversations;
  //         that.g.wdLog([' archivedConversations:::: ', that.archivedConversations]);
  //       });
  //     });
  //     this.subscriptions.push(this.subArchivedConversations);
  //   }

  // }

  initialize() {
    this.g.wdLog(['initialize: ListConversationsComponent']);
    this.initTranslations();

    //this.senderId = this.g.senderId;
    this.tenant = this.g.tenant;
    this.LABEL_START_NW_CONV = this.g.LABEL_START_NW_CONV; // IN THE TEMPLATE REPLACED LABEL_START_NW_CONV WITH g.LABEL_START_NW_CONV
    this.listConversations = [];
    this.archivedConversations = [];
    this.waitingTime = -1;
    this.availableAgents = this.g.availableAgents.slice(0, 5)
    this.availableAgents.forEach(agent => {
      agent.imageurl = this.imageRepoService.getImagePhotoUrl(FIREBASESTORAGE_BASE_URL_IMAGE, agent.id)
    })

    //this.g.wdLog(['senderId: ', this.senderId]);
    this.g.wdLog(['tenant: ', this.tenant, this.availableAgents]);
    // this.conversationsService.initialize(this.senderId, this.tenant);
    // this.conversationsService.checkListConversations();
    // this.conversationsService.checkListArchivedConversations();
    // this.listConversations = this.conversationsService.listConversations;

    // this.conversationsHandlerService.initialize(this.tenant,this.senderId, translationMap)
    // this.conversationsHandlerService.connect();
    // this.listConversations = this.conversationsHandlerService.conversations;
    // 6 - save conversationHandler in chatManager
    // this.chatManager.setConversationsHandler(this.conversationsHandlerService);
    
    this.g.wdLog(['this.listConversations.length', this.listConversations.length]);
    this.g.wdLog(['this.listConversations', this.listConversations]);
    if (this.g.supportMode) {
      this.showWaitingTime();
    }
    //this.showConversations();
  }

  showWaitingTime() {
    const that = this;
    const projectid = this.g.projectid;
    this.waitingService.getCurrent(projectid).subscribe(response => {
        that.g.wdLog(['response waiting', response]);
        // console.log('response waiting ::::', response);
       if (response && response.length > 0 && response[0].waiting_time_avg) {
        const wt = response[0].waiting_time_avg;

        that.waitingTime = wt;
        that.g.wdLog([' that.waitingTime',  that.waitingTime]);
        // console.log('that.waitingTime', that.waitingTime);

        const lang = that.translatorService.getLanguage();
        // console.log('lang', lang);
        that.humanWaitingTime = this.humanizer.humanize(wt, {language: lang});
        // console.log('LIST CONVERSATION humanWaitingTime ', that.humanWaitingTime);
        // console.log('LIST CONVERSATION g.WAITING_TIME_FOUND ',  this.g.WAITING_TIME_FOUND)
        // console.log('LIST CONVERSATION g.WAITING_TIME_FOUND contains $reply_time',  this.g.WAITING_TIME_FOUND.includes("$reply_time") )
       
        // REPLACE
        if (this.g.WAITING_TIME_FOUND.includes("$reply_time")) {
          // REPLACE if exist
          this.WAITING_TIME_FOUND_WITH_REPLYTIME_PLACEHOLDER = this.g.WAITING_TIME_FOUND.replace("$reply_time", that.humanWaitingTime);
        }
        // console.log('LIST CONVERSATION WAITING_TIME_FOUND_WITH_REPLYTIME_PLACEHOLDER',  this.WAITING_TIME_FOUND_WITH_REPLYTIME_PLACEHOLDER)
        // console.log('LIST CONVERSATION g.dynamicWaitTimeReply ',  this.g.dynamicWaitTimeReply )
        // console.log('LIST CONVERSATION typeof g.dynamicWaitTimeReply ', typeof this.g.dynamicWaitTimeReply )

        // console.log('xxx', this.humanizer.humanize(wt));
        // 'The team typically replies in ' + moment.duration(response[0].waiting_time_avg).format();
       }
      //  else {
      //   that.waitingTimeMessage = 'waiting_time_not_found';
      //   // that.waitingTimeMessage = 'Will reply as soon as they can';
      //  }
    });
}

checkShowAllConversation() {
  if (this.archivedConversations && this.archivedConversations.length > 0) {
    return true;
  } else if (this.listConversations && this.listConversations.length > 0) {
    return true;
  }
  return false;
}
// msToTime(duration) {
//   let milliseconds = parseInt((duration % 1000) / 100),
//     seconds = parseInt((duration / 1000) % 60),
//     minutes = parseInt((duration / (1000 * 60)) % 60),
//     hours = parseInt((duration / (1000 * 60 * 60)) % 24);

//   hours = (hours < 10) ? "0" + hours : hours;
//   minutes = (minutes < 10) ? "0" + minutes : minutes;
//   seconds = (seconds < 10) ? "0" + seconds : seconds;

//   return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
// }


//  dhm(t) {
//   let cd = 24 * 60 * 60 * 1000,
//       ch = 60 * 60 * 1000,
//       d = Math.floor(t / cd),
//       h = Math.floor( (t - d * cd) / ch),
//       m = Math.round( (t - d * cd - h * ch) / 60000),
//       pad = function(n){ return n < 10 ? '0' + n : n; };
// if ( m === 60 ) {
//   h++;
//   m = 0;
// }
// if ( h === 24 ) {
//   d++;
//   h = 0;
// }
// return [d, pad(h), pad(m)].join(':');
// }


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
    this.onNewConversation.emit();
  }
  returnOpenAllConversation() {
    this.onOpenAllConvesations.emit();
  }

  onImageLoadedFN(conversation: ConversationModel){
    this.onImageLoaded.emit(conversation)
  }

  onConversationLoadedFN(conversation: ConversationModel){
    this.onConversationLoaded.emit(conversation)
  }

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


  private openConversationByID(conversation) {
    this.g.wdLog(['openConversationByID: ', conversation]);
    if ( conversation ) {
      // this.conversationsService.updateIsNew(conversation);
      // this.conversationsService.updateConversationBadge();
      this.onConversationSelected.emit(conversation);
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
