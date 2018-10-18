import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrechatFormComponent } from './prechat-form.component';

describe('PrechatFormComponent', () => {
  let component: PrechatFormComponent;
  let fixture: ComponentFixture<PrechatFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrechatFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrechatFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
