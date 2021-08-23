import { TestBed } from '@angular/core/testing';

import { TypingService } from './typing.service';

describe('TypingService', () => {
  beforeEach(() => 
    TestBed.configureTestingModule({
      providers: [TypingService]
    })
  );

  it('should be created', () => {
    const service: TypingService = TestBed.get(TypingService);
    expect(service).toBeTruthy();
  });
});
