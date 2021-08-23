import { StorageService } from './storage.service';
import { AppConfigService } from './app-config.service';
import { Globals } from './../utils/globals';
import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { AuthService_old } from './auth.service';
import { HttpClientModule } from '@angular/common/http';

describe('AuthService_old', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        HttpClientModule
      ],
      providers: [
        AuthService_old,
        Globals,
        AppConfigService,
        StorageService
      ]
    });
  });

  it('should be created', inject([AuthService_old], (service: AuthService_old) => {
    expect(service).toBeTruthy();
  }));
});
