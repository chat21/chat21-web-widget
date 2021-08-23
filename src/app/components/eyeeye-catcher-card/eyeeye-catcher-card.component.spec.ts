import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Globals } from '../../utils/globals';

import { EyeeyeCatcherCardComponent } from './eyeeye-catcher-card.component';

describe('EyeeyeCatcherCardComponent', () => {
  let component: EyeeyeCatcherCardComponent;
  let fixture: ComponentFixture<EyeeyeCatcherCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EyeeyeCatcherCardComponent ],
      imports: [
        BrowserAnimationsModule
      ],
      providers: [ Globals ]
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
