import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from './../../../providers/app-config.service';
import { Globals } from './../../../utils/globals';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationHeaderComponent } from './conversation-header.component';
import { TypingService } from '../../../../chat21-core/providers/abstract/typing.service';

describe('ConversationHeaderComponent', () => {
  let component: ConversationHeaderComponent;
  let fixture: ComponentFixture<ConversationHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationHeaderComponent ],
      imports: [
        HttpClientModule
      ],
      providers: [ 
        Globals,
        TypingService,
        AppConfigService
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
