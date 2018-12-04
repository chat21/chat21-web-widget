import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Globals } from '../../utils/globals';
import { convertColorToRGBA } from '../../utils/utils';



@Component({
  selector: 'tiledeskwidget-menu-options',
  templateUrl: './menu-options.component.html',
  styleUrls: ['./menu-options.component.scss']
})
export class MenuOptionsComponent implements OnInit {
   // ========= begin:: Input/Output values ============//
   @Output() eventSignOut = new EventEmitter();
   // ========= end:: Input/Output values ============//
  themeColor50: string;
  constructor(
    public g: Globals
  ) { }

  ngOnInit() {
    this.themeColor50 = convertColorToRGBA(this.g.themeColor, 50);
    // this.themeColor50 = this.g.themeColor + '7F';
  }

  f21_toggle_options() {
     this.g.wdLog(['f21_toggle_options', this.g.isOpenMenuOptions]);
    this.g.isOpenMenuOptions = !this.g.isOpenMenuOptions;
  }
  toggleSound() {
    this.g.isSoundActive = !this.g.isSoundActive;
    if ( this.g.isSoundActive === true ) {
      localStorage.setItem('isSoundActive', 'true');
    } else {
      localStorage.removeItem('isSoundActive');
    }
  }

  signOut() {
    this.g.isOpenMenuOptions = false;
    this.eventSignOut.emit();
  }

}
