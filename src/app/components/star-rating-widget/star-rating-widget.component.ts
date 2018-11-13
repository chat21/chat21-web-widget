import { Component, OnInit, Input } from '@angular/core';
import { StarRatingWidgetService } from './star-rating-widget.service';
import { TranslatorService } from '../../providers/translator.service';


@Component({
  selector: 'app-star-rating-widget',
  templateUrl: './star-rating-widget.component.html',
  styleUrls: ['./star-rating-widget.component.scss']
})
export class StarRatingWidgetComponent implements OnInit {
  @Input() themeColor: string;
  @Input() themeForegroundColor: string;
  @Input() parentAllowTranscriptDownload: boolean;

  private rate: number;
  step: number;
  private displayDownloadTranscriptBtn: boolean;

  // STRING (FOR TRANSLATION) PASSED IN THE TEMPLATE
  CUSTOMER_SATISFACTION: string;
  YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE: string;
  DOWNLOAD_TRANSCRIPT: string;
  BACK: string;
  YOUR_RATING: string;
  WRITE_YOUR_OPINION: string;
  SUBMIT: string;
  THANK_YOU_FOR_YOUR_EVALUATION: string;
  YOUR_RATING_HAS_BEEN_RECEIVED: string;

  constructor(
    public starRatingWidgetService: StarRatingWidgetService,
    public translatorService: TranslatorService
  ) {  }

  ngOnInit() {
    console.log('START-RATING-WIDGET - PARENT THEME-COLOR: ', this.themeColor);
    console.log('START-RATING-WIDGET - PARENT THEME-FOREGROUND-COLOR: ', this.themeForegroundColor);
    console.log('START-RATING-WIDGET - PARENT ALLOW-TRANSCRIPT-DOWNLOAD: ', this.parentAllowTranscriptDownload);
    this.displayDownloadTranscriptBtn = this.parentAllowTranscriptDownload;
    this.translate();
    this.step = 0;
  }

  private translate() {
    this.CUSTOMER_SATISFACTION = this.translatorService.translate('CUSTOMER_SATISFACTION');
    this.YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE = this.translatorService.translate('YOUR_OPINION_ON_OUR_CUSTOMER_SERVICE');
    this.DOWNLOAD_TRANSCRIPT = this.translatorService.translate('DOWNLOAD_TRANSCRIPT');
    this.BACK = this.translatorService.translate('BACK');
    this.YOUR_RATING = this.translatorService.translate('YOUR_RATING');
    this.WRITE_YOUR_OPINION = this.translatorService.translate('WRITE_YOUR_OPINION');
    this.SUBMIT = this.translatorService.translate('SUBMIT');
    this.THANK_YOU_FOR_YOUR_EVALUATION = this.translatorService.translate('THANK_YOU_FOR_YOUR_EVALUATION');
    this.YOUR_RATING_HAS_BEEN_RECEIVED = this.translatorService.translate('YOUR_RATING_HAS_BEEN_RECEIVED');
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
    this.rate = null;
    this.step = this.step - 1;
  }

  sendRate() {
    const message = (document.getElementById('chat21-message-rate-context') as HTMLInputElement).value;
    console.log('sendRate!!!::', message);
    const that = this;
    // chiamo servizio invio segnalazione
    this.starRatingWidgetService.httpSendRate(this.rate, message)
    .subscribe(
      response => {
        console.log('OK sender ::::', response);
        // pubblico var isWidgetActive
        that.nextStep();
      },
      errMsg => {
        console.log('httpSendRate ERROR MESSAGE', errMsg);
        // window.alert('MSG_GENERIC_SERVICE_ERROR');
        that.nextStep();
      },
      () => {
        // console.log('API ERROR NESSUNO');
      }
    );
  }

  closeRate() {
    this.starRatingWidgetService.setOsservable(false);
    this.step = 0;
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.step = 0;
  }

}
