import { TestBed, inject } from '@angular/core/testing';

import { AgentAvailabilityService } from './agent-availability.service';

describe('IsOnlineService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgentAvailabilityService]
    });
  });

  it('should be created', inject([AgentAvailabilityService], (service: AgentAvailabilityService) => {
    expect(service).toBeTruthy();
  }));
});
