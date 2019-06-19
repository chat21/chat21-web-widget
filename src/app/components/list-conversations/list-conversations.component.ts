import { Component, NgZone, OnInit, AfterViewInit, Input, Output, EventEmitter, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
// services
import { ConversationsService } from '../../providers/conversations.service';
import { Globals } from '../../utils/globals';
import { getImageUrlThumb, setColorFromString, avatarPlaceholder, convertMessage, compareValues } from '../../utils/utils';
import {
  IMG_PROFILE_BOT, IMG_PROFILE_DEFAULT
} from '../../utils/constants';
import { ContactService } from '../../providers/contact.service';
import { WaitingService } from '../../providers/waiting.service';
import { TranslatorService } from '../../providers/translator.service';


// models
import { ConversationModel } from '../../../models/conversation';
import { User } from '../../../models/User';
// import * as moment from 'moment/moment';
// import 'moment-duration-format';
import {HumanizeDurationLanguage, HumanizeDuration} from 'humanize-duration-ts';

@Component({
  selector: 'tiledeskwidget-list-conversations',
  templateUrl: './list-conversations.component.html',
  styleUrls: ['./list-conversations.component.scss']
})


export class ListConversationsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('aflistconv') private aflistconv: ElementRef;
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
  availableAgents: Array<User> = [];
  // ========= end:: variabili del componente ======== //

  waitingTime: Number;
  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration;
  humanWaitingTime: string;

  constructor(
    public g: Globals,
    private ngZone: NgZone,
    public conversationsService: ConversationsService,
    public contactService: ContactService,
    public waitingService: WaitingService,
    public translatorService: TranslatorService
  ) {
    // console.log(this.langService);
    // https://www.npmjs.com/package/humanize-duration-ts
    // https://github.com/Nightapes/HumanizeDuration.ts/blob/master/src/humanize-duration.ts
    this.humanizer = new HumanizeDuration(this.langService);
    this.humanizer.setOptions({round: true});
    this.initialize();
  }

  ngOnInit() {
    this.g.wdLog([' ngOnInit:::: ', this.listConversations]);
  }

  ngAfterViewInit() {
    this.g.wdLog([' --------ngAfterViewInit-------- ']);
    setTimeout(() => {
      if (this.aflistconv) {
        this.aflistconv.nativeElement.focus();
      }
    }, 1000);
  }


  showConversations() {
    this.g.wdLog([' showConversations:::: ', this.listConversations.length]);
    const that = this;
    let subListConversations;
    if (!subListConversations) {
      subListConversations = this.conversationsService.obsListConversations.subscribe((conversations) => {
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
      this.subscriptions.push(subListConversations);
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
    this.waitingTime = -1;
    this.availableAgents = this.g.availableAgents;
    this.g.wdLog(['senderId: ', this.senderId]);
    this.g.wdLog(['tenant: ', this.tenant]);
    this.conversationsService.initialize(this.senderId, this.tenant);
    this.conversationsService.checkListConversations();
    this.conversationsService.checkListArchivedConversations();
    this.listConversations = this.conversationsService.listConversations;
    this.g.wdLog(['this.listConversations.length', this.listConversations.length]);
    this.g.wdLog(['this.listConversations', this.listConversations]);
    if (this.g.supportMode) {
      this.showWaitingTime();
    }
    this.showConversations();
  }

  showWaitingTime() {
    const that = this;
    const projectid = this.g.projectid;
    this.waitingService.getCurrent(projectid)
    .subscribe(response => {
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
    this.eventNewConv.emit();
  }
  returnOpenAllConversation() {
    this.eventOpenAllConv.emit();
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


  private openConversationByID(conversation) {
    this.g.wdLog(['openConversationByID: ', conversation]);
    if ( conversation ) {
      // this.conversationsService.updateIsNew(conversation);
      // this.conversationsService.updateConversationBadge();
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
