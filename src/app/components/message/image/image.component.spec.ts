import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageComponent } from './image.component';

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    component.metadata = {
      height: 650,
      name: "logo_fb.png",
      src: "https://firebasestorage.googleapis.com/v0/b/chat21-pre-01.appspot.com/o/public%2Fimages%2F42083ab3-3aa6-4507-831c-41c84b09dd83%2F0e8e8562-360e-4407-aa20-a0ccbe99b62d%2Flogo_fb.png?alt=media&token=8125435a-76ac-42f0-9017-cf3d8fb4e8a1",
      type: "image/png",
      uid: "ksg7sxnt",
      width: 650
    }
    component.width = '650px'
    component.height = 650
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
