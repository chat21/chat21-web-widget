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
  public DEFAULT_PERSISTENCE: string = 'none';
  public DEFAULT_URL: string = 'https://api.tiledesk.com/v2/auth/';

  private persistence;
  private baseUrl;

  public setPersistence(persistence): void {
    this.persistence = persistence;
  }

  public getPersistence(): string {
    if (this.persistence) {
      return this.persistence;
    } else {
      return this.DEFAULT_PERSISTENCE;
    }
  }

  public setBaseUrl(baseUrl): void {
    this.baseUrl = baseUrl;
  }
  public getBaseUrl(): string {
    if (this.baseUrl) {
      return this.baseUrl;
    } else {
      return this.DEFAULT_URL;
    }
  }

  // functions
  abstract initialize(): void;
  abstract getCurrentUser(): UserModel;
  // tslint:disable-next-line: max-line-length
  // passare usermodel e completare il dettaglio dai parametri passati da tiledesk, quindi eliminare tutte la chiamate alla classe di service current-user!!! // oppure  richiamare il servizio x completare il dettaglio prima di far scattare l'evento di connect
  abstract getToken(): string;
  abstract getTiledeskToken(): string;
  abstract signInWithEmailAndPassword(email: string, password: string): void;
  abstract signInWithCustomToken(tiledeskToken: string): Promise<any>;
  abstract signInAnonymously(projectID: string): Promise<any>;
  abstract logout(): void;
}
