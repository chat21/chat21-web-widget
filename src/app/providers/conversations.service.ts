import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';

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

  avatarPlaceholder = avatarPlaceholder;
  getColorBck =  getColorBck;
  getFromNow = getFromNow;

  constructor() {
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
    this.conversationRef.once('value').then(function(snapshot) {
      snapshot.forEach( function(childSnapshot) {
        that.addConversation(childSnapshot);
      });
    });
  }

  private addConversation(childSnapshot) {
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
      // that.conversations.push(conversation);
      that.conversations.unshift(conversation);
    }
  }


}
