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

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class FirebaseUploadService extends UploadService {
  
  // BehaviorSubject
  BSStateUpload: BehaviorSubject<any>;


  //private
  private url: string;
  private logger: CustomLogger = new CustomLogger(true);

  constructor() {
    super();
  }

  public initialize() {
    this.logger.printLog('FirebaseUploadService');
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

    return new Promise ((resolve, reject)=> {
        uploadTask.on('state_changed', function progress(snapshot){
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
                break;
            }
          }, function error(error) {
            // Handle unsuccessful uploads
            reject(error)
          }, function complete() {
              // Handle successful uploads on complete
              console.log('Upload is complete', upload);
            //   uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            //       console.log('File available at', downloadURL);
            //   });
            resolve(uploadTask.snapshot.ref.getDownloadURL())
            that.BSStateUpload.next({upload: upload});
              
          });
    })
    
  }

  get(filename: string, type: string): string {
    throw new Error('Method not implemented.');
  }
}