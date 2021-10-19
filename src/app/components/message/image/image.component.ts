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
  tooltipMessage: string;

  tooltipOptions = {
    'show-delay': 0,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };
  constructor() { }

  ngOnInit() {
  }

  onLoaded(event){
    this.loading = false
    this.onImageRendered.emit(true)
  }

  downloadImage(url: string, fileName: string) {
    // console.log('Image COMP - IMAGE URL ', url) 
    // console.log('Image COMP - IMAGE FILENAME ', fileName) 
    const a: any = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  }


}
