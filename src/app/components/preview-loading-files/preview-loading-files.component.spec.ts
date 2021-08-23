import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Globals } from '../../utils/globals';

import { PreviewLoadingFilesComponent } from './preview-loading-files.component';

describe('PreviewLoadingFilesComponent', () => {
  let fixture: ComponentFixture<PreviewLoadingFilesComponent>;
  let component: PreviewLoadingFilesComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewLoadingFilesComponent ],
      providers: [ Globals ]
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
