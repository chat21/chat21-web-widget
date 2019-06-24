import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Globals } from '../../utils/globals';
import { convertColorToRGBA } from '../../utils/utils';



@Component({
  selector: 'tiledeskwidget-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None, /* it allows to customize 'Powered By' */
})
export class HomeComponent implements OnInit, AfterViewInit {
  // ========= begin:: Input/Output values ===========/
  @Output() eventNewConv = new EventEmitter<string>();
  @Output() eventSelctedConv = new EventEmitter<string>();
  @Output() eventClose = new EventEmitter();
  @Output() eventSignOut = new EventEmitter();
  @Output() eventOpenAllConv = new EventEmitter();
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
  isShow = false;
  // ========= end:: component variables ======= //




  constructor(
    public g: Globals
  ) {

  }

  ngOnInit() {
    // get global variables
    this.g.wdLog(['ngOnInit app-home']);
    this.tenant = this.g.tenant;
    this.themeColor = this.g.themeColor;
    this.colorBck = this.themeColor;
    this.themeForegroundColor = this.g.themeForegroundColor;
    this.widgetTitle = this.g.widgetTitle;
    this.wellcomeMsg = this.g.wellcomeMsg;
    this.wellcomeTitle = this.g.wellcomeTitle;
    // https://stackoverflow.com/questions/7015302/css-hexadecimal-rgba
    this.themeColor50 = convertColorToRGBA(this.themeColor, 30); // this.g.themeColor + 'CC';
    this.colorGradient = 'linear-gradient(' + this.themeColor + ', ' + this.themeColor50 + ')';
    this.colorBck = '#000000';
    this.isShow = true;
  }

  ngAfterViewInit() {
  }

  // ========= begin:: ACTIONS ============//
  returnNewConversation() {
    this.eventNewConv.emit();
  }

  returnOpenAllConversation() {
    this.eventOpenAllConv.emit();
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
    this.g.wdLog(['hideMenuOptions']);
    // this.g.isOpenMenuOptions = false;
    this.g.setParameter('isOpenMenuOptions', false);
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
