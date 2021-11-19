import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';


@Component({
  selector: 'chat-text-button-attachment',
  templateUrl: './text-button.component.html',
  styleUrls: ['./text-button.component.scss']
})
export class TextButtonComponent implements OnInit {

  @Input() button: any;
  @Input() fontSize: string;
  @Input() themeColor: string;
  @Input() foregroundColor: string;
  @Output() onButtonClicked = new EventEmitter();

  public type: string = "text"
  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges){
    //decomment if element should have same color of themeColor and fregroundColor
    if(this.fontSize) this.elementRef.nativeElement.querySelector('.text').style.setProperty('--buttonFontSize', this.fontSize);
    if(this.themeColor) this.elementRef.nativeElement.querySelector('.text').style.setProperty('--themeColor', this.themeColor);
    if(this.foregroundColor) this.elementRef.nativeElement.querySelector('.text').style.setProperty('--foregroundColor', this.foregroundColor);
  }

  onMouseOver(event){
    if(this.themeColor) this.elementRef.nativeElement.querySelector('.text').style.background = this.themeColor
    if(this.foregroundColor) this.elementRef.nativeElement.querySelector('.text').style.color = this.foregroundColor
  }

  onMouseOut(event){
    this.elementRef.nativeElement.querySelector('.text').style.color = '';
    this.elementRef.nativeElement.querySelector('.text').style.background = ''
  }

  actionButtonText(){
    const event = { target: this, currentTarget: this}
    this.onButtonClicked.emit(event)
  }

}
