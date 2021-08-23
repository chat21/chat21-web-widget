import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Globals } from '../../utils/globals';

import { MenuOptionsComponent } from './menu-options.component';

describe('MenuOptionsComponent', () => {
  let component: MenuOptionsComponent;
  let fixture: ComponentFixture<MenuOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuOptionsComponent ],
      providers: [ Globals ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
