import { TestBed, inject } from '@angular/core/testing';

import { ChatPresenceHandlerService } from './chat-presence-handler.service';

describe('ChatPresenceHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatPresenceHandlerService]
    });
  });

  it('should be created', inject([ChatPresenceHandlerService], (service: ChatPresenceHandlerService) => {
    expect(service).toBeTruthy();
  }));
});
