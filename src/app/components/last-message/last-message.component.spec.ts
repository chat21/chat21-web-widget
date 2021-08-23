import { MarkedPipe } from './../../directives/marked.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageRepoService } from '../../../chat21-core/providers/abstract/image-repo.service';
import { Globals } from '../../utils/globals';

import { LastMessageComponent } from './last-message.component';
import { HtmlEntitiesEncodePipe } from '../../directives/html-entities-encode.pipe';
import { MomentModule } from 'angular2-moment';

describe('LastMessageComponent', () => {
  let component: LastMessageComponent;
  let fixture: ComponentFixture<LastMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        LastMessageComponent,
        MarkedPipe,
        HtmlEntitiesEncodePipe
      ],
      imports: [  
        MomentModule
      ],
      providers: [
        Globals,
        ImageRepoService,
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
