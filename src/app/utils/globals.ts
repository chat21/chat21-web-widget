import { Injectable } from '@angular/core';

@Injectable()
export class Globals {
  senderId: string;
  isOpenHP: boolean;
  BUILD_VERSION: string;
  baseLocation: string;

  // params url
  tenant: string;
  recipientId: string;
  projectid: string;
  widgetTitle: string;
  poweredBy: string;
  userId: string;
  userEmail: string;
  userPassword: string;
  userFullname: string;
  preChatForm: boolean;
  isOpen: string;
  channelType: string;
  lang: string;
  calloutTimer: Number;
  align: string;
  hideHeaderCloseButton: boolean;
  wellcomeMsg: string;
  calloutTitle: string;
  calloutMsg: string;
  fullscreenMode: boolean;
  themeColor: string;
  themeForegroundColor: string;
  allowTranscriptDownload: boolean;
  showWidgetNameInConversation: boolean;


  constructor() {
    this.tenant = '';
    this.senderId = '';
    this.themeColor = '';
    this.themeForegroundColor = '';
    this.poweredBy = '';
    // this.isOpenHP = true;
  }

}
