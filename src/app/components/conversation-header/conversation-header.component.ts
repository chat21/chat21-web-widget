import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessagingService } from '../../providers/messaging.service';
import { StorageService } from '../../providers/storage.service';
import { Globals } from '../../utils/globals';

@Component({
  selector: 'tiledeskwidget-conversation-header',
  templateUrl: './conversation-header.component.html',
  styleUrls: ['./conversation-header.component.scss']
})
export class ConversationHeaderComponent implements OnInit {

  // ========= begin:: Input/Output values
  @Input() translationMap: Map< string, string>
  @Output() onClose = new EventEmitter();
  @Output() onCloseWidget = new EventEmitter();
  // ========= end:: Input/Output values
  
  isButtonsDisabled = true;
  isMenuShow = false;
  
  writingMessage = '';    // messaggio sta scrivendo...
  isTypings = false;
  private setTimeoutWritingMessages;

  // devo inserirle nel globals
  obsTyping: Subscription;
  subscriptions: Subscription[] = [];
  
  colorBck: string;

  constructor(
    public g: Globals,
    public storageService: StorageService,
    public messagingService: MessagingService,) { }

  ngOnInit() {
    this.g.wdLog([' ngOnInit: conversation-header COMPONENT ']);
    this.colorBck = '#000000';
  }

  ngAfterViewInit() {
    // this.isShowSpinner();
    this.g.wdLog([' --------ngAfterViewInit--------AAAAAA ', this.g.recipientId]);
    // this.storageService.setItem('activeConversation', this.conversation.uid);
    
    // --------------------------- //
    // after animation intro
    setTimeout(() => {
      // this.initAll();
      // this.setFocusOnId('chat21-main-message-context');
      // this.updateConversationBadge();

      // this.g.currentConversationComponent = this;
      // if (this.g.newConversationStart === true) {
      //   this.onNewConversationComponentInit();
      //   this.g.newConversationStart = false;
      //   const start_message = this.g.startMessage;
      //   if (this.g.startMessage) {
      //     this.sendMessage(
      //       start_message.text,
      //       start_message.type,
      //       start_message.metadata,
      //       start_message.attributes
      //     );
      //     // {"subtype": "info"}  //sponziello
      //   }
      // }
      this.subscriptionTyping();
      // if (this.afConversationComponent) {
      //   this.afConversationComponent.nativeElement.focus();
      // }
      this.isButtonsDisabled = false;
    }, 300);

  }



  returnHome() {
    this.storageService.removeItem('activeConversation');
    this.g.setParameter('activeConversation', null, false);
    this.onClose.emit();
  }

  returnCloseWidget() {
    //this.g.setParameter('activeConversation', null, false);
    this.onCloseWidget.emit();
  }

  toggleMenu() {
    this.isMenuShow = !this.isMenuShow;
  }

  // ========= begin:: typing ======= //

  /**
   *
   * @param str
   */
  setWritingMessages(str) {
    this.messagingService.setWritingMessages(str, this.g.channelType);
  }

  /**
   * on subscribe Typings
   */
  subscriptionTyping() {
    // console.log('subscriptionTyping');
    this.obsTyping = this.messagingService.obsTyping.subscribe(childSnapshot => {
      if (childSnapshot) {
        // this.isTypings = true;
        const that = this;
        // console.log('child_changed key', childSnapshot.key);
        // console.log('child_changed val', childSnapshot.val());
        this.checkMemberId(childSnapshot.key);
        clearTimeout(this.setTimeoutWritingMessages);
        this.setTimeoutWritingMessages = setTimeout(function () {
            that.isTypings = false;
            that.writingMessage = that.g.LABEL_WRITING;
        }, 2000);
      }
    });
    this.subscriptions.push(this.obsTyping);
  }

  /**
   *
   * @param memberID
   */
  checkMemberId(memberID) {
    const that = this;
     // && memberID.trim() !== 'system'
    if ( memberID.trim() !== '' && memberID.trim() !== this.g.senderId
    ) {
      if (that.isTypings === false) {
        that.isTypings = true;
      }
    } else {
      that.isTypings = false;
    }
  }
  // ================================ //

  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
  /**
   * elimino tutte le sottoscrizioni
   */
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.g.wdLog(['ngOnDestroy ------------------> this.subscriptions', this.subscriptions]);
    //this.storageService.removeItem('activeConversation');
    this.unsubscribe();
  }


  /** */
  unsubscribe() {
    this.g.wdLog(['******* unsubscribe *******']);
    this.subscriptions.forEach(function (subscription) {
        subscription.unsubscribe();
    });
    this.subscriptions.length = 0;
    this.messagingService.unsubscribeAllReferences();
    this.g.wdLog(['this.subscriptions', this.subscriptions]);
  }
  // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//


}
