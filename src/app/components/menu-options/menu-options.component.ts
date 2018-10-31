import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Globals } from '../../utils/globals';

@Component({
  selector: 'app-menu-options',
  templateUrl: './menu-options.component.html',
  styleUrls: ['./menu-options.component.scss']
})
export class MenuOptionsComponent implements OnInit {
   // ========= begin:: Input/Output values ============//
   @Output() eventSignOut = new EventEmitter();
   // ========= end:: Input/Output values ============//
  isOpenMenuOptions = false;

  constructor(
    public g: Globals
  ) { }

  ngOnInit() {
  }

  f21_toggle_options() {
    this.isOpenMenuOptions = !this.isOpenMenuOptions;
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
    this.eventSignOut.emit();
  }

}
