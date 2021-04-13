import { Injectable, ɵConsole } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/auth';

// utils
import {
  avatarPlaceholder,
  getColorBck,
} from '../../utils/utils-user';

// services
// import { EventsService } from '../events-service';
import { AuthService } from '../abstract/auth.service';
import { Chat21Service } from './chat-service';
// models
import { UserModel } from '../../models/user';

// declare var Chat21Client: any;


// @Injectable({ providedIn: 'root' })
@Injectable()
export class MQTTAuthService extends AuthService {

  // authStateChanged: BehaviorSubject<any>; // = new BehaviorSubject<any>([]);

  // BehaviorSubject
  BSAuthStateChanged: BehaviorSubject<any>;
  BSSignOut: BehaviorSubject<any>;

  // private persistence: string;
  SERVER_BASE_URL: string;

  public token: any;
  public tiledeskToken: any;
  public user: any;
  private currentUser: any;
  private storagePrefix: string;

  private URL_TILEDESK_SIGNIN: string;
  private URL_TILEDESK_CREATE_CUSTOM_TOKEN: string;
  private URL_TILEDESK_SIGNIN_ANONYMOUSLY: string;
  private URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN: string;

  constructor(
    public http: HttpClient,
    public chat21Service: Chat21Service
  ) {
    super();
    console.log("chat21Service:", chat21Service)
  }

  /**
   *
   */
  initialize(storagePrefix: string) {
    this.SERVER_BASE_URL = this.getBaseUrl();
    console.log("this.SERVER_BASE_URL = this.getBaseUrl();", this.SERVER_BASE_URL)
    this.storagePrefix = storagePrefix;
    this.URL_TILEDESK_SIGNIN = this.SERVER_BASE_URL + 'auth/signin';
    this.URL_TILEDESK_SIGNIN_ANONYMOUSLY = this.SERVER_BASE_URL + 'auth/signinAnonymously'
    // this.URL_TILEDESK_CREATE_CUSTOM_TOKEN = environment.chat21Config.loginServiceEndpoint;
    this.URL_TILEDESK_CREATE_CUSTOM_TOKEN = this.SERVER_BASE_URL + "chat21/native/auth/createCustomToken"
    console.log("URL_TILEDESK_CREATE_CUSTOM_TOKEN", this.URL_TILEDESK_CREATE_CUSTOM_TOKEN)
    this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'auth/signinWithCustomToken';
    console.log(' ---------------- login con token url ---------------- ');
    this.checkIsAuth();
    this.onAuthStateChanged();
  }

  logout() {
    console.log('logged out');
  }

  getCurrentUser(): UserModel {
    // return firebase.auth().currentUser;
    return this.currentUser;
  }

  checkIsAuth() {
    this.tiledeskToken = localStorage.getItem('tiledeskToken');
    if (this.tiledeskToken && this.tiledeskToken !== undefined) {
      this.getCustomToken(this.tiledeskToken);
    } else {
      console.log(' ---------------- NON sono loggato ---------------- ');
    }
  }

  /**
   *
   */
  getUser(): any {
    return this.currentUser;
  }

  getTiledeskToken(): string {
    console.log('UserService::tiledeskToken', this.tiledeskToken);
    return this.tiledeskToken;
  }

  /** */
  getToken(): string {
    console.log('UserService::getToken');
    return this.token;
  }

  /**
   */
  onAuthStateChanged() {
    console.log('UserService::onAuthStateChanged');
    if (localStorage.getItem('tiledeskToken') == null) {
      this.currentUser = null;
      this.BSAuthStateChanged.next('offline');
    }
    const that = this;
    window.addEventListener('storage', (e) => {
      console.log('Changed:', e.key);
      if (localStorage.getItem('tiledeskToken') == null) {
        that.currentUser = null;
        that.BSAuthStateChanged.next('offline');
      }
    }, false);

  }


  /**
   * @param projectID
   */
  signInAnonymously(projectID: string): Promise<any> {
    console.log('signInAnonymously', projectID);
    const httpHeaders = new HttpHeaders();
    
    httpHeaders.append('Accept', 'application/json');
    httpHeaders.append('Content-Type', 'application/json' );
    const requestOptions = { headers: httpHeaders };
    const postData = {
      id_project: projectID
    };
    const that = this;
    return new Promise((resolve, reject)=> {
      this.http.post(this.URL_TILEDESK_SIGNIN_ANONYMOUSLY, postData, requestOptions).subscribe((data) => {
        if (data['success'] && data['token']) {
          that.tiledeskToken = data['token'];
          this.createCompleteUser(data['user']);
          localStorage.setItem(this.storagePrefix + 'tiledeskToken', that.tiledeskToken);
          that.getCustomToken(this.tiledeskToken);
          resolve(this.currentUser)
        }
    }, (error) => {
      console.log(error);
      reject(error)
    });
    })
  }

  // ********************* NATIVE AUTH (NO TILEDESK) ********************* //
  private signinMQTT(url: string, username: string, password: string) {
    console.log("signinMQTT...")
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('Accept', 'application/json');
    httpHeaders.append('Content-Type', 'application/json' );
    const requestOptions = { headers: httpHeaders };
    const postData = {
      username: username,
      password: password
    };
    const that = this;
    this.http.post(url, postData, requestOptions)
      .subscribe(data => {
        console.log("data:", JSON.stringify(data));
        if (data['token'] && data['userid']) {
          localStorage.setItem('tiledeskToken', data['token']);
          that.connectMQTT(data);
          // that.firebaseCreateCustomToken(tiledeskToken);
        }
      }, error => {
        console.log(error);
      });
  }

  /**
   * @param tiledeskToken
   */
  signInWithCustomToken(tiledeskToken: string): Promise<any>{
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: tiledeskToken
    });
    const requestOptions = { headers: headers };
    const that = this;
    return new Promise((resolve, reject)=> {
      this.http.post(this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN, null, requestOptions).subscribe((data) => {
        if (data['success'] && data['token']) {
          that.tiledeskToken = data['token'];
          this.createCompleteUser(data['user']);
          localStorage.setItem(this.storagePrefix + 'tiledeskToken', that.tiledeskToken);
          that.getCustomToken(this.tiledeskToken);
          resolve(this.currentUser)
        }
      }, (error) => {
        console.log(error);
        reject(error)
      });
    });
  }

// ********************* TILEDESK AUTH ********************* //
  signInWithEmailAndPassword(email: string, password: string) {
    // console.log('signInWithEmailAndPassword', email, password);
    // this.signIn(this.URL_TILEDESK_SIGNIN, email, password);

    console.log('signInWithEmailAndPassword', email, password);
    if (this.SERVER_BASE_URL !== '__') {
      console.log('this.URL_TILEDESK_SIGNIN', this.URL_TILEDESK_SIGNIN);
      this.signIn(this.URL_TILEDESK_SIGNIN, email, password);
    }
    else {
      this.signinMQTT(environment.chat21Config.loginServiceEndpoint, email, password);
    }
  }

  private signIn(url: string, emailVal: string, pswVal: string) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('Accept', 'application/json');
    httpHeaders.append('Content-Type', 'application/json' );
    const requestOptions = { headers: httpHeaders };
    const postData = {
      email: emailVal,
      password: pswVal
    };
    const that = this;
    this.http.post(url, postData, requestOptions)
      .subscribe(data => {
        console.log("data:", JSON.stringify(data));
        if (data['success'] && data['token']) {
          that.tiledeskToken = data['token'];
          localStorage.setItem(this.storagePrefix + 'tiledeskToken', that.tiledeskToken);
          that.getCustomToken(this.tiledeskToken);
          // that.firebaseCreateCustomToken(tiledeskToken);
        }
      }, error => {
        console.log(error);
      });
  }

  // private createCustomToken(tiledeskToken: string) {
  //   const headers = new HttpHeaders({
  //     'Content-type': 'application/json',
  //     Authorization: tiledeskToken
  //   });
  //   const responseType = 'text';
  //   const postData = {};
  //   const that = this;
  //   this.http.post(this.URL_TILEDESK_CREATE_CUSTOM_TOKEN, postData, { headers, responseType})
  //   .subscribe(data =>  {
  //     that.getCustomToken(data);
  //   }, error => {
  //     console.log(error);
  //   });
  // }

  getCustomToken(tiledeskToken: string): any {
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: tiledeskToken
    });
    const responseType = 'text';
    const postData = {};
    const that = this;
    this.http.post(this.URL_TILEDESK_CREATE_CUSTOM_TOKEN, postData, { headers, responseType})
    .subscribe(data =>  {
      const result = JSON.parse(data);
      that.connectMQTT(result);
    }, error => {
      console.log(error);
    });
  }

  connectMQTT(result: any): any {
    console.log('result:', result);
    const userid = result.userid;
    const chatOptions = environment.chat21Config;
    console.log('chatOptions:', chatOptions, this.chat21Service.chatClient);
    //this.chat21Service.initChat(chatOptions);
    this.chat21Service.chatClient.connect(userid, result.token, () => {
      console.log('Chat connected.');
      const uid = userid;
      const firstname = result['firstname'];
      const lastname = result['lastname'];
      const fullname = result['fullname'];
      // let user = new UserModel(uid, '', firstname, lastname, fullname, '');
      const user = {
        uid: userid,
        fullname,
        firstname,
        lastname
      };
      this.currentUser = user;
      console.log('User signed in:', user);
      // this.BSAuthStateChanged.next(user);
      this.BSAuthStateChanged.next('online');
    });
  }

  /**
   * createCompleteUser
   * @param user
   */
  private createCompleteUser(user: any) {
    const member = new UserModel(user._id);
    try {
      const uid = user._id;
      const firstname = user.firstname ? user.firstname : '';
      const lastname = user.lastname ? user.lastname : '';
      const email = user.email ? user.email : '';
      const fullname = ( firstname + ' ' + lastname ).trim();
      const avatar = avatarPlaceholder(fullname);
      const color = getColorBck(fullname);
      //TODO-GAB
      // const imageurl = this.imageRepo.getImageThumb(uid);

      member.uid = uid;
      member.email = email;
      member.firstname = firstname;
      member.lastname = lastname;
      member.fullname = fullname;
      //TODO-GAB
      // member.imageurl = imageurl;
      member.avatar = avatar;
      member.color = color;
      console.log('createCompleteUser: ', member);
    } catch (err) {
      console.log('createCompleteUser error:' + err);
    }
    this.currentUser = member;
    // salvo nel local storage e sollevo l'evento
    localStorage.setItem(this.storagePrefix + 'currentUser', JSON.stringify(this.currentUser));
    // this.BScurrentUser.next(this.currentUser);
  }

  // private firebaseCreateCustomToken(tiledeskToken: string) {
  //   console.log('getting firebase custom token with tiledesk token', tiledeskToken);
  //   const headers = new HttpHeaders({
  //     'Content-type': 'application/json',
  //     Authorization: tiledeskToken
  //   });
  //   const responseType = 'text';
  //   const postData = {};
  //   const that = this;
  //   const url = this.SERVER_BASE_URL + 'chat21/firebase/auth/createCustomToken';
  //   console.log('firebase custom token URL', url);
  //   this.http.post(url, postData, { headers, responseType})
  //   .subscribe(data =>  {
  //     console.log('got firebase custom token', data);
  //     that.firebaseSignInWithCustomToken(data);
  //   }, error => {
  //     console.log('error while getting firebase token!');
  //     console.log(error);
  //   });
  // }

  // firebaseSignInWithCustomToken(token: string): any {
  //   console.log('connecting to firebase with token', token);
  //   const that = this;
  //   let firebasePersistence;
  //   switch (this.persistence) {
  //     case 'SESSION': {
  //       firebasePersistence = firebase.auth.Auth.Persistence.SESSION;
  //       break;
  //     }
  //     case 'LOCAL': {
  //       firebasePersistence = firebase.auth.Auth.Persistence.LOCAL;
  //       break;
  //     }
  //     case 'NONE': {
  //       firebasePersistence = firebase.auth.Auth.Persistence.NONE;
  //       break;
  //     }
  //     default: {
  //       firebasePersistence = firebase.auth.Auth.Persistence.NONE;
  //       break;
  //     }
  //   }
  //   return firebase.auth().setPersistence(firebasePersistence)
  //   .then( async () => {
  //     return firebase.auth().signInWithCustomToken(token)
  //     .then( async (response) => {
  //       console.log('connected on firebase');
  //     })
  //     .catch((error) => {
  //       console.error('Error: ', error);
  //     });
  //   })
  //   .catch((error) => {
  //     console.error('Error: ', error);
  //   });
  // }

}
