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
  private _config: any;

  constructor() {
  }

  public set config(config: any) {
    this._config = config;
  }

  public get config() : any {
    return this._config;
  }

  initChat() {
    if (!this._config || this._config.appId === 'CHANGEIT') {
      throw new Error('chat21Config is not defined. Please setup your environment');
    }
    this.chatClient = new Chat21Client(this._config);
    // console.log("chatClient init. ID:", this.chatClient.client_id)
  }
}