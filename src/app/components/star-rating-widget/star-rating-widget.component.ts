import { Component, OnInit, Input } from '@angular/core';

import { StarRatingWidgetService } from './star-rating-widget.service';


@Component({
  selector: 'app-star-rating-widget',
  templateUrl: './star-rating-widget.component.html',
  styleUrls: ['./star-rating-widget.component.css']
})
export class StarRatingWidgetComponent implements OnInit {
  @Input() parentThemeColor: string;
  @Input() parentThemeForegroundColor: string;
  @Input() parentAllowTranscriptDownload: boolean;

  private rate: number;
  public step: number;
  displayDownloadTranscriptBtn: boolean;

  constructor(
    public starRatingWidgetService: StarRatingWidgetService
  ) {
  }

  ngOnInit() {
    console.log('START-RATING-WIDGET - PARENT THEME-COLOR: ', this.parentThemeColor);
    console.log('START-RATING-WIDGET - PARENT THEME-FOREGROUND-COLOR: ', this.parentThemeForegroundColor);
    console.log('START-RATING-WIDGET - PARENT ALLOW-TRANSCRIPT-DOWNLOAD: ', this.parentAllowTranscriptDownload);
    this.displayDownloadTranscriptBtn = this.parentAllowTranscriptDownload;

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

  ngOnDestroy() {
    this.step = 0;
  }

}
