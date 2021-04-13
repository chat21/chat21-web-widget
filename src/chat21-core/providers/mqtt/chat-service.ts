import { Injectable } from '@angular/core';
import { Chat21Client } from '../../../assets/js/chat21client';

/*
  Generated class for the AuthService provider.
  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
/**
 * DESC PROVIDER
 */
export class Chat21Service {

  public chatClient: any;
  
  constructor() {
  }

  initChat(chat21Config: any) {
    if (!chat21Config || chat21Config.appId === 'CHANGEIT') {
      throw new Error('chat21Config config is not defined. Please create your widget-config.json. See the Chat21-Web_widget Installation Page');
    }  
    this.chatClient = new Chat21Client(chat21Config)
    // console.log("chatClient init. ID:", this.chatClient.client_id)
  }
}