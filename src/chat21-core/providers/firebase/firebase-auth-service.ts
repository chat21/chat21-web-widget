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


// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseAuthService extends AuthService {

  // BehaviorSubject
  BSAuthStateChanged: BehaviorSubject<any>;
  BSSignOut: BehaviorSubject<any>;
  // firebaseSignInWithCustomToken: BehaviorSubject<any>;

  // piblic
  // private persistence: string;
  public SERVER_BASE_URL: string;

  // private
  private URL_TILEDESK_SIGNIN: string;
  private URL_TILEDESK_SIGNIN_ANONYMOUSLY: string;
  private URL_TILEDESK_CREATE_CUSTOM_TOKEN: string;
  //TODO-GAB
  // private imageRepo: ImageRepoService = new FirebaseImageRepoService();

  private tiledeskToken: string;
  private firebaseToken: string;
  private currentUser: UserModel;

  constructor(
    // private events: EventsService,
    public http: HttpClient,
    public route: ActivatedRoute
  ) {
    super();
  }

  /**
   *
   */
  initialize() {
    this.URL_TILEDESK_SIGNIN = this.SERVER_BASE_URL + 'auth/signin';
    this.URL_TILEDESK_SIGNIN_ANONYMOUSLY = this.SERVER_BASE_URL + 'auth/signinAnonymously'
    this.URL_TILEDESK_CREATE_CUSTOM_TOKEN = this.SERVER_BASE_URL + 'chat21/firebase/auth/createCustomToken';
    this.checkIsAuth();
    this.onAuthStateChanged();
  }

  /**
   * checkIsAuth
   */
  checkIsAuth() {
    console.log(' ---------------- AuthService checkIsAuth ---------------- ');
    this.tiledeskToken = localStorage.getItem('tiledeskToken');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.tiledeskToken) {
      console.log(' ---------------- MI LOGGO CON UN TOKEN ESISTENTE NEL LOCAL STORAGE O PASSATO NEI PARAMS URL ---------------- ');
      this.createFirebaseCustomToken();
    } else {
      console.log(' ---------------- NON sono loggato ---------------- ');
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


  /** */
  getToken(): string {
    console.log('UserService::getFirebaseToken', this.firebaseToken);
    return this.firebaseToken;
  }

  getTiledeskToken(): string {
    console.log('UserService::tiledeskToken', this.tiledeskToken);
    return this.tiledeskToken;
  }

  // ********************* START FIREBASE AUTH ********************* //
  /**
   * FIREBASE: onAuthStateChanged
   */
  onAuthStateChanged() {
    console.log('UserService::onAuthStateChanged');
    const that = this;
    firebase.auth().onAuthStateChanged(user => {
      console.log(' onAuthStateChanged', user);
      if (!user) {
        console.log(' 1 - PASSO OFFLINE AL CHAT MANAGER');
        that.BSAuthStateChanged.next('offline');
      } else {
        console.log(' 2 - PASSO ONLINE AL CHAT MANAGER');
        that.BSAuthStateChanged.next(user);
      }
    });
  }


  /** */
  updateTokenOnAuthStateIsLogin() {
    const taht = this;
    firebase.auth().currentUser.getIdToken(false)
    .then((token) => {
      console.log('firebaseToken.', token);
      taht.firebaseToken = token;
    }).catch((error) => {
      console.log('idToken error: ', error);
    });
  }

  /**
   * FIREBASE: signInWithCustomToken
   * @param token
   */
  signInFirebaseWithCustomToken(token: string): any {
    console.log('signInWithCustomToken:', token);
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
    return firebase.auth().setPersistence(firebasePersistence)
    .then( async () => {
      return firebase.auth().signInWithCustomToken(token)
      .then( async (response) => {
        // that.currentUser = response.user;
        // that.firebaseSignInWithCustomToken.next(response);
      })
      .catch((error) => {
        console.error('Error: ', error);
        // that.firebaseSignInWithCustomToken.next(null);
      });
    })
    .catch((error) => {
      console.error('Error: ', error);
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
    return firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((response) => {
      console.log('firebase-create-user-with-email-and-password');
      // that.firebaseCreateUserWithEmailAndPassword.next(response);
      return response;
    })
    .catch((error) => {
        console.log('error: ', error.message);
        return error;
    });
  }


  /**
   * FIREBASE: sendPasswordResetEmail
   */
  sendPasswordResetEmail(email: string): any {
    const that = this;
    return firebase.auth().sendPasswordResetEmail(email).
    then(() => {
      console.log('firebase-send-password-reset-email');
      // that.firebaseSendPasswordResetEmail.next(email);
    }).catch((error) => {
      console.log('error: ', error);
    });
  }

  /**
   * FIREBASE: signOut
   */
  private signOut() {
    const that = this;
    firebase.auth().signOut()
    .then(() => {
      console.log('firebase-sign-out');
      // cancello token
      localStorage.removeItem('tiledeskToken');
      localStorage.removeItem('firebaseToken');
    }).catch((error) => {
      console.log('error: ', error);
    });
  }


  /**
   * FIREBASE: currentUser delete
   */
  delete() {
    const that = this;
    const user = firebase.auth().currentUser;
    user.delete().then(() => {
      console.log('firebase-current-user-delete');
      // that.firebaseCurrentUserDelete.next();
    }).catch((error) => {
      console.log('error: ', error);
    });
  }

// ********************* END FIREBASE AUTH ********************* //





// ********************* TILEDESK AUTH ********************* //
  /**
   *
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
          localStorage.setItem('tiledeskToken', that.tiledeskToken);
          that.createFirebaseCustomToken();
        }
    }, (error) => {
      console.log(error);
    });
  }

  signInAnonymously(projectID: string) {
    console.log('signInAnonymously', projectID);
    const httpHeaders = new HttpHeaders();
    
    httpHeaders.append('Accept', 'application/json');
    httpHeaders.append('Content-Type', 'application/json' );
    const requestOptions = { headers: httpHeaders };
    const postData = {
      id_project: projectID
    };
    const that = this;
    this.http.post(this.URL_TILEDESK_SIGNIN_ANONYMOUSLY, postData, requestOptions).subscribe((data) => {
        if (data['success'] && data['token']) {
          that.tiledeskToken = data['token'];
          this.createCompleteUser(data['user']);
          localStorage.setItem('tiledeskToken', that.tiledeskToken);
          that.createFirebaseCustomToken();
        }
    }, (error) => {
      console.log(error);
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
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
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
      localStorage.setItem('firebaseToken', that.firebaseToken);
      that.signInFirebaseWithCustomToken(data);
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
