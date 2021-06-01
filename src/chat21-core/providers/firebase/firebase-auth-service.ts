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
import { MessagingAuthService } from '../abstract/messagingAuth.service';
import { AppStorageService } from '../abstract/app-storage.service';

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
import { LoggerService } from '../abstract/logger.service';
import { LoggerInstance } from '../logger/loggerInstance';


// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseAuthService extends MessagingAuthService {
  signInWithEmailAndPassword(email: string, password: string): void {
    throw new Error('Method not implemented.');
  }
  signInWithCustomToken(tiledeskToken: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  signInAnonymously(projectID: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

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

  private tiledeskToken: string;
  private firebaseToken: string;
  private currentUser: UserModel;
  private logger:LoggerService = LoggerInstance.getInstance()
  constructor(
    public http: HttpClient
  ) {
    super();
  }

  /**
   *
   */
  initialize() {
    this.SERVER_BASE_URL = this.getBaseUrl();
    this.URL_TILEDESK_SIGNIN = this.SERVER_BASE_URL + 'auth/signin';
    this.URL_TILEDESK_SIGNIN_ANONYMOUSLY = this.SERVER_BASE_URL + 'auth/signinAnonymously'
    this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'auth/signinWithCustomToken';
    this.URL_TILEDESK_CREATE_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'chat21/firebase/auth/createCustomToken';
    // this.checkIsAuth();
    this.onAuthStateChanged();
  }

  /**
   * checkIsAuth
   */
  // checkIsAuth() {
  //   this.logger.printDebug(' ---------------- AuthService checkIsAuth ---------------- ')
  //   this.tiledeskToken = this.appStorage.getItem('tiledeskToken')
  //   this.currentUser = JSON.parse(this.appStorage.getItem('currentUser'));
  //   if (this.tiledeskToken) {
  //     this.logger.printDebug(' ---------------- MI LOGGO CON UN TOKEN ESISTENTE NEL LOCAL STORAGE O PASSATO NEI PARAMS URL ---------------- ')
  //     this.createFirebaseCustomToken();
  //   }  else {
  //     this.logger.printDebug(' ---------------- NON sono loggato ---------------- ')
  //     // this.BSAuthStateChanged.next('offline');
  //   }

  //   // da rifattorizzare il codice seguente!!!
  //   // const that = this;
  //   // this.route.queryParams.subscribe(params => {
  //   //   if (params.tiledeskToken) {
  //   //     that.tiledeskToken = params.tiledeskToken;
  //   //   }
  //   // });
  // }

  /**
   *
   */
  getCurrentUser(): UserModel {
    // return firebase.auth().currentUser;
    return this.currentUser;
  }

  setCurrentUser(user: UserModel) {
    // return firebase.auth().currentUser;
    this.currentUser = user;
  }


  /** */
  getToken(): string {
    return this.firebaseToken;
  }

  getTiledeskToken(): string {
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
        this.logger.printDebug(' 1 - PASSO OFFLINE AL CHAT MANAGER')
        that.BSAuthStateChanged.next('offline');
      } else {
        this.logger.printDebug(' 2 - PASSO ONLINE AL CHAT MANAGER')
        that.BSAuthStateChanged.next('online');
      }
    });

    // window.addEventListener('storage', (e) => {
    //   if (this.appStorage.getItem('tiledeskToken') === null) {
    //     this.currentUser = null;
    //     this.signOut();
    //     this.BSAuthStateChanged.next('offline');
    //   }
    // }, false);
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
      this.logger.printDebug('FIREBASE-AUTH-SERV - CRATE USER WITH EMAIL: ', email, ' & PSW: ', password);
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
      this.logger.printDebug('firebase-send-password-reset-email');
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
      this.logger.printDebug('firebase-sign-out');
      // cancello token
      // this.appStorage.removeItem('tiledeskToken');
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
      this.logger.printDebug('firebase-current-user-delete');
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
  // signInWithEmailAndPassword(email: string, password: string) {
  //   this.logger.printDebug('FIREBASE-AUTH-SERV - signInWithEmailAndPassword', email, password);
  //   const httpHeaders = new HttpHeaders();

  //   httpHeaders.append('Accept', 'application/json');
  //   httpHeaders.append('Content-Type', 'application/json');
  //   const requestOptions = { headers: httpHeaders };
  //   const postData = {
  //     email: email,
  //     password: password
  //   };
  //   const that = this;
  //   this.http.post(this.URL_TILEDESK_SIGNIN, postData, requestOptions).subscribe((data) => {
  //     if (data['success'] && data['token']) {
  //       that.tiledeskToken = data['token'];
  //       this.createCompleteUser(data['user']);
  //       this.appStorage.setItem('tiledeskToken', that.tiledeskToken);
  //       that.createFirebaseCustomToken();
  //     }
  //   }, (error) => {
  //     this.logger.printError('FIREBASE-AUTH-SERV - signInWithEmailAndPassword ERR ',error);
  //   });
  // }

  // /**
  //  * @param projectID
  //  */
  // signInAnonymously(projectID: string): Promise<any> {
  //   this.logger.printDebug('FIREBASE-AUTH-SERV - signInAnonymously - projectID', projectID);
  //   const httpHeaders = new HttpHeaders();

  //   httpHeaders.append('Accept', 'application/json');
  //   httpHeaders.append('Content-Type', 'application/json');
  //   const requestOptions = { headers: httpHeaders };
  //   const postData = {
  //     id_project: projectID
  //   };
  //   const that = this;
  //   return new Promise((resolve, reject) => {
  //     this.http.post(this.URL_TILEDESK_SIGNIN_ANONYMOUSLY, postData, requestOptions).subscribe((data) => {
  //       if (data['success'] && data['token']) {
  //         that.tiledeskToken = data['token'];
  //         this.createCompleteUser(data['user']);
  //         this.appStorage.setItem('tiledeskToken', that.tiledeskToken);
  //         that.createFirebaseCustomToken();
  //         resolve(this.currentUser)
  //       }
  //     }, (error) => {
  //       this.logger.printError('FIREBASE-AUTH-SERV - signInAnonymously ERR ',error);
  //       reject(error)
  //     });
  //   })

  // }

  // /**
  //  * @param tiledeskToken
  //  */
  // signInWithCustomToken(tiledeskToken: string): Promise<any> {
  //   const headers = new HttpHeaders({
  //     'Content-type': 'application/json',
  //     Authorization: tiledeskToken
  //   });
  //   const requestOptions = { headers: headers };
  //   const that = this;
  //   return new Promise((resolve, reject) => {
  //     this.http.post(this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN, null, requestOptions).subscribe((data) => {
  //       if (data['success'] && data['token']) {
  //         that.tiledeskToken = data['token'];
  //         this.createCompleteUser(data['user']);
  //         this.appStorage.setItem('tiledeskToken', that.tiledeskToken); // salvarlo esternamente nell'app.component
  //         that.createFirebaseCustomToken();
  //         resolve(this.currentUser)
  //       }
  //     }, (error) => {
  //       this.logger.printError('FIREBASE-AUTH-SERV - signInWithCustomToken ERR ',error);
  //       reject(error)
  //     });
  //   });
  // }

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
  // private createCompleteUser(user: any) {
  //   const member = new UserModel(user._id);
  //   try {
  //     const uid = user._id;
  //     const firstname = user.firstname ? user.firstname : '';
  //     const lastname = user.lastname ? user.lastname : '';
  //     const email = user.email ? user.email : '';
  //     const fullname = (firstname + ' ' + lastname).trim();
  //     const avatar = avatarPlaceholder(fullname);
  //     const color = getColorBck(fullname);

  //     member.uid = uid;
  //     member.email = email;
  //     member.firstname = firstname;
  //     member.lastname = lastname;
  //     member.fullname = fullname;
  //     member.avatar = avatar;
  //     member.color = color;

  //     this.logger.printDebug('FIREBASE-AUTH-SERV - createCompleteUser member ', member) 
  //   } catch (err) {
  //     this.logger.printError('FIREBASE-AUTH-SERV - createCompleteUser ERR ', err) 
  //   }
  //   this.currentUser = member;
  //   // salvo nel local storage e sollevo l'evento
  //   this.appStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  //   // this.BScurrentUser.next(this.currentUser);
  // }

  /**
   *
   * @param token
   */
  createCustomToken(tiledeskToken: string) {
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: tiledeskToken
    });
    const responseType = 'text';
    const postData = {};
    const that = this;
    this.http.post(this.URL_TILEDESK_CREATE_CUSTOM_TOKEN, postData, { headers, responseType }).subscribe(data => {
      that.firebaseToken = data;
      //localStorage.setItem('firebaseToken', that.firebaseToken);
      that.signInFirebaseWithCustomToken(data)
    }, error => {
      this.logger.printError('FIREBASE-AUTH-SERV - createFirebaseCustomToken ERR ', error) 
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
    this.logger.printDebug('FIREBASE-AUTH-SERV logout');
    // cancello token firebase dal local storage e da firebase
    // dovrebbe scattare l'evento authchangeStat
    this.BSSignOut.next(true);
    this.signOut();
  }

}
