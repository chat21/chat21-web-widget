import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// models
import { MessageModel } from '../../../models/message';

@Component({
  selector: 'tiledeskwidget-message-attachment',
  templateUrl: './message-attachment.component.html',
  styleUrls: ['./message-attachment.component.scss']
})
export class MessageAttachmentComponent implements OnInit {
  // ========= begin:: Input/Output values ============//
  @Output() eventOpenAttachment = new EventEmitter<string>();
  @Input() message: MessageModel;
  // ========= end:: Input/Output values ============//

  public type: string;
  public buttons: [any];

  constructor() { }

  ngOnInit() {
    this.getAttachment();
  }

  /** */
  getAttachment() {
    if (this.message && this.message.attributes && this.message.attributes.attachment) {
      try {
        this.type = this.message.attributes.attachment.type;
        // console.log(this.type);
      } catch (error) {
        // this.g.wdLog(['> Error :' + error]);
        return;
      }
      try {
        this.buttons = this.message.attributes.attachment.buttons;
        // console.log(this.buttons);
      } catch (error) {
        // this.g.wdLog(['> Error :' + error]);
        return;
      }
    }
  }

  /** */
  actionButton($event) {
    // alert($event);
    if ( $event ) {
      this.eventOpenAttachment.emit($event);
    }
  }

}
