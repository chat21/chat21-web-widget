import { Globals } from './../../../utils/globals';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, SimpleChanges } from '@angular/core';
import { MessageModel } from '../../../../chat21-core/models/message';
import { isPopupUrl, popupUrl } from '../../../../chat21-core/utils/utils';
import { MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER, MAX_WIDTH_IMAGES} from '../../../utils/constants';
import { strip_tags } from '../../../utils/utils';
@Component({
  selector: 'tiledeskwidget-conversation-content',
  templateUrl: './conversation-content.component.html',
  styleUrls: ['./conversation-content.component.scss']
})
export class ConversationContentComponent implements OnInit {
  @ViewChild('scrollMe') private scrollMe: ElementRef;
  
  @Input() messages: MessageModel[]
  @Input() senderId: string;
  @Input() baseLocation: string;
  @Input() stylesMap: Map<string, string>;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();
  @Output() onMenuOptionShow = new EventEmitter();
  @Output() onAttachmentButtonClicked = new EventEmitter();
  @Output() onScrollContent = new EventEmitter();

  // ========= begin:: gestione scroll view messaggi ======= //
  startScroll = true; // indica lo stato dello scroll: true/false -> è in movimento/ è fermo
  idDivScroll = 'c21-contentScroll'; // id div da scrollare
  isScrolling = false;
  isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
  firstScroll = true;
  // ========= end:: gestione scroll view messaggi ======= //

  // ========= begin:: dichiarazione funzioni ======= //
  isPopupUrl = isPopupUrl;
  popupUrl = popupUrl;
  strip_tags = strip_tags;
  // ========= end:: dichiarazione funzioni ======= //

  // ========== begin:: set icon status message
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_SENT_SERVER = MSG_STATUS_SENT_SERVER;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  // ========== end:: icon status message

  tooltipOptions = {
    'show-delay': 1500,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };

  urlBOTImage = 'https://s3.eu-west-1.amazonaws.com/tiledesk-widget/dev/2.0.4-beta.7/assets/images/avatar_bot_tiledesk.svg'

  constructor(private g: Globals,
              private cdref: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }



  /**
   *
   * @param message
   */
  getMetadataSize(metadata): any {
    if(metadata.width === undefined){
      metadata.width= '100%'
    }
    if(metadata.height === undefined){
      metadata.height = MAX_WIDTH_IMAGES
    }
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


  // ========= begin:: functions scroll position ======= //
 
  // LISTEN TO SCROLL POSITION
  onScroll(event): void {
    // console.log('************** SCROLLLLLLLLLL *****************');
    this.startScroll = false;
    if (this.scrollMe) {
      const divScrollMe = this.scrollMe.nativeElement;
      const checkContentScrollPosition = this.checkContentScrollPosition(divScrollMe);
      if (checkContentScrollPosition) {
        this.onScrollContent.emit(false)
        //this.showBadgeScroollToBottom = false;
        //this.NUM_BADGES = 0;
      } else {
        this.onScrollContent.emit(true)
        //this.showBadgeScroollToBottom = true;
      }
    }
  }

  /**
   *
   */
  checkContentScrollPosition(divScrollMe?): boolean {
    if(!divScrollMe){
      divScrollMe = this.scrollMe.nativeElement
    }
    if (divScrollMe.scrollHeight - divScrollMe.scrollTop <= (divScrollMe.clientHeight + 40)) {
      this.g.wdLog(['SONO ALLA FINE']);
        return true;
    } else {
      this.g.wdLog([' NON SONO ALLA FINE']);
        return false;
    }
  }

  /**
   * scrollo la lista messaggi all'ultimo
   * chiamato in maniera ricorsiva sino a quando non risponde correttamente
  */

//  scrollToBottomStart() {
//   const that = this;
//   if ( this.isScrolling === false ) {
//     setTimeout(function () {
//       try {
//         that.isScrolling = true;
//         const objDiv = document.getElementById(that.idDivScroll);
//         setTimeout(function () {
//           that.g.wdLog(['objDiv::', objDiv.scrollHeight]);
//           //objDiv.scrollIntoView(false);
//           objDiv.style.opacity = '1';
//         }, 200);
//         that.isScrolling = false;
//       } catch (err) {
//         that.g.wdLog(['> Error :' + err]);
//       }
//     }, 0);
//   }
// }

  /**
   * scrollo la lista messaggi all'ultimo
   * chiamato in maniera ricorsiva sino a quando non risponde correttamente
  */

 scrollToBottom(withoutAnimation?: boolean) {
  const that = this;
  try {
    that.isScrolling = true;
    const objDiv = document.getElementById(that.idDivScroll) as HTMLElement;
    // const element = objDiv[0] as HTMLElement;
    setTimeout(function () {

      if (that.isIE === true || withoutAnimation === true || that.firstScroll === true) {
        objDiv.parentElement.classList.add('withoutAnimation');
      } else {
        objDiv.parentElement.classList.remove('withoutAnimation');
      }
      objDiv.parentElement.scrollTop = objDiv.scrollHeight;
      objDiv.style.opacity = '1';
      that.firstScroll = false;
    }, 0);
  } catch (err) {
    that.g.wdLog(['> Error :' + err]);
  }
  that.isScrolling = false;
 }

  // ========= END:: functions scroll position ======= //

  /**
  * function customize tooltip
  */
  handleTooltipEvents() {
    console.log('handleToolpitEvents')
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

  isLastMessage(idMessage: string) {
    // console.log('idMessage: ' + idMessage + 'id LAST Message: ' + this.messages[this.messages.length - 1].uid);
    if (idMessage === this.messages[this.messages.length - 1].uid) {
      return true;
    }
    return false;
  }

  hideMenuOption(){
    this.onMenuOptionShow.emit(false)
  }


  // ========= begin:: event emitter function ============//

  returnOnAttachmentButtonClicked(event: any){
    this.onAttachmentButtonClicked.emit(event)
  }

  returnOnBeforeMessageRender(event){
    //decommentare se in html c'è solamente component tiledesk-text
    //const messageOBJ = { message: this.message, sanitizer: this.sanitizer, messageEl: event.messageEl, component: event.component}
    this.onBeforeMessageRender.emit(event)
  }

  returnOnAfterMessageRender(event){
    this.onAfterMessageRender.emit(event)
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
