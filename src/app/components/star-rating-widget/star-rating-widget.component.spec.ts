import { AppConfigService } from './../../providers/app-config.service';
import { StarRatingWidgetService } from './star-rating-widget.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StarRatingWidgetComponent } from './star-rating-widget.component';
import { HttpModule } from '@angular/http';
import { Globals } from '../../utils/globals';
import { HttpClientModule } from '@angular/common/http';

describe('StarRatingWidgetComponent', () => {
  let component: StarRatingWidgetComponent;
  let fixture: ComponentFixture<StarRatingWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StarRatingWidgetComponent ],
      imports: [
        HttpModule,
        HttpClientModule
      ],
      providers: [
        Globals,
        AppConfigService,
        StarRatingWidgetService
      ]
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
