/**
 * Check the availability of one or more agents for a specific project
 * identified by a projectId
 */

import { Injectable } from '@angular/core';
import { User } from '../../models/User';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Http, Headers } from '@angular/http';

@Injectable()
export class AgentAvailabilityService {
  private API_URL = "https://chat21-api-nodejs.herokuapp.com";

  constructor(private http: Http) {}

  public getAvailableAgents(projectId): Observable<User[]> {

    //console.log("getAvailableAgents::");
    // console.log("projectId", projectId);

    // return an exception if the projectid is undefined, null or not valid
    if (!projectId) return Observable.throw("projectId is not valid");
    if(projectId == null) return Observable.throw("projectId is null");
    if (projectId == undefined) return Observable.throw("projectId is undefined");

    const url = this.API_URL + "/projects/" + projectId+ "/users/availables";
    // console.log('AgentAvailabilityService::getAvailableAgents::url', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http
      .get(url, { headers })
      .map((response) => response.json())
      // .catch(this.handleError);
  }

  // private handleError(error: Response | any) {
  //   // console.error('AgentAvailabilityService::handleError', error);
  //   return Observable.throw(error);
  // }
}
