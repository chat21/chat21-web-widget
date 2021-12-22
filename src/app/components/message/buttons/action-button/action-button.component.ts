import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'chat-action-button-attachment',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss']
})
export class ActionButtonComponent implements OnInit {

  @Input() button: any;
  @Input() fontSize: string;
  @Input() backgroundColor: string;
  @Input() textColor: string;
  @Input() hoverBackgroundColor: string;
  @Input() hoverTextColor: string;
  @Output() onButtonClicked = new EventEmitter();

  public type: string = "action"
  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges){
    //decomment if element should have same color of themeColor and fregroundColor
    if(this.fontSize) this.elementRef.nativeElement.querySelector('.action').style.setProperty('--buttonFontSize', this.fontSize);
    if(this.backgroundColor) this.elementRef.nativeElement.querySelector('.action').style.setProperty('--backgroundColor', this.backgroundColor);
    if(this.textColor) this.elementRef.nativeElement.querySelector('.action').style.setProperty('--textColor', this.textColor);
    if(this.hoverBackgroundColor) this.elementRef.nativeElement.querySelector('.action').style.setProperty('--hoverBackgroundColor', this.hoverBackgroundColor);
    if(this.hoverTextColor) this.elementRef.nativeElement.querySelector('.action').style.setProperty('--hoverTextColor', this.hoverTextColor);
  }

  onMouseOver(event){
    // if(this.themeColor) this.elementRef.nativeElement.querySelector('.action').style.background = this.themeColor
    // if(this.foregroundColor) this.elementRef.nativeElement.querySelector('.action').style.color = this.foregroundColor
  }

  onMouseOut(event){
    // this.elementRef.nativeElement.querySelector('.action').style.color = '';
    // this.elementRef.nativeElement.querySelector('.action').style.background = ''
  }

  actionButtonAction(){
    if ( this.button && this.button.action && this.button.action !== '') {
      // const spanCheck = window.document.getElementById('actionButton');
      const spanCheck = this.elementRef.nativeElement.querySelector('.action');
      // const spanCheck = document.getElementsByClassName('action');
      if (spanCheck) {
        // const item = domRepresentation[0] as HTMLInputElement;
        if (!spanCheck.classList.contains('active')) {
          spanCheck.classList.add('active');
        }
        setTimeout(function() {
          if (spanCheck.classList.contains('active')) {
            spanCheck.classList.remove('active');
          }
        }, 400);
      }
      const event = { target: this, currentTarget: this}
      this.onButtonClicked.emit(event);
    }
  }

}
