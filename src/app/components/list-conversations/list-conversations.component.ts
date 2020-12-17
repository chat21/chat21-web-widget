import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConversationModel } from '../../../chat21-core/models/conversation';
import { ConversationComponent } from '../conversation/conversation.component';
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
  @Output() eventSelctedConv = new EventEmitter<string>();
  @Input() listConversations: Array<ConversationModel>;
  @Input() limit?: number
  // ========= end:: Input/Output values ============//

  // ========= begin:: dichiarazione funzioni ======= //
  convertMessage = convertMessage;
  setColorFromString = setColorFromString;
  avatarPlaceholder = avatarPlaceholder;
  getUrlImgProfile = getUrlImgProfile;
  // ========= end:: dichiarazione funzioni ========= //



  constructor(
    public g: Globals,
  ) {
  }

  ngOnInit() {
    this.g.wdLog([' ngOnInit::::list-conversations ', this.listConversations]);
    console.log('limit', this.limit)
  }

  private openConversationByID(conversation) {
    this.g.wdLog(['openConversationByID: ', conversation]);
    if ( conversation ) {
      // this.conversationsService.updateIsNew(conversation);
      // this.conversationsService.updateConversationBadge();
      this.eventSelctedConv.emit(conversation);
    }
  }

  ngAfterViewInit() {
    this.g.wdLog([' --------ngAfterViewInit-------- ']);
    console.log('listconversation', this.listConversations)
  }


}
