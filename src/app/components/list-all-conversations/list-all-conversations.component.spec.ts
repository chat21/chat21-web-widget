import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAllConversationsComponent } from './list-all-conversations.component';

describe('ListAllConversationsComponent', () => {
  let component: ListAllConversationsComponent;
  let fixture: ComponentFixture<ListAllConversationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListAllConversationsComponent ]
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
