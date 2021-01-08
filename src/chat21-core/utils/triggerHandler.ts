import { DepartmentModel } from './../../models/department';
import { MessageModel } from '../../models/message';
import { Injectable, ElementRef } from '@angular/core';
import { Globals } from '../../app/utils/globals';
import { ConversationModel } from '../models/conversation';

@Injectable()
export class Triggerhandler {

    el: ElementRef;
    windowContext;

    constructor(private g: Globals) { }

    public setElement(el: ElementRef){
        this.el = el
    }

    public setWindowContext(windowContext){
        this.windowContext = windowContext
    }

    /**CONVERSATION-FOOTER.component */
    public triggerBeforeSendMessageEvent(messageModel){
        this.g.wdLog([' ---------------- triggerBeforeSendMessageEvent ---------------- ', messageModel]);
        try {
            const onBeforeMessageSend = new CustomEvent('onBeforeMessageSend', { detail: { messageModel } });
            const windowContext = this.windowContext;
            if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
                windowContext.tiledesk.tiledeskroot.dispatchEvent(onBeforeMessageSend);
                this.windowContext = windowContext;
            } else {
              this.el.nativeElement.dispatchEvent(onBeforeMessageSend);
            }
        } catch (e) {
          this.g.wdLog(['> Error :' + e]);
        }
    }

    /**CONVERSATION-FOOTER.component */
    public triggerAfterSendMessageEvent(messageSent: MessageModel){
        this.g.wdLog([' ---------------- triggerAfterSendMessageEvent ---------------- ', messageSent]);
        try {
            const onAfterMessageSend = new CustomEvent('onAfterMessageSend', { detail: { message: messageSent } });
            const windowContext = this.windowContext;
            if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
                windowContext.tiledesk.tiledeskroot.dispatchEvent(onAfterMessageSend);
                this.windowContext = windowContext;
            } else {
              this.el.nativeElement.dispatchEvent(onAfterMessageSend);
            }
        } catch (e) {
          this.g.wdLog(['> Error :' + e]);
        }
    }

    /**CONVERSATION.component */
    public triggerOnNewConversationInit(detailObj: {}){
        this.g.wdLog([' ---------------- triggerOnNewConversationComponentInit ---------------- ', detailObj]);
        const onNewConversation = new CustomEvent('onNewConversationComponentInit', { detail: detailObj });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onNewConversation);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onNewConversation);
        }
    }

    /**CONVERSATION.component */
    public triggerBeforeMessageRender(detailObj: {}) {
        //this.g.wdLog([' ---------------- triggerBeforeMessageRender ---------------- ', detailObj]);
        try {
          const beforeMessageRender = new CustomEvent('beforeMessageRender',
            { detail: detailObj });
          const windowContext = this.g.windowContext;
          if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
              windowContext.tiledesk.tiledeskroot.dispatchEvent(beforeMessageRender);
              this.g.windowContext = windowContext;
          } else {
            const returnEventValue = this.el.nativeElement.dispatchEvent(beforeMessageRender);
          }
        } catch (e) {
          this.g.wdLog(['> Error :' + e]);
        }
      }

    /**CONVERSATION.component */
    public triggerAfterMessageRender(detailObj: {}) {
        //this.g.wdLog([' ---------------- triggerAfterMessageRender ---------------- ', detailObj]);
        try {
            const afterMessageRender = new CustomEvent('afterMessageRender',
            { detail: detailObj });
            const windowContext = this.g.windowContext;
            if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
                windowContext.tiledesk.tiledeskroot.dispatchEvent(afterMessageRender);
                this.g.windowContext = windowContext;
            } else {
            const returnEventValue = this.el.nativeElement.dispatchEvent(afterMessageRender);
            }
        } catch (e) {
            this.g.wdLog(['> Error :' + e]);
        }
    }

    /**CONVERSATION.component */
    public triggerOnMessageCreated(message: MessageModel) {
        this.g.wdLog([' ---------------- triggerOnMessageCreated ---------------- ', message]);
        const onMessageCreated = new CustomEvent('onMessageCreated', { detail: { message: message } });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onMessageCreated);
            this.g.windowContext = windowContext;
        } else {
            // this.el.nativeElement.dispatchEvent(onMessageCreated);
        }
      }

    /**APP-COMPONENT.component */  
    public triggerOnViewInit(detailObj: {}) {
        const windowContext = this.g.windowContext;
        this.g.wdLog([' ---------------- triggerOnInit ---------------- ', detailObj]);
        const onInit = new CustomEvent('onInit', { detail: detailObj });

        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onInit);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onInit);
        }
    }

    /**APP-COMPONENT.component */
    public triggerOnOpenEvent(detailObj: {}) {
        this.g.wdLog([' ---------------- triggerOnOpenEvent ---------------- ', detailObj]);
        const onOpen = new CustomEvent('onOpen', { detail: detailObj });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onOpen);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onOpen);
        }

    }

    /**APP-COMPONENT.component */
    public triggerOnCloseEvent(detailObj: {}) {
        this.g.wdLog([' ---------------- triggerOnCloseEvent ---------------- ', detailObj]);
        const onClose = new CustomEvent('onClose', { detail: detailObj });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onClose);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onClose);
        }

    }

    /**APP-COMPONENT.component */
    public triggerOnOpenEyeCatcherEvent(detailObj: {}) {
        this.g.wdLog([' ---------------- triggerOnOpenEyeCatcherEvent ---------------- ', detailObj]);
        const onOpenEyeCatcher = new CustomEvent('onOpenEyeCatcher', { detail: detailObj });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onOpenEyeCatcher);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onOpenEyeCatcher);
        }
    }

    /**APP-COMPONENT.component */
    public triggerOnClosedEyeCatcherEvent() {
        this.g.wdLog([' ---------------- triggerOnClosedEyeCatcherEvent ---------------- ']);
        const onClosedEyeCatcher = new CustomEvent('onClosedEyeCatcher', { detail: { } });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onClosedEyeCatcher);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onClosedEyeCatcher);
        }
    }



    /**APP-COMPONENT.component */
    public triggerOnLoggedIn(detailObj: {}) {
        this.g.wdLog([' ---------------- triggerOnLoggedIn ---------------- ', detailObj]);
        const onLoggedIn = new CustomEvent('onLoggedIn', { detail: detailObj});
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onLoggedIn);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onLoggedIn);
        }
    }

    /**APP-COMPONENT.component */
    public triggerOnLoggedOut(detailObj: {}) {
        this.g.wdLog([' ---------------- triggerOnLoggedOut ---------------- ', detailObj]);
        const onLoggedOut = new CustomEvent('onLoggedOut', { detail: detailObj});
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onLoggedOut);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onLoggedOut);
        }
    }

    /**APP-COMPONENT.component */
    public triggerOnAuthStateChanged(detailObj: {}) {
        this.g.wdLog([' ---------------- triggerOnAuthStateChanged ---------------- ', detailObj]);
        const onAuthStateChanged = new CustomEvent('onAuthStateChanged', { detail: detailObj});
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onAuthStateChanged);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onAuthStateChanged);
        }
    }


    /**APP-COMPONENT.component */
    public triggerLoadParamsEvent(detailObj: {}) {
        this.g.wdLog([' ---------------- triggerOnLoadParamsEvent ---------------- ', detailObj]);
        const onLoadParams = new CustomEvent('onLoadParams', { detail: detailObj });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onLoadParams);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onLoadParams);
        }
    }

    /**APP-COMPONENT.component */
    public triggerOnConversationUpdated(conversation: ConversationModel) {
        this.g.wdLog([' ---------------- triggerOnConversationUpdated ---------------- ', conversation]);
        try {
            const triggerConversationUpdated = new CustomEvent('onConversationUpdated', { detail: { conversation: conversation } });
            const windowContext = this.g.windowContext;
            if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
                windowContext.tiledesk.tiledeskroot.dispatchEvent(triggerConversationUpdated);
                this.g.windowContext = windowContext;
            } else {
                this.el.nativeElement.dispatchEvent(triggerConversationUpdated);
            }
        } catch (e) {
            this.g.wdLog(['> Error :' + e]);
        }
    }

    /**APP-COMPONENT.component */
    public triggerOnCloseMessagePreview() {
        this.g.wdLog([' ---------------- triggerOnCloseMessagePreview ---------------- ']);
        try {
            const triggerCloseMessagePreview = new CustomEvent('onCloseMessagePreview', { detail: { } });
            const windowContext = this.g.windowContext;
            if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
                windowContext.tiledesk.tiledeskroot.dispatchEvent(triggerCloseMessagePreview);
                this.g.windowContext = windowContext;
            } else {
                this.el.nativeElement.dispatchEvent(triggerCloseMessagePreview);
            }
            this.g.isOpenNewMessage = false;
        } catch (e) {
            this.g.wdLog(['> Error :' + e]);
        }
    }

    /**SELECTION-DEPARTMENT.component */
    public triggerOnbeforeDepartmentsFormRender(departments: DepartmentModel[]) {
        this.g.wdLog([' ---------------- beforeDepartmentsFormRender ---------------- ']);
        const onOpen = new CustomEvent('onBeforeDepartmentsFormRender', { detail: { departments: departments } });
        const windowContext = this.g.windowContext;
        if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(onOpen);
            this.g.windowContext = windowContext;
        } else {
            this.el.nativeElement.dispatchEvent(onOpen);
        }
    }

    /** */
    public triggerGetImageUrlThumb(message: MessageModel) {
        try {
          const windowContext = this.g.windowContext;
          const triggerGetImageUrlThumb = new CustomEvent('getImageUrlThumb', { detail: { message: message } });
          if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
            windowContext.tiledesk.tiledeskroot.dispatchEvent(triggerGetImageUrlThumb);
          } else {
            // this.el.nativeElement.dispatchEvent(triggerGetImageUrlThumb);
          }
        } catch (e) {
          this.g.wdLog(['> Error :' + e]);
        }
      }

    
}