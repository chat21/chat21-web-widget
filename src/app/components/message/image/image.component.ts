import { Component, Input, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'chat-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  @Input() metadata: any;
  @Input() width: string;
  @Input() height: number;
  @Output() onImageRendered = new EventEmitter<boolean>();
  loading: boolean = true

  constructor() { }

  ngOnInit() {
  }

  onLoaded(event){
      this.loading = false
      this.onImageRendered.emit(true)
  }


}
