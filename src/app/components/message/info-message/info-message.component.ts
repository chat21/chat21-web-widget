
import { Component, Input, OnInit } from '@angular/core';
import { MessageModel } from '../../../../chat21-core/models/message';

@Component({
  selector: 'tiledeskwidget-info-message',
  templateUrl: './info-message.component.html',
  styleUrls: ['./info-message.component.scss']
})
export class InfoMessageComponent implements OnInit {

  @Input() message: MessageModel
  constructor() { }

  ngOnInit() {
  }

}
