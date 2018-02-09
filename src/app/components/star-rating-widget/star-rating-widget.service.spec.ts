import { TestBed, inject } from '@angular/core/testing';

import { StarRatingWidgetService } from './star-rating-widget.service';

describe('StarRatingWidgetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StarRatingWidgetService]
    });
  });

  it('should be created', inject([StarRatingWidgetService], (service: StarRatingWidgetService) => {
    expect(service).toBeTruthy();
  }));
});
