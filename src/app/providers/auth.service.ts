import { Injectable } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/auth';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';

import { Globals } from '../utils/globals';
import { supports_html5_storage, supports_html5_session } from '../utils/utils';
import { AppConfigService } from './app-config.service';

@Injectable()
export class AuthService {
  // public user: Observable<firebase.User>;
  // public user: firebase.User;
  public user: any;
  private token: string;
  obsLoggedUser: BehaviorSubject<any>;
  // obsCurrentUser: BehaviorSubject<any>;

  unsubscribe: any;
  API_URL: string;

  constructor(
    // private firebaseAuth: AngularFireAuth,
    public http: Http,
    public g: Globals,
    public appConfigService: AppConfigService
  ) {
    // this.user = firebaseAuth.authState;
    this.obsLoggedUser = new BehaviorSubject<any>(null);
    // this.obsCurrentUser = new BehaviorSubject<any>(null);

    this.API_URL = appConfigService.getConfig().apiUrl;
  }



  onAuthStateChanged() {
    const that = this;
    // https://stackoverflow.com/questions/37370224/firebase-stop-listening-onauthstatechanged
    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        that.g.wdLog(['NO CURRENT USER PASSO NULL']);
        if (that.g.isLogout === false ) {
          that.obsLoggedUser.next(0);
        }
      } else {
        that.g.wdLog(['PASSO CURRENT USER']);
        that.user = firebase.auth().currentUser;
        that.g.wdLog(['onAuthStateChanged']);
        that.getIdToken();
        that.obsLoggedUser.next(firebase.auth().currentUser);
        // that.obsCurrentUser.next(that.user);
      }
    });
  }

  getCurrentUser() {
    this.g.wdLog([' ---------------- getCurrentUser ---------------- ']);
    return firebase.auth().currentUser;
  }

  reloadCurrentUser() {
    return firebase.auth().currentUser.reload();
    // .then(() => {
    //   // console.log(firebase.auth().currentUser);
    //   return firebase.auth().currentUser;
    // });
  }

  getIdToken() {
    this.g.wdLog(['getIdToken CURRENT USER']);
    //  that.g.wdLog(['Notification permission granted.');
    const that = this;
    firebase.auth().currentUser.getIdToken()/* true: forceRefresh */
    .then(function(idToken) {
        that.token = idToken;
        that.g.wdLog(['******************** ---------------> idToken.', idToken]);
        return idToken;
    }).catch(function(error) {
        console.error('idToken ERROR: ', error);
        return;
    });
  }

  getToken() {
    return this.token;
  }


  authenticateFirebaseAnonymously() {
    // console.log('authenticateFirebaseAnonymously');
    const that = this;
    firebase.auth().setPersistence(this.getFirebaseAuthPersistence()).then(function() {
          firebase.auth().signInAnonymously()
          .then(function(user) {
            that.user = user;
            if (that.unsubscribe) {
              that.unsubscribe();
            }
            that.g.wdLog(['authenticateFirebaseAnonymously']);
            that.getIdToken();
            that.obsLoggedUser.next(firebase.auth().currentUser);
          })
          .catch(function(error) {
              const errorCode = error.code;
              const errorMessage = error.message;
              if (that.unsubscribe) {
                that.unsubscribe();
              }
              that.g.wdLog(['signInAnonymously ERROR: ', errorCode, errorMessage]);
              that.obsLoggedUser.next(0);
          });
        })
    .catch(function(error) {
      console.error('Error setting firebase auth persistence', error);
      // that.obsLoggedUser.next(0);
    });
  }


  authenticateFirebaseCustomToken(token) {
    this.g.wdLog(['1 - authService.authenticateFirebaseCustomToken']);
    const that = this;
    firebase.auth().setPersistence(this.getFirebaseAuthPersistence()).then(function() {
      // Sign-out successful.
      firebase.auth().signInWithCustomToken(token)
      .then(function(response) {
        // that.g.wdLog(['USER by signInWithCustomToken: ' + response.user.getIdToken()]);
        // console.log('USER by signInWithCustomToken: ', response);
        that.g.setParameter('firebaseToken', token);
        that.g.setParameter('signInWithCustomToken', true);
        that.user = response.user;
        if (that.unsubscribe) {
          that.unsubscribe();
        }
        this.g.wdLog(['obsLoggedUser - authService.authenticateFirebaseCustomToken']);
        that.obsLoggedUser.next(firebase.auth().currentUser);
        // that.getToken();????
      })
      .catch(function(error) {
          const errorCode = error.code;
          const errorMessage = error.message;
          if (that.unsubscribe) {
            that.unsubscribe();
          }
          that.g.wdLog(['authenticateFirebaseCustomToken ERROR: ', errorCode, errorMessage]);
          that.obsLoggedUser.next(0);
      });
    })
    .catch(function(error) {
      console.error('Error setting firebase auth persistence', error);
    });
    // firebase.auth().currentUser.getIdToken()
    // .then(function(idToken) {
    //   // Send token to your backend via HTTPS
    //    that.g.wdLog(['idToken: ', idToken);
    //   // ...
    // }).catch(function(error) {
    //   // Handle error
    // });

  }



  authenticateFirebaseWithEmailAndPassword(email, password) {
    const that = this;
    firebase.auth().setPersistence(this.getFirebaseAuthPersistence()).then(function() {
      firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function(user) {
        that.user = user;
        if (that.unsubscribe) {
          that.unsubscribe();
        }
        that.getIdToken();
        that.g.wdLog(['authenticateFirebaseWithEmailAndPassword']);
        that.obsLoggedUser.next(firebase.auth().currentUser);
      })
      .catch(function(error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (that.unsubscribe) {
          that.unsubscribe();
        }
        that.g.wdLog(['authenticateFirebaseWithEmailAndPassword ERROR: ', errorCode, errorMessage]);
        that.obsLoggedUser.next(0);
      });
    })
    .catch(function(error) {
      console.error('Error setting firebase auth persistence', error);
    });
  }




  // signOut() {
  //   return firebase.auth().signOut();
  //   // .then(function() {
  //   //   // Sign-out successful.
  //   // }).catch(function(error) {
  //   //   // An error happened.
  //   // });
  // }




  // signup(email: string, password: string) {
  //   this.firebaseAuth
  //     .auth
  //     .createUserWithEmailAndPassword(email, password)
  //     .then(value => {
  //        that.g.wdLog(['Success!', value);
  //     })
  //     .catch(err => {
  //        that.g.wdLog(['Something went wrong:', err.message);
  //     });
  // }

  // login(email: string, password: string) {
  //   this.firebaseAuth.auth.signInWithEmailAndPassword(email, password)
  //     .then(value => {
  //        that.g.wdLog(['Nice, it worked!');
  //     })
  //     .catch(err => {
  //        that.g.wdLog(['Something went wrong:', err.message);
  //     });
  // }

  signOut(code: number) {
    const that = this;
    // return this.firebaseAuth.auth.signOut()
    return firebase.auth().signOut()
    .then(value => {
      that.g.wdLog(['Nice, signOut OK!', value]);
      that.hideIFrame();
      if (that.unsubscribe) {
        that.unsubscribe();
      }
      if (code) {
        that.g.wdLog(['obsLoggedUser', code]);
        that.obsLoggedUser.next(code);
      } else {
        that.g.wdLog(['obsLoggedUser -1']);
        that.obsLoggedUser.next(-1);
      }
    })
    .catch(err => {
      that.g.wdLog(['Something went wrong in signOut:', err.message]);
      that.obsLoggedUser.next(firebase.auth().currentUser);
    });
  }

  hideIFrame() {
    const divWidgetContainer = this.g.windowContext.document.getElementById('tiledesk-container');
    if (divWidgetContainer) {
      divWidgetContainer.classList.add('closed');
      divWidgetContainer.classList.remove('open');
    }
  }

  // /jwt/decode?project_id=123
  public decode(token, projectId) {
    const url = this.API_URL + projectId + '/jwt/decode';
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'JWT ' + token);
    return this.http
      .post(url, null, { headers })
      .map((response) => response.json());
  }

  public createFirebaseToken(token, projectId) {
    // const url = this.API_URL + projectId + '/firebase/createtoken';
    const url = this.API_URL + 'chat21/firebase/auth/createCustomToken';
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // headers.append('Authorization', 'JWT ' + token);
    headers.append('Authorization', token);
    return this.http
      .post(url, null, { headers })
      .map((response) => response.text());
  }

  getFirebaseAuthPersistence() {
    if (this.g.persistence === 'local') {
      // console.log('getFirebaseAuthPersistence local');
      if (supports_html5_storage()) {
        return firebase.auth.Auth.Persistence.LOCAL;
      } else {
        return firebase.auth.Auth.Persistence.NONE;
      }
    } else if (this.g.persistence === 'session') {
      // console.log('getFirebaseAuthPersistence session');
      if (supports_html5_session()) {
        return firebase.auth.Auth.Persistence.SESSION;
      } else {
        return firebase.auth.Auth.Persistence.NONE;
      }
    } else if (this.g.persistence === 'none') {
      return firebase.auth.Auth.Persistence.NONE;
    } else {
      // console.log('getFirebaseAuthPersistence local as else');
      if (supports_html5_storage()) {
        return firebase.auth.Auth.Persistence.LOCAL;
      } else {
        return firebase.auth.Auth.Persistence.NONE;
      }
    }
  }


}
