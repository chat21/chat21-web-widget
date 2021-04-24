import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { Observable } from 'rxjs';
// import { AngularFireModule } from '@angular/fire';
// import { AngularFirestoreModule } from '@angular/fire/firestore';
// import { AngularFireDatabaseModule } from '@angular/fire/database';
// import { AngularFireAuthModule } from '@angular/fire/auth';
// import * as firebase from 'firebase';


// Directives
import { TooltipModule } from 'ng2-tooltip-directive';

// Import the library module
import { environment } from '../environments/environment';
import { HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocalStorageModule } from 'angular-2-local-storage';
import { MomentModule } from 'angular2-moment';
import { LinkyModule } from 'angular-linky';
import { AngularResizedEventModule } from 'angular-resize-event';

// utils
import { Globals } from './utils/globals';

// users
import { UserLoginComponent } from './users/user-login/user-login.component';
import { UserProfileComponent } from './users/user-profile/user-profile.component';

// providers
import { GlobalSettingsService } from './providers/global-settings.service';
import { SettingsSaverService } from './providers/settings-saver.service';
import { StorageService } from './providers/storage.service';
import { ChatPresenceHandlerService } from './providers/chat-presence-handler.service';
import { AuthService_old } from './providers/auth.service';
import { MessagingService } from './providers/messaging.service';
import { ConversationsService } from './providers/conversations.service';
import { ContactService } from './providers/contact.service';
import { AgentAvailabilityService } from './providers/agent-availability.service';
import { TranslatorService } from './providers/translator.service';
import { WaitingService } from './providers/waiting.service';
import { AppConfigService } from './providers/app-config.service';


// components
import { SelectionDepartmentComponent } from './components/selection-department/selection-department.component';
import { HomeConversationsComponent } from './components/home-conversations/home-conversations.component';
import { HomeComponent } from './components/home/home.component';
import { LauncherButtonComponent } from './components/launcher-button/launcher-button.component';
import { ConversationComponent } from './components/conversation-detail/conversation/conversation.component';
import { MessageAttachmentComponent } from './components/message-attachment/message-attachment.component';
import { PrechatFormComponent } from './components/prechat-form/prechat-form.component';
import { EyeeyeCatcherCardComponent } from './components/eyeeye-catcher-card/eyeeye-catcher-card.component';
import { PreviewLoadingFilesComponent } from './components/preview-loading-files/preview-loading-files.component';
import { MenuOptionsComponent } from './components/menu-options/menu-options.component';
import { ListAllConversationsComponent } from './components/list-all-conversations/list-all-conversations.component';
import { StarRatingWidgetComponent } from './components/star-rating-widget/star-rating-widget.component';
import { StarRatingWidgetService } from './components/star-rating-widget/star-rating-widget.service';
import { LastMessageComponent } from './components/last-message/last-message.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MarkedPipe } from './directives/marked.pipe';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { TranslateHttpLoader } from '@ngx-translate/http-loader/src/http-loader';
import { ListConversationsComponent } from './components/list-conversations/list-conversations.component';
import { MessageTextAreaComponent } from './components/conversation-detail/conversation-footer/message-text-area/message-text-area.component';
import { ConversationHeaderComponent } from './components/conversation-detail/conversation-header/conversation-header.component';
import { ConversationFooterComponent } from './components/conversation-detail/conversation-footer/conversation-footer.component';





import { ConversationContentComponent } from './components/conversation-detail/conversation-content/conversation-content.component';
import { BubbleMessageComponent } from './components/message/bubble-message/bubble-message.component';
import { TextComponent } from './components/message/text/text.component';
import { ImageComponent } from './components/message/image/image.component';
import { TextButtonComponent } from './components/message/buttons/text-button/text-button.component';
import { FrameComponent } from './components/message/frame/frame.component';
import { LinkButtonComponent } from './components/message/buttons/link-button/link-button.component';
import { ActionButtonComponent } from './components/message/buttons/action-button/action-button.component';
import { AvatarComponent } from './components/message/avatar/avatar.component';
import { ReturnReceiptComponent } from './components/message/return-receipt/return-receipt.component';
import { InfoMessageComponent } from './components/message/info-message/info-message.component';




// **************** CHAT21-CORE ************************ //
//COMPONENTS
import { UserTypingComponent } from '../../src/chat21-core/utils/user-typing/user-typing.component';

//CONSTANTS
import { CHAT_ENGINE_MQTT, CHAT_ENGINE_FIREBASE } from '../../src/chat21-core/utils/constants';

//TRIGGER-HANDLER
import { Triggerhandler } from '../chat21-core/utils/triggerHandler';

//SERVICES
// import { DatabaseProvider } from '../chat21-core/providers/database';
import { ChatManager } from './../chat21-core/providers/chat-manager';
import { CustomTranslateService } from './../chat21-core/providers/custom-translate.service';

//ABSTRACT SERVICES
import { AuthService } from '../chat21-core/providers/abstract/auth.service';
import { ConversationHandlerBuilderService } from '../chat21-core/providers/abstract/conversation-handler-builder.service';
import { ConversationsHandlerService } from '../chat21-core/providers/abstract/conversations-handler.service';
import { ArchivedConversationsHandlerService } from '../chat21-core/providers/abstract/archivedconversations-handler.service';
import { ConversationHandlerService } from '../chat21-core/providers/abstract/conversation-handler.service';
import { ImageRepoService } from '../chat21-core/providers/abstract/image-repo.service';
import { TypingService } from '../chat21-core/providers/abstract/typing.service';
import { PresenceService } from '../chat21-core/providers/abstract/presence.service';
import { UploadService } from '../chat21-core/providers/abstract/upload.service';

//FIREBASE SERVICES
import { FirebaseAuthService } from '../chat21-core/providers/firebase/firebase-auth-service';
import { FirebaseConversationHandlerBuilderService } from '../chat21-core/providers/firebase/firebase-conversation-handler-builder.service';
import { FirebaseConversationsHandler } from '../chat21-core/providers/firebase/firebase-conversations-handler';
import { FirebaseArchivedConversationsHandler } from '../chat21-core/providers/firebase/firebase-archivedconversations-handler';
import { FirebaseConversationHandler } from '../chat21-core/providers/firebase/firebase-conversation-handler';
import { FirebaseTypingService } from '../chat21-core/providers/firebase/firebase-typing.service';
import { FirebasePresenceService } from '../chat21-core/providers/firebase/firebase-presence.service';
import { FirebaseImageRepoService } from '../chat21-core/providers/firebase/firebase-image-repo';
import { FirebaseUploadService } from '../chat21-core/providers/firebase/firebase-upload.service';
import { FirebaseInitService } from '../chat21-core/providers/firebase/firebase-init-service';

// MQTT
import { Chat21Service } from '../chat21-core/providers/mqtt/chat-service';
import { MQTTAuthService } from '../chat21-core/providers/mqtt/mqtt-auth-service';
import { MQTTConversationsHandler } from '../chat21-core/providers/mqtt/mqtt-conversations-handler';
import { MQTTConversationHandlerBuilderService } from '../chat21-core/providers/mqtt/mqtt-conversation-handler-builder.service';
import { MQTTTypingService } from '../chat21-core/providers/mqtt/mqtt-typing.service';
import { MQTTPresenceService } from '../chat21-core/providers/mqtt/mqtt-presence.service';

//LOGGER SERVICES
import { CustomLogger } from '../chat21-core/providers/logger/customLogger';
import { LoggerService } from '../chat21-core/providers/abstract/logger.service';


//APP_STORAGE
import { AppStorageService } from '../chat21-core/providers/abstract/app-storage.service';
import { LocalSessionStorage } from '../chat21-core/providers/localSessionStorage';
import { NativeUploadService } from '../chat21-core/providers/native/native-upload-service';



export class TranslateHttpLoaderCustom implements TranslateLoader {
  constructor(private http: HttpClient, 
              public prefix: string = "/assets/i18n/", 
              public suffix: string = ".json") {}

  public getTranslation(lang: string): Observable<Object> {
    console.log('getTranslation', lang)
      return this.http.get(`${this.prefix}${lang}${this.suffix}`).catch(err => {
        console.log('err', err)
        lang = 'en'
        return this.http.get(`${this.prefix}${lang}${this.suffix}`);
      }); 
  }
}



// FACTORIES
export function createTranslateLoader(http: HttpClient) {
  let localUrl = './assets/i18n/';
  if (location.pathname.includes('/assets/')) {
    localUrl = '../i18n/';
  }
  console.log('translate factoryyyyyyyy APP MODULE')
  return new TranslateHttpLoaderCustom(http, localUrl, '.json');
}

const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    if (environment.remoteConfig) {
      return appConfig.loadAppConfig();
    }
  };
};

export function authenticationFactory(http: HttpClient, appConfig: AppConfigService, chat21Service: Chat21Service, appSorage: AppStorageService ) {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    
    chat21Service.config = appConfig.getConfig().chat21Config;
    chat21Service.initChat();
    console.log("appConfig.getConfig().SERVER_BASE_URL", appConfig.getConfig().apiUrl);
    const auth = new MQTTAuthService(http, chat21Service, appSorage);

    auth.setBaseUrl(appConfig.getConfig().apiUrl)
    return auth;
  } else {

    FirebaseInitService.initFirebase(appConfig.getConfig().firebaseConfig)
    const auth= new FirebaseAuthService(http, appSorage);
    auth.setBaseUrl(appConfig.getConfig().apiUrl)
    return auth
  }
}

export function conversationsHandlerFactory(chat21Service: Chat21Service) {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTConversationsHandler(chat21Service);
  } else {
    return new FirebaseConversationsHandler();
  }
}

export function archivedConversationsHandlerFactory() {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new FirebaseArchivedConversationsHandler();
  } else {
    return new FirebaseArchivedConversationsHandler();
  }
}

export function conversationHandlerBuilderFactory(chat21Service: Chat21Service) {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTConversationHandlerBuilderService(chat21Service);
  } else {
    return new FirebaseConversationHandlerBuilderService();
  }
}

export function conversationHandlerFactory() {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new FirebaseConversationHandler(true);
  } else {
    return new FirebaseConversationHandler(true);
  }
}

export function typingFactory() {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTTypingService();
  } else {
    return new FirebaseTypingService();
  }
}

export function presenceFactory() {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    return new MQTTPresenceService();
  } else {
    return new FirebasePresenceService();
  }
}

export function imageRepoFactory(appConfig: AppConfigService) {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    const imageService = new FirebaseImageRepoService();
    console.log('imageRepoFactory INIT_FIREBASE')
    FirebaseInitService.initFirebase(appConfig.getConfig().firebaseConfig)
    imageService.setImageBaseUrl(appConfig.getConfig().baseImageUrl)
    return imageService
  } else {
    const imageService = new FirebaseImageRepoService();
    FirebaseInitService.initFirebase(appConfig.getConfig().firebaseConfig)
    imageService.setImageBaseUrl(appConfig.getConfig().baseImageUrl)
    return imageService
  }
}

export function uploadFactory(http: HttpClient, appConfig: AppConfigService, appStorage: AppStorageService) {
  if (environment.chatEngine === CHAT_ENGINE_MQTT) {
    const nativeUploadService = new NativeUploadService(http, appStorage)
    nativeUploadService.setBaseUrl(appConfig.getConfig().apiUrl)
    return nativeUploadService
    // return new FirebaseUploadService();
  } else {
    return new FirebaseUploadService();
  }
}

export function loggerFactory() {
  return new CustomLogger(true);
}



@NgModule({
  declarations: [
    AppComponent,
    UserLoginComponent,
    UserProfileComponent,
    StarRatingWidgetComponent,
    SelectionDepartmentComponent,
    HomeConversationsComponent,
    HomeComponent,
    LauncherButtonComponent,
    ConversationComponent,
    PrechatFormComponent,
    EyeeyeCatcherCardComponent,
    PreviewLoadingFilesComponent,
    MenuOptionsComponent,
    ListAllConversationsComponent,
    MessageAttachmentComponent,
    LastMessageComponent,
    MarkedPipe,
    ListConversationsComponent,
    ConversationHeaderComponent,
    UserTypingComponent,
    MessageTextAreaComponent,
    ConversationFooterComponent,
    ConversationContentComponent,
    BubbleMessageComponent,
    TextComponent,
    ImageComponent,
    TextButtonComponent,
    FrameComponent,
    LinkButtonComponent,
    ActionButtonComponent,
    AvatarComponent,
    ReturnReceiptComponent,
    InfoMessageComponent
  ],
  imports: [
    BrowserModule,
    // firebase.initializeApp(environment.firebase),
    // AngularFireModule.initializeApp(environment.firebase),
    // AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    // AngularFireDatabaseModule, // imports firebase/database, only needed for database features
    // AngularFirestoreModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    LinkyModule,
    // https://medium.com/codingthesmartway-com-blog/using-bootstrap-with-angular-c83c3cee3f4a
    // NgbModule.forRoot(),
    LocalStorageModule.withConfig({
      prefix: 'chat21-web-widget',
      storageType: 'localStorage'
     }),
    MomentModule,
    AngularResizedEventModule,
    TranslateModule.forRoot(//),
    {
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }), 
    TooltipModule,
    //RouterModule.forRoot([])
  ],
  providers: [
    AppConfigService, // https://juristr.com/blog/2018/01/ng-app-runtime-config/
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigService]
    },
    {
      provide: AuthService,
      useFactory: authenticationFactory,
      deps: [HttpClient, AppConfigService, Chat21Service, AppStorageService ]
    },
    {
      provide: ConversationsHandlerService,
      useFactory: conversationsHandlerFactory,
      deps: [Chat21Service]
    },
    {
      provide: ArchivedConversationsHandlerService,
      useFactory: archivedConversationsHandlerFactory,
      deps: []
    },
    {
      provide: ConversationHandlerBuilderService,
      useFactory: conversationHandlerBuilderFactory,
      deps: [Chat21Service]
    },
    {
      provide: ConversationHandlerService,
      useFactory: conversationHandlerFactory,
      deps: []
    },
    {
      provide: TypingService,
      useFactory: typingFactory,
      deps: []
    },
    {
      provide: PresenceService,
      useFactory: presenceFactory,
      deps: []
    },
    {
      provide: ImageRepoService,
      useFactory: imageRepoFactory,
      deps: [AppConfigService]
    },
    {
      provide: UploadService,
      useFactory: uploadFactory,
      deps: [HttpClient, AppConfigService, AppStorageService ]
    },
    {
      provide: LoggerService,
      useFactory: loggerFactory,
      deps: []
    },
    {
      provide: AppStorageService,
      useClass: LocalSessionStorage
    },
    //AuthService,
    //MessagingService,
    Globals,
    GlobalSettingsService,
    SettingsSaverService,
    ConversationsService,
    //UploadService,
    ContactService,
    StarRatingWidgetService,
    AgentAvailabilityService,
    TranslatorService,
    //ChatPresenceHandlerService,
    StorageService,
    WaitingService,
    //********chat21-core***********//
    CustomTranslateService,
    ChatManager,
    Triggerhandler,
    Chat21Service
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
