import { TypingService } from '../../../../chat21-core/providers/abstract/typing.service';

import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConversationModel } from '../../../../chat21-core/models/conversation';
import { MessagingService } from '../../../providers/messaging.service';
import { StorageService } from '../../../providers/storage.service';
import { Globals } from '../../../utils/globals';
import { AppConfigService } from '../../../providers/app-config.service';
import { convertColorToRGBA } from '../../../../chat21-core/utils/utils';

@Component({
  selector: 'tiledeskwidget-conversation-header',
  templateUrl: './conversation-header.component.html',
  styleUrls: ['./conversation-header.component.scss']
})
export class ConversationHeaderComponent implements OnInit, OnChanges {

  // ========= begin:: Input/Output values
  @Input() idConversation: string;
  @Input() senderId: string;
  @Input() isSoundActive: boolean;
  @Input() isMenuShow: boolean;
  @Input() isTrascriptDownloadEnabled: boolean;
  @Input() hideHeaderCloseButton: boolean;
  @Input() windowContext;
  @Input() stylesMap: Map<string, string>
  @Input() translationMap: Map< string, string>;
  @Input() widgetTitle: string;
  @Output() onBack = new EventEmitter();
  @Output() onCloseWidget = new EventEmitter();
  @Output() onSoundChange = new EventEmitter();
  @Output() onMenuOptionShow = new EventEmitter();
  // ========= end:: Input/Output values

  // ============ BEGIN: SET FUNCTION BY UTILS ==============//
  convertColorToRGBA = convertColorToRGBA;
  // ============ BEGIN: SET INTERNAL PARAMETERS ==============//
  
  isButtonsDisabled = true;
  
  public isTypings = false;
  public isDirect = false;
  public writingMessage: string;
  public nameUserTypingNow: string;
  private setTimeoutWritingMessages;

  subscriptions = [];
  
  membersConversation = ['SYSTEM'];

  // text used within the html
  private API_URL: string;
  
  constructor(
    public g: Globals,
    public typingService: TypingService,
    public appConfigService: AppConfigService,) {
      this.API_URL = this.appConfigService.getConfig().apiUrl;
     }

  ngOnInit() {
    this.g.wdLog([' ngOnInit: conversation-header COMPONENT ', this.translationMap]);
    this.membersConversation.push(this.senderId)
    //this.initializeTyping();
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes['idConversation'] && changes['idConversation'].currentValue !== undefined){
      console.log('onChanges -- Conversation-header.component-> start initializeTyping()', this.idConversation)
      this.initializeTyping();
    }
  }

  ngAfterViewInit() {
    // this.isShowSpinner();
    this.g.wdLog([' --------ngAfterViewInit: conversation-header-------- ']);
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
      //this.subscriptionTyping();
      // if (this.afConversationComponent) {
      //   this.afConversationComponent.nativeElement.focus();
      // }
      this.isButtonsDisabled = false;
    }, 300);
    this.setSubscriptions();

  }


  initializeTyping() {
    console.log('membersconversation', this.membersConversation)
    //this.setSubscriptions();
    this.typingService.isTyping(this.idConversation, this.senderId, this.isDirect);
    
  }

  // /** */
  private setSubscriptions() {
    const that = this;
    console.log('subsctiptions', this.subscriptions)
    const conversationSelected = this.subscriptions.find(item => item.key === this.idConversation);
    if (!conversationSelected) {
      const subscribeBSIsTyping =  this.typingService.BSIsTyping.subscribe((data: any) => {
        console.log('***** BSIsTyping *****', data);
        if (data) {
          const isTypingUid = data.uid; //support-group-...
          if (this.idConversation === isTypingUid) {
            that.subscribeTypings(data);
          }
        }
      });
      const subscribe = {key: this.idConversation, value: subscribeBSIsTyping };
      this.subscriptions.push(subscribe);
    }
  }

  /** */
  subscribeTypings(data: any) {
    const that = this;
    try {
      const key = data.uidUserTypingNow; 
      this.nameUserTypingNow = null;
      if (data.nameUserTypingNow) {
        this.nameUserTypingNow = data.nameUserTypingNow;
      }
      console.log('subscribeTypings data:', data);
      const userTyping = this.membersConversation.includes(key);
      if ( !userTyping) {
        this.isTypings = true;
        console.log('child_changed key', key);
        clearTimeout(this.setTimeoutWritingMessages);
        this.setTimeoutWritingMessages = setTimeout(() => {
            that.isTypings = false;
        }, 2000);
      }
    } catch (error) {
      console.log('error: ', error);
    }

  }


  // =========== BEGIN: event emitter function ====== //
  returnHome() {
    // this.storageService.removeItem('activeConversation');
    // this.g.setParameter('activeConversation', null, false);
    this.onBack.emit();
  }

  returnCloseWidget() {
    //this.g.setParameter('activeConversation', null, false);
    this.onCloseWidget.emit();
  }
  // =========== END: event emitter function ====== //

  dowloadTranscript() {
    const url = this.API_URL + 'public/requests/' + this.idConversation + '/messages.html';
    const windowContext = this.windowContext;
    windowContext.open(url, '_blank');
    // this.isMenuShow  = false;
    this.onMenuOptionShow.emit(false)
  }
  
  toggleSound() {
    //this.isMenuShow  = false;
    this.onMenuOptionShow.emit(false)
    this.onSoundChange.emit(!this.isSoundActive)
  }

  toggleMenu() {
    this.onMenuOptionShow.emit(!this.isMenuShow)
    // this.isMenuShow = !this.isMenuShow;   
  }




  // ========= begin:: DESTROY ALL SUBSCRIPTIONS ============//
  /**
   * elimino tutte le sottoscrizioni
   */
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.g.wdLog(['ngOnDestroy ------------------> this.subscriptions', this.subscriptions]);
    //this.storageService.removeItem('activeConversation');
    // this.unsubscribe();
    this.unsubescribeAll()
  }


  /** */
  private unsubescribeAll() {
    console.log('UserTypingComponent unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach((subscription: any) => {
      console.log('unsubescribe: ', subscription);
      subscription.value.unsubscribe();
    });
    this.subscriptions.length = 0;
    this.subscriptions = [];
  }
  // ========= end:: DESTROY ALL SUBSCRIPTIONS ============//


}
