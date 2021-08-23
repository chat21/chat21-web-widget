import { style } from '@angular/animations';
import { ChatManager } from './../../../../chat21-core/providers/chat-manager';
import { Globals } from './../../../utils/globals';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ConversationFooterComponent } from './conversation-footer.component';
import { UploadService } from '../../../../chat21-core/providers/abstract/upload.service';
import { TypingService } from '../../../../chat21-core/providers/abstract/typing.service';
import { ConversationsHandlerService } from '../../../../chat21-core/providers/abstract/conversations-handler.service';
import { ArchivedConversationsHandlerService } from '../../../../chat21-core/providers/abstract/archivedconversations-handler.service';
import { By } from '@angular/platform-browser';

describe('ConversationFooterComponent', () => {
  let component: ConversationFooterComponent;
  let fixture: ComponentFixture<ConversationFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        ConversationFooterComponent,
      ],
      imports: [ FormsModule ],
      providers: [ 
        Globals, 
        ChatManager, 
        TypingService, 
        UploadService,
        ConversationsHandlerService,
        ArchivedConversationsHandlerService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('render basics component: attachment button, text-area, send-button', () => {
    component.isConversationArchived = false
    component.showAttachmentButton = true
    component.hideTextReply = false
    fixture.detectChanges();
    const nativeEl: HTMLElement = fixture.nativeElement;
    const attachmentButtonEL = nativeEl.querySelector('input#chat21-file');
    const textAreaEl = nativeEl.querySelector('textarea#chat21-main-message-context')
    const sendButtonEl = nativeEl.querySelector('div#chat21-button-send')
    expect(attachmentButtonEL).toBeTruthy()
    expect(textAreaEl).toBeTruthy();
    expect(sendButtonEl).toBeTruthy();
  });

  it('not render attachment button if showAttachmentButton is false', () => {
    component.showAttachmentButton = false
    fixture.detectChanges();
    const nativeEl: HTMLElement = fixture.nativeElement;
    const attachmentButtonEL = nativeEl.querySelector('input#chat21-file');
    expect(attachmentButtonEL).not.toBeTruthy();
  });

  it('not render .active class in send button if textInputTextArea is null', () => {
    component.textInputTextArea = null
    component.isConversationArchived = false
    component.hideTextReply = false
    fixture.detectChanges();
    const nativeEl = fixture.debugElement;
    const sendButtonEl = nativeEl.query(By.css('div#chat21-button-send'));
    expect(sendButtonEl.classes['active']).toBe(false);
  });

  it('render .active class in send button if textInputTextArea is different from null', () => {
    component.textInputTextArea = 'test input'
    component.isConversationArchived = false
    component.hideTextReply = false
    fixture.detectChanges();
    const nativeEl = fixture.debugElement;
    const sendButtonEl = nativeEl.query(By.css('div#chat21-button-send'));
    expect(sendButtonEl.classes['active']).toBe(true);
  });

  it('click event on sendButton is fired', fakeAsync(() => {
    spyOn(component, 'onSendPressed')
    const nativeEl = fixture.nativeElement;
    const sendButtonEl = nativeEl.querySelector('div#chat21-button-send');
    sendButtonEl.click();
    tick();
    expect(component.onSendPressed).toHaveBeenCalled();
  }));
});
