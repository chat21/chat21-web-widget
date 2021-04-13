import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'tiledeskwidget-link-button-attachment',
  templateUrl: './link-button.component.html',
  styleUrls: ['./link-button.component.scss']
})
export class LinkButtonComponent implements OnInit {

  @Input() button: any;
  @Input() themeColor: string;
  @Input() foregroundColor: string;
  @Output() onButtonClicked = new EventEmitter();
  public type: string = "url"
  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    //decomment if element should have same color of themeColor and fregroundColor
    // this.elementRef.nativeElement.style.setProperty('--themeColor', this.themeColor);
    // this.elementRef.nativeElement.style.setProperty('--foregroundColor', this.foregroundColor);
  }

  actionButtonUrl(){
    if ( this.button && this.button.link && this.button.link !== '') {
      const event = { target: this, currentTarget: this}
      this.onButtonClicked.emit(event);
    }
  }

}
