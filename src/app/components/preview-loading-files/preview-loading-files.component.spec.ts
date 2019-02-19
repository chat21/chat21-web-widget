import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewLoadingFilesComponent } from './preview-loading-files.component';

describe('PreviewLoadingFilesComponent', () => {
  let component: PreviewLoadingFilesComponent;
  let fixture: ComponentFixture<PreviewLoadingFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewLoadingFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewLoadingFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
