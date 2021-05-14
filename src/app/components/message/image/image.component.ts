import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'tiledeskwidget-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  @Input() metadata: any;
  @Input() width: string;
  @Input() height: number;
  loading: boolean = true
  
  constructor(private cdref: ChangeDetectorRef) { }

  ngOnInit() {
  }

  onLoaded(){
    console.log('image loadeddddd');
    this.loading = false
  }


}
