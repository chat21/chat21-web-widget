import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { Globals } from './../utils/globals';
import { HttpModule } from '@angular/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TestBed, inject } from '@angular/core/testing';

import { TranslatorService } from './translator.service';

describe('TranslatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        HttpClientModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        TranslatorService,
        Globals,
        AppConfigService
      ]
    });
  });

  it('should be created', inject([TranslatorService], (service: TranslatorService) => {
    expect(service).toBeTruthy();
  }));
});
