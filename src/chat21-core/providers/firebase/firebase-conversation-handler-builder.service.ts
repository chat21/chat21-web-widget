import { Injectable } from '@angular/core';
// services
import { ConversationHandlerBuilderService } from '../abstract/conversation-handler-builder.service';
import { FirebaseConversationHandler } from './firebase-conversation-handler';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class FirebaseConversationHandlerBuilderService extends ConversationHandlerBuilderService {

  constructor() {
    super();
  }

  public build(): any {
    const conversationHandlerService = new FirebaseConversationHandler(true);
    return conversationHandlerService;
  }
}
