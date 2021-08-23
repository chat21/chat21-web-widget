import { Globals } from './../utils/globals';
import { TestBed, inject } from '@angular/core/testing';

import { SettingsSaverService } from './settings-saver.service';
import { AppStorageService } from '../../chat21-core/providers/abstract/app-storage.service';

describe('SettingsSaverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsSaverService, Globals, AppStorageService]
    });
  });

  it('should be created', inject([SettingsSaverService], (service: SettingsSaverService) => {
    expect(service).toBeTruthy();
  }));
});
