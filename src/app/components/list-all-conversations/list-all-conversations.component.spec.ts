import { CustomTranslateService } from './../../../chat21-core/providers/custom-translate.service';
import { NO_ERRORS_SCHEMA, IterableDiffers, IterableDifferFactory } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Globals } from '../../utils/globals';

import { ListAllConversationsComponent } from './list-all-conversations.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('ListAllConversationsComponent', () => {
  let component: ListAllConversationsComponent;
  let fixture: ComponentFixture<ListAllConversationsComponent>;
  
  class MockIterableDiffers implements IterableDiffers {
    factories: IterableDifferFactory[];
    find(iterable: any): IterableDifferFactory {
      return 
    }
    create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers {
      return 
    }
}

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListAllConversationsComponent ],
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        Globals,
        { provide: IterableDiffers, useClass: MockIterableDiffers },
        CustomTranslateService,
        TranslateService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAllConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
