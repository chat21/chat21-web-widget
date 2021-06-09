import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Globals } from '../../utils/globals';
import { convertColorToRGBA } from '../../utils/utils';



@Component({
  selector: 'chat-menu-options',
  templateUrl: './menu-options.component.html',
  styleUrls: ['./menu-options.component.scss']
})
export class MenuOptionsComponent implements OnInit {
   // ========= begin:: Input/Output values ============//
   @Output() onSignOut = new EventEmitter();
   // ========= end:: Input/Output values ============//
  themeColor50: string;
  hover: boolean;

  constructor(
    public g: Globals
  ) { }

  ngOnInit() {
    const themeColor = this.g.themeColor;
    this.themeColor50 = convertColorToRGBA(themeColor, 50);
    // this.themeColor50 = this.g.themeColor + '7F';
  }

  f21_toggle_options() {
    this.g.setParameter('isOpenMenuOptions', !this.g.isOpenMenuOptions, true);
  }

  toggleSound() {
    this.g.setParameter('soundEnabled', !this.g.soundEnabled, true);
    this.g.setParameter('isOpenMenuOptions', false, true);
    // this.g.soundEnabled = !this.g.soundEnabled;
    // if ( this.g.soundEnabled === false ) {
    //   this.storageService.setItem('soundEnabled', false);
    // } else {
    //   this.storageService.setItem('soundEnabled', true);
    // }
  }

  signOut() {
    this.g.setParameter('isOpenMenuOptions', false, true);
    this.onSignOut.emit();
  }

}
