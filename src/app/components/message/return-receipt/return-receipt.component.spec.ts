import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnReceiptComponent } from './return-receipt.component';

describe('ReturnReceiptComponent', () => {
  let component: ReturnReceiptComponent;
  let fixture: ComponentFixture<ReturnReceiptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReturnReceiptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
