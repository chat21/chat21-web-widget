import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

// services
import { ImageRepoService } from '../abstract/image-repo.service';
// firebase
import * as firebase from 'firebase/app';
import 'firebase/storage';
// @Injectable({ providedIn: 'root' })
@Injectable()
export class MQTTImageRepoService extends ImageRepoService {

    // private params
    private baseImageURL: string;
    
    constructor() {
        super();
    }

    /**
     *
     */
    getImagePhotoUrl(uid: string): string {
        this.baseImageURL = this.getImageBaseUrl()
        let sender_id = '';
        if (uid.includes('bot_')) {
            sender_id = uid.slice(4)
        } else {
            sender_id = uid
        }

        return ;
    }
}