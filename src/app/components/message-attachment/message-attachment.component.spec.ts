import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageAttachmentComponent } from './message-attachment.component';

describe('MessageAttachmentComponent', () => {
  let component: MessageAttachmentComponent;
  let fixture: ComponentFixture<MessageAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
