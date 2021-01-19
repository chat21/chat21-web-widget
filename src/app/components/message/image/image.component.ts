import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MAX_WIDTH_IMAGES,} from '../../../utils/constants';
@Component({
  selector: 'tiledeskwidget-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  @Input() metadata: Array<any>;
  @Input() width: string;
  @Input() height: number;

  constructor(private cdref: ChangeDetectorRef) { }

  ngOnInit() {
  }


}
