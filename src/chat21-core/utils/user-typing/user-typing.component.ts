import { Component, OnInit, OnDestroy, Input } from '@angular/core';


// services
import { TypingService } from '../../providers/abstract/typing.service';

@Component({
  selector: 'user-typing',
  templateUrl: './user-typing.component.html',
  styleUrls: ['./user-typing.component.scss'],
})
export class UserTypingComponent implements OnInit, OnDestroy {

  // @Input() idConversation: string;
  // @Input() idCurrentUser: string;
  // @Input() isDirect: boolean;
  @Input() translationMap: Map<string, string>;
  @Input() color: string;
  // @Input() membersConversation: [string];

  public status = '';
  public isTyping = false;
  public nameUserTypingNow: string;

  private setTimeoutWritingMessages: any;
  private subscriptions = [];

  constructor(
    public typingService: TypingService
  ) { }

  /** */
  ngOnInit() {
    console.log('UserTypingComponent - ngOnInit');
    console.log('translationMap', this.translationMap.get('LABEL_IS_WRITING'))
    //this.initialize();
  }

  /** */
  ngOnDestroy() {
    console.log('UserTypingComponent - ngOnDestroy');
    // this.unsubescribeAll();
  }

  // /** */
  // initialize() {
  //   this.status = ''; // this.translationMap.get('LABEL_AVAILABLE');
  //   console.log('this.translationMap', this.translationMap);
  //   console.log('this.status', this.status);
  //   this.setSubscriptions();
  //   this.typingService.isTyping(this.idConversation, this.idCurrentUser, this.isDirect);
  // }

  // /** */
  // private setSubscriptions() {
  //   const that = this;
  //   const conversationSelected = this.subscriptions.find(item => item.key === this.idConversation);
  //   if (!conversationSelected) {
  //     const subscribeBSIsTyping =  this.typingService.BSIsTyping.subscribe((data: any) => {
  //       console.log('***** BSIsTyping *****', data);
  //       if (data) {
  //         const isTypingUid = data.uid;
  //         if (this.idConversation === isTypingUid) {
  //           that.subscribeTypings(data);
  //         }
  //       }
  //     });
  //     const subscribe = {key: this.idConversation, value: subscribeBSIsTyping };
  //     this.subscriptions.push(subscribe);
  //   }
  // }

  // /** */
  // subscribeTypings(data: any) {
  //   const that = this;
  //   try {
  //     const key = data.uid;
  //     this.nameUserTypingNow = null;
  //     if (data.nameUserTypingNow) {
  //       this.nameUserTypingNow = data.nameUserTypingNow;
  //     }
  //     console.log('subscribeTypings data:', data.uid);
  //     const userTyping = this.membersConversation.includes(key);
  //     if ( !userTyping ) {
  //       this.isTyping = true;
  //       console.log('child_changed key', key);
  //       console.log('child_changed name', this.nameUserTypingNow);
  //       clearTimeout(this.setTimeoutWritingMessages);
  //       this.setTimeoutWritingMessages = setTimeout(() => {
  //           that.isTyping = false;
  //       }, 2000);
  //     }
  //   } catch (error) {
  //     console.log('error: ', error);
  //   }
  // }


  /** */
  private unsubescribeAll() {
    console.log('UserTypingComponent unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach((subscription: any) => {
      console.log('unsubescribe: ', subscription);
      subscription.unsubescribe();
    });
    this.subscriptions = [];
  }


}
