import { Component, OnInit, Output, OnDestroy, AfterViewInit, NgZone, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
// services
import { Globals } from '../../utils/globals';
import { MessageModel } from '../../../models/message';
import { ConversationsService } from '../../providers/conversations.service';

// utils
import { getImageUrlThumb, popupUrl, isPopupUrl, strip_tags, replaceBr } from '../../utils/utils';

import {
  CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, TYPE_MSG_TEXT,
  MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER,
  TYPE_MSG_FILE, TYPE_MSG_IMAGE, MAX_WIDTH_IMAGES, IMG_PROFILE_BOT, IMG_PROFILE_DEFAULT
} from '../../utils/constants';
import { ConversationModel } from '../../../models/conversation';

@Component({
  selector: 'tiledeskwidget-last-message',
  templateUrl: './last-message.component.html',
  styleUrls: ['./last-message.component.scss']
})
export class LastMessageComponent implements OnInit, AfterViewInit, OnDestroy {
  // @Input() message: MessageModel;
  @Output() eventCloseMessagePreview  = new EventEmitter();
  @Output() eventSelctedConv = new EventEmitter<string>();
  // ========= begin:: sottoscrizioni ======= //
  subscriptions: Subscription[] = []; /** */
  // ========= end:: sottoscrizioni ======= //

  conversation: ConversationModel;
  isPopupUrl = isPopupUrl;
  popupUrl = popupUrl;
  strip_tags = strip_tags;

  constructor(
    private ngZone: NgZone,
    public g: Globals,
    public conversationsService: ConversationsService
  ) {
    this.g.wdLog(' ---------------- ngOnInit LastMessageComponent ---------------- ');
    const that = this;
    const subChangedConversation = this.conversationsService.obsChangeConversation.subscribe((conversation) => {
        that.ngZone.run(() => {
          if (that.g.isOpen === false) {
            that.g.wdLog([' 2 - > obsChangeConversation ::: ']);
            that.conversation = conversation;
            console.log('conv: ' + conversation);
          }
        });
    });
    this.subscriptions.push(subChangedConversation);
  }

  ngOnInit() {
  }

  /** */
  ngAfterViewInit() {
    console.log('isOpenNewMessage: ' + this.g.isOpenNewMessage);
  }

  /**
   *
   * @param message
   */
  getSizeImg(message): any {
    const metadata = message.metadata;
    const sizeImage = {
      width: metadata.width,
      height: metadata.height
    };
    if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
      const rapporto = (metadata['width'] / metadata['height']);
      sizeImage.width = MAX_WIDTH_IMAGES;
      sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
    }
    return sizeImage;
  }

  /** */
  private openConversationByID(conversation) {
    this.g.wdLog(['openConversationByID: ', conversation]);
    this.conversation = null;
    this.g.isOpenNewMessage = false;
    console.log('2 isOpenNewMessage: ' + this.g.isOpenNewMessage);
    if ( conversation ) {
      this.eventSelctedConv.emit(conversation);
    }
  }
  /** */
  private closeMessagePreview() {
    this.conversation = null;
    this.g.isOpenNewMessage = false;
    console.log('3 isOpenNewMessage: ' + this.g.isOpenNewMessage);
    this.eventCloseMessagePreview.emit();
  }
  /** */
  ngOnDestroy() {
    this.conversation = null;
    this.g.isOpenNewMessage = false;
    console.log('4 isOpenNewMessage: ' + this.g.isOpenNewMessage);
    this.unsubscribe();
  }

  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
  /** */
  unsubscribe() {
    this.subscriptions.forEach(function (subscription) {
        subscription.unsubscribe();
    });
    this.subscriptions = [];
    this.g.wdLog(['this.subscriptions', this.subscriptions]);
  }
  // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//

}
