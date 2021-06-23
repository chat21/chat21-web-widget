import { Injectable } from '@angular/core';
import { version } from 'process';
// import { PACKAGE }from '../../../../package.json';
const { version : appVersion} = require('../../../../package.json')

// @Injectable({ providedIn: 'root' })
@Injectable()
export abstract class NotificationsService {
  
  private _tenant: string;
  // abstract BUILD_VERSION = PACKAGE.version
  abstract BUILD_VERSION = appVersion.version

  public setTenant(tenant): void {
    this._tenant = tenant;
  }
  public getTenant(): string {
    if (this._tenant) {
      return this._tenant;
    } 
  }

  abstract getNotificationPermissionAndSaveToken(currentUserUid: string): void;
  abstract removeNotificationsInstance(callback: (string) => void): void;

  constructor( ) { 
      
  }


}
