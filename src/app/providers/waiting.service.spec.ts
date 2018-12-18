import { TestBed, inject } from '@angular/core/testing';

import { WaitingService } from './waiting.service';

describe('WaitingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WaitingService]
    });
  });

  it('should be created', inject([WaitingService], (service: WaitingService) => {
    expect(service).toBeTruthy();
  }));
});
