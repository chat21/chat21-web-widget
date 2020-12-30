import { MessageModel } from './../../models/message';
import { Injectable, ElementRef } from '@angular/core';

@Injectable()
export class Triggerhandler {
    el: ElementRef;
    constructor() { }

    public triggerBeforeSendMessageEvent(messageModel){
        console.log('triggerBeforeSendMessage', messageModel)
        // try {
        //     // tslint:disable-next-line:max-line-length
        //     const onBeforeMessageSend = new CustomEvent('onBeforeMessageSend', { detail: { messageModel } });
        //     const windowContext = this.windowContext;
        //     if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //         windowContext.tiledesk.tiledeskroot.dispatchEvent(onBeforeMessageSend);
        //         this.windowContext = windowContext;
        //     } else {
        //       this.el.nativeElement.dispatchEvent(onBeforeMessageSend);
        //     }
        // } catch (e) {
        //   this.g.wdLog(['> Error :' + e]);
        // }
    }

    public triggerAfterSendMessageEvent(messageSent: MessageModel){
        console.log('triggerAfterSendMessageEvent', messageSent)
        // try {
        //     // tslint:disable-next-line:max-line-length
        //     const onAfterMessageSend = new CustomEvent('onAfterMessageSend', { detail: { message: message } });
        //     const windowContext = this.windowContext;
        //     if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
        //         windowContext.tiledesk.tiledeskroot.dispatchEvent(onAfterMessageSend);
        //         this.windowContext = windowContext;
        //     } else {
        //       this.el.nativeElement.dispatchEvent(onAfterMessageSend);
        //     }
        // } catch (e) {
        //   this.g.wdLog(['> Error :' + e]);
        // }
    }

    public setElement(el: ElementRef){
        this.el = el
    }
}