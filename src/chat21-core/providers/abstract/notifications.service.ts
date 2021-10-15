import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';

// @Injectable({ providedIn: 'root' })
@Injectable()
export abstract class NotificationsService {
  
  private _tenant: string;
  abstract BUILD_VERSION = environment.version

  public setTenant(tenant): void {
    this._tenant = tenant;
  }
  public getTenant(): string {
    if (this._tenant) {
      return this._tenant;
    } 
  }

  abstract initialize(tenant: string, vapidKey: string): void;
  abstract getNotificationPermissionAndSaveToken(currentUserUid: string): void;
  abstract removeNotificationsInstance(callback: (string) => void): void;

  constructor( ) { 
      
  }


}
