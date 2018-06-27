import { TestBed, inject } from '@angular/core/testing';

import { TranslatorService } from './translator.service';

describe('TranslatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslatorService]
    });
  });

  it('should be created', inject([TranslatorService], (service: TranslatorService) => {
    expect(service).toBeTruthy();
  }));
});
