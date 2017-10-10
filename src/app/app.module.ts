import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// import {MdButtonModule, MdListModule, MdToolbarModule} from '@angular/material';
// import { FlexLayoutModule } from '@angular/flex-layout';
// import {MdInputModule} from '@angular/material';
import { FormsModule } from '@angular/forms';
//import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { LocalStorageModule } from 'angular-2-local-storage';
import { MomentModule } from 'angular2-moment';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule, // imports firebase/database, only needed for database features
    BrowserAnimationsModule,
    // MdButtonModule,
    // MdListModule,
    // MdToolbarModule,
    // FlexLayoutModule,
    // MdInputModule,
    FormsModule,
    // https://medium.com/codingthesmartway-com-blog/using-bootstrap-with-angular-c83c3cee3f4a
    //NgbModule.forRoot(),
    LocalStorageModule.withConfig({
      prefix: 'chat21-web-widget',
      storageType: 'localStorage'
     }),
     MomentModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
