import { TestBed, inject } from '@angular/core/testing';

import { AuthService_old } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService_old]
    });
  });

  it('should be created', inject([AuthService_old], (service: AuthService_old) => {
    expect(service).toBeTruthy();
  }));
});
