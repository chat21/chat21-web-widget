import { TestBed, inject } from '@angular/core/testing';

import { LocalSettingsService } from './local-settings.service';

describe('LocalSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalSettingsService]
    });
  });

  it('should be created', inject([LocalSettingsService], (service: LocalSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
