import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';

// services
import { TypingService } from '../abstract/typing.service';

export class TypingModel {
  constructor(
      public uid: string,
      public timestamp: any,
      public message: string,
      public name: string
  ) { }
}

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class FirebaseTypingService extends TypingService {

  // BehaviorSubject
  BSIsTyping: BehaviorSubject<any>;
  BSSetTyping: BehaviorSubject<any>;

  // public params
  public tenant: string;

  // private params
  private urlNodeTypings: string;
  private setTimeoutWritingMessages: any;

  constructor() {
    super();
  }

  /** */
  public initialize() {
    console.log('FirebaseTypingService', this.tenant);
    this.urlNodeTypings = '/apps/' + this.tenant + '/typings/';
  }

  /** */
  public isTyping(idConversation: string, idCurrentUser: string, isDirect: boolean ) {
    const that = this;
    let urlTyping = this.urlNodeTypings + idConversation;
    if (isDirect) {
      urlTyping = this.urlNodeTypings + idCurrentUser + '/' + idConversation;
    }
    console.log('urlTyping: ', urlTyping);
    const ref = firebase.database().ref(urlTyping);
    ref.on('child_changed', (childSnapshot) => {
      const precence: TypingModel = childSnapshot.val();
      console.log('urlTyping: child_changed ', childSnapshot.val());
      //TODO-GAB: supportata solo da chat ionic 5
      // this.BSIsTyping.next({uid: idConversation, uidUserTypingNow: childSnapshot.val().user.uid, nameUserTypingNow: childSnapshot.val().user.name});
      this.BSIsTyping.next({uid: idConversation, uidUserTypingNow: precence.uid, nameUserTypingNow: precence.name});
    });
  }

  /** */
  public setTyping(idConversation: string, message: string, recipientId: string, userFullname: string) {
    const that = this;
    clearTimeout(this.setTimeoutWritingMessages);
    this.setTimeoutWritingMessages = setTimeout(() => {
      const urlTyping = this.urlNodeTypings + idConversation + '/' + recipientId;// + '/user';
      console.log('setWritingMessages:', urlTyping, userFullname);
      const timestampData =  firebase.database.ServerValue.TIMESTAMP;
      const precence = new TypingModel(recipientId, timestampData, message, userFullname);
      firebase.database().ref(urlTyping).set(precence, ( error ) => {
        if (error) {
          console.log('ERRORE', error);
        } else {
          this.BSSetTyping.next({uid: idConversation, typing: precence});
        }
      });
    }, 500);
  }

}
