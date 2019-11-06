import { ElementRef, ViewChild, Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Globals } from '../../utils/globals';
import { convertColorToRGBA } from '../../utils/utils';



@Component({
  selector: 'tiledeskwidget-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None, /* it allows to customize 'Powered By' */
})
export class HomeComponent implements OnInit {
  @ViewChild('homeComponent') private element: ElementRef;
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

    if (this.g.firstOpen === true) {
      this.addAnimation();
      this.g.firstOpen = false;
    }
    // https://stackoverflow.com/questions/7015302/css-hexadecimal-rgba
    // this.themeColor50 = convertColorToRGBA(this.themeColor, 30); // this.g.themeColor + 'CC';
    // this.colorGradient = 'linear-gradient(' + this.themeColor + ', ' + this.themeColor50 + ')';
  }

  // ========= begin:: ACTIONS ============//
  returnNewConversation() {
    // rimuovo classe animazione
    this.removeAnimation();
    this.eventNewConv.emit();
  }

  returnOpenAllConversation() {
    // rimuovo classe animazione
    this.removeAnimation();
    this.eventOpenAllConv.emit();
  }

  returnSelectedConversation($event) {
    if ( $event ) {
      // rimuovo classe animazione
      this.removeAnimation();
      this.eventSelctedConv.emit($event);
    }
  }

  f21_close() {
    // aggiungo classe animazione
    this.addAnimation();
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

  addAnimation() {
    try {
      const mainDiv = this.element.nativeElement;
      if (mainDiv) {
        mainDiv.classList.add('start-animation');
      }
    } catch (error) {
        this.g.wdLog(['> Error :' + error]);
    }
  }
  removeAnimation() {
    try {
      const mainDiv = this.element.nativeElement;
      if (mainDiv) {
        mainDiv.classList.remove('start-animation');
      }
    } catch (error) {
      this.g.wdLog(['> Error :' + error]);
    }
  }
}
