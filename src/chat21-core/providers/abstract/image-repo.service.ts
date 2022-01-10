import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';

// @Injectable({providedIn: 'root'})
@Injectable()
export abstract class ImageRepoService {



  //params
  private DEFAULT_URL: string = environment.baseImageUrl;
  private baseImageUrl;

  public setImageBaseUrl(baseUrl): void {
    this.baseImageUrl = baseUrl;
  }
  public getImageBaseUrl(): string {
    if (this.baseImageUrl) {
      return this.baseImageUrl;
    } else {
      return this.DEFAULT_URL;
    }
  }

  // functions
  abstract getImagePhotoUrl(uid: string): string;
  abstract checkImageExists(uid: string, callback:(exist: boolean)=>void): void;
}
