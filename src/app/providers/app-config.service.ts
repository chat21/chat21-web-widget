import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
// services
import { Globals } from '../utils/globals';

import { getParameterByName } from '../utils/utils';
import { LoggerService } from '../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../chat21-core/providers/logger/loggerInstance';

@Injectable()
export class AppConfigService {
  private appConfig;

  constructor(private http: HttpClient, public g: Globals) {
    this.appConfig = environment;
    // console.debug('chat21-web-widget environment: ', environment);
  }

  loadAppConfig() { // : Observable<any> {
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
    // urlConfigFile = 'https://widget.inspired.edu.au/widget-config.json';
    // console.log('baseURL: ', this.g.baseLocation , this.appConfig.remoteConfigUrl );
    // END GET BASE URL and create absolute url of remoteConfigUrl //
    // const headers = new Headers();
    // headers.append('Content-Type', 'application/json');
    // return this.http
    //   .get(urlConfigFile, { headers })
    //   .map((response) => response.json());
    const that = this;
    return this.http.get(urlConfigFile).toPromise().then(data => {
      that.appConfig = data;
      }).catch(err => {
        console.error('error loadAppConfig', err);
      });
  }

  getConfig() {
    return this.appConfig;
  }
}
