import { ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppStorageService } from '../../../chat21-core/providers/abstract/app-storage.service';
import { Globals } from '../../utils/globals';

import { SelectionDepartmentComponent } from './selection-department.component';

describe('SelectionDepartmentComponent', () => {
  let component: SelectionDepartmentComponent;
  let fixture: ComponentFixture<SelectionDepartmentComponent>;
  class MockElementRef {}
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionDepartmentComponent ],
      providers: [ 
        Globals, 
        { provide: ElementRef, useClass: MockElementRef },
        AppStorageService
      ]
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
