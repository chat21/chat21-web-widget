import { Globals } from './../utils/globals';
import { AppConfigService } from './app-config.service';
import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { AgentAvailabilityService } from './agent-availability.service';

describe('AgentAvailabilityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        HttpClientModule
      ],
      providers: [
        AgentAvailabilityService,
        AppConfigService,
        Globals
      ]
    });
  });

  it('should be created', inject([AgentAvailabilityService], (service: AgentAvailabilityService) => {
    expect(service).toBeTruthy();
  }));
});
