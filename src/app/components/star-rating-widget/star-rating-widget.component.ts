import { Component, OnInit } from '@angular/core';

// services
import { MessagingService } from '../../providers/messaging.service';

@Component({
  selector: 'app-star-rating-widget',
  templateUrl: './star-rating-widget.component.html',
  styleUrls: ['./star-rating-widget.component.css']
})
export class StarRatingWidgetComponent implements OnInit {

  private rate: number;
  private step: number;

  constructor(
    public messagingService: MessagingService
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
      // that.messagingService.setRating(e.srcElement.value);
    }, 300);
  }
}
