
import { Component, Input, OnInit } from '@angular/core';
import { MessageModel } from '../../../../chat21-core/models/message';
import { LoggerService } from '../../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../../chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'chat-info-message',
  templateUrl: './info-message.component.html',
  styleUrls: ['./info-message.component.scss']
})
export class InfoMessageComponent implements OnInit {

  @Input() message: MessageModel

  public message_text: string
  private logger: LoggerService = LoggerInstance.getInstance()
  constructor() { }

  ngOnInit() {
    this.logger.debug('[INFO-COMP] message ', this.message)
    // Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly info message
    if(this.message && this.message.text) {
      var regex = /<br\s*[\/]?>/gi;
      this.message.text = this.message.text.replace(regex, "\n")
      // this.message.text = replaceEndOfLine(this.message.text);
      this.logger.debug('[INFO-COMP] message .text  ', this.message.text )
    }
  }

}
