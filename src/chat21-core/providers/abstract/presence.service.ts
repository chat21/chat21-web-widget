import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export abstract class PresenceService {

  // BehaviorSubject
  abstract BSIsOnline: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  abstract BSLastOnline: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // params
  // private DEFAULT_TENANT: string = environment.firebaseConfig.tenant;
  // private _tenant: string;
  
  // public setTenant(tenant): void {
  //   this._tenant = tenant;
  // }
  // public getTenant(): string {
  //   if (this._tenant) {
  //     return this._tenant;
  //   } else {
  //     return this.DEFAULT_TENANT
  //   }
  // }

  // functions
  abstract initialize(tenant: string): void;
  abstract userIsOnline(userid: string): Observable<any>
  abstract lastOnlineForUser(userid: string): void;
  abstract setPresence(userid: string): void;
  abstract removePresence(): void;
}
