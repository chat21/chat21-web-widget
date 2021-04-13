import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// models
import { MessageModel } from '../../models/message';
import { UserModel } from '../../models/user';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export abstract class ConversationHandlerService {

  // BehaviorSubject
  abstract messageAdded: BehaviorSubject<MessageModel> = new BehaviorSubject<MessageModel>(null);
  abstract messageChanged: BehaviorSubject<MessageModel> = new BehaviorSubject<MessageModel>(null);
  abstract messageRemoved: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  // params
  abstract attributes: any;
  abstract messages: Array<MessageModel> = [];
  abstract conversationWith: string;

  constructor() {}

  // functions
  abstract initialize(
    recipientId: string, recipientFullName: string, loggedUser: UserModel, tenant: string, translationMap: Map<string, string>): void;
  abstract connect(): void;
  abstract sendMessage(
    msg: string,
    type: string,
    metadata: string,
    conversationWith: string,
    conversationWithFullname: string,
    sender: string,
    senderFullname: string,
    channelType: string,
    attributes: any
  ): MessageModel;
  abstract dispose(): void;

}
