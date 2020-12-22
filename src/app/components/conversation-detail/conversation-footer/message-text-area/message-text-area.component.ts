import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UploadModel } from '../../../../../chat21-core/models/upload';

@Component({
  selector: 'tiledeskwidget-message-text-area',
  templateUrl: './message-text-area.component.html',
  styleUrls: ['./message-text-area.component.scss']
})
export class MessageTextAreaComponent implements OnInit {


  @Output() onChangeTextArea = new EventEmitter();
 

  
  
  constructor() { }

  ngOnInit() {
  }

  

  

}
