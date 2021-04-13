
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// models
import { ImageRepoService } from './image-repo.service';
import { ConversationModel } from './../../models/conversation';
// import { ImageRepoService } from './image-repo.service';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export abstract class ConversationsHandlerService {

  // BehaviorSubject
  abstract BSConversationDetail: BehaviorSubject<ConversationModel> = new BehaviorSubject<ConversationModel>(null);
  abstract readAllMessages: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  abstract conversationAdded: BehaviorSubject<ConversationModel> = new BehaviorSubject<ConversationModel>(null);
  abstract conversationChanged: BehaviorSubject<ConversationModel> = new BehaviorSubject<ConversationModel>(null);
  abstract conversationRemoved: BehaviorSubject<ConversationModel> = new BehaviorSubject<ConversationModel>(null);
  abstract loadedConversationsStorage: BehaviorSubject<ConversationModel[]> = new BehaviorSubject<ConversationModel[]>([]);

  // params
  abstract conversations: Array<ConversationModel> = [];
  abstract uidConvSelected: string;
  // abstract imageRepo: ImageRepoService;

  // functions
  abstract initialize(tenant: string, userId: string, translationMap: Map<string, string>): void;
  abstract connect(): void;
  abstract countIsNew(): number;
  abstract setConversationRead(conversation: ConversationModel): void;
  abstract dispose(): void;
  abstract getConversationDetail(tenant: string, userId: string, conversationId: string): void;
  abstract getClosingConversation(conversationId: string): boolean;
  abstract setClosingConversation(conversationId: string, status: boolean): void;
  abstract deleteClosingConversation(conversationId: string): void;

}
