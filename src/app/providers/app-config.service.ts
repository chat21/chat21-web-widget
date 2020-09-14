import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
// services
import { Globals } from '../utils/globals';

import { getParameterByName } from '../utils/utils';

@Injectable()
export class AppConfigService {
  private appConfig;

  constructor(private http: Http, public g: Globals) {
    this.appConfig = environment;
    console.log('chat21-web-widget environment: ', environment);
  }

  loadAppConfig(): Observable<any> {
    // START GET BASE URL and create absolute url of remoteConfigUrl //
    let urlConfigFile = this.appConfig.remoteConfigUrl;
    if (!this.appConfig.remoteConfigUrl.startsWith('http')) {
      let wContext: any = window;
      if (window.frameElement && window.frameElement.getAttribute('tiledesk_context') === 'parent') {
        wContext = window.parent;
      }
      const windowcontextFromWindow = getParameterByName(window, 'windowcontext');
      if (windowcontextFromWindow !== null && windowcontextFromWindow === 'window.parent') {
        wContext = window.parent;
      }
      if (!wContext['tiledesk']) {
        return;
      } else {
          const baseLocation =  wContext['tiledesk'].getBaseLocation();
          if (baseLocation !== undefined) {
              // globals.setParameter('baseLocation', baseLocation);
              this.g.baseLocation = baseLocation;
              urlConfigFile = this.g.baseLocation + this.appConfig.remoteConfigUrl;
          }
      }
    }
    // console.log("baseURL: ", this.g.baseLocation , this.appConfig.remoteConfigUrl );
    // END GET BASE URL and create absolute url of remoteConfigUrl //
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http
      .get(urlConfigFile, { headers })
      .map((response) => response.json());

    // return this.http.get(urlConfigFile)
    //   .toPromise()
    //   .then(data => {
    //     this.appConfig = data;
    //   }).catch(err => {
    //     // console.log('error loadAppConfig');
    //   });
  }

  getConfig() {
    return this.appConfig;
  }
}
