import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

// services
import { ImageRepoService } from '../abstract/image-repo.service';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseImageRepoService extends ImageRepoService {

    // private params
    FIREBASESTORAGE_BASE_URL_IMAGE = environment.FIREBASESTORAGE_BASE_URL_IMAGE;
    urlStorageBucket = environment.firebase.storageBucket + '/o/profiles%2F';

    constructor() {
        super();
    }

    /**
     *
     */
    public getImageThumb(uid: string): string {
        const imageurl = this.FIREBASESTORAGE_BASE_URL_IMAGE + this.urlStorageBucket + uid + '%2Fthumb_photo.jpg?alt=media';
        return imageurl;
    }
}
