import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Globals } from '../utils/globals';
import { Headers, Http } from '@angular/http';
import { AppConfigService } from '../providers/app-config.service';

@Injectable()
export class WaitingService {
  API_URL: string;

  constructor(
    public http: Http,
    public g: Globals,
    public appConfigService: AppConfigService
    ) {

    this.API_URL = appConfigService.getConfig().apiUrl;
  }

  public getCurrent(projectId): Observable<any> {
    const url = this.API_URL + projectId + '/publicanalytics/waiting/current';
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // headers.append('Authorization', TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

}
