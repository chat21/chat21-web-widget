import { TestBed } from '@angular/core/testing';

import { MessagingAuthService } from './messagingAuth.service';

describe('MessagingAuthService', () => {
  beforeEach(() => 
    TestBed.configureTestingModule({
      providers: [MessagingAuthService]
    })
  );

  it('should be created', () => {
    const service: MessagingAuthService = TestBed.get(MessagingAuthService);
    expect(service).toBeTruthy();
  });
});
