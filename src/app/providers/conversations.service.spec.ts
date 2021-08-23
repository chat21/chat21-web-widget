import { SettingsSaverService } from './settings-saver.service';
import { Globals } from './../utils/globals';
import { TestBed, inject } from '@angular/core/testing';

import { ConversationsService } from './conversations.service';
import { HttpClientModule } from '@angular/common/http';
import { AppStorageService } from '../../chat21-core/providers/abstract/app-storage.service';

describe('ConversationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConversationsService,
        Globals,
        SettingsSaverService,
        AppStorageService
      ]
    });
  });

  it('should be created', inject([ConversationsService], (service: ConversationsService) => {
    expect(service).toBeTruthy();
  }));
});
