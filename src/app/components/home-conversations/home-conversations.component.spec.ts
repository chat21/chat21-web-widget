import { CustomTranslateService } from './../../../chat21-core/providers/custom-translate.service';
import { TranslatorService } from './../../providers/translator.service';
import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from './../../providers/app-config.service';
import { HttpModule } from '@angular/http';
import { WaitingService } from './../../providers/waiting.service';
import { ContactService } from './../../providers/contact.service';
import { ChatManager } from './../../../chat21-core/providers/chat-manager';
import { Globals } from './../../utils/globals';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeConversationsComponent } from './home-conversations.component';
import { ImageRepoService } from '../../../chat21-core/providers/abstract/image-repo.service';
import { ConversationsHandlerService } from '../../../chat21-core/providers/abstract/conversations-handler.service';
import { ArchivedConversationsHandlerService } from '../../../chat21-core/providers/abstract/archivedconversations-handler.service';
import { TranslateModule } from '@ngx-translate/core';

describe('HomeConversationsComponent', () => {
  let component: HomeConversationsComponent;
  let fixture: ComponentFixture<HomeConversationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeConversationsComponent ],
      imports: [
        HttpModule,
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [
        Globals,
        ImageRepoService,
        ChatManager,
        ConversationsHandlerService,
        ArchivedConversationsHandlerService,
        WaitingService,
        AppConfigService,
        TranslatorService,
        CustomTranslateService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
