import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Globals } from '../../utils/globals';

import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'tiledeskwidget-eyeeye-catcher-card',
  templateUrl: './eyeeye-catcher-card.component.html',
  styleUrls: ['./eyeeye-catcher-card.component.scss'],
  animations: [
    trigger('rotatedState', [
        state('default', style({ transform: 'scale(0)' })),
        state('rotated', style({ transform: 'scale(1)' })),
        transition('rotated => default', animate('1000ms ease-out')),
        transition('default => rotated', animate('1000ms ease-in'))
    ])
  ]
})
export class EyeeyeCatcherCardComponent implements OnInit {

   // ========= begin:: Input/Output values ============//
   @Output()   eventOpenChat  = new EventEmitter();
   @Output()   eventOpenEyeCatcher = new EventEmitter();
   // ========= end:: Input/Output values ============//

  // EYE-CATCHER CARD & EYE-CATCHER CARD CLOSE BTN
  state: string;
//   this.g.displayEyeCatcherCard = 'none';
  displayEyeCatcherCardCloseBtnWrapper: string;
  displayEyeCatcherCardCloseBtnIsMobileWrapper: string;
  displayEyeCatcherCardCloseBtn: string;
  /* EYE-CATCHER CLOSE BUTTON SWITCH */


  constructor(
    public g: Globals
  ) {
    // this.g.calloutTimer = 2;
  }

  ngOnInit() {
      // EYE-CATCHER CARD & EYE-CATCHER CARD CLOSE BTN
  this.state = 'default';
  this.g.setParameter('displayEyeCatcherCard', 'none');
  this.displayEyeCatcherCardCloseBtnWrapper = 'none';
  this.displayEyeCatcherCardCloseBtnIsMobileWrapper = 'none';
  this.displayEyeCatcherCardCloseBtn = 'none';
  /* EYE-CATCHER CLOSE BUTTON SWITCH */
    this.openIfCallOutTimer();
  }


  /**
   * OPEN THE EYE-CATCHER CARD
   * if calloutTimer >= 0
   */
  private openIfCallOutTimer() {
    const that = this;
    const calloutTimer = this.g.calloutTimer;
    if (calloutTimer >= 0) {
        const waitingTime = calloutTimer * 1000;
        setTimeout(function () {
            that.openEyeCatcher();
        }, waitingTime);
    }
  }

  /**
   * OPEN THE EYE-CATCHER CARD (aka CALLOUT) ONLY IF THE CHAT IS CLOSED */
  openEyeCatcher() {
      const isOpen = this.g.isOpen;
      if (isOpen === false) {
          this.eventOpenEyeCatcher.emit(true);
          // this.g.displayEyeCatcherCard = 'block';
          this.g.setParameter('displayEyeCatcherCard', 'block');
          this.displayEyeCatcherCardCloseBtnWrapper = 'block';
          this.displayEyeCatcherCardCloseBtnIsMobileWrapper = 'block';
          this.rotateCalloutEmoticon();
      } else {
         // wdLog(['»»»»»»» CALLING OPEN-EYE-CATCHER BUT NOT DISPLAY THE CARD BECAUSE THE CHAT IS ALREADY OPEN ']);
      }
  }

  rotateCalloutEmoticon() {
      // this.state = (this.state === 'default' ? 'rotated' : 'default');
      if (this.state === 'default') {
          setTimeout(() => this.state = 'rotated');
      }
  }

  /**
   * *** EYE-CATCHER CARD ***
   * THE CLICK OVER THE EYE-CATCHER CARD OPENS THE CHAT AND CLOSE THE EYE-CATCHER CARD */
  openChatFromEyeCatcherCard() {
      // this.g.displayEyeCatcherCard = 'none';
      this.g.setParameter('displayEyeCatcherCard', 'none');
      this.eventOpenChat.emit();
  }

  /**
   * *** DISPLAY THE EYE-CATCHER CARD CLOSE BTN ***
   * DISPLAY EYE-CATCHER CARD CLOSE BTN THE WHEN THE MOUSE IS OVER EYE-CATCHER CARD OR
   * OVER THE EYE-CATCHER CARD CLOSE BTN WRAPPER */
  mouseEnter() {
      //  wdLog(['MOUSE ENTER THE CARD OR THE CLOSE BTN CONTAINER');
      this.displayEyeCatcherCardCloseBtn = 'block';
  }

  /**
   * *** HIDE THE EYE-CATCHER CARD CLOSE BTN ***
   * HIDE THE EYE-CATCHER CARD CLOSE BTN THE WHEN THE MOUSE LEAVE THE EYE-CATCHER CARD OR
   * LEAVE THE EYE-CATCHER CARD CLOSE BTN WRAPPER */
  mouseLeave() {
      //  wdLog(['MOUSE LEAVE THE CARD OR THE CLOSE BTN CONTAINER');
      this.displayEyeCatcherCardCloseBtn = 'none';
  }

  /**
   * EYE-CATCHER CARD CLOSE BTN */
  closeEyeCatcherCard() {
      this.eventOpenEyeCatcher.emit(false);
        // this.g.displayEyeCatcherCard = 'none';
        this.g.setParameter('displayEyeCatcherCard', 'none');
        this.displayEyeCatcherCardCloseBtnWrapper = 'none';
  }

  // /**
  //  * EYE-CATCHER CARD CLOSE BTN ON MOBILE DEVICE */
  // closeEyeCatcherCardWhenMobile() {
  //      wdLog(['HAS CLICKED CLOSE EYE CATCHER CARD WHEN MOBILE ');
  //     this.displayEyeCatcherCard = 'none';
  //     this.displayEyeCatcherCardCloseBtnIsMobileWrapper = 'none';
  // }
}
