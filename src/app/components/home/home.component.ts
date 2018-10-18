import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Globals } from '../../utils/globals';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None, /* it allows to customize 'Powered By' */
})
export class HomeComponent implements OnInit {
  // ========= begin:: Input/Output values ===========/
  @Output() eventNewConv = new EventEmitter<string>();
  @Output() eventSelctedConv = new EventEmitter<string>();
  @Output() eventClose = new EventEmitter();
  @Input() senderId: string; // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  // ========= end:: Input/Output values ===========/


  // ========= begin:: component variables ======= //
  themeColor;
  themeForegroundColor;
  tenant;
  widgetTitle;
  wellcomeMsg;
  WELLCOME_TITLE;
  // ========= end:: component variables ======= //

  constructor(
    public g: Globals
  ) {

  }

  ngOnInit() {
    console.log('ngOnInit app-home');
    // get global variables
    this.tenant = this.g.tenant;
    this.themeColor = this.g.themeColor;
    this.themeForegroundColor = this.g.themeForegroundColor;
    this.widgetTitle = this.g.widgetTitle;
    this.wellcomeMsg = this.g.wellcomeMsg;
    this.WELLCOME_TITLE = this.g.WELLCOME_TITLE;
  }


  // ========= begin:: ACTIONS ============//
  returnNewConversation() {
    this.eventNewConv.emit();
  }

  returnSelectedConversation($event) {
    if ( $event ) {
      this.eventSelctedConv.emit($event);
    }
  }

  f21_close() {
    this.eventClose.emit();
  }
  // ========= end:: ACTIONS ============//

}
