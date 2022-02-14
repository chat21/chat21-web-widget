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

export function isFrame(message: any) {
  if (message && message.type && message.metadata && message.metadata.src && message.type === 'frame') {
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
    if (message && message.attributes && (message.attributes.subtype === 'info' || message.attributes.subtype === 'info/support')) {
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
      return isInfo(message);
    }
    if (msgType === MESSAGE_TYPE_MINE) {
      return isMine(message);
    }
    if (msgType === MESSAGE_TYPE_OTHERS) {
      if (isInfo(message) === false && isMine(message) === false) {
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


export function isEmojii(message: any){
  if (message.length > 2) {
    return false;
  }
  let fistChar = '';
  try {
    fistChar = message.trim(); // .charAt(0);
  } catch (e) {
    return false;
  }

  const ranges = ['(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])'];
  if (fistChar.match(ranges.join('|'))) {
      return true;
  } else {
      return false;
  }
}


export function checkIfIsMemberJoinedGroup(msg, loggedUser): boolean{
  if(msg && msg.attributes && msg.attributes.messagelabel
      && msg.attributes.messagelabel['key']=== "MEMBER_JOINED_GROUP" 
      && msg.attributes.messagelabel.parameters['member_id'] !== loggedUser.uid
      && !msg.attributes.messagelabel.parameters['member_id'].includes('bot')){
          return true
  }
  return false
  
}
