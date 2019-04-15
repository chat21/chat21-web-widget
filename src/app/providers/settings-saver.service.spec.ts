import { TestBed, inject } from '@angular/core/testing';

import { SettingsSaverService } from './settings-saver.service';

describe('SettingsSaverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsSaverService]
    });
  });

  it('should be created', inject([SettingsSaverService], (service: SettingsSaverService) => {
    expect(service).toBeTruthy();
  }));
});
