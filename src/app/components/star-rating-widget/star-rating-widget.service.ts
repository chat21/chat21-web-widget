import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// services
import { Response } from '@angular/http/src/static_response';
import { environment } from '../../../environments/environment';

@Injectable()
export class StarRatingWidgetService {

  // private BASE_URL_SEND_RATE: string;
  observable: any;

  private API_URL;

  private requestid: String = 'LKfJrBCk6G5up3uNH1L';
  private projectid: String = '5b55e806c93dde00143163dd';

  constructor(
    public http: Http
  ) {

    this.API_URL = environment.apiUrl;

    // console.log('AgentAvailabilityService:: this.API_URL',  this.API_URL );
    if (!this.API_URL) {
     throw new Error('apiUrl is not defined');
    }

    // this.BASE_URL_SEND_RATE = 'http://www.dariodepascalis.com/depa_predictor/test.php';
    this.observable = new BehaviorSubject<boolean>(null);
  }

  httpSendRate(rate, message): Observable<string> {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });
    const url = this.API_URL + this.projectid + '/requests/' + this.requestid;
    console.log('url: ', url);
    const body = {
      'rating': rate,
      'rating_message': message,
      // 'uid': uid
    };
    //   'header': {
    //     'language': 'it',
    //     'country': 'IT'
    //   },
    //   'body': {
    //     'rate': rate,
    //     'message': message,
    //     'uid': uid
    //   }
    // };
    console.log('------------------> options: ', options);
    console.log('------------------> body: ', JSON.stringify(body));
    return this.http
    .patch(url, JSON.stringify(body), options)
    .map(res => (res.json()));
    // .timeout(10000) // in milli sec
   }

   setProjectid(projectid: String) {
     this.projectid = projectid;
   }

   setRequestid(requestid: String) {
    this.requestid = requestid;
  }

   setOsservable(bool) {
    console.log('------------------> setOsservable: ', bool);
    this.observable.next(bool);
   }



}
