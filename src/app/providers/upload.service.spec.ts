import { TestBed, inject } from '@angular/core/testing';

import { UploadService_old } from './upload.service';

describe('UploadService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UploadService_old]
    });
  });

  it('should be created', inject([UploadService_old], (service: UploadService_old) => {
    expect(service).toBeTruthy();
  }));
});
