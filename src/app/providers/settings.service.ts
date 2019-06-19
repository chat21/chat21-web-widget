import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AppConfigService } from '../providers/app-config.service';
import { AuthService } from '../providers/auth.service';

@Injectable()
export class SettingsService {

  constructor(
    public http: Http,
    public appConfigService: AppConfigService,
    public authService: AuthService
  ) { }


  getProjectParametersById(id: string): Observable<any[]> {
    const API_URL = this.appConfigService.getConfig().apiUrl;
    const url = API_URL + id + '/widgets';
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }
}
