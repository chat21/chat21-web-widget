import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { Globals } from './../utils/globals';
import { TestBed, inject } from '@angular/core/testing';

import { UploadService_old } from './upload.service';

describe('UploadService_old', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        UploadService_old,
        Globals,
        AppConfigService
      ]
    });
  });

  it('should be created', inject([UploadService_old], (service: UploadService_old) => {
    expect(service).toBeTruthy();
  }));
});
