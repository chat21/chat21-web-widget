import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { StarRatingWidgetService } from './star-rating-widget.service';
import { Subscription } from 'rxjs/Subscription';
import { Globals } from '../../utils/globals';

@Component({
  selector: 'app-star-rating-widget',
  templateUrl: './star-rating-widget.component.html',
  styleUrls: ['./star-rating-widget.component.scss']
})
export class StarRatingWidgetComponent implements OnInit {

  // ========= begin:: Input/Output values ===========//
  @Output() eventClosePage = new EventEmitter();
  @Output() eventCloseRate = new EventEmitter();
  // ========= end:: Input/Output values ===========//

  // ========= begin:: Input/Output values ===========/
  // @Output() eventNewConv = new EventEmitter<string>();
  // @Output() eventSelctedConv = new EventEmitter<string>();
  // @Output() eventClose = new EventEmitter();
  // @Output() eventSignOut = new EventEmitter();
  // @Input() senderId: string; // uid utente ex: JHFFkYk2RBUn87LCWP2WZ546M7d2
  // ========= end:: Input/Output values ===========/


  // ========= begin:: component variables ======= //
  themeColor;
  themeForegroundColor;
  isConversationClosed: boolean;
  themeColor50: string;
  colorGradient: string;
  colorBck: string;
  // ========= end:: component variables ======= //

  private rate: number;
  step: number;
  message: string;
  private displayDownloadTranscriptBtn: boolean;

  // STRING (FOR TRANSLATION) PASSED IN THE TEMPLATE
  // CUSTOMER_SATISFACTION: string;
  // YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE: string;
  // DOWNLOAD_TRANSCRIPT: string;
  // BACK: string;
  // YOUR_RATING: string;
  // WRITE_YOUR_OPINION: string;
  // SUBMIT: string;
  // THANK_YOU_FOR_YOUR_EVALUATION: string;
  // YOUR_RATING_HAS_BEEN_RECEIVED: string;

  constructor(
    public starRatingWidgetService: StarRatingWidgetService,
    public g: Globals
  ) {
   }

  ngOnInit() {
    console.log('START-RATING-WIDGET - PARENT THEME-COLOR: ', this.themeColor);
    console.log('START-RATING-WIDGET - PARENT THEME-FOREGROUND-COLOR: ', this.themeForegroundColor);
    this.displayDownloadTranscriptBtn = this.g.allowTranscriptDownload; //????????
    this.step = 0;
  }

  dowloadTranscript() {
    this.starRatingWidgetService._dowloadTranscript();
  }

  openRate(e) {
    const that = this;
    this.rate = parseInt(e.srcElement.value, 0);
    setTimeout(function () {
      that.step = 1;
      // console.log('VOTA!!!::', that.step, that.rate);
    }, 300);
  }

  nextStep() {
    this.step = this.step + 1;
  }

  prevStep() {
    this.step = this.step - 1;
  }

  sendRate() {
    this.message = (document.getElementById('chat21-message-rate-context') as HTMLInputElement).value;
    console.log('sendRate!!!::', this.message);
    const that = this;
    // chiamo servizio invio segnalazione
    this.starRatingWidgetService.httpSendRate(this.rate, this.message, this.g.recipientId)
    .subscribe(
      response => {
        console.log('OK sender ::::', response);
        // pubblico var isWidgetActive
        that.closeRate();
      },
      errMsg => {
        // console.error('httpSendRate ERROR MESSAGE', errMsg);
        // window.alert('MSG_GENERIC_SERVICE_ERROR');
        that.closeRate();
      },
      () => {
        // console.log('API ERROR NESSUNO');
      }
    );
  }

  closeRate() {
    this.starRatingWidgetService.setOsservable(false);
    this.step = 0;
    this.returnClosePage();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.step = 0;
  }

  // ========= begin:: ACTIONS ============//
  returnClosePage() {
    console.log(' closePage: ');
    this.eventClosePage.emit();
  }
  // ========= end:: ACTIONS ============//

}
