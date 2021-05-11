import { Injectable } from '@angular/core';
// services
import { ConversationHandlerBuilderService } from '../abstract/conversation-handler-builder.service';
import { MQTTConversationHandler } from './mqtt-conversation-handler';
import { Chat21Service } from './chat-service';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class MQTTConversationHandlerBuilderService extends ConversationHandlerBuilderService {

  constructor(
    public chat21Service: Chat21Service
  ) {
    super();
  }

  public build(): any {
    const conversationHandlerService = new MQTTConversationHandler(
      this.chat21Service,
      true
    );
    return conversationHandlerService;
  }
}
