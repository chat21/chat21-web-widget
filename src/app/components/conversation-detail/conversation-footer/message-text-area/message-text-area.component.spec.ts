import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageTextAreaComponent } from './message-text-area.component';

describe('MessageTextAreaComponent', () => {
  let component: MessageTextAreaComponent;
  let fixture: ComponentFixture<MessageTextAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageTextAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
