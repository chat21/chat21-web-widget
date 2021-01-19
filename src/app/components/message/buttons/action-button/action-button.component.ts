import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'tiledeskwidget-action-button-attachment',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss']
})
export class ActionButtonComponent implements OnInit {

  @Input() button: any;
  @Input() themeColor: string;
  @Input() foregroundColor: string;
  @Output() onButtonClicked = new EventEmitter();
  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.elementRef.nativeElement.style.setProperty('--themeColor', this.themeColor);
    this.elementRef.nativeElement.style.setProperty('--foregroundColor', this.foregroundColor);
  }

  actionButtonAction(){
    if ( this.button && this.button.action && this.button.action !== '') {
      const spanCheck = window.document.getElementById('actionButton');
      if (spanCheck) {
        spanCheck.classList.add('active');
        setTimeout(function() {
          spanCheck.classList.remove('active');
        }, 400);
      }
      this.onButtonClicked.emit(this.button);
    }
  }

}
