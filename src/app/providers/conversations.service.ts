import { Injectable } from '@angular/core';
import {from } from 'rxjs/observable/from';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/database';


import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// services
import { Globals } from '../utils/globals';

// models
import { ConversationModel } from '../../models/conversation';
// utils
// tslint:disable-next-line:max-line-length
import { isJustRecived, getUrlImgProfile, getUnique, avatarPlaceholder, setColorFromString, getFromNow, compareValues } from '../utils/utils';

// import { ConsoleReporter } from 'jasmine';
import { SettingsSaverService } from '../providers/settings-saver.service';
import { ConversationComponent } from '../components/conversation-detail/conversation/conversation.component';




@Injectable()
export class ConversationsService {
  // openConversations: ConversationModel[];
  archivedConversations: Array<ConversationModel>;
  // allConversations: ConversationModel[];
  listConversations: Array<ConversationModel>;

  // obsAllConversations: any;
  obsArchivedConversations: any;
  obsListConversations: any;
  obsChangeConversation: any;

  tenant: string;
  senderId: string;
  urlConversation: string;
  urlArchivedConversation: string;


  conversationRef: any;
  audio: any;
  badgeConversations: number;
  setTimeoutSound: NodeJS.Timer;

  avatarPlaceholder = avatarPlaceholder;
  setColorFromString = setColorFromString;
  getFromNow = getFromNow;
  getUrlImgProfile = getUrlImgProfile;

  constructor(
    public g: Globals,
    public settingsSaverService: SettingsSaverService
  ) {
    // this.allConversations = new Array<ConversationModel>();
    // this.openConversations = new Array<ConversationModel>();
    this.archivedConversations = new Array<ConversationModel>();
    this.listConversations = new Array<ConversationModel>();

    // this.obsAllConversations = new BehaviorSubject<[ConversationModel]>(null);
    this.obsArchivedConversations = new BehaviorSubject<[ConversationModel]>(null);
    this.obsListConversations = new BehaviorSubject<[ConversationModel]>(null);
    this.obsChangeConversation = new BehaviorSubject<ConversationModel>(null);
  }


  public initialize(senderId, tenant) {
    // this.openConversations = [];
    // this.archivedConversations = [];
    // this.listConversations = [];
    this.tenant = tenant;
    this.senderId = senderId;
    this.urlConversation = '/apps/' + this.tenant + '/users/' + this.senderId + '/conversations/';
    this.urlArchivedConversation = '/apps/' + this.tenant + '/users/' + this.senderId + '/archived_conversations/';

    const that = this;
    /**
     * se ho aperto il widget:
     * controllo se sulla conversazione attiva (se esiste ed è una delle 3 in hp cioè appartiene a listConversations)
     * e aggiorno la conversazione con 'is_new' = false;
     * in tal caso aggiorno il badge
     */
    this.g.obsIsOpen.subscribe((valIsOpen) => {
      if ( valIsOpen === true ) {
        that.listConversations.forEach(element => {
          // if ( that.g.activeConversation === element.uid ) {
          if ( that.g.activeConversation && that.g.activeConversation.uid === element.uid ) {
            that.updateIsNew(element);
            that.updateConversationBadge();
          }
        });
      }
    });
  }

  loadConversationDetail(tenant: string, senderId: string, idConversation: string): any {
    const urlConversationDetail = '/apps/' + tenant + '/users/' + senderId + '/conversations/' + idConversation;
    console.log('urlConversationDetail:: ', urlConversationDetail);
    const firebaseConversationDetail = firebase.database().ref(urlConversationDetail);
    return firebaseConversationDetail.once('value');
  }

  // // ============== begin:: subscribe to conversations ================//
  // public checkListConversationsLimit(limit?) {
  //   if (!limit || limit <= 0) { limit = 100; }
  //   const that = this;
  //   const firebaseConversations = firebase.database().ref(this.urlConversation);
  //   const refListConvLimit = firebaseConversations.orderByChild('timestamp').limitToLast(limit);
  //   that.g.wdLog(['checkListConversationsLimit *****', this.urlConversation]);

  //   //// SUBSCRIBE ADDED ////
  //   refListConvLimit.on('child_added', function (childSnapshot) {
  //     that.g.wdLog(['111 childSnapshot.val() *****', childSnapshot.val(), that.g.filterByRequester]);
  //     const conversation = that.setConversation(childSnapshot, false);
  //     // tslint:disable-next-line:max-line-length
  // tslint:disable-next-line:max-line-length
  //     if ( that.g.filterByRequester === false || (that.g.filterByRequester === true && conversation.attributes.requester_id === that.g.senderId ) ) {
  //       that.checkIsNew(conversation);
  //       that.checkIsSound(conversation);

  //       that.listConversations.unshift(conversation); // insert item to top array
  //       that.g.wdLog(['222 listConversations *****', that.listConversations.length, limit]);
  //       if (that.listConversations && that.listConversations.length > limit) {
  //         that.listConversations.slice(0, (limit - 1));
  //       }
  //       that.listConversations.sort(compareValues('timestamp', 'desc'));
  //       that.g.wdLog(['333 listConversations *****']);
  //       console.log(that.listConversations);

  //       that.updateConversationBadge();
  //       that.obsListConversations.next(that.listConversations);
  //     }
  //   });

  //   //// SUBSCRIBE CHANGED ////
  //   refListConvLimit.on('child_changed', function (childSnapshot) {
  //     const index = that.searchIndexInArrayForUid(that.listConversations, childSnapshot.key);
  //     const conversation = that.setConversation(childSnapshot, false);
  //     //if (index > 0 ) {
  //       that.listConversations.splice(index, 1, conversation);
  //       if (that.listConversations && that.listConversations.length > limit) {
  //         that.listConversations.slice(0, (limit - 1));
  //       }
  //       that.listConversations.sort(compareValues('timestamp', 'desc'));
  //       that.checkIsNew(conversation);
  //       that.checkIsSound(conversation);
  //       that.g.wdLog(['checkListConversationsLimit child_changed *****', that.listConversations.length, index]);
  //       that.updateConversationBadge();
  //       that.obsListConversations.next(that.listConversations);
  //     //}

  //   });

  //   //// SUBSCRIBE REMOVED ////
  //   refListConvLimit.on('child_removed', function (childSnapshot) {
  //     const index = that.searchIndexInArrayForUid(that.listConversations, childSnapshot.key);
  //     if (index > -1) {
  //       that.listConversations.splice(index, 1);
  //       that.obsListConversations.next(that.listConversations);
  //     }
  //     that.updateConversationBadge();
  //   });
  // }
  // // ============== end:: subscribe to conversations ================//



  // ============== begin:: subscribe to conversations ================//
  public checkListConversations() {
    const limit = 10;
    const that = this;
    const firebaseConversations = firebase.database().ref(this.urlConversation);
    this.conversationRef = firebaseConversations.orderByChild('timestamp').limitToLast(limit);
     that.g.wdLog(['checkListConversations *****', this.urlConversation]);

    //// SUBSCRIBE ADDED ////
    this.conversationRef.on('child_added', function (childSnapshot) {
      const conversation = that.setConversation(childSnapshot, false);
      that.g.wdLog(['child_added val *****', childSnapshot.val()]);
      if (that.ifCanAddConversation(conversation)) {
          const index = that.searchIndexInArrayForUid(that.listConversations, childSnapshot.key);
          if (index === -1) {
            setTimeout(function () {
              // console.log('***** NEXT *****');
              that.listConversations.unshift(conversation); // insert item top array
              that.checkIsNew(conversation);
              that.checkIsSound(conversation);
              that.updateConversationBadge();
              that.listConversations.sort(compareValues('timestamp', 'desc'));
              that.listConversations = getUnique(that.listConversations, 'uid');
              that.g.wdLog(['checkListConversations - child_added: ', that.listConversations.length]);
              that.obsListConversations.next(that.listConversations);
              that.triggerOnConversationUpdated(conversation);
            }, 0);
          }
      }
    });

    // SUBSCRIBE CHANGED ////
    this.conversationRef.on('child_changed', function (childSnapshot) {
      that.g.wdLog(['child_changed val *****', childSnapshot.val()]);
      const conversation = that.setConversation(childSnapshot, false);
      if (that.ifCanAddConversation(conversation)) {
        const index = that.searchIndexInArrayForUid(that.listConversations, childSnapshot.key);
        if (index > -1) {
          setTimeout(function () {
            that.listConversations.splice(index, 1, conversation);
            that.checkIsNew(conversation);
            that.checkIsSound(conversation);
            that.updateConversationBadge();
            that.listConversations.sort(compareValues('timestamp', 'desc'));
            that.listConversations = getUnique(that.listConversations, 'uid');
            that.g.wdLog(['checkListConversations child_changed *****', that.listConversations, index]);
            that.obsListConversations.next(that.listConversations);
            that.obsChangeConversation.next(conversation);
            that.triggerOnConversationUpdated(conversation);
          }, 0);
        }
      }
    });

    //// SUBSCRIBE REMOVED ////
    this.conversationRef.on('child_removed', function (childSnapshot) {
      that.g.wdLog(['child_removed val *****', childSnapshot.val()]);
      const index = that.searchIndexInArrayForUid(that.listConversations, childSnapshot.key);
      if (index > -1) {
        setTimeout(function () {
          that.listConversations.splice(index, 1);
          that.listConversations.sort(compareValues('timestamp', 'desc'));
          that.listConversations = getUnique(that.listConversations, 'uid');
          that.obsListConversations.next(that.listConversations);
        }, 0);
      }
      that.updateConversationBadge();
    });
  }
  // ============== end:: subscribe to conversations ================//



  // ========= begin:: subscribe to archived conversations ============//
  public checkListArchivedConversations(limit?) {
    if (!limit || limit <= 0) { limit = 100; }
    const that = this;
    const firebaseConversations = firebase.database().ref(this.urlArchivedConversation);
    const ref = firebaseConversations.orderByChild('timestamp').limitToLast(limit);
    that.g.wdLog(['checkListArchivedConversations *****', this.urlArchivedConversation]);

    //// SUBSCRIBE ADDED ////
    ref.on('child_added', function (childSnapshot) {
      that.g.wdLog(['childSnapshot.val() *****', childSnapshot.val()]);
      const conversation = that.setConversation(childSnapshot, true);
      if (that.ifCanAddConversation(conversation)) {
        const index = that.searchIndexInArrayForUid(that.archivedConversations, childSnapshot.key);
        if (index === -1) {
          that.archivedConversations.unshift(conversation); // insert item top array
          that.checkIsNew(conversation);
          that.archivedConversations.sort(compareValues('timestamp', 'desc'));
          that.archivedConversations = getUnique(that.archivedConversations, 'uid');
          that.obsArchivedConversations.next(that.archivedConversations);
          that.triggerOnConversationUpdated(conversation);
        }
      }
    });

    //// SUBSCRIBE CHANGED ////
    ref.on('child_changed', function (childSnapshot) {
      that.g.wdLog(['child_changed.val() *****', childSnapshot.val()]);
      const conversation = that.setConversation(childSnapshot, true);
      if (that.ifCanAddConversation(conversation)) {
        const index = that.searchIndexInArrayForUid(that.archivedConversations, childSnapshot.key);
        if (index > -1) {
          that.archivedConversations.splice(index, 1, conversation);
          that.checkIsNew(conversation);
          that.archivedConversations.sort(compareValues('timestamp', 'desc'));
          that.archivedConversations = getUnique(that.archivedConversations, 'uid');
          that.obsArchivedConversations.next(that.archivedConversations);
          that.g.wdLog([' checkListArchivedConversations child_changed *****', that.archivedConversations, index]);
          that.triggerOnConversationUpdated(conversation);
        }
      }
    });

    //// SUBSCRIBE REMOVED ////
    ref.on('child_removed', function (childSnapshot) {
      that.g.wdLog(['child_removed.val() *****', childSnapshot.val()]);
      const index = that.searchIndexInArrayForUid(that.archivedConversations, childSnapshot.key);
      if (index > -1) {
        that.archivedConversations.splice(index, 1);
        that.archivedConversations.sort(compareValues('timestamp', 'desc'));
        that.archivedConversations = getUnique(that.archivedConversations, 'uid');
        that.obsArchivedConversations.next(that.archivedConversations);
        // that.updateConversations();
      }
     // that.updateConversationBadge();
    });
  }
  // ========= end:: subscribe to archived conversations ============//

  /**
   * Verifica se aggiungere o meno una conversazione
   * @param conversation
   */
  private ifCanAddConversation(conversation: ConversationModel) {
    // console.log('***** CONTROLLO FILTRO BY REQUESTER ID *****');
    this.g.wdLog(['***** filterByRequester *****', this.g.filterByRequester]);
    // this.g.wdLog(['***** requester_id *****', conversation.attributes.requester_id]);
    this.g.wdLog(['***** that.g.senderId *****', this.g.senderId]);
    if (conversation.uid === 'undefined') {
      return false;
    } else if (this.g.filterByRequester === false ||
      (this.g.filterByRequester === true && conversation.attributes && conversation.attributes.requester_id === this.g.senderId)
      ) {
      return true;
    } else {
      this.g.wdLog(['***** ifCanAddConversation *****', conversation, false]);
      return false;
    }
  }

  /**
   * 1 - concat array conversations
   * 2 - order array
   * 3 - aggiorno stato conversazione
   */
  // public updateConversations() {
  //   const TEMP = this.openConversations.concat(this.archivedConversations);
  //   const result = [];
  //   const map = new Map();
  //   for (const item of TEMP) {
  //     if (!map.has(item.uid)) {
  //       map.set(item.uid, true);    // set any value to Map
  //       result.push(item);
  //     }
  //   }
  //   this.allConversations = result;
  //   // this.allConversations.map(item => item.uid).filter((value, index, self) => self.indexOf(value) === index);
  //   this.allConversations.sort(compareValues('timestamp', 'desc'));
  //   that.g.wdLog([' updateConversations:::: ', this.allConversations.length]);
  //   this.obsAllConversations.next(this.allConversations);
  // }

  /**
   *
   */
  public checkIsSound(conversation) {
    console.log('1 -- checkIsSound conversation', conversation);
    console.log('1 -- checkIsSound this.g.activeConversation', this.g.activeConversation);
    // console.log('1 -- checkIsSound this.g.activeConversation.recipient', this.g.activeConversation.recipient);
    // console.log('1 -- checkIsSound conversation.recipient', conversation.recipient);
    console.log('1 -- checkIsSound conversation.sender', conversation.sender);
    console.log('1 -- checkIsSound this.senderId', this.senderId);
    console.log('1 -- checkIsSound conversation.is_new', conversation.is_new);
    if (!this.g.activeConversation ||
        (this.g.activeConversation.recipient !== conversation.recipient
        && conversation.sender !== this.senderId
        && conversation.is_new === true)) {
      console.log('sound-massege: ', conversation.timestamp);
      // const badge = (conversation.is_new) ? 1 : 0;
      // that.updateBadge(conversation, badge);
      // this.soundMessage(conversation.timestamp);
    }
  }



  // ========= begin:: isNew value in conversation ============//

  /**
   * check if new or modify conversation is on active conversation
   */
  public checkIsNew(conversation) {
    if ( this.g.activeConversation && this.g.activeConversation.uid === conversation.uid && this.g.isOpen === true ) {
      this.updateIsNew(conversation);
    }
  }


  /** */
  public updateIsNew(conversation) {
    let urlUpdate = '';
    if (conversation.archived === true) {
      urlUpdate = this.urlArchivedConversation + conversation.recipient;
    } else {
      urlUpdate = this.urlConversation + conversation.recipient;
    }
    const update = {};
    update['/is_new'] = false;
    this.g.wdLog(['**** updateIsNew::' + urlUpdate]);
    return firebase.database().ref(urlUpdate).update(update);
  }
  // ========= end:: isNew value in conversation ============//






  updateConversationBadge() {
    let conversationsBadge = 0;
    // console.log("this.listConversations", this.listConversations);
    this.listConversations.forEach(element => {
      // console.log("element", element);
      if (element.is_new === true && element.archived === false) {
        conversationsBadge++;
      }
    });
    this.g.wdLog(['updateConversationBadge', conversationsBadge]);
    // console.log("updateConversationBadge", conversationsBadge);
    this.g.conversationsBadge = conversationsBadge;
    this.g.setParameter('conversationsBadge', conversationsBadge);
    // this.settingsSaverService.setVariable('conversationsBadge', conversationsBadge);
  }


  // updateBadge(conversation, badge) {
  //   const urlUpdate = this.urlConversation + conversation.recipient + '/badge/';
  //   const update = {};
  //   update [urlUpdate] = badge;
  //    that.g.wdLog(['**** updateBadge::' + urlUpdate);
  //   return firebase.database().ref().update(update);
  // }


  private setConversation(childSnapshot, archived) {
    const that = this;
     that.g.wdLog(['setConversation -> snapshot.val() *****', that.senderId, childSnapshot.val()]);
    if (childSnapshot.val()) {
      const conversation: ConversationModel = childSnapshot.val();
      conversation.uid = childSnapshot.key;
      conversation.last_message_text = conversation.last_message_text;
      const timestampNumber = conversation.timestamp / 1000;
      conversation.time_last_message = that.getFromNow(this.g.windowContext, timestampNumber);
      // conversation.time_last_message = that.getFromNow(timestampNumber);
      conversation.archived = archived;
      if (conversation.sender === that.senderId) {
        conversation.sender_fullname = this.g.YOU;
      }
      if (conversation.sender !== that.senderId) {
        conversation.avatar = that.avatarPlaceholder(conversation.sender_fullname);
        conversation.color = that.setColorFromString(conversation.sender_fullname);
        conversation.image = that.getUrlImgProfile(conversation.sender);
      } else {
        conversation.avatar = that.avatarPlaceholder(conversation.recipient_fullname);
        conversation.color = that.setColorFromString(conversation.recipient_fullname);
        conversation.image = that.getUrlImgProfile(conversation.recipient);
      }
      // that.checkFirebaseUrl(conversation.image);
      return conversation;
    }
    return;
  }


  private checkFirebaseUrl(imageurl: string) {
    // tslint:disable-next-line:max-line-length
    // console.log('checkFirebaseUrl::: ', imageurl);
    // const storageRef = firebase.storage().refFromURL(imageurl);
    // storageRef.getDownloadURL()
    // .then((response) => {
    //   // Found it. Do whatever
    //   console.log(':::ESISTE::: ', response);
    //   return imageurl;
    // })
    // .catch((err) => {
    //   // Didn't exist... or some other error
    //   //console.log(':::ERRORE::: ', err);
    //   //return null;
    // });
  }


  setImageConversation(conv, conversation_with) {
    const IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
    conv.image = IMG_PROFILE_SUPPORT;
    // if (conv.channel_type === TYPE_DIRECT) {
        const urlNodeConcacts = '/apps/' + this.tenant + '/contacts/' + conv.sender + '/imageurl/';
        this.g.wdLog(['setImageConversation *****', urlNodeConcacts]);
        firebase.database().ref(urlNodeConcacts).once('value')
        .then(function (snapshot) {
            if (snapshot.val().trim()) {
                conv.image = snapshot.val();
            }
        })
        .catch(function (err) {
            console.log(err);
        });
    // }
}

  /**
   * regola sound message:
   * se lo invio io -> NO SOUND
   * se non sono nella conversazione -> SOUND
   * se sono nella conversazione in fondo alla pagina -> NO SOUND
   * altrimenti -> SOUND
   */
  soundMessage(timestamp?) {
    this.g.wdLog(['****** soundMessage startedAt *****', this.g.startedAt.getTime()]);
    this.g.wdLog(['****** soundMessage timestamp *****', timestamp]);
    if (!isJustRecived(this.g.startedAt.getTime(), timestamp)) {
      return;
    }
    if (this.g.soundEnabled === true)  {
      const that = this;
      this.audio = new Audio();
      this.audio.src = this.g.baseLocation + '/assets/sounds/justsaying.mp3';
      this.audio.load();
      clearTimeout(this.setTimeoutSound);
      this.setTimeoutSound = setTimeout(function () {
        that.audio.play();
        that.g.wdLog(['****** soundMessage 2 *****']);
      }, 1000);
      // console.log('conversations play');
    }
  }

  searchIndexInArrayForUid(items, key) {
    return items.findIndex(i => i.recipient === key);
  }


  // ========= START:: TRIGGER FUNCTIONS ============//
  /** */
  private triggerOnConversationUpdated( conversation: ConversationModel) {
    this.g.wdLog([' ---------------- triggerOnConversationUpdated ---------------- ', conversation]);
    const onConversationUpdated = new CustomEvent('onConversationUpdated', { detail: { conversation: conversation } });
    const windowContext = this.g.windowContext;
    if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        windowContext.tiledesk.tiledeskroot.dispatchEvent(onConversationUpdated);
        this.g.windowContext = windowContext;
    } else {
        // this.el.nativeElement.dispatchEvent(onMessageCreated);
    }
  }
  // ========= END:: TRIGGER FUNCTIONS ============//

}
