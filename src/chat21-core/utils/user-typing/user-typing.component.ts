import { Component, OnInit, OnDestroy, Input } from '@angular/core';

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
  @Input() nameUserTypingNow: string;
  // @Input() membersConversation: [string];

  constructor( ) { }

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


}
