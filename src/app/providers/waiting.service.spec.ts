import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { Globals } from './../utils/globals';
import { HttpModule } from '@angular/http';
import { TestBed, inject } from '@angular/core/testing';

import { WaitingService } from './waiting.service';

describe('WaitingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        HttpClientModule
      ],
      providers: [
        WaitingService,
        Globals,
        AppConfigService
      ]
    });
  });

  it('should be created', inject([WaitingService], (service: WaitingService) => {
    expect(service).toBeTruthy();
  }));
});
