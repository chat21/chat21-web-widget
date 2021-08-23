import { MomentModule } from 'angular2-moment';
import { TextComponent } from './../text/text.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BubbleMessageComponent } from './bubble-message.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BubbleMessageComponent', () => {
  let component: BubbleMessageComponent;
  let fixture: ComponentFixture<BubbleMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BubbleMessageComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        MomentModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BubbleMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a "chat-text" child element', () => {
    const messages: any = {
          attributes: {
              projectId: "6013ec749b32000045be650e",
              tiledesk_message_id: "611cbf8ffb379b00346660e7"
          },
          channel_type: "group",
          recipient: "support-group-6013ec749b32000045be650e-4904aee91f8b487aad117bcda860549d",
          recipient_fullname: "Guest ",
          sender: "bot_602256f6c001b800342cb76f",
          sender_fullname: "BOT2",
          status: 150,
          text: "Hello 👋. I'm a bot 🤖.\n\nChoose one of the options below or write a message to reach our staff.",
          timestamp: 1629273999970,
          type: "text",
          uid: "-MhNI3eaIoLTOLoX3TAu",
          isSender: false
    }
    component.message = messages
    component.textColor = 'black'
    fixture.detectChanges()
    const textChild = fixture.debugElement.query(By.css('chat-text'))
    textChild.properties.text
    expect(textChild).toBeTruthy();
  })

  it('should have a text inside "chat-text" child element', () => {
    const messages: any = {
          attributes: {
              projectId: "6013ec749b32000045be650e",
              tiledesk_message_id: "611cbf8ffb379b00346660e7"
          },
          channel_type: "group",
          recipient: "support-group-6013ec749b32000045be650e-4904aee91f8b487aad117bcda860549d",
          recipient_fullname: "Guest ",
          sender: "bot_602256f6c001b800342cb76f",
          sender_fullname: "BOT2",
          status: 150,
          text: "Hello 👋. I'm a bot 🤖.\n\nChoose one of the options below or write a message to reach our staff.",
          timestamp: 1629273999970,
          type: "text",
          uid: "-MhNI3eaIoLTOLoX3TAu",
          isSender: false
    }
    component.message = messages
    component.textColor = 'black'
    fixture.detectChanges()
    const textChild = fixture.debugElement.query(By.css('chat-text'))
    expect(textChild.properties.text).toEqual(messages.text)
  })
});
