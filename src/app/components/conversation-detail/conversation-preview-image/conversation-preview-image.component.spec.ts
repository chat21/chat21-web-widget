import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationPreviewImageComponent } from './conversation-preview-image.component';

describe('ConversationPreviewImageComponent', () => {
  let component: ConversationPreviewImageComponent;
  let fixture: ComponentFixture<ConversationPreviewImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationPreviewImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationPreviewImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
