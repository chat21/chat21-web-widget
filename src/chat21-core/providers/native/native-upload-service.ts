import { AppConfigService } from './../../../app/providers/app-config.service';
import { UploadService } from '../abstract/upload.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UploadModel } from '../../models/upload';
import { AppStorageService } from '../abstract/app-storage.service';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class NativeUploadService extends UploadService {
   
  

    BSStateUpload: BehaviorSubject<any>;
    
    // private persistence: string;
    SERVER_BASE_URL: string;

    public token: any;
    public tiledeskToken: any;

    private URL_TILEDESK_IMAGES: string;
    private URL_TILEDESK_FILE: string;

    constructor(
        public http: HttpClient,
        public appStorage: AppStorageService
    ) {
        super();
    }


    initialize(): void {
        console.log('initialize NATIVE-UPLOAD storage')
        this.URL_TILEDESK_FILE = this.getBaseUrl() + 'file'
        this.URL_TILEDESK_IMAGES = this.getBaseUrl() + 'images'
        this.tiledeskToken = this.appStorage.getItem('tiledeskToken')
    }


    upload(upload: UploadModel): Promise<any>  {
        const headers = new HttpHeaders({
            Authorization: this.tiledeskToken,
            //'Content-Type': 'multipart/form-data',
        });
        const requestOptions = { headers: headers };
        const formData = new FormData();
        formData.append('file', upload.file);
 
        const that = this;
        if(upload.file.type.startsWith('image')){
            //USE IMAGE API
            const url = this.URL_TILEDESK_IMAGES + '/users'
            return new Promise ((resolve, reject)=> {
                that.http.post(url, formData, requestOptions).subscribe(data => {
                    console.log("data:", data);
                    const downloadURL = this.URL_TILEDESK_IMAGES + '?path='+ data['filename']
                    resolve(downloadURL)
                    // that.BSStateUpload.next({upload: upload});
                }, (error) => {
                    reject(error)
                });
            });
        }else {
            //USE FILE API
            const url = this.URL_TILEDESK_FILE + '/users'
            return new Promise ((resolve, reject)=> {
                that.http.post(url, formData, requestOptions).subscribe(data => {
                    console.log("data:", data);
                    const downloadURL = this.URL_TILEDESK_FILE + '?path='+ data['filename']
                    resolve(downloadURL)
                    // that.BSStateUpload.next({upload: upload});
                }, (error) => {
                    reject(error)
                });
            });
        }
        
    }


    get(filename: string, type): string {
        const headers = new HttpHeaders({
            Authorization: this.tiledeskToken,
        });
        const requestOptions = { headers: headers };
        
        let queryString= '?path='+ filename
        if(type.startsWith('image')){
            //USE IMAGE API
            const url = this.URL_TILEDESK_IMAGES + queryString
            // this.http.get(url, requestOptions).subscribe((data: any) => {
            //     console.log("data:", data);
            //     // that.BSStateUpload.next({upload: upload});
            // }, (error) => {
            //     console.error(error);
            // });
            return url
        }else {
            //USE FILE API
            const url = this.URL_TILEDESK_FILE + queryString
            // this.http.get(url, requestOptions).subscribe(data => {
            //     console.log("data:", data);
            //     // that.BSStateUpload.next({upload: upload});
            // }, (error) => {
            //     console.error(error);
            // });
            return url
        }
 
    }
}