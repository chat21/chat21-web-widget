import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppStorageService } from '../../../chat21-core/providers/abstract/app-storage.service';
import { Globals } from '../../utils/globals';

import { LauncherButtonComponent } from './launcher-button.component';

describe('LauncherButtonComponent', () => {
  let component: LauncherButtonComponent;
  let fixture: ComponentFixture<LauncherButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LauncherButtonComponent ],
      providers: [ Globals, AppStorageService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LauncherButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
