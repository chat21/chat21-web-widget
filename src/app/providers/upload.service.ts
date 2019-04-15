import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// import * as firebase from 'firebase/app';
import * as firebase from 'firebase';
import 'firebase/storage';


import { UploadModel } from '../../models/upload';
import { environment } from '../../environments/environment';

import { Globals } from '../utils/globals';
import { AppConfigService } from '../providers/app-config.service';
// utils
import { wdLog } from '../utils/utils';

class ImageSnippet {
  pending = false;
  status = 'init';
  constructor(public src: string, public file: File) {}
}

@Injectable()
/**
 * DESC PROVIDER
 */
export class UploadService {
  private tenant: string;
  private recipientId: string;
  private senderId: string;


  arrayFilesLoad: Array<any>;
  observable: any;

  constructor(
    public g: Globals,
    public appConfigService: AppConfigService
  ) {
    this.observable = new BehaviorSubject<string>('');
  }

  public initialize(senderId, tenant, recipientId) {
    this.senderId = senderId;
    if (!tenant) {
      this.tenant = this.appConfigService.getConfig().tenant;
    } else {
      this.tenant = tenant;
    }
      this.recipientId = recipientId;
  }


  processFile(imageInput: any) {
    const that = this;
    const file: File = imageInput.files[0];
    const nameFile = file.name;
    const typeFile = file.type;
    const reader = new FileReader();
     wdLog(['OK preload: ', nameFile, typeFile, reader]);
    reader.addEventListener('load', function () {
    // reader.addEventListener('load', (event: any) => {
       wdLog(['addEventListener load', reader.result]);
      // se inizia con image
      if (typeFile.startsWith('image')) {
        // const selectedFile = new ImageSnippet(event.target.result, file);
        // selectedFile.pending = true;
        const imageXLoad = new Image;
        wdLog(['onload ', imageXLoad]);
        imageXLoad.src = reader.result.toString();
        imageXLoad.title = nameFile;
        imageXLoad.onload = function () {
          wdLog(['onload immagine']);
          // that.arrayFilesLoad.push(imageXLoad);
          const uid = that.createGuid();
          that.arrayFilesLoad.push('{ uid: ' + uid + ', file: ' + imageXLoad + ', type: ' + typeFile + ' }');
          wdLog(['OK: ', that.arrayFilesLoad[0]]);
        };
      }
      // this.imageService.uploadImage(this.selectedFile.file).subscribe(
      //   (res) => {
      //     this.onSuccess();
      //   },
      //   (err) => {
      //     this.onError();
      //   })
    });
    reader.readAsDataURL(file);
     wdLog(['reader-result: ', file]);
  }



  pushUpload(upload: UploadModel): any {
    const uid = this.createGuid();
    const urlImagesNodeFirebase = '/public/images/' + uid + '/';
     wdLog(['pushUpload::::::::::::: ', urlImagesNodeFirebase]);

    // Create a root reference
    const storageRef = firebase.storage().ref();

    // Create a reference to 'mountains.jpg'
    const mountainsRef = storageRef.child(urlImagesNodeFirebase);

    //  wdLog(["UploadService::pushUpload::mountainsRef", mountainsRef);

    return mountainsRef.put(upload.file);
    // .then(function(snapshot) {
    //    wdLog(['Uploaded a blob or file! ', snapshot.downloadURL);
    //   this.observable.next(snapshot.downloadURL);
    // });
  }


  pushUpload_Old(upload: UploadModel) {
    // recupero current user id
    const uid = this.createGuid();
    const urlImagesNodeFirebase = '/public/images/' + uid;
     wdLog(['pushUpload::::::::::::: ', urlImagesNodeFirebase]);

    const next = function(snapshot) {
      // upload in progress
      const snapshotRef = snapshot as firebase.storage.UploadTaskSnapshot;
      const percent = snapshotRef.bytesTransferred / snapshotRef.totalBytes * 100;
       wdLog(['snapshot::::::::::::: ', percent]);
      upload.progress = percent;
    };
    // tslint:disable-next-line:no-shadowed-variable
    const error = function( error: any ) {
      // upload failed
       wdLog([error]);
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
