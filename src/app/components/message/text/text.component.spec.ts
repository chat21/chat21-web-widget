import { HtmlEntitiesEncodePipe } from './../../../directives/html-entities-encode.pipe';
import { MarkedPipe } from './../../../directives/marked.pipe';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextComponent } from './text.component';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        TextComponent,
        MarkedPipe,
        HtmlEntitiesEncodePipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
    component.text = 'Msg text'
    component.color= 'black'
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
