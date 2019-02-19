import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EyeeyeCatcherCardComponent } from './eyeeye-catcher-card.component';

describe('EyeeyeCatcherCardComponent', () => {
  let component: EyeeyeCatcherCardComponent;
  let fixture: ComponentFixture<EyeeyeCatcherCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EyeeyeCatcherCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EyeeyeCatcherCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
