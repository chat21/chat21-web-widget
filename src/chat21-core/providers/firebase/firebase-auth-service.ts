import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/auth';

// services
import { AuthService } from '../abstract/auth.service';
// import { ImageRepoService } from '../abstract/image-repo.service';
// import { FirebaseImageRepoService } from './firebase-image-repo';

// models
import { UserModel } from '../../models/user';

// utils
import {
  avatarPlaceholder,
  getColorBck,
} from '../../utils/utils-user';
import { resolve } from 'url';
import { CustomLogger } from '../logger/customLogger';


// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseAuthService extends AuthService {

  // BehaviorSubject
  BSAuthStateChanged: BehaviorSubject<any>;
  BSSignOut: BehaviorSubject<any>;
  // firebaseSignInWithCustomToken: BehaviorSubject<any>;

  // public params
  // private persistence: string;
  public SERVER_BASE_URL: string;

  // private
  private URL_TILEDESK_SIGNIN: string;
  private URL_TILEDESK_SIGNIN_ANONYMOUSLY: string;
  private URL_TILEDESK_CREATE_CUSTOM_TOKEN: string;
  private URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN: string;
  //TODO-GAB
  // private imageRepo: ImageRepoService = new FirebaseImageRepoService();

  private storagePrefix: string;
  private tiledeskToken: string;
  private firebaseToken: string;
  private currentUser: UserModel;
  private logger: CustomLogger = new CustomLogger(true);
  
  constructor(
    // private events: EventsService,
    public http: HttpClient,
    //public route: ActivatedRoute
  ) {
    super();
  }

  /**
   *
   */
  initialize(storagePrefix: string) {
    this.SERVER_BASE_URL = this.getBaseUrl();
    this.storagePrefix = storagePrefix;
    this.URL_TILEDESK_SIGNIN = this.SERVER_BASE_URL + 'auth/signin';
    this.URL_TILEDESK_SIGNIN_ANONYMOUSLY = this.SERVER_BASE_URL + 'auth/signinAnonymously'
    this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'auth/signinWithCustomToken';
    this.URL_TILEDESK_CREATE_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'chat21/firebase/auth/createCustomToken';
    this.checkIsAuth();
    this.onAuthStateChanged();
  }

  /**
   * checkIsAuth
   */
  checkIsAuth() {
    this.logger.printLog(' ---------------- AuthService checkIsAuth ---------------- ')
    this.tiledeskToken = localStorage.getItem(this.storagePrefix+'tiledeskToken');
    this.currentUser = JSON.parse(localStorage.getItem(this.storagePrefix + 'currentUser'));
    if (this.tiledeskToken) {
      this.logger.printLog(' ---------------- MI LOGGO CON UN TOKEN ESISTENTE NEL LOCAL STORAGE O PASSATO NEI PARAMS URL ---------------- ')
      this.createFirebaseCustomToken();
    } else {
      this.logger.printLog(' ---------------- NON sono loggato ---------------- ')
      // this.BSAuthStateChanged.next('offline');
    }

    // da rifattorizzare il codice seguente!!!
    // const that = this;
    // this.route.queryParams.subscribe(params => {
    //   console.log('queryParams -->', params );
    //   if (params.tiledeskToken) {
    //     that.tiledeskToken = params.tiledeskToken;
    //   }
    // });
  }

  /**
   *
   */
  getCurrentUser(): UserModel {
    // return firebase.auth().currentUser;
    return this.currentUser;
  }

  setCurrentUser(user:UserModel) {
    // return firebase.auth().currentUser;
    this.currentUser= user;
  }


  /** */
  getToken(): string {
    // console.log('UserService::getFirebaseToken', this.firebaseToken);
    return this.firebaseToken;
  }

  getTiledeskToken(): string {
    // console.log('UserService::tiledeskToken', this.tiledeskToken);
    return this.tiledeskToken;
  }

  // ********************* START FIREBASE AUTH ********************* //
  /**
   * FIREBASE: onAuthStateChanged
   */
  onAuthStateChanged() {
    const that = this;
    firebase.auth().onAuthStateChanged(user => {
      this.logger.printDebug(' onAuthStateChanged', user)
      if (!user) {
        this.logger.printLog(' 1 - PASSO OFFLINE AL CHAT MANAGER')
        that.BSAuthStateChanged.next('offline');
      } else {
        this.logger.printLog(' 2 - PASSO ONLINE AL CHAT MANAGER')
        that.BSAuthStateChanged.next('online');
      }
    });
  }


  /** */
  updateTokenOnAuthStateIsLogin() {
    const taht = this;
    firebase.auth().currentUser.getIdToken(false).then((token) => {
      this.logger.printDebug('firebaseToken.', token);
      taht.firebaseToken = token;
    }).catch((error) => {
      this.logger.printError('idToken error: ', error);
    });
  }

  /**
   * FIREBASE: signInWithCustomToken
   * @param token
   */
  signInFirebaseWithCustomToken(token: string): Promise<any> {
    const that = this;
    let firebasePersistence;
    switch (this.getPersistence()) {
      case 'SESSION': {
        firebasePersistence = firebase.auth.Auth.Persistence.SESSION;
        break;
      }
      case 'LOCAL': {
        firebasePersistence = firebase.auth.Auth.Persistence.LOCAL;
        break;
      }
      case 'NONE': {
        firebasePersistence = firebase.auth.Auth.Persistence.NONE;
        break;
      }
      default: {
        firebasePersistence = firebase.auth.Auth.Persistence.NONE;
        break;
      }
    }
    return firebase.auth().setPersistence(firebasePersistence).then( async () => {
      return firebase.auth().signInWithCustomToken(token).then( async (response) => {
                // that.currentUser = response.user;
                // that.firebaseSignInWithCustomToken.next(response);
              }).catch((error) => {
                this.logger.printError('Error: ', error);
                  // that.firebaseSignInWithCustomToken.next(null);
              });
    }).catch((error) => {
      this.logger.printError('Error: ', error);
    });
  }

  /**
   * FIREBASE: createUserWithEmailAndPassword
   * @param email
   * @param password
   * @param firstname
   * @param lastname
   */
  createUserWithEmailAndPassword(email: string, password: string): any {
    const that = this;
    return firebase.auth().createUserWithEmailAndPassword(email, password).then((response) => {
      this.logger.printLog('firebase-create-user-with-email-and-password');
      // that.firebaseCreateUserWithEmailAndPassword.next(response);
      return response;
    }).catch((error) => {
      this.logger.printError('error: ', error.message);
      return error;
    });
  }


  /**
   * FIREBASE: sendPasswordResetEmail
   */
  sendPasswordResetEmail(email: string): any {
    const that = this;
    return firebase.auth().sendPasswordResetEmail(email).then(() => {
      this.logger.printLog('firebase-send-password-reset-email');
      // that.firebaseSendPasswordResetEmail.next(email);
    }).catch((error) => {
      this.logger.printError('error: ', error);
    });
  }

  /**
   * FIREBASE: signOut
   */
  private signOut() {
    const that = this;
    firebase.auth().signOut().then(() => {
      this.logger.printLog('firebase-sign-out');
      // cancello token
      localStorage.removeItem(this.storagePrefix + 'tiledeskToken');
      //localStorage.removeItem('firebaseToken');
    }).catch((error) => {
      this.logger.printError('error: ', error);
    });
  }


  /**
   * FIREBASE: currentUser delete
   */
  delete() {
    const that = this;
    const user = firebase.auth().currentUser;
    user.delete().then(() => {
      this.logger.printLog('firebase-current-user-delete');
      // that.firebaseCurrentUserDelete.next();
    }).catch((error) => {
      this.logger.printError('error: ', error);
    });
  }

// ********************* END FIREBASE AUTH ********************* //





// ********************* TILEDESK AUTH ********************* //
  /**
   * @param email
   * @param password
   */
  signInWithEmailAndPassword(email: string, password: string) {
    console.log('signInWithEmailAndPassword', email, password);
    const httpHeaders = new HttpHeaders();
    
    httpHeaders.append('Accept', 'application/json');
    httpHeaders.append('Content-Type', 'application/json' );
    const requestOptions = { headers: httpHeaders };
    const postData = {
      email: email,
      password: password
    };
    const that = this;
    this.http.post(this.URL_TILEDESK_SIGNIN, postData, requestOptions).subscribe((data) => {
        if (data['success'] && data['token']) {
          that.tiledeskToken = data['token'];
          this.createCompleteUser(data['user']);
          localStorage.setItem(this.storagePrefix + 'tiledeskToken', that.tiledeskToken);
          that.createFirebaseCustomToken();
        }
    }, (error) => {
      console.log(error);
    });
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
          that.createFirebaseCustomToken();
          resolve(this.currentUser)
        }
    }, (error) => {
      console.log(error);
      reject(error)
    });
    })
    
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
          that.createFirebaseCustomToken();
          resolve(this.currentUser)
        }
      }, (error) => {
        console.log(error);
        reject(error)
      });
    });
  }

  /**
   * https://www.techiediaries.com/ionic-http-post/
   * @param url
   * @param emailVal
   * @param pswVal
   */
  // private signIn(url: string, emailVal: string, pswVal: string) {
  //   const httpHeaders = new HttpHeaders();
  //   httpHeaders.append('Accept', 'application/json');
  //   httpHeaders.append('Content-Type', 'application/json' );
  //   const requestOptions = { headers: httpHeaders };
  //   const postData = {
  //     email: emailVal,
  //     password: pswVal
  //   };
  //   const that = this;
  //   this.http.post(url, postData, requestOptions)
  //     .subscribe(data => {
  //       if (data['success'] && data['token']) {
  //         that.tiledeskToken = data['token'];
  //         this.createCompleteUser(data['user']);
  //         localStorage.setItem('tiledeskToken', that.tiledeskToken);
  //         that.createFirebaseCustomToken();
  //       }
  //     }, error => {
  //       console.log(error);
  //     });
  // }

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

  /**
   *
   * @param token
   */
  private createFirebaseCustomToken() {
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: this.tiledeskToken
    });
    const responseType = 'text';
    const postData = {};
    const that = this;
      this.http.post(this.URL_TILEDESK_CREATE_CUSTOM_TOKEN, postData, { headers, responseType}).subscribe(data =>  {
        that.firebaseToken = data;
        //localStorage.setItem('firebaseToken', that.firebaseToken);
        that.signInFirebaseWithCustomToken(data)
      }, error => {
        console.log(error);
        
      });
    
  }



  /**
   *
   * @param error
   */
  // handleError(error: HttpErrorResponse) {
  //   if (error.error instanceof ErrorEvent) {
  //     console.error('An error occurred:', error.error.message);
  //   } else {
  //     console.error(
  //       `Backend returned code ${error.status}, ` +
  //       `body was: ${error.error}`);
  //   }
  //   return throwError(
  //     'Something bad happened; please try again later.');
  // }


  public logout() {
    // cancello token firebase dal local storage e da firebase
    // dovrebbe scattare l'evento authchangeStat
    this.BSSignOut.next(true);
    this.signOut();
    console.log('logout non nancora abilitato');
  }

}
