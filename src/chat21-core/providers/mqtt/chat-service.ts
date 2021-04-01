import { Injectable } from '@angular/core';

declare var Chat21Client: any;

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

  initChat(options: any) {
    this.chatClient = new Chat21Client(options)
    // console.log("chatClient init. ID:", this.chatClient.client_id)
  }
}