import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class AppConfigService {
  private appConfig;

  constructor(private http: HttpClient) {
    this.appConfig = environment;
  }

  loadAppConfig() {
    return this.http.get(this.appConfig.apiUrl + 'settings')
      .toPromise()
      .then(data => {
        this.appConfig = data;
      }).catch(err => {
        // console.log('error loadAppConfig');
      });
  }

  getConfig() {
    return this.appConfig;
  }
}
