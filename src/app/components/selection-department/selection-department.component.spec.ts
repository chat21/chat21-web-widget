import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionDepartmentComponent } from './selection-department.component';

describe('SelectionDepartmentComponent', () => {
  let component: SelectionDepartmentComponent;
  let fixture: ComponentFixture<SelectionDepartmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionDepartmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
