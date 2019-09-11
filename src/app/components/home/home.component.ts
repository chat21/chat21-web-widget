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
  tenant;
  widgetTitle;
  wellcomeMsg;
  wellcomeTitle;
  colorBck: string;
  // tslint:disable-next-line:max-line-length
  messaggio_benvenuto = 'Ciao, mi chiamo Ernesto e sono il tuo assistente virtuale sul sito della Città Metropolitana di Bari. Per richiedere il mio aiuto premi il pulsante "Chiedi a Ernesto"';
  // ========= end:: component variables ======= //




  constructor(
    public g: Globals
  ) {

  }

  ngOnInit() {
    // get global variables
    this.g.wdLog(['ngOnInit app-home']);
    this.tenant = this.g.tenant;
    this.colorBck = '#000000';
    try {
      JSON.parse(this.g.customAttributes, (key, value) => {
        // console.log('> attributes: ', key);
        if (key === 'messaggio_benvenuto') {
          this.messaggio_benvenuto = value;
        }
      });
    } catch (error) {
        console.log('> Error is handled attributes: ', error);
    }
    // tslint:disable-next-line:max-line-length
    // https://stackoverflow.com/questions/7015302/css-hexadecimal-rgba
    // this.themeColor50 = convertColorToRGBA(this.themeColor, 30); // this.g.themeColor + 'CC';
    // this.colorGradient = 'linear-gradient(' + this.themeColor + ', ' + this.themeColor50 + ')';
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
