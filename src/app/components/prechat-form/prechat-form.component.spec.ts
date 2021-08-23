import { Globals } from './../../utils/globals';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PrechatFormComponent } from './prechat-form.component';
import { AppStorageService } from '../../../chat21-core/providers/abstract/app-storage.service';

describe('PrechatFormComponent', () => {
  let component: PrechatFormComponent;
  let fixture: ComponentFixture<PrechatFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrechatFormComponent ],
      imports: [ FormsModule, ReactiveFormsModule ],
      providers: [ Globals, AppStorageService]
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
