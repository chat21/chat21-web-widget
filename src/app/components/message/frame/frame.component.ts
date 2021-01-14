import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tiledeskwidget-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {

  @Input() metadata: Array<any>;
  @Input() width: number;
  @Input() height: number;
  
  constructor() { }

  ngOnInit() {
  }

}
