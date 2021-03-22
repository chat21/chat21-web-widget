import {
    MESSAGE_TYPE_INFO,
    MESSAGE_TYPE_MINE,
    MESSAGE_TYPE_OTHERS,
    MESSAGE_TYPE_DATE,
    MAX_WIDTH_IMAGES,
    CHANNEL_TYPE_GROUP,
    TYPE_SUPPORT_GROUP
} from '../../chat21-core/utils/constants';

/**  */
export function isFirstMessage(i: number) {
    if ( i > 0 ) {
      try {
        const message = this.messages[i];
        const prevMessage = this.messages[ i - 1 ];
        if (prevMessage.sender !== message.sender || message.headerDate || (prevMessage && this.isInfo(prevMessage))) {
          return true;
        }
        return false;
      } catch (err) {
        console.log('error: ', err);
      }
    }
}

/** */
export function isImage(message: any) {
    if (message && message.type && message.metadata && message.metadata.src && message.type === 'image') {
      return true;
    }
    return false;
}

/** */
export function isFile(message: any) {
    if (message && message.type && message.metadata && message.metadata.src && message.type === 'file') {
      return true;
    }
    return false;
}

/** */
export function isInfo(message: any) {
    if (message.attributes && (message.attributes.subtype === 'info' || message.attributes.subtype === 'info/support')) {
      return true;
    }
    return false;
}

/** */
export function isMine(message: any) {
    if (message.isSender) {
      return true;
    }
    return false;
}

/** */
export function messageType(msgType: string, message: any) {
    if (msgType === MESSAGE_TYPE_DATE) {
      if (message.headerDate && message.headerDate !== '') {
        return true;
      }
      return false;
    }
    if (msgType === MESSAGE_TYPE_INFO) {
      return this.isInfo(message);
    }
    if (msgType === MESSAGE_TYPE_MINE) {
      return this.isMine(message);
    }
    if (msgType === MESSAGE_TYPE_OTHERS) {
      if (this.isInfo(message) === false && this.isMine(message) === false) {
        return true;
      }
      return false;
    }
}

/** */
export function getSizeImg(message: any, maxWidthImage?: number): any {
    try {
      const metadata = message.metadata;
      const sizeImage = {
        width: metadata.width,
        height: metadata.height
      };
      if (!maxWidthImage) {
        maxWidthImage = MAX_WIDTH_IMAGES;
      }
      if (metadata.width && metadata.width > maxWidthImage) {
        const rapporto = (metadata['width'] / metadata['height']);
        sizeImage.width = maxWidthImage;
        sizeImage.height = maxWidthImage / rapporto;
      }
      return sizeImage;
    } catch (err) {
      console.log('error: ', err);
      return;
    }
}

/** */
export function isChannelTypeGroup(channelType: string) {
    if (channelType === CHANNEL_TYPE_GROUP || channelType === TYPE_SUPPORT_GROUP) {
      return true;
    }
    return false;
}
