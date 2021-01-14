import { Component, Input, OnInit } from '@angular/core';
import { MAX_WIDTH_IMAGES,} from '../../../utils/constants';
@Component({
  selector: 'tiledeskwidget-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  @Input() metadata: Array<any>;
  @Input() width: number;
  @Input() height: number;
  
  constructor() { }

  ngOnInit() {
  }

  /**
   *
   * @param metadata
   */
  getSizeImg(metadata): any {
    const sizeImage = {
        width: metadata.width,
        height: metadata.height
    };
    if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
        const rapporto = (metadata['width'] / metadata['height']);
        sizeImage.width = MAX_WIDTH_IMAGES;
        sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
    }
    return sizeImage; // h.toString();
  }

}
