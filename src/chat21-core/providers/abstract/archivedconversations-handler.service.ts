import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConversationModel } from '../../models/conversation';
import { ImageRepoService } from './image-repo.service';

@Injectable()
export abstract class ArchivedConversationsHandlerService {

  // BehaviorSubject
  abstract BSConversationDetail: BehaviorSubject<ConversationModel> = new BehaviorSubject<ConversationModel>(null);
  abstract readAllMessages: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  abstract archivedConversationAdded: BehaviorSubject<ConversationModel> = new BehaviorSubject<ConversationModel>(null);
  abstract archivedConversationChanged: BehaviorSubject<ConversationModel> = new BehaviorSubject<ConversationModel>(null);
  abstract archivedConversationRemoved: BehaviorSubject<ConversationModel> = new BehaviorSubject<ConversationModel>(null);
  abstract loadedConversationsStorage: BehaviorSubject<ConversationModel[]> = new BehaviorSubject<ConversationModel[]>([]);

  // params
  abstract archivedConversations: Array<ConversationModel> = [];
  abstract uidConvSelected: string;
  //abstract imageRepo: ImageRepoService;

  // functions
  abstract initialize(tenant: string, userId: string, translationMap: Map<string, string>): void;
  // abstract connect(): void;
  abstract subscribeToConversations(callback: any): void;
  abstract countIsNew(): number;
  abstract setConversationRead(conversationId: string)
  abstract dispose(): void;
  abstract getConversationDetail(conversationId: string, callback:(conv: ConversationModel)=>void): void;
  abstract getClosingConversation(conversationId: string): boolean;
  abstract setClosingConversation(conversationId: string, status: boolean): void;
  abstract deleteClosingConversation(conversationId: string): void;

}
