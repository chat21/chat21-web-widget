import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { Globals } from './../utils/globals';
import { StarRatingWidgetService } from './../components/star-rating-widget/star-rating-widget.service';
import { TestBed, inject } from '@angular/core/testing';

import { MessagingService } from './messaging.service';
import { HttpModule } from '@angular/http';
import { AppStorageService } from '../../chat21-core/providers/abstract/app-storage.service';

describe('MessagingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        HttpClientModule
      ],
      providers: [
        MessagingService,
        StarRatingWidgetService,
        Globals,
        AppConfigService,
        AppStorageService
      ]
    });
  });

  it('should be created', inject([MessagingService], (service: MessagingService) => {
    expect(service).toBeTruthy();
  }));
});
