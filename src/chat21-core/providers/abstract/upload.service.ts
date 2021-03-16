import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
//import { environment } from 'src/environments/environment';

// models
import { UploadModel } from '../../models/upload';
@Injectable()
export abstract class UploadService2 {

  BehaviorSubject
  abstract BSStateUpload: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // params
  // abstract tenant = environment.tenant;

  // functions
  abstract initialize(): void;
  abstract pushUploadMessage(upload: UploadModel): Promise<any>;
}
