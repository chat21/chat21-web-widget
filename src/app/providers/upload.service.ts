import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as firebase from 'firebase';
import { UploadModel } from '../../models/upload';
import { environment } from '../../environments/environment';


@Injectable()
/**
 * DESC PROVIDER
 */
export class UploadService {
  private tenant: string;
  private recipientId: string;
  private senderId: string;
  observable: any;

  constructor(
  ) {
    this.observable = new BehaviorSubject<string>('');
  }

  public initialize(senderId, tenant, recipientId) {
    this.senderId = senderId;
    if (!tenant) {
      this.tenant = environment.tenant;
    } else {
      this.tenant = tenant;
    }
    if (!recipientId) {
      this.recipientId = environment.agentId;
    } else {
      this.recipientId = recipientId;
    }
  }

  pushUpload(upload: UploadModel): any {
    const uid = this.createGuid();
    const urlImagesNodeFirebase = '/public/images/' + uid + '/';
    console.log('pushUpload::::::::::::: ', urlImagesNodeFirebase);

    // Create a root reference
    const storageRef = firebase.storage().ref();

    // Create a reference to 'mountains.jpg'
    const mountainsRef = storageRef.child(urlImagesNodeFirebase);

    // console.log("UploadService::pushUpload::mountainsRef", mountainsRef);

    return mountainsRef.put(upload.file);
    // .then(function(snapshot) {
    //   console.log('Uploaded a blob or file! ', snapshot.downloadURL);
    //   this.observable.next(snapshot.downloadURL);
    // });
  }


  pushUpload_Old(upload: UploadModel) {
    // recupero current user id
    const uid = this.createGuid();
    const urlImagesNodeFirebase = '/public/images/' + uid;
    console.log('pushUpload::::::::::::: ', urlImagesNodeFirebase);

    const next = function(snapshot) {
      // upload in progress
      const snapshotRef = snapshot as firebase.storage.UploadTaskSnapshot;
      const percent = snapshotRef.bytesTransferred / snapshotRef.totalBytes * 100;
      console.log('snapshot::::::::::::: ', percent);
      upload.progress = percent;
    };
    // tslint:disable-next-line:no-shadowed-variable
    const error = function( error: any ) {
      // upload failed
      console.log(error);
    };
    const complete = function() {
      // upload success
      upload.url = uploadTask.snapshot.downloadURL;
      upload.name = upload.file.name;
      upload.progress = 100;
    };


    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(urlImagesNodeFirebase).put(upload.file);

    // This is equivalent to the first example.
    const subscribe = uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED);
    subscribe(next, error, complete);
  }

  // display(uidContact) {
  //   if (uidContact && uidContact !== '') {
  //     const urlImagesNodeFirebase = '/apps/' + this.tenant + '/contacts/' + uidContact + "-imageProfile";
  //     return firebase.storage().ref().child(urlImagesNodeFirebase).getDownloadURL();
  //   }
  // }

  private createGuid() {
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      // tslint:disable-next-line:no-bitwise
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
   });
  }



}
