import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StarRatingWidgetComponent } from './star-rating-widget.component';

describe('StarRatingWidgetComponent', () => {
  let component: StarRatingWidgetComponent;
  let fixture: ComponentFixture<StarRatingWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StarRatingWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StarRatingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
