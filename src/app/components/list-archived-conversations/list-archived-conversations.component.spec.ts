import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListArchivedConversationsComponent } from './list-archived-conversations.component';

describe('ListArchivedConversationsComponent', () => {
  let component: ListArchivedConversationsComponent;
  let fixture: ComponentFixture<ListArchivedConversationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListArchivedConversationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListArchivedConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
