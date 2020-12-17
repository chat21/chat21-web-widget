import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

// models
import { UserModel } from '../../models/user';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export abstract class AuthService {

  // BehaviorSubject
  abstract BSAuthStateChanged: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  abstract BSSignOut: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // params
  abstract persistence = environment.authPersistence;
  abstract SERVER_BASE_URL = environment.SERVER_BASE_URL;

  // functions
  abstract initialize(): void;
  abstract getCurrentUser(): UserModel;
  // tslint:disable-next-line: max-line-length
  // passare usermodel e completare il dettaglio dai parametri passati da tiledesk, quindi eliminare tutte la chiamate alla classe di service current-user!!! // oppure  richiamare il servizio x completare il dettaglio prima di far scattare l'evento di connect
  abstract getToken(): string;
  abstract getTiledeskToken(): string;
  abstract signInWithEmailAndPassword(email: string, password: string): void;
  abstract logout(): void;
}
