import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTextComponent } from './form-text.component';

describe('FormTextComponent', () => {
  let component: FormTextComponent;
  let fixture: ComponentFixture<FormTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
