import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Component, ElementRef, Input, OnInit, SimpleChange, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'chat-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss']
})
export class HtmlComponent implements OnInit {

  @Input() htmlText: string;
  @Input() fontSize: string;
  @Input() themeColor: string;
  @Input() foregroundColor: string;

  @ViewChild('htmlCode') container;
  
  constructor(private elementRef: ElementRef) { }

  ngOnInit(){

  }

  ngOnChanges(changes: SimpleChanges){
    //decomment if element should have same color of themeColor and fregroundColor
    if(this.fontSize) this.elementRef.nativeElement.style.setProperty('--buttonFontSize', this.fontSize);
    if(this.themeColor) this.elementRef.nativeElement.style.setProperty('--themeColor', this.themeColor);
    if(this.foregroundColor) this.elementRef.nativeElement.style.setProperty('--foregroundColor', this.foregroundColor);
  }

  

}
