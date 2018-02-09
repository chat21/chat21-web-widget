import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// services
import { Response } from '@angular/http/src/static_response';

@Injectable()
export class StarRatingWidgetService {

  private BASE_URL_SEND_RATE: string;
  observable: any;

  constructor(
    public http: Http
  ) {
    this.BASE_URL_SEND_RATE = 'http://www.dariodepascalis.com/depa_predictor/test.php';
    this.observable = new BehaviorSubject<boolean>(null);
  }

  httpSendRate(uid, rate, message): Observable<string> {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });
    const url = this.BASE_URL_SEND_RATE;
    console.log('url: ', url);
    const body = {
      'rate': rate,
      'message': message,
      'uid': uid
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
    .post(url, JSON.stringify(body), options)
    .map(res => (res.json()));
    // .timeout(10000) // in milli sec
   }

   setOsservable(bool) {
    console.log('------------------> setOsservable: ', bool);
    this.observable.next(bool);
   }



}
