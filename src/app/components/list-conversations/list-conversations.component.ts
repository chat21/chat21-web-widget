import { Component, OnInit, Output, EventEmitter } from '@angular/core';

// services
import { ConversationsService } from '../../providers/conversations.service';
import { TranslatorService } from '../../providers/translator.service';
import { Globals } from '../../utils/globals';
import { convertMessage } from '../../utils/utils';
// models
import { ConversationModel } from '../../../models/conversation';


@Component({
  selector: 'app-list-conversations',
  templateUrl: './list-conversations.component.html',
  styleUrls: ['./list-conversations.component.scss']
})

export class ListConversationsComponent implements OnInit {
  @Output() eventNewConv = new EventEmitter<string>();
  @Output() eventSelctedConv = new EventEmitter<string>();

  // used within the html template
  convertMessage = convertMessage;
  conversations: ConversationModel[];
  senderId = '';
  tenant = '';
  themeColor = '';
  themeForegroundColor = '';

  lang: string;
  LABEL_START_NW_CONV: string;

  constructor(
    public globals: Globals,
    public conversationsService: ConversationsService,
    private translatorService: TranslatorService
  ) {

    // get global variables
    this.tenant = this.globals.tenant;
    this.senderId = this.globals.senderId;
    this.themeColor = this.globals.themeColor;
    this.themeForegroundColor = this.globals.themeForegroundColor;
    this.lang = this.globals.lang;

    /** set lang and translate */
    this.translatorService.setLanguage(!this.lang ? 'en' : this.lang);
    this.translate();

    /** initialize */
    this.initialize();
  }

  ngOnInit() {
  }

  initialize() {
    this.conversationsService.initialize(this.senderId, this.tenant);
    this.conversations = this.conversationsService.conversations;
    this.conversationsService.checkListConversations();
  }

  private translate() {
    this.LABEL_START_NW_CONV = this.translatorService.translate('LABEL_START_NW_CONV');
  }

  openNewConversation() {
    this.eventNewConv.emit();
  }

  private openConversationByID(conversation) {
    console.log('openConversationByID: ', conversation);
    if ( conversation ) {
      this.eventSelctedConv.emit(conversation);
    }
  }


}
