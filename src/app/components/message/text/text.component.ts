import { Component, EventEmitter, Input, OnInit, Output, Sanitizer } from '@angular/core';

@Component({
  selector: 'chat-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {

  @Input() text: string;
  @Input() htmlEnabled: boolean = false;
  @Input() color: string;
  @Input() fontSize: string;
  @Input() fontFamily: string;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }


  printMessage(text, messageEl, component) {
    const messageOBJ = { messageEl: messageEl, component: component}
    this.onBeforeMessageRender.emit(messageOBJ)
    const messageText = text;
    this.onAfterMessageRender.emit(messageOBJ)
    // this.triggerBeforeMessageRender(message, messageEl, component);
    // const messageText = message.text;
    // this.triggerAfterMessageRender(message, messageEl, component);
    return messageText;
  }

}
