import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterlalFrameComponent } from './interlal-frame.component';

describe('InterlalFrameComponent', () => {
  let component: InterlalFrameComponent;
  let fixture: ComponentFixture<InterlalFrameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterlalFrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterlalFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
