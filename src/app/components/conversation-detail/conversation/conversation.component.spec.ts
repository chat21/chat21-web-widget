import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConversationsService } from './../../../providers/conversations.service';
import { Triggerhandler } from './../../../../chat21-core/utils/triggerHandler';
import { AppComponent } from './../../../app.component';
import { AppConfigService } from './../../../providers/app-config.service';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { StarRatingWidgetService } from './../../star-rating-widget/star-rating-widget.service';
import { Globals } from './../../../utils/globals';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationComponent } from './conversation.component';
import { GlobalSettingsService } from '../../../providers/global-settings.service';
import { SettingsSaverService } from '../../../providers/settings-saver.service';
import { TranslatorService } from '../../../providers/translator.service';
import { AgentAvailabilityService } from '../../../providers/agent-availability.service';
import { AppStorageService } from '../../../../chat21-core/providers/abstract/app-storage.service';
import { ContactService } from '../../../providers/contact.service';
import { CustomTranslateService } from '../../../../chat21-core/providers/custom-translate.service';
import { MessagingAuthService } from '../../../../chat21-core/providers/abstract/messagingAuth.service';
import { TiledeskAuthService } from '../../../../chat21-core/providers/tiledesk/tiledesk-auth.service';
import { PresenceService } from '../../../../chat21-core/providers/abstract/presence.service';
import { ConversationsHandlerService } from '../../../../chat21-core/providers/abstract/conversations-handler.service';
import { ArchivedConversationsHandlerService } from '../../../../chat21-core/providers/abstract/archivedconversations-handler.service';
import { ConversationHandlerBuilderService } from '../../../../chat21-core/providers/abstract/conversation-handler-builder.service';
import { ChatManager } from '../../../../chat21-core/providers/chat-manager';
import { TypingService } from '../../../../chat21-core/providers/abstract/typing.service';
import { ImageRepoService } from '../../../../chat21-core/providers/abstract/image-repo.service';
import { UploadService } from '../../../../chat21-core/providers/abstract/upload.service';
import { TranslateModule } from '@ngx-translate/core';

describe('ConversationComponent', () => {
  let component: ConversationComponent;
  let fixture: ComponentFixture<ConversationComponent>;
  class MockElementRef {}

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationComponent ],
      imports: [
        HttpModule,
        HttpModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        Globals,
        StarRatingWidgetService,
        AppConfigService,
        AppComponent,
        { provide: ElementRef, useClass: MockElementRef },
        GlobalSettingsService,
        SettingsSaverService,
        Triggerhandler,
        TranslatorService,
        AgentAvailabilityService,
        AppConfigService,
        AppStorageService,
        ContactService,
        CustomTranslateService,
        MessagingAuthService,
        TiledeskAuthService,
        PresenceService,
        ConversationsHandlerService,
        ConversationsService,
        ArchivedConversationsHandlerService,
        ConversationHandlerBuilderService,
        ChatManager,
        TypingService,
        ImageRepoService,
        UploadService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
