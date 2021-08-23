import { TestBed } from '@angular/core/testing';

import { ConversationHandlerBuilderService } from './conversation-handler-builder.service';

describe('ConversationHandlerBuilderService', () => {
  beforeEach(() => 
    TestBed.configureTestingModule({
      providers: [ConversationHandlerBuilderService]
    })
  );

  it('should be created', () => {
    const service: ConversationHandlerBuilderService = TestBed.get(ConversationHandlerBuilderService);
    expect(service).toBeTruthy();
  });
});
