import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/database';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// services
import { Globals } from '../utils/globals';

// models
import { ConversationModel } from '../../models/conversation';
// utils
import { avatarPlaceholder, setColorFromString, getFromNow, compareValues } from '../utils/utils';
// import { ConsoleReporter } from 'jasmine';




@Injectable()
export class ConversationsService {
  openConversations: ConversationModel[];
  archivedConversations: ConversationModel[];
  allConversations: ConversationModel[];
  listConversations: ConversationModel[];

  obsAllConversations: any;
  obsOpenConversations: any;
  obsListConversations: any;

  tenant: string;
  senderId: string;
  urlConversation: string;
  urlArchivedConversation: string;


  conversationRef: any;
  audio: any;
  badgeConversations: number;

  avatarPlaceholder = avatarPlaceholder;
  setColorFromString = setColorFromString;
  getFromNow = getFromNow;

  constructor(
    public g: Globals
  ) {
    this.allConversations = new Array<ConversationModel>();
    this.openConversations = new Array<ConversationModel>();
    this.archivedConversations = new Array<ConversationModel>();
    this.listConversations = new Array<ConversationModel>();

    this.obsAllConversations = new BehaviorSubject<[ConversationModel]>(null);
    this.obsOpenConversations = new BehaviorSubject<[ConversationModel]>(null);
    this.obsListConversations = new BehaviorSubject<[ConversationModel]>(null);

  }


  public initialize(senderId, tenant) {
    // this.openConversations = [];
    this.archivedConversations = [];
    this.allConversations = [];
    this.tenant = tenant;
    this.senderId = senderId;
    this.urlConversation = '/apps/' + this.tenant + '/users/' + this.senderId + '/conversations/';
    this.urlArchivedConversation = '/apps/' + this.tenant + '/users/' + this.senderId + '/archived_conversations/';
  }


  // ============== begin:: subscribe to conversations ================//
  public checkListConversationsLimit(limit?) {
    if (!limit || limit <= 0) { limit = 100; }
    const that = this;
    const firebaseConversations = firebase.database().ref(this.urlConversation);
    const refListConvLimit = firebaseConversations.orderByChild('timestamp').limitToLast(limit);
    this.g.wdLog(['checkListConversationsLimit *****', this.urlConversation]);

    //// SUBSCRIBE ADDED ////
    refListConvLimit.on('child_added', function (childSnapshot) {
      that.g.wdLog(['111 childSnapshot.val() *****', childSnapshot.val(), that.g.filterByRequester]);
      // console.log(childSnapshot.val());
      const conversation = that.setConversation(childSnapshot, false);
      // tslint:disable-next-line:max-line-length
      if ( that.g.filterByRequester === false || (that.g.filterByRequester === true && conversation.attributes.requester_id === that.g.senderId ) ) {
        that.listConversations.unshift(conversation); // insert item top array
        // that.updateConversations();
        that.checkIsNew(conversation);
        that.checkIsSound(conversation);
        that.updateConversationBadge();
        that.obsListConversations.next(that.listConversations);
      }
    });

    //// SUBSCRIBE CHANGED ////
    refListConvLimit.on('child_changed', function (childSnapshot) {
      const index = that.searchIndexInArrayForUid(that.listConversations, childSnapshot.key);
      const conversation = that.setConversation(childSnapshot, false);
      that.listConversations.splice(index, 1, conversation);
      that.updateConversations();
      that.checkIsNew(conversation);
      that.checkIsSound(conversation);
      that.updateConversationBadge();
      that.obsListConversations.next(that.listConversations);
      that.g.wdLog(['child_changed *****', that.listConversations, index]);
    });

    //// SUBSCRIBE REMOVED ////
    refListConvLimit.on('child_removed', function (childSnapshot) {
      const index = that.searchIndexInArrayForUid(that.listConversations, childSnapshot.key);
      if (index > -1) {
        that.listConversations.splice(index, 1);
        that.updateConversations();
        that.obsListConversations.next(that.listConversations);
      }
      that.updateConversationBadge();
    });
  }
  // ============== end:: subscribe to conversations ================//

  // ============== begin:: subscribe to conversations ================//
  public checkListConversations(limit?) {
    if (!limit || limit <= 0) { limit = 100; }
    const that = this;
    const firebaseConversations = firebase.database().ref(this.urlConversation);
    this.conversationRef = firebaseConversations.orderByChild('timestamp').limitToLast(limit);
     this.g.wdLog(['checkListAllConversations *****', this.urlConversation]);

    //// SUBSCRIBE ADDED ////
    this.conversationRef.on('child_added', function (childSnapshot) {
      that.g.wdLog(['childSnapshot.val() *****', childSnapshot.val(), that.g.filterByRequester]);
      const conversation = that.setConversation(childSnapshot, false);
      // tslint:disable-next-line:max-line-length
      if ( that.g.filterByRequester === false || (that.g.filterByRequester === true && conversation.attributes.requester_id === that.g.senderId ) ) {
        that.openConversations.unshift(conversation); // insert item top array
        that.updateConversations();
        that.checkIsNew(conversation);
        that.checkIsSound(conversation);
        // that.updateConversationBadge();
        that.obsOpenConversations.next(that.openConversations);
      }
    });

    //// SUBSCRIBE CHANGED ////
    this.conversationRef.on('child_changed', function (childSnapshot) {
      const index = that.searchIndexInArrayForUid(that.openConversations, childSnapshot.key);
      const conversation = that.setConversation(childSnapshot, false);
      that.openConversations.splice(index, 1, conversation);
      that.updateConversations();
      that.checkIsNew(conversation);
      that.checkIsSound(conversation);
      // that.updateConversationBadge();
      that.obsOpenConversations.next(that.openConversations);
      that.g.wdLog(['child_changed *****', that.openConversations, index]);
    });

    //// SUBSCRIBE REMOVED ////
    this.conversationRef.on('child_removed', function (childSnapshot) {
      const index = that.searchIndexInArrayForUid(that.openConversations, childSnapshot.key);
      if (index > -1) {
        that.openConversations.splice(index, 1);
        that.updateConversations();
        that.obsOpenConversations.next(that.openConversations);
      }
      // that.updateConversationBadge();
    });
  }
  // ============== end:: subscribe to conversations ================//



  // ========= begin:: subscribe to archived conversations ============//
  public checkListArchivedConversations(limit?) {
    if (!limit || limit <= 0) { limit = 100; }
    const that = this;
    const firebaseConversations = firebase.database().ref(this.urlArchivedConversation);
    const ref = firebaseConversations.orderByChild('timestamp').limitToLast(limit);
     this.g.wdLog(['checkListAllConversations *****', this.urlArchivedConversation]);

    //// SUBSCRIBE ADDED ////
    ref.on('child_added', function (childSnapshot) {
      that.g.wdLog(['childSnapshot.val() *****', childSnapshot.val()]);
      const conversation = that.setConversation(childSnapshot, true);
      // tslint:disable-next-line:max-line-length
      if ( that.g.filterByRequester === false || (that.g.filterByRequester === true && conversation.attributes.requester_id === that.g.senderId ) ) {
        that.archivedConversations.unshift(conversation); // insert item top array
        that.updateConversations();
        that.checkIsNew(conversation);
        that.checkIsSound(conversation);
        // that.updateConversationBadge();
      }
    });

    //// SUBSCRIBE CHANGED ////
    ref.on('child_changed', function (childSnapshot) {
      const conversation = that.setConversation(childSnapshot, true);
      const index = that.searchIndexInArrayForUid(that.archivedConversations, childSnapshot.key);
      that.archivedConversations.splice(index, 1, conversation);

      that.updateConversations();
      that.checkIsNew(conversation);
      that.checkIsSound(conversation);
      // that.updateConversationBadge();

      that.g.wdLog(['child_changed *****', that.archivedConversations, index]);
    });

    //// SUBSCRIBE REMOVED ////
    ref.on('child_removed', function (childSnapshot) {
      const index = that.searchIndexInArrayForUid(that.archivedConversations, childSnapshot.key);
      if (index > -1) {
        that.archivedConversations.splice(index, 1);
        that.updateConversations();
      }
     // that.updateConversationBadge();
    });
  }
  // ========= end:: subscribe to archived conversations ============//

  /**
   * 1 - concat array conversations
   * 2 - order array
   * 3 - aggiorno stato conversazione
   */
  public updateConversations() {
    const TEMP = this.openConversations.concat(this.archivedConversations);
    const result = [];
    const map = new Map();
    for (const item of TEMP) {
      if (!map.has(item.uid)) {
        map.set(item.uid, true);    // set any value to Map
        result.push(item);
      }
    }
    this.allConversations = result;
    // this.allConversations.map(item => item.uid).filter((value, index, self) => self.indexOf(value) === index);
    this.allConversations.sort(compareValues('timestamp', 'desc'));
    this.g.wdLog([' updateConversations:::: ', this.allConversations.length]);
    this.obsAllConversations.next(this.allConversations);
  }

  /**
   *
   */
  public checkIsSound(conversation) {
    if (this.g.activeConversation !== conversation.recipient && conversation.sender !== this.senderId) {
      // const badge = (conversation.is_new) ? 1 : 0;
      // that.updateBadge(conversation, badge);
      this.soundMessage();
    }
  }



  // ========= begin:: isNew value in conversation ============//

  /**
   * check if new or modify conversation is on active conversation
   */
  public checkIsNew(conversation) {
    if ( this.g.activeConversation === conversation.uid ) {
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
  }


  // updateBadge(conversation, badge) {
  //   const urlUpdate = this.urlConversation + conversation.recipient + '/badge/';
  //   const update = {};
  //   update [urlUpdate] = badge;
  //    this.g.wdLog(['**** updateBadge::' + urlUpdate);
  //   return firebase.database().ref().update(update);
  // }


  private setConversation(childSnapshot, archived) {
    const that = this;
     this.g.wdLog(['snapshot.val() *****', that.senderId, childSnapshot.val()]);
    if (childSnapshot.val()) {
      const conversation: ConversationModel = childSnapshot.val();
      conversation.uid = childSnapshot.key;
      conversation.last_message_text = conversation.last_message_text;
      const timestampNumber = conversation.timestamp / 1000;
      conversation.time_last_message = that.getFromNow(timestampNumber);
      conversation.archived = archived;

      if (conversation.sender === that.senderId) {
        conversation.sender_fullname = this.g.YOU;
      }
      // if (conversation.sender !== that.senderId) {
      //   conversation.avatar = that.avatarPlaceholder(conversation.sender_fullname);
      //   conversation.color = that.setColorFromString(conversation.sender_fullname);
      // }
      // this.setImageConversation(conversation, '1');

      const IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
      conversation.image = IMG_PROFILE_SUPPORT;
      // conversation.badge = 1;
      // that.conversations.push(conversation); // insert item bottom array
      return conversation;
    }
    return;
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
  soundMessage() {
    if (this.g.isSoundActive) {
       this.g.wdLog(['****** soundMessage *****']);
      this.audio = new Audio();
      this.audio.src = this.g.baseLocation + '/assets/sounds/Carme.mp3';
      this.audio.load();
      this.audio.play();
    }
  }

  searchIndexInArrayForUid(items, key) {
    return items.findIndex(i => i.recipient === key);
  }

}
