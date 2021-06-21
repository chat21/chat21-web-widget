import { CustomLogger } from './../logger/customLogger';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/storage';
import 'firebase/firestore';

// services
import { UploadService } from '../abstract/upload.service';

// models
import { UploadModel } from '../../models/upload';
import { ScriptSnapshot } from 'typescript';
import { LoggerService } from '../abstract/logger.service';
import { LoggerInstance } from '../logger/loggerInstance';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class FirebaseUploadService extends UploadService {
  
  // BehaviorSubject
  BSStateUpload: BehaviorSubject<any>;

  //private
  private logger:LoggerService = LoggerInstance.getInstance()

  constructor() {
    super();
  }

  public initialize() {
  }

  private createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
       // tslint:disable-next-line:no-bitwise
       const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
       return v.toString(16);
    });
  }
   
   
  public upload(upload: UploadModel): Promise<any> {
    const that = this;
    const uid = this.createGuid();
    const urlImagesNodeFirebase = '/public/images/' + uid + '/';
    this.logger.printDebug('pushUpload::::::::::::: ', urlImagesNodeFirebase, upload.file);
    // Create a root reference
    const storageRef = firebase.storage().ref();
    this.logger.printDebug('storageRef::::::::::::: ', storageRef);
    // Create a reference to 'mountains.jpg'
    const mountainsRef = storageRef.child(urlImagesNodeFirebase);
    this.logger.printDebug('mountainsRef::::::::::::: ', mountainsRef);
    const metadata = {};
    let uploadTask = mountainsRef.put(upload.file, metadata);
    console.log('uploadTask upload.file type', upload.file.type);
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', function progress(snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        that.logger.printDebug('Upload is ' + progress + '% done');

        that.BSStateUpload.next({ upload: progress, type: upload.file.type });

        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            that.logger.printDebug('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            that.logger.printDebug('Upload is running');
            break;
        }
      }, function error(error) {
        // Handle unsuccessful uploads
        reject(error)
      }, function complete() {
        // Handle successful uploads on complete
        that.logger.printDebug('Upload is complete', upload);
        resolve(uploadTask.snapshot.ref.getDownloadURL())
        // that.BSStateUpload.next({upload: upload});

      });
    })

  }

}