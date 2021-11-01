import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';


@Component({
  selector: 'chat-text-button-attachment',
  templateUrl: './text-button.component.html',
  styleUrls: ['./text-button.component.scss']
})
export class TextButtonComponent implements OnInit {

  @Input() button: any;
  @Input() themeColor: string;
  @Input() foregroundColor: string;
  @Output() onButtonClicked = new EventEmitter();

  public type: string = "text"
  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    //decomment if element should have same color of themeColor and fregroundColor
    this.elementRef.nativeElement.querySelector('.text').style.setProperty('--themeColor', this.themeColor);
    this.elementRef.nativeElement.querySelector('.text').style.setProperty('--foregroundColor', this.foregroundColor);
  }

  onMouseOver(event){
    this.elementRef.nativeElement.querySelector('.text').style.color = this.foregroundColor
    this.elementRef.nativeElement.querySelector('.text').style.background = this.themeColor
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
