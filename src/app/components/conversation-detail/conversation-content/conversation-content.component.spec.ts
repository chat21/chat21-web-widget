import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationContentComponent } from './conversation-content.component';

describe('ConversationContentComponent', () => {
  let component: ConversationContentComponent;
  let fixture: ComponentFixture<ConversationContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
