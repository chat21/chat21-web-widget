import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

// services
import { ImageRepoService } from '../abstract/image-repo.service';
// firebase
import * as firebase from 'firebase/app';
import 'firebase/storage';
// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseImageRepoService extends ImageRepoService {

    // private params
    FIREBASESTORAGE_BASE_URL_IMAGE = environment.FIREBASESTORAGE_BASE_URL_IMAGE;
    urlStorageBucket = environment.firebase.storageBucket + '/o/profiles%2F';
    imageURL: string;
    constructor() {
        super();
    }

    /**
     *
     */
    getImagePhotoUrl(baseURLfirebaseStorage: string, uid: string): string {
        let sender_id = '';
        if (uid.includes('bot_')) {
            sender_id = uid.slice(4)
        } else {
            sender_id = uid
        }
        const firebaseRef = '/o/profiles%2F'+ sender_id + '%2Fthumb_photo.jpg?alt=media'

        const imageurl = baseURLfirebaseStorage + firebase.storage().ref().bucket + firebaseRef
        return imageurl;
    }
}
