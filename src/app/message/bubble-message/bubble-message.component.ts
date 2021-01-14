import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageModel } from '../../../chat21-core/models/message';
import { MAX_WIDTH_IMAGES, MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER} from '../../utils/constants';
import { Globals } from '../../utils/globals';
@Component({
  selector: 'tiledeskwidget-bubble-message',
  templateUrl: './bubble-message.component.html',
  styleUrls: ['./bubble-message.component.scss']
})
export class BubbleMessageComponent implements OnInit {

  @Input() message: MessageModel;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();

  tooltipOptions = {
    'show-delay': 1500,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };

  // ========== begin:: set icon status message
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_SENT_SERVER = MSG_STATUS_SENT_SERVER;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  // ========== end:: icon status message

  constructor(private g: Globals,
              public sanitizer: DomSanitizer) { }

  ngOnInit() {

  }

  /**
   *
   * @param message
   */
  getSizeImg(message): any {
    const metadata = message.metadata;
    // const MAX_WIDTH_IMAGES = 300;
    const sizeImage = {
        width: metadata.width,
        height: metadata.height
    };
    //   that.g.wdLog(['message::: ', metadata);
    if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
        const rapporto = (metadata['width'] / metadata['height']);
        sizeImage.width = MAX_WIDTH_IMAGES;
        sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
    }
    return sizeImage; // h.toString();
  }

  /**
  * function customize tooltip
  */
 handleTooltipEvents(event) {
  const that = this;
  const showDelay = this.tooltipOptions['showDelay'];
  // console.log(this.tooltipOptions);
  setTimeout(function () {
    try {
      const domRepresentation = document.getElementsByClassName('chat-tooltip');
      if (domRepresentation) {
        const item = domRepresentation[0] as HTMLInputElement;
        // console.log(item);
        if (!item.classList.contains('tooltip-show')) {
          item.classList.add('tooltip-show');
        }
        setTimeout(function () {
          if (item.classList.contains('tooltip-show')) {
            item.classList.remove('tooltip-show');
          }
        }, that.tooltipOptions['hideDelayAfterClick']);
      }
    } catch (err) {
        that.g.wdLog(['> Error :' + err]);
    }
  }, showDelay);
}

  // ========= begin:: event emitter function ============//

  // returnOpenAttachment(event: String) {
  //   this.onOpenAttachment.emit(event)
  // }

  // /** */
  // returnClickOnAttachmentButton(event: any) {
  //   this.onClickAttachmentButton.emit(event)
  // }

  returnOnBeforeMessageRender(event){
    const messageOBJ = { message: this.message, sanitizer: this.sanitizer, messageEl: event.messageEl, component: event.component}
    this.onBeforeMessageRender.emit(messageOBJ)
  }

  returnOnAfterMessageRender(event){
    const messageOBJ = { message: this.message, sanitizer: this.sanitizer, messageEl: event.messageEl, component: event.component}
    this.onAfterMessageRender.emit(messageOBJ)
  }

  // printMessage(message, messageEl, component) {
  //   const messageOBJ = { message: message, sanitizer: this.sanitizer, messageEl: messageEl, component: component}
  //   this.onBeforeMessageRender.emit(messageOBJ)
  //   const messageText = message.text;
  //   this.onAfterMessageRender.emit(messageOBJ)
  //   // this.triggerBeforeMessageRender(message, messageEl, component);
  //   // const messageText = message.text;
  //   // this.triggerAfterMessageRender(message, messageEl, component);
  //   return messageText;
  // }

  // ========= END:: event emitter function ============//


}
