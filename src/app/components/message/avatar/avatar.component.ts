import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tiledeskwidget-avatar-image',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  @Input() url: string;
  constructor() { }

  ngOnInit() {
    if(!this.url){
      this.url = 'assets/images/avatar_bot_tiledesk.svg'
    }
  }

}
