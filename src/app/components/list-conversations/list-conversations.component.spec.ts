import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListConversationsComponent } from './list-conversations.component';

describe('ListConversationsComponent', () => {
  let component: ListConversationsComponent;
  let fixture: ComponentFixture<ListConversationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListConversationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
