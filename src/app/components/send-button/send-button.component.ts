import { ConversationFooterComponent } from './../conversation-detail/conversation-footer/conversation-footer.component';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Globals } from '../../utils/globals';

@Component({
  selector: 'chat-send-button',
  templateUrl: './send-button.component.html',
  styleUrls: ['./send-button.component.scss']
})
export class SendButtonComponent implements OnInit {

  @Output() onSendButtonClicked = new EventEmitter()
  constructor(public g: Globals) { }

  ngOnInit() {
  }

  onSendPressed(event){
    console.log('send pressed')
    this.onSendButtonClicked.emit(true)
  }

}
