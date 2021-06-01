import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
//import { environment } from 'src/environments/environment';

// models
import { UploadModel } from '../../models/upload';
@Injectable()
export abstract class UploadService {

  //params
  private DEFAULT_URL: string = environment.apiUrl;
  private baseUrl;

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

  //BehaviorSubject
  abstract BSStateUpload: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // params
  // abstract tenant = environment.tenant;

  // functions
  abstract initialize(): void;
  abstract upload(upload: UploadModel): Promise<any>;
}
