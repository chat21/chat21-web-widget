import { ActionButtonComponent } from './../message/buttons/action-button/action-button.component';
import { TextButtonComponent } from './../message/buttons/text-button/text-button.component';
import { LinkButtonComponent } from './../message/buttons/link-button/link-button.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageAttachmentComponent } from './message-attachment.component';

describe('MessageAttachmentComponent', () => {
  let component: MessageAttachmentComponent;
  let fixture: ComponentFixture<MessageAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        MessageAttachmentComponent, 
        LinkButtonComponent, 
        TextButtonComponent, 
        ActionButtonComponent 
      ]
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
