import { ChatManager } from './../chat21-core/providers/chat-manager';
import { SettingsSaverService } from './providers/settings-saver.service';
import { GlobalSettingsService } from './providers/global-settings.service';
import { AgentAvailabilityService } from './providers/agent-availability.service';
import { ContactService } from './providers/contact.service';
import { TiledeskAuthService } from './../chat21-core/providers/tiledesk/tiledesk-auth.service';
import { CustomTranslateService } from './../chat21-core/providers/custom-translate.service';
import { AppConfigService } from './providers/app-config.service';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslatorService } from './providers/translator.service';
import { Triggerhandler } from './../chat21-core/utils/triggerHandler';
import { Globals } from './utils/globals';
import { AppModule } from './app.module';
import { ConversationFooterComponent } from './components/conversation-detail/conversation-footer/conversation-footer.component';
import { ConversationContentComponent } from './components/conversation-detail/conversation-content/conversation-content.component';
import { ConversationHeaderComponent } from './components/conversation-detail/conversation-header/conversation-header.component';
import { ListConversationsComponent } from './components/list-conversations/list-conversations.component';
import { MenuOptionsComponent } from './components/menu-options/menu-options.component';
import { HomeConversationsComponent } from './components/home-conversations/home-conversations.component';
import { LauncherButtonComponent } from './components/launcher-button/launcher-button.component';
import { LastMessageComponent } from './components/last-message/last-message.component';
import { EyeeyeCatcherCardComponent } from './components/eyeeye-catcher-card/eyeeye-catcher-card.component';
import { StarRatingWidgetComponent } from './components/star-rating-widget/star-rating-widget.component';
import { PrechatFormComponent } from './components/prechat-form/prechat-form.component';
import { SelectionDepartmentComponent } from './components/selection-department/selection-department.component';
import { ConversationComponent } from './components/conversation-detail/conversation/conversation.component';
import { ListAllConversationsComponent } from './components/list-all-conversations/list-all-conversations.component';
import { HomeComponent } from './components/home/home.component';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { UserLoginComponent } from './users/user-login/user-login.component';
import { PreviewLoadingFilesComponent } from './components/preview-loading-files/preview-loading-files.component';
import { MessageAttachmentComponent } from './components/message-attachment/message-attachment.component';
import { MarkedPipe } from './directives/marked.pipe';
import { HtmlEntitiesEncodePipe } from './directives/html-entities-encode.pipe';
import { UserTypingComponent } from '../chat21-core/utils/user-typing/user-typing.component';
import { BubbleMessageComponent } from './components/message/bubble-message/bubble-message.component';
import { TextComponent } from './components/message/text/text.component';
import { ImageComponent } from './components/message/image/image.component';
import { FrameComponent } from './components/message/frame/frame.component';
import { TextButtonComponent } from './components/message/buttons/text-button/text-button.component';
import { LinkButtonComponent } from './components/message/buttons/link-button/link-button.component';
import { ActionButtonComponent } from './components/message/buttons/action-button/action-button.component';
import { AvatarComponent } from './components/message/avatar/avatar.component';
import { ReturnReceiptComponent } from './components/message/return-receipt/return-receipt.component';
import { InfoMessageComponent } from './components/message/info-message/info-message.component';
import { InterlalFrameComponent } from './components/conversation-detail/interlal-frame/interlal-frame.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';
import { TooltipModule } from 'ng2-tooltip-directive';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessagingAuthService } from '../chat21-core/providers/abstract/messagingAuth.service';
import { AppStorageService } from '../chat21-core/providers/abstract/app-storage.service';
import { PresenceService } from '../chat21-core/providers/abstract/presence.service';
import { ConversationsHandlerService } from '../chat21-core/providers/abstract/conversations-handler.service';
import { ArchivedConversationsHandlerService } from '../chat21-core/providers/abstract/archivedconversations-handler.service';
import { ConversationHandlerBuilderService } from '../chat21-core/providers/abstract/conversation-handler-builder.service';
import { TypingService } from '../chat21-core/providers/abstract/typing.service';
import { ImageRepoService } from '../chat21-core/providers/abstract/image-repo.service';
import { UploadService } from '../chat21-core/providers/abstract/upload.service';

describe('AppComponent', () => {
  let appConfig: AppConfigService
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        // AppComponent,
        // HomeComponent,
        // HomeConversationsComponent,
        // ListAllConversationsComponent,
        // ListConversationsComponent,
        // ConversationComponent,
        // ConversationHeaderComponent,
        // ConversationContentComponent,
        // ConversationFooterComponent,
        // SelectionDepartmentComponent,
        // PrechatFormComponent,
        // StarRatingWidgetComponent,
        // EyeeyeCatcherCardComponent,
        // LastMessageComponent,
        // LauncherButtonComponent,
        // MenuOptionsComponent,

        AppComponent,
        // UserLoginComponent,
        // StarRatingWidgetComponent,
        // SelectionDepartmentComponent,
        // HomeConversationsComponent,
        // HomeComponent,
        // LauncherButtonComponent,
        // ConversationComponent,
        // PrechatFormComponent,
        // EyeeyeCatcherCardComponent,
        // PreviewLoadingFilesComponent,
        // MenuOptionsComponent,
        // ListAllConversationsComponent,
        // MessageAttachmentComponent,
        // LastMessageComponent,
        // MarkedPipe,
        // HtmlEntitiesEncodePipe,
        // ListConversationsComponent,
        // ConversationHeaderComponent,
        // UserTypingComponent,
        // ConversationFooterComponent,
        // ConversationContentComponent,
        // BubbleMessageComponent,
        // TextComponent,
        // ImageComponent,
        // TextButtonComponent,
        // FrameComponent,
        // LinkButtonComponent,
        // ActionButtonComponent,
        // AvatarComponent,
        // ReturnReceiptComponent,
        // InfoMessageComponent,
        // InterlalFrameComponent
      ],
      imports: [  
        FormsModule, 
        ReactiveFormsModule,
        MomentModule,
        TooltipModule,
        TranslateModule.forRoot(),
        HttpModule,
        HttpClientModule
      ],
      providers : [
        Globals,
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
        ArchivedConversationsHandlerService,
        ConversationHandlerBuilderService,
        ChatManager,
        TypingService,
        ImageRepoService,
        UploadService
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    appConfig = TestBed.get(AppConfigService)
    
  }));
  
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should initialize right parameters value`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.isInitialized).toEqual(false);
    expect(app.isOpenHome).toEqual(true);
    expect(app.isOpenConversation).toEqual(false);
    expect(app.isOpenSelectionDepartment).toEqual(false);
    expect(app.isOpenStartRating).toEqual(false);
    expect(app.isConversationArchived).toEqual(false)
    expect(app.departments).toEqual([])
  }));

});
