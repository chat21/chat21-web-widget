import { Globals } from './../../../utils/globals';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { convertColorToRGBA } from '../../../../chat21-core/utils/utils';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { slideInOutAnimation } from '../../../_animations/slide-in-out.animation';
@Component({
  selector: 'chat-interlal-frame',
  templateUrl: './interlal-frame.component.html',
  styleUrls: ['./interlal-frame.component.scss'],
})
export class InterlalFrameComponent implements OnInit {
  
  @Input() url: any;
  @Input() styleMap: Map<string, string>
  @Input() translationMap: Map< string, string>;
  @Output() onBack = new EventEmitter();
  @Output() onClose = new EventEmitter();

  public hideSpinner: boolean = false;
  @ViewChild('iframe') iframe: ElementRef;
  convertColorToRGBA = convertColorToRGBA;
  constructor(private sanitizer: DomSanitizer,
              private g: Globals) { }

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);    
  }
  
  ngAfterViewInit(){
    let doc = this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow;
    console.log('ngAfterViewInit iframee', doc, this.iframe.nativeElement.contentWindow)
  }

  ngOnDestroy(){
    this.url = null;
    this.hideSpinner = false;
  }

  returnClose(){
    this.onClose.emit();    
  }


  returnBack(){

    this.g.windowContext.window.history.back();
    console.log('returnBack INTERNAL FRAME COMPONENT', this.iframe.nativeElement.src, this.iframe.nativeElement.contentWindow.history);
    console.log('returnBack INTERNAL FRAME COMPONENT', this.g.windowContext.history, this.g.windowContext.window.history.length)
  }

  onIframeLoaded(event){
    console.log('iframe loaded', event)
    this.hideSpinner = true
  }

}
