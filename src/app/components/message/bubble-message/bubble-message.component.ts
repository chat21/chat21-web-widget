import { MIN_WIDTH_IMAGES } from './../../../utils/constants';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageModel } from '../../../../chat21-core/models/message';
import { LoggerService } from '../../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../../chat21-core/providers/logger/loggerInstance';
import { isFile, isFrame, isImage } from '../../../../chat21-core/utils/utils-message';
import { MAX_WIDTH_IMAGES} from '../../../utils/constants';
import { Globals } from '../../../utils/globals';
@Component({
  selector: 'chat-bubble-message',
  templateUrl: './bubble-message.component.html',
  styleUrls: ['./bubble-message.component.scss']
})
export class BubbleMessageComponent implements OnInit {

  @Input() message: MessageModel;
  @Input() fontColor: string;
  @Input() fontSize: string;
  @Input() fontFamily: string;
  @Input() stylesMap: Map<string, string>;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();
  @Output() onImageRendered = new EventEmitter<boolean>()
  isImage = isImage;
  isFile = isFile;
  isFrame = isFrame;

  tooltipOptions = {
    'show-delay': 500,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };
  sizeImage : { width: number, height: number}

  private logger: LoggerService = LoggerInstance.getInstance()
  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  ngOnChanges() {
    // console.log('BUBBLE-MSG Hello !!!! this.message ',  this.message)
    if (this.message && this.message.metadata && typeof this.message.metadata === 'object' ) {
      this.sizeImage = this.getMetadataSize(this.message.metadata)
      // console.log('BUBBLE-MSG ngOnChanges message > metadata', this.message.metadata)
    }

  }

  /**
   *
   * @param message
   */
  // getMetadataSize(metadata): any {
  //   if(metadata.width === undefined){
  //     metadata.width= MAX_WIDTH_IMAGES
  //   }
  //   if(metadata.height === undefined){
  //     metadata.height = MAX_WIDTH_IMAGES
  //   }
  //   // const MAX_WIDTH_IMAGES = 300;
  //   const sizeImage = {
  //       width: metadata.width,
  //       height: metadata.height
  //   };
  //   //   that.g.wdLog(['message::: ', metadata);
  //   if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
  //       const rapporto = (metadata['width'] / metadata['height']);
  //       sizeImage.width = MAX_WIDTH_IMAGES;
  //       sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
  //   }
  //   return sizeImage; // h.toString();
  // }

  /**
   *
   * @param message
   */
  getMetadataSize(metadata): {width, height} {
    // if (metadata.width === undefined) {
    //   metadata.width = MAX_WIDTH_IMAGES
    // }
    // if (metadata.height === undefined) {
    //   metadata.height = MAX_WIDTH_IMAGES
    // }

    const sizeImage = {
      width: metadata.width,
      height: metadata.height
    };

    if (metadata.width && metadata.width < MAX_WIDTH_IMAGES) {
      if (metadata.width <= 55) {
        const ratio = (metadata['width'] / metadata['height']);
        sizeImage.width = MIN_WIDTH_IMAGES;
        sizeImage.height = MIN_WIDTH_IMAGES / ratio;
      } else if (metadata.width > 55) {
        sizeImage.width = metadata.width;
        sizeImage.height = metadata.height
      }
    } else if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
      const ratio = (metadata['width'] / metadata['height']);
      sizeImage.width = MAX_WIDTH_IMAGES;
      sizeImage.height = MAX_WIDTH_IMAGES / ratio;
    }
    return sizeImage
  }

  /**
  * function customize tooltip
  */
 handleTooltipEvents(event) {
  const that = this;
  const showDelay = this.tooltipOptions['showDelay'];
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
        that.logger.error('[BUBBLE-MESSAGE] handleTooltipEvents >>>> Error :' + err);
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

  onImageRenderedFN(event){
    this.onImageRendered.emit(event)
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
