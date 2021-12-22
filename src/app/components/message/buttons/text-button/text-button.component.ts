import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';


@Component({
  selector: 'chat-text-button-attachment',
  templateUrl: './text-button.component.html',
  styleUrls: ['./text-button.component.scss']
})
export class TextButtonComponent implements OnInit {

  @Input() button: any;
  @Input() fontSize: string;
  @Input() backgroundColor: string;
  @Input() textColor: string;
  @Input() hoverBackgroundColor: string;
  @Input() hoverTextColor: string;
  @Output() onButtonClicked = new EventEmitter();

  public type: string = "text"
  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges){
    //decomment if element should have same color of themeColor and fregroundColor
    if(this.fontSize) this.elementRef.nativeElement.querySelector('.text').style.setProperty('--buttonFontSize', this.fontSize);
    if(this.backgroundColor) this.elementRef.nativeElement.querySelector('.text').style.setProperty('--backgroundColor', this.backgroundColor);
    if(this.textColor) this.elementRef.nativeElement.querySelector('.text').style.setProperty('--textColor', this.textColor);
    if(this.hoverBackgroundColor) this.elementRef.nativeElement.querySelector('.text').style.setProperty('--hoverBackgroundColor', this.hoverBackgroundColor);
    if(this.hoverTextColor) this.elementRef.nativeElement.querySelector('.text').style.setProperty('--hoverTextColor', this.hoverTextColor);
  }

  onMouseOver(event){
    // if(this.backgroundColor) this.elementRef.nativeElement.querySelector('.text').style.background = this.textColor
    // if(this.textColor) this.elementRef.nativeElement.querySelector('.text').style.color = this.backgroundColor
  }

  onMouseOut(event){
    // this.elementRef.nativeElement.querySelector('.text').style.color = '';
    // this.elementRef.nativeElement.querySelector('.text').style.background = ''
  }

  actionButtonText(){
    const event = { target: this, currentTarget: this}
    this.onButtonClicked.emit(event)
  }

}
