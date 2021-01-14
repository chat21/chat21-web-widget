import { Component, EventEmitter, Input, IterableDiffers, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConversationModel } from '../../../chat21-core/models/conversation';
import { ConversationComponent } from '../conversation-detail/conversation/conversation.component';
import {
  getUrlImgProfile,
  setColorFromString,
  avatarPlaceholder,
  convertMessage,
  compareValues
} from '../../utils/utils';
import { User } from '../../../models/User';
import { Globals } from '../../utils/globals';
@Component({
  selector: 'tiledeskwidget-list-conversations',
  templateUrl: './list-conversations.component.html',
  styleUrls: ['./list-conversations.component.scss']
})
export class ListConversationsComponent implements OnInit {

  // ========= begin:: Input/Output values ============//
  @Input() listConversations: Array<ConversationModel>;
  @Input() limit?: number
  @Input() styleMap: Map<string, string>;
  @Input() translationMap: Map< string, string>;
  @Output() onConversationSelected = new EventEmitter<string>();
  // ========= end:: Input/Output values ============//

  // ========= begin:: dichiarazione funzioni ======= //
  convertMessage = convertMessage;
  setColorFromString = setColorFromString;
  avatarPlaceholder = avatarPlaceholder;
  getUrlImgProfile = getUrlImgProfile;
  // ========= end:: dichiarazione funzioni ========= //

  constructor(public g: Globals) { }

  ngOnInit() {
    this.g.wdLog([' ngOnInit::::list-conversations ', this.listConversations]);
    
  }

  private openConversationByID(conversation) {
    this.g.wdLog(['openConversationByID: ', conversation]);
    if ( conversation ) {
      // this.conversationsService.updateIsNew(conversation);
      // this.conversationsService.updateConversationBadge();
      this.onConversationSelected.emit(conversation);
    }
  }

  ngAfterViewInit() {
    this.g.wdLog([' --------ngAfterViewInit: list-conversations-------- ', this.listConversations]);
  }


}
