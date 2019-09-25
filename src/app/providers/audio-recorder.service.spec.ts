import { TestBed, inject } from '@angular/core/testing';

import { AudioRecorderService } from './audio-recorder.service';

describe('AudioRecorderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AudioRecorderService]
    });
  });

  it('should be created', inject([AudioRecorderService], (service: AudioRecorderService) => {
    expect(service).toBeTruthy();
  }));
});
