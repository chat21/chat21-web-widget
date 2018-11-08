import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Globals } from '../../utils/globals';

@Component({
  selector: 'tiledeskwidget-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None, /* it allows to customize 'Powered By' */
})
export class HomeComponent implements OnInit {
  // ========= begin:: Input/Output values ===========/
  @Output() eventNewConv = new EventEmitter<string>();
  @Output() eventSelctedConv = new EventEmitter<string>();
  @Output() eventClose = new EventEmitter();
  @Output() eventSignOut = new EventEmitter();
  @Output() eventOpenArchivedConv = new EventEmitter();
  @Input() senderId: string; // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  // ========= end:: Input/Output values ===========/


  // ========= begin:: component variables ======= //
  themeColor;
  themeForegroundColor;
  tenant;
  widgetTitle;
  wellcomeMsg;
  wellcomeTitle;
  themeColor50: string;
  colorGradient: string;
  colorBck: string;
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
    this.wellcomeTitle = this.g.wellcomeTitle;
    // https://stackoverflow.com/questions/7015302/css-hexadecimal-rgba
    this.themeColor50 = this.g.themeColor + '7F';

    this.colorGradient = 'linear-gradient(' + this.g.themeColor + ', ' + this.themeColor50 + ')';
    this.colorBck = '#000000';

  }


  // ========= begin:: ACTIONS ============//
  returnNewConversation() {
    this.eventNewConv.emit();
  }
  
  returnOpenArchivedConversation() {
    this.eventOpenArchivedConv.emit();
  }

  returnSelectedConversation($event) {
    if ( $event ) {
      this.eventSelctedConv.emit($event);
    }
  }

  f21_close() {
    this.eventClose.emit();
  }

  hideMenuOptions() {
    console.log('hideMenuOptions');
    this.g.isOpenMenuOptions = false;
  }


  /**
   * MODAL MENU SETTINGS:
   * logout
   */
  returnSignOut() {
    this.eventSignOut.emit();
  }

  // ========= end:: ACTIONS ============//

}
