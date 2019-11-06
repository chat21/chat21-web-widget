import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
// import { AngularFireModule } from '@angular/fire';
// import { AngularFirestoreModule } from '@angular/fire/firestore';
// import { AngularFireDatabaseModule } from '@angular/fire/database';
// import { AngularFireAuthModule } from '@angular/fire/auth';
// import * as firebase from 'firebase';

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
import { AuthService } from './providers/auth.service';
import { MessagingService } from './providers/messaging.service';
import { ConversationsService } from './providers/conversations.service';
import { UploadService } from './providers/upload.service';
import { ContactService } from './providers/contact.service';
import { AgentAvailabilityService } from './providers/agent-availability.service';
import { TranslatorService } from './providers/translator.service';
import { WaitingService } from './providers/waiting.service';
import { AppConfigService } from './providers/app-config.service';


// components
import { SelectionDepartmentComponent } from './components/selection-department/selection-department.component';
import { ListConversationsComponent } from './components/list-conversations/list-conversations.component';
import { HomeComponent } from './components/home/home.component';
import { LauncherButtonComponent } from './components/launcher-button/launcher-button.component';
import { ConversationComponent } from './components/conversation/conversation.component';
import { MessageAttachmentComponent } from './components/message-attachment/message-attachment.component';
import { PrechatFormComponent } from './components/prechat-form/prechat-form.component';
import { EyeeyeCatcherCardComponent } from './components/eyeeye-catcher-card/eyeeye-catcher-card.component';
import { PreviewLoadingFilesComponent } from './components/preview-loading-files/preview-loading-files.component';
import { MenuOptionsComponent } from './components/menu-options/menu-options.component';
import { ListAllConversationsComponent } from './components/list-all-conversations/list-all-conversations.component';
import { StarRatingWidgetComponent } from './components/star-rating-widget/star-rating-widget.component';
import { StarRatingWidgetService } from './components/star-rating-widget/star-rating-widget.service';
import { LastMessageComponent } from './components/last-message/last-message.component';


const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    if (environment.remoteConfig) {
      return appConfig.loadAppConfig();
    }
  };
};


@NgModule({
  declarations: [
    AppComponent,
    UserLoginComponent,
    UserProfileComponent,
    StarRatingWidgetComponent,
    SelectionDepartmentComponent,
    ListConversationsComponent,
    HomeComponent,
    LauncherButtonComponent,
    ConversationComponent,
    PrechatFormComponent,
    EyeeyeCatcherCardComponent,
    PreviewLoadingFilesComponent,
    MenuOptionsComponent,
    ListAllConversationsComponent,
    MessageAttachmentComponent,
    LastMessageComponent
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
    AngularResizedEventModule
  ],
  providers: [
    AppConfigService, // https://juristr.com/blog/2018/01/ng-app-runtime-config/
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigService]
    },
    AuthService,
    MessagingService,
    Globals,
    GlobalSettingsService,
    SettingsSaverService,
    ConversationsService,
    UploadService,
    ContactService,
    StarRatingWidgetService,
    AgentAvailabilityService,
    TranslatorService,
    ChatPresenceHandlerService,
    StorageService,
    WaitingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
