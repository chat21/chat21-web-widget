import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AngularFireModule } from 'angularfire2';
// import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';
import { HttpClientModule} from '@angular/common/http';



import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// import {MdButtonModule, MdListModule, MdToolbarModule} from '@angular/material';
// import { FlexLayoutModule } from '@angular/flex-layout';
// import {MdInputModule} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocalStorageModule } from 'angular-2-local-storage';
import { MomentModule } from 'angular2-moment';
import { UserLoginComponent } from './users/user-login/user-login.component';
import { UserProfileComponent } from './users/user-profile/user-profile.component';


import { AuthService } from './core/auth.service';
import { MessagingService } from './providers/messaging.service';
import { UploadService } from './providers/upload.service';
import { ContactService } from './providers/contact.service';
import { StarRatingWidgetComponent } from './components/star-rating-widget/star-rating-widget.component';
import { StarRatingWidgetService } from './components/star-rating-widget/star-rating-widget.service';

// begin translations
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { WebpackTranslateLoader } from './providers/webpack-translate-loader';
// end translations


@NgModule({
  declarations: [
    AppComponent,
    UserLoginComponent,
    UserProfileComponent,
    StarRatingWidgetComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    AngularFireDatabaseModule, // imports firebase/database, only needed for database features
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    // https://medium.com/codingthesmartway-com-blog/using-bootstrap-with-angular-c83c3cee3f4a
    // NgbModule.forRoot(),
    LocalStorageModule.withConfig({
      prefix: 'chat21-web-widget',
      storageType: 'localStorage'
     }),
    MomentModule,
   // source : https://ionicframework.com/docs/developer-resources/ng2-translate/
    // TranslateModule.forRoot(
    //   {
    //     loader: {
    //       provide: TranslateLoader,
    //       useFactory: (createTranslateLoader),
    //       deps: [HttpClient]
    //     }
    //   }
    //   //  {
    //   //  loader: {
    //   //     provide: TranslateLoader,
    //   //     useFactory: HttpLoaderFactory,
    //   //     deps: [HttpClient]
    //   //   }
    //   // }
    // )

    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useClass: WebpackTranslateLoader
    //   }
    // })
  ],
  providers: [
    AuthService,
    MessagingService,
    UploadService,
    ContactService,
    StarRatingWidgetService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// // AoT requires an exported function for factories
// export function HttpLoaderFactory(http: HttpClient) {
//     return new TranslateHttpLoader(http);
// }

// export function createTranslateLoader(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }


// export function createTranslateLoader(http: HttpClient) {
//   return new TranslateHttpLoader(http, 'https://widget.tiledesk.com/assets/i18n/', '.json');
// }