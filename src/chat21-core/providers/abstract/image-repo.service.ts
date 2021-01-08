import { Injectable } from '@angular/core';

// @Injectable({providedIn: 'root'})
@Injectable()
export abstract class ImageRepoService {

  // functions
  abstract getImageThumb(uid: string): string;
}
