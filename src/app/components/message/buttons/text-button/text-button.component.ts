import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';


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
    // this.elementRef.nativeElement.style.setProperty('--themeColor', this.themeColor);
    // this.elementRef.nativeElement.style.setProperty('--foregroundColor', this.foregroundColor);
  }

  actionButtonText(){
    const event = { target: this, currentTarget: this}
    this.onButtonClicked.emit(event)
  }

}
