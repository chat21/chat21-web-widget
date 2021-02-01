import { Injectable } from '@angular/core';

// @Injectable({providedIn: 'root'})
@Injectable()
export abstract class ImageRepoService {

  // functions
  abstract getImagePhotoUrl(baseURLfirebaseStorage: string,uid: string): string;
}
