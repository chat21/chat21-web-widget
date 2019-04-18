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

  getProjectById(id: string): Observable<any[]> {
    // tslint:disable-next-line:max-line-length
    const token = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7Il9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvIiwicGFzc3dvcmQiOiIkMmEkMTAkTlBoSk5VNVZDYlU2d05idG1Jck5lT3MxR0dBSW5rMERMeGVYWXN2dklHZ1JnY1dMWW1kYkciLCJlbWFpbCI6Im5pY29sYS5sYW56aWxvdHRvQGZyb250aWVyZTIxLml0IiwiX2lkIjoiNWFjNzUyMTc4N2Y2YjUwMDE0ZTBiNTkyIn0sIiRpbml0Ijp0cnVlLCJpYXQiOjE1NTU1OTY1MDJ9.ElCOFoEwzHd89poyVwE6tC5lypfxKBjZhkPgp-o7foQ';
    const API_URL = this.appConfigService.getConfig().apiUrl;
    const PROJECT_BASE_URL = API_URL + 'projects/';
    const url = PROJECT_BASE_URL + id;
    console.log('!!! GET PROJECT BY ID URL', url);
    console.log('!!! GET ID', id);
    console.log('!!! GET TOKEN', token);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', token);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }
}
