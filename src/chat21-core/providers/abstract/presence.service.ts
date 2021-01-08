import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export abstract class PresenceService {

  // BehaviorSubject
  abstract BSIsOnline: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  abstract BSLastOnline: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // params
  abstract tenant = environment.tenant;

  // functions
  abstract initialize(): void;
  abstract userIsOnline(userid: string): void;
  abstract lastOnlineForUser(userid: string): void;
  abstract setPresence(userid: string): void;
  abstract removePresence(): void;
}
