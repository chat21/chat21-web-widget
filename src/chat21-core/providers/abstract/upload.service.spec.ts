import { TestBed, inject } from '@angular/core/testing';

import { UploadService2 } from './upload.service';

describe('UploadService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UploadService2]
    });
  });

  it('should be created', () => {
    const service: UploadService2 = TestBed.get(UploadService2);
    expect(service).toBeTruthy();
  });
});
