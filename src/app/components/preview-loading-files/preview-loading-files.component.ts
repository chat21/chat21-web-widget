import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Globals } from '../../utils/globals';

@Component({
  selector: 'tiledeskwidget-preview-loading-files',
  templateUrl: './preview-loading-files.component.html',
  styleUrls: ['./preview-loading-files.component.scss']
})
export class PreviewLoadingFilesComponent implements OnInit {
  @Input() arrayFilesLoad: [any];
  @Output() eventClose = new EventEmitter();
  @Output() eventSend = new EventEmitter();

  constructor(
    public g: Globals
  ) { }

  ngOnInit() {
  }

}
