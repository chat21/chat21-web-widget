import { Injectable } from '@angular/core';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';

// services
// import { EventsService } from './abstract/events-service';
import { PresenceService } from '../abstract/presence.service';

// utils
import { setLastDate } from '../../utils/utils';
import { environment } from '../../../environments/environment';
import { TypingService } from '../abstract/typing.service';
import { LoggerService } from '../abstract/logger.service';
import { LoggerInstance } from '../logger/loggerInstance';

export class TypingModel {
  constructor(
      public timestamp: any,
      public message: string,
      public name: string
  ) { }
}

// @Injectable({ providedIn: 'root' })
@Injectable()
export class MQTTTypingService extends TypingService {

  // private params
  private tenant: string;
  private urlNodeTypings: string;
  private setTimeoutWritingMessages: any;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    // private events: EventsService
  ) {
    super();
  }

  /** */
  initialize(tenant: string) {
    // this.tenant = this.getTenant();
    this.tenant = tenant;
    this.logger.debug('[MQTT-TYPING] initialize this.tenant', this.tenant);
    this.urlNodeTypings = '/apps/' + this.tenant + '/typings/';
  }

  /** */
  isTyping(idConversation: string, idUser: string) {
    // const that = this;
    // let urlTyping = this.urlNodeTypings + idConversation;
    // if (idUser) {
    //   urlTyping = this.urlNodeTypings + idUser + '/' + idConversation;
    // }
    // console.log('urlTyping: ', urlTyping);
    // const ref = firebase.database().ref(urlTyping).orderByChild('timestamp').limitToLast(1);
    // ref.on('child_changed', (childSnapshot) => {
    //   console.log('urlTyping: ', childSnapshot.val());
    //   that.events.publish('isTypings', childSnapshot);
    // });
  }

  /** */
  setTyping(idConversation: string, message: string, idUser: string, userFullname: string) {
    // const that = this;
    // this.setTimeoutWritingMessages = setTimeout(() => {

    //   let urlTyping = this.urlNodeTypings + idConversation;
    //   if (idUser) {
    //     urlTyping = this.urlNodeTypings + idUser + '/' + idConversation;
    //   }
    //   console.log('setWritingMessages:', urlTyping, userFullname);
    //   const timestampData =  firebase.database.ServerValue.TIMESTAMP;
    //   const precence = new TypingModel(timestampData, message, userFullname);
    //   console.log('precence::::', precence);
    //   firebase.database().ref(urlTyping).set(precence, ( error ) => {
    //     if (error) {
    //       console.log('ERRORE', error);
    //     } else {
    //       console.log('OK update typing');
    //     }
    //     that.events.publish('setTyping', precence, error);
    //   });
    // }, 500);
  }

}
