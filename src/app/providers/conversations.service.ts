import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
// services
import { Globals } from '../utils/globals';

// models
import { ConversationModel } from '../../models/conversation';
// utils
import { avatarPlaceholder, getColorBck, getFromNow } from '../utils/utils';




@Injectable()
export class ConversationsService {
  conversations: ConversationModel[];
  tenant: string;
  senderId: string;
  urlConversation: string;
  conversationRef: any;
  audio: any;

  badgeConversations: number;

  avatarPlaceholder = avatarPlaceholder;
  getColorBck = getColorBck;
  getFromNow = getFromNow;

  constructor(
    public g: Globals
  ) {
    this.conversations = new Array<ConversationModel>();
  }


  public initialize(senderId, tenant) {
    console.log('*******************>>>>>>>>>>>>> initialize ConversationsService:: ', senderId, tenant);
    this.conversations = [];
    this.tenant = tenant;
    this.senderId = senderId;
    this.urlConversation = '/apps/' + this.tenant + '/users/' + this.senderId + '/conversations/' ;
  }

  public checkListConversations() {
    const that = this;
    const firebaseConversations = firebase.database().ref(this.urlConversation);
    this.conversationRef = firebaseConversations.orderByChild('timestamp').limitToLast(3);
    // this.conversationRef.on('value', function(snapshot) {

    //// SUBSCRIBE ADDED ////
    this.conversationRef.on('child_added', function(childSnapshot) {
      console.log('childSnapshot.val() *****', childSnapshot.val());
      const conversation = that.setConversation(childSnapshot);
      that.conversations.unshift(conversation); // insert item top array
      if (conversation.sender !== that.senderId ) {
        // const badge = (conversation.is_new) ? 1 : 0;
        // that.updateBadge(conversation, badge);
        if ( conversation.is_new === true ) {
          that.updateConversationBadge();
        }
        that.soundMessage();
      }
    });

    //// SUBSCRIBE CHANGED ////
    this.conversationRef.on('child_changed', function(childSnapshot) {
      const index = that.searchIndexInArrayForUid(that.conversations, childSnapshot.key);
      const conversationTEMP = that.conversations[index];
      const conversation = that.setConversation(childSnapshot);
      // conversation.badge = conversationTEMP.badge + 1;
      that.conversations.splice(index, 1, conversation);
      if (conversation.sender !== that.senderId) {
        // mi è arrivato un nw messaggio o è cambiato lo stato di badge
        if (conversation.timestamp !==  conversationTEMP.timestamp ) {
          // nuovo messaggio con conversazione aperta o chiusa
          let badge;
          if (that.g.activeConversation === conversation.recipient) {
            // aperta: resetto il badge
            badge = 0;
          } else {
            // chiusa: incremento budget, attivo sound
            badge = (conversationTEMP.badge) ? conversationTEMP.badge + 1 : 1;
            that.soundMessage();
          }
          //that.updateBadge(conversation, badge);
          that.updateConversationBadge();
        }
      }
      console.log('child_changed *****', that.conversations, index);
    });

    //// SUBSCRIBE REMOVED ////
    this.conversationRef.on('child_removed', function(childSnapshot) {
      const index = that.searchIndexInArrayForUid(that.conversations, childSnapshot.key);
      if (index > -1) {
        that.conversations.splice(index, 1);
      }
      // apro votazione
    });

    // this.conversationRef.once('value').then(function(snapshot) {
    //   snapshot.forEach( function(childSnapshot) {
    //     that.addConversation(childSnapshot);
    //   });
    // });
  }


  updateConversationBadge() {
    let conversationsBadge = 0;
    this.conversations.forEach(element => {
      if ( element.is_new === true ) {
        conversationsBadge ++;
      }
    });
    this.g.conversationsBadge = conversationsBadge;
  }


  // updateBadge(conversation, badge) {
  //   const urlUpdate = this.urlConversation + conversation.recipient + '/badge/';
  //   const update = {};
  //   update [urlUpdate] = badge;
  //   console.log('**** updateBadge::' + urlUpdate);
  //   return firebase.database().ref().update(update);
  // }

  updateIsNew(conversation) {
    const urlUpdate = this.urlConversation + conversation.recipient;
    const update = {};
    update['/is_new'] = false;
    console.log('**** updateIsNew::' + urlUpdate);
    return firebase.database().ref(urlUpdate).update(update);
  }

  private setConversation(childSnapshot) {
    const that = this;
    // console.log('snapshot.val() *****', that.senderId, childSnapshot.val());
    if (childSnapshot.val()) {
      const conversation: ConversationModel = childSnapshot.val();
      conversation.last_message_text = conversation.last_message_text;
      const timestampNumber = conversation.timestamp / 1000;
      conversation.time_last_message = that.getFromNow(timestampNumber);
      // if (conversation.sender !== that.senderId) {
      //   conversation.avatar = that.avatarPlaceholder(conversation.sender_fullname);
      //   conversation.color = that.getColorBck(conversation.sender_fullname);
      // }
      const IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
      conversation.image = IMG_PROFILE_SUPPORT;
      // conversation.badge = 1;
      // that.conversations.push(conversation); // insert item bottom array
      return conversation;
    }
    return;
  }

  /**
   * regola sound message:
   * se lo invio io -> NO SOUND
   * se non sono nella conversazione -> SOUND
   * se sono nella conversazione in fondo alla pagina -> NO SOUND
   * altrimenti -> SOUND
   */
  soundMessage() {
    if ( this.g.isSoundActive ) {
      console.log('****** soundMessage *****');
      this.audio = new Audio();
      this.audio.src = './assets/sounds/Carme.mp3';
      this.audio.load();
      this.audio.play();
    }
  }

  searchIndexInArrayForUid(items, key) {
    return items.findIndex(i => i.recipient === key);
  }

}
