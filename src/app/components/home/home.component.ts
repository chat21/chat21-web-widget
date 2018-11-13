import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Globals } from '../../utils/globals';
import { TranslatorService } from '../../providers/translator.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // @Input() themeColor: string;
  // @Input() themeForegroundColor: string;
  // @Input() senderId: string;
  // @Input() tenant: string;
  @Output() eventNewConv = new EventEmitter<string>();
  @Output() eventSelctedConv = new EventEmitter<string>();
  @Output() eventClose = new EventEmitter<string>();


  themeColor;
  themeForegroundColor;
  senderId;
  tenant;
  widgetTitle;
  wellcomeMsg;

  lang: string;
  WELLCOME_TITLE: string;
  

  constructor(
    public globals: Globals,
    private translatorService: TranslatorService
  ) {
    this.lang = this.globals.lang;

    // get global variables
    this.themeColor = this.globals.tenant;
    this.senderId = this.globals.senderId;
    this.themeColor = this.globals.themeColor;
    this.themeForegroundColor = this.globals.themeForegroundColor;

    this.widgetTitle = this.globals.widgetTitle;
    this.wellcomeMsg = this.globals.wellcomeMsg;

     /** set lang and translate */
     this.translatorService.setLanguage(!this.lang ? 'en' : this.lang);
     this.translate();
   }

  ngOnInit() {
    console.log('*******************>>>>>>>>>>>>> ngOnInit HomeComponent', this.senderId, this.tenant);
  }

  private translate() {
    this.WELLCOME_TITLE = this.translatorService.translate('WELLCOME_TITLE');
  }

  returnNewConversation() {
    this.eventNewConv.emit();
  }

  returnSelectedConversation($event) {
    if ( $event ) {
      console.log('onSelectConversation: ', $event);
      this.eventSelctedConv.emit($event);
    }
  }

  f21_close() {
    this.eventClose.emit();
  }
}
