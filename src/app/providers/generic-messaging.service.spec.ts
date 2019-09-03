import { TestBed, inject } from '@angular/core/testing';

import { GenericMessagingService } from './generic-messaging.service';

describe('GenericMessagingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenericMessagingService]
    });
  });

  it('should be created', inject([GenericMessagingService], (service: GenericMessagingService) => {
    expect(service).toBeTruthy();
  }));
});
