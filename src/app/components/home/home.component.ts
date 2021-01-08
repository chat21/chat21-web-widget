import { ElementRef, ViewChild, Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { ConversationModel } from '../../../chat21-core/models/conversation';
import { convertColorToRGBA } from '../../../chat21-core/utils/utils';
import { Globals } from '../../utils/globals';




@Component({
  selector: 'tiledeskwidget-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None, /* it allows to customize 'Powered By' */
})
export class HomeComponent implements OnInit {
  @ViewChild('homeComponent') private element: ElementRef;
  // ========= begin:: Input/Output values ===========/
  @Output() onNewConversation = new EventEmitter<string>();
  @Output() onConversationSelected = new EventEmitter<string>();
  @Output() onOpenAllConvesations = new EventEmitter();
  @Output() onCloseWidget = new EventEmitter();
  @Output() onSignOut = new EventEmitter();
  @Input() listConversations: Array<ConversationModel>;
  @Input() styleMap: Map<string, string>
  // ========= end:: Input/Output values ===========/


  // ========= begin:: component variables ======= //
  widgetTitle;
  welcomeMsg;
  welcomeTitle;
  colorBck;
  translationMapHeader: Map<string, string>;
  translationMapFooter: Map<string, string>;
  // ========= end:: component variables ======= //

  convertColorToRGBA = convertColorToRGBA


  constructor(
    public g: Globals
  ) {

  }

  ngOnInit() {
    // get global variables
    this.g.wdLog(['ngOnInit app-home']);

    if (this.g.firstOpen === true) {
      this.addAnimation();
      this.g.firstOpen = false;
    }
    // https://stackoverflow.com/questions/7015302/css-hexadecimal-rgba
    // this.themeColor50 = convertColorToRGBA(this.themeColor, 30); // this.g.themeColor + 'CC';
    // this.colorGradient = 'linear-gradient(' + this.themeColor + ', ' + this.themeColor50 + ')';
    this.colorBck ="#000000"

  }

  


  public translations() {
    const keysHeader = [
      'BUTTON_CLOSE_TO_ICON', 
      'WELLCOME_TITLE', 
      'WELLCOME_MSG',
    ];

    const keysFooter = [
      'LABEL_PLACEHOLDER',
      'GUEST_LABEL',
    ];

    // this.translationMapHeader = this.customTranslateService.translateLanguage(keysHeader);
    // this.translationMapFooter = this.customTranslateService.translateLanguage(keysFooter);
  
    
  }


  // ========= begin:: ACTIONS ============//
  returnNewConversation() {
    // rimuovo classe animazione
    this.removeAnimation();
    this.onNewConversation.emit();
  }

  returnOpenAllConversation() {
    // rimuovo classe animazione
    this.removeAnimation();
    this.onOpenAllConvesations.emit();
  }

  returnSelectedConversation($event) {
    if ( $event ) {
      // rimuovo classe animazione
      this.removeAnimation();
      this.onConversationSelected.emit($event);
    }
  }

  f21_close() {
    // aggiungo classe animazione
    this.addAnimation();
    this.onCloseWidget.emit();
  }

  hideMenuOptions() {
    this.g.wdLog(['hideMenuOptions']);
    // this.g.isOpenMenuOptions = false;
    this.g.setParameter('isOpenMenuOptions', false, true);
  }


  /**
   * MODAL MENU SETTINGS:
   * logout
   */
  returnSignOut() {
    this.onSignOut.emit();
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

