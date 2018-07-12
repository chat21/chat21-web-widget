import { Component, OnInit } from '@angular/core';

import { StarRatingWidgetService } from './star-rating-widget.service';


@Component({
  selector: 'app-star-rating-widget',
  templateUrl: './star-rating-widget.component.html',
  styleUrls: ['./star-rating-widget.component.css']
})
export class StarRatingWidgetComponent implements OnInit {

  private rate: number;
  public step: number;

  constructor(
    public starRatingWidgetService: StarRatingWidgetService
  ) {
  }

  ngOnInit() {
    this.step = 0;
  }

  openRate(e) {
    const that = this;
    this.rate = parseInt(e.srcElement.value, 0);
    setTimeout(function() {
      that.step = 1;
      console.log('VOTA!!!::', that.step, that.rate);
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
    this.starRatingWidgetService.httpSendRate('userUid', this.rate, message)
    .subscribe(
      response => {
        console.log('OK sender ::::', response);
         // pubblico var isWidgetActive
         that.nextStep();
      },
      errMsg => {
        console.log('httpSendRate ERROR MESSAGE', errMsg);
        window.alert('MSG_GENERIC_SERVICE_ERROR');
      },
      () => {
        console.log('API ERROR NESSUNO');
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
