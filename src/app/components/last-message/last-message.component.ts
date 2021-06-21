import { Component, OnInit, Output, OnDestroy, AfterViewInit, NgZone, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
// services
import { Globals } from '../../utils/globals';
import { MessageModel } from '../../../models/message';
import { ConversationsService } from '../../providers/conversations.service';

// utils
import { popupUrl, isPopupUrl, strip_tags, replaceBr } from '../../utils/utils';

import {
  CHANNEL_TYPE_DIRECT, CHANNEL_TYPE_GROUP, TYPE_MSG_TEXT,
  MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER,
  TYPE_MSG_FILE, TYPE_MSG_IMAGE, MAX_WIDTH_IMAGES, IMG_PROFILE_BOT, IMG_PROFILE_DEFAULT
} from '../../utils/constants';
import { ConversationModel } from '../../../chat21-core/models/conversation';
import { isImage } from '../../../chat21-core/utils/utils-message';
import { ImageRepoService } from '../../../chat21-core/providers/abstract/image-repo.service';
import { LoggerInstance } from '../../../chat21-core/providers/logger/loggerInstance';
import { LoggerService } from '../../../chat21-core/providers/abstract/logger.service';


@Component({
  selector: 'chat-last-message',
  templateUrl: './last-message.component.html',
  styleUrls: ['./last-message.component.scss']
})
export class LastMessageComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() conversation: ConversationModel
  @Input() baseLocation: string;
  @Input() stylesMap: Map<string, string>;
  @Output() onCloseMessagePreview  = new EventEmitter();
  @Output() onSelectedConversation = new EventEmitter<string>();
  // ========= begin:: sottoscrizioni ======= //
  subscriptions: Subscription[] = []; /** */
  // ========= end:: sottoscrizioni ======= //

  isPopupUrl = isPopupUrl;
  popupUrl = popupUrl;
  strip_tags = strip_tags;
  isImage = isImage;

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(
    private imageRepoService: ImageRepoService,
    public g: Globals,
    // public conversationsService: ConversationsService
  ) {
    // this.g.wdLog([' ---------------- ngOnInit LastMessageComponent ---------------- ']);
    // const that = this;
    // const subChangedConversation = this.conversationsService.obsChangeConversation.subscribe((conversation) => {
    //     that.ngZone.run(() => {
    //       if (that.g.isOpen === false) {
    //         that.g.wdLog([' 2 - > obsChangeConversation ::: ', conversation]);
    //         if (conversation && conversation.attributes && conversation.attributes['subtype'] === 'info') {
    //           return;
    //         }
    //         that.conversation = conversation;
    //         // this.logger.printDebug('conv: ' + conversation);
    //       }
    //     });
    // });
    // this.subscriptions.push(subChangedConversation);
  }

  ngOnInit() {
  }

  /** */
  ngAfterViewInit() {
    // this.logger.printDebug('isOpenNewMessage: ' + this.g.isOpenNewMessage);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.printDebug('LASTMESSAGE:: onchagnges', changes)
    if(this.conversation){
      this.conversation.image = this.imageRepoService.getImagePhotoUrl(this.conversation.sender)
    }
  }

  /**
   *
   * @param message
   */
  getMetadataSize(metadata): any {
    if(metadata.width === undefined){
      metadata.width= MAX_WIDTH_IMAGES
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
    if (metadata.width && metadata.width > (MAX_WIDTH_IMAGES)) {
        const rapporto = (metadata['width'] / metadata['height']);
        sizeImage.width = MAX_WIDTH_IMAGES;
        sizeImage.height = (MAX_WIDTH_IMAGES) / rapporto;
    }
    return sizeImage; // h.toString();
  }



// ========= begin:: event emitter function ============//

  onAttachmentButtonClicked(event: any){
    // this.onAttachmentButtonClicked.emit(event)
    this.logger.printDebug('LASTMESSAGE:: onAttachmentButtonClicked', event)
  }
  /** */
  openConversationByID(conversation) {
    this.logger.printDebug('LASTMESSAGE:: openConversationByID: ', conversation);
    this.conversation = null;
    this.g.isOpenNewMessage = false;
    // this.logger.printDebug('2 isOpenNewMessage: ' + this.g.isOpenNewMessage);
    if ( conversation ) {
      this.onSelectedConversation.emit(conversation);
    }
  }
  /** */
  closeMessagePreview() {
    this.conversation = null;
    this.g.isOpenNewMessage = false;
    // this.logger.printDebug('3 isOpenNewMessage: ' + this.g.isOpenNewMessage);
    this.onCloseMessagePreview.emit();
  }
  // ========= begin:: event emitter function ============//


  /** */
  ngOnDestroy() {
    this.conversation = null;
    this.g.isOpenNewMessage = false;
    // this.logger.printDebug('4 isOpenNewMessage: ' + this.g.isOpenNewMessage);
    //this.unsubscribe();
  }

  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
  /** */
  unsubscribe() {
    this.subscriptions.forEach(function (subscription) {
        subscription.unsubscribe();
    });
    this.subscriptions = [];
    this.logger.printDebug('LASTMESSAGE:: this.subscriptions', this.subscriptions);
  }
  // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//

}
