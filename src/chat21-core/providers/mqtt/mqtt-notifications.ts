
import { Injectable } from '@angular/core';
// services
import { NotificationsService } from '../abstract/notifications.service';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class MQTTNotifications extends NotificationsService {
  
  public BUILD_VERSION: string;
  constructor( ) {
      super();
  }

  initialize(tenant: string): void {
    console.log('Method not implemented.');
    return;
  }

  getNotificationPermissionAndSaveToken(currentUser: string) { 
    console.log('Method not implemented.');
    return;
  }


  removeNotificationsInstance(callback: (string) => void) {
    console.log('Method not implemented.');
    return;
  }
    
}
