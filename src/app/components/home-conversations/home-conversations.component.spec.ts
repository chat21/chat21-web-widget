import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeConversationsComponent } from './home-conversations.component';

describe('ListConversationsComponent', () => {
  let component: HomeConversationsComponent;
  let fixture: ComponentFixture<HomeConversationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeConversationsComponent ]
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
