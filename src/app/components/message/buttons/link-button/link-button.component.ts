import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'chat-link-button-attachment',
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
    this.elementRef.nativeElement.querySelector('.url').style.setProperty('--themeColor', this.themeColor);
    this.elementRef.nativeElement.querySelector('.url').style.setProperty('--foregroundColor', this.foregroundColor);
  }

  onMouseOver(event){
    this.elementRef.nativeElement.querySelector('.url').style.color = this.foregroundColor
    this.elementRef.nativeElement.querySelector('.url').style.background = this.themeColor
  }

  onMouseOut(event){
    this.elementRef.nativeElement.querySelector('.url').style.color = '';
    this.elementRef.nativeElement.querySelector('.url').style.background = ''
  }

  actionButtonUrl(){
    if ( this.button && this.button.link && this.button.link !== '') {
      const event = { target: this, currentTarget: this}
      this.onButtonClicked.emit(event);
    }
  }

}
