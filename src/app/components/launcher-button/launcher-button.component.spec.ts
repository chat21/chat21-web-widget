import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LauncherButtonComponent } from './launcher-button.component';

describe('LauncherButtonComponent', () => {
  let component: LauncherButtonComponent;
  let fixture: ComponentFixture<LauncherButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LauncherButtonComponent ]
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
