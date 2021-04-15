import { Injectable } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/auth';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';

import { Globals } from '../utils/globals';
import { supports_html5_storage, supports_html5_session } from '../utils/utils';
import { AppConfigService } from './app-config.service';
import { StorageService } from './storage.service';
import { componentRefresh } from '@angular/core/src/render3/instructions';

@Injectable()
export class AuthService_old {
  // public user: Observable<firebase.User>;
  // public user: firebase.User;
  public user: any;
  private token: string;
  obsLoggedUser = new ReplaySubject<number>(1);

  unsubscribe: any;
  API_URL: string;

  constructor(
    // private firebaseAuth: AngularFireAuth,
    public http: Http,
    public g: Globals,
    public appConfigService: AppConfigService,
    private storageService: StorageService,
  ) {
    this.API_URL = appConfigService.getConfig().apiUrl;
  }

  initialize() {
    const tiledeskTokenTEMP = this.storageService.getItem('tiledeskToken');
    this.g.wdLog([' ---------------- AuthService initialize ---------------- ']);
    /** SIGIN WITH JWT CUSTOM TOKEN */
    // aggiungo nel local storage e mi autentico
    // this.g.wdLog(['controllo se è stato passato un token: ', this.g.jwt]);
    // if (this.g.jwt) {
    //   // mi loggo con custom token passato nell'url
    //   this.g.wdLog([' ----------------  mi loggo con custom token passato nell url  ---------------- ']);
    //   this.authenticationWithCustomToken(this.g.jwt);
    //   this.g.tiledeskToken = this.g.jwt;
    // } else
    if (tiledeskTokenTEMP && tiledeskTokenTEMP !== undefined) {
        this.g.tiledeskToken = tiledeskTokenTEMP;
        // SONO già loggato
        this.g.wdLog([' ---------------- SONO già loggato ---------------- ']);
        this.authenticationWithCustomToken(this.g.tiledeskToken);
    } else {
        // NON sono loggato;
        this.g.wdLog([' ---------------- NON sono loggato ---------------- ']);
        this.obsLoggedUser.next(0);
    }
  }


  // onAuthStateChanged() {
  //   const that = this;
  //   that.g.wdLog(['-------------------- >>>> onAuthStateChanged <<<< ------------------------']);
  //   // https://stackoverflow.com/questions/37370224/firebase-stop-listening-onauthstatechanged
  //   this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
  //     if (!user) {
  //       that.g.wdLog(['NO CURRENT USER PASSO NULL']);
  //       if (that.g.isLogout === false ) {
  //         that.obsLoggedUser.next(0);
  //       }
  //     } else {
  //       that.g.wdLog(['that.environment.shemaVersion', environment.shemaVersion]);
  //       that.g.wdLog(['shemaVersion', that.storageService.getItemWithoutProjectId('shemaVersion')]);
  //       const tiledeskTokenTEMP = that.storageService.getItem('tiledeskToken');
  //       const shemaVersionTEMP = that.storageService.getItemWithoutProjectId('shemaVersion');
  //       if (environment.shemaVersion !== shemaVersionTEMP) {
  //         that.signOut(0);
  //       } else if (!tiledeskTokenTEMP || tiledeskTokenTEMP === undefined) {
  //         that.signOut(0);
  //       } else {
  //         that.g.wdLog(['PASSO CURRENT USER']);
  //         that.user = firebase.auth().currentUser;
  //         that.g.wdLog(['onAuthStateChanged']);
  //         that.getIdToken();
  //         that.obsLoggedUser.next(firebase.auth().currentUser);
  //       }
  //     }
  //   });
  // }

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


  // -------------- BEGIN SIGN IN ANONYMOUSLY  -------------- //

  resigninAnonymousAuthentication() {
    const that = this;
    const tiledeskToken = this.g.tiledeskToken;
    if (tiledeskToken) {
      this.resigninAnonymously(tiledeskToken)
      .subscribe(response => {
        if (response.token) {
          that.g.tiledeskToken = tiledeskToken;
          that.storageService.setItem('tiledeskToken', tiledeskToken);
          // that.storageService.setItemWithoutProjectId('tiledeskToken', tiledeskToken);
          // const newTiledeskToken = response.token;
          // console.log('tiledeskToken 1: ', tiledeskToken);
          // console.log('tiledeskToken 2: ', newTiledeskToken);
        }
      });
    }
  }

  /** */
  authenticationWithCustomToken(tiledeskToken: string) {
    const that = this;
    this.g.wdLog(['tiledeskToken::: ', tiledeskToken]);
    if (tiledeskToken) {
      this.createFirebaseToken(tiledeskToken, this.g.projectid)
      .subscribe(firebaseToken => {
        that.authenticateFirebaseCustomToken(firebaseToken);
      }, error => {
        console.log('createFirebaseToken: ', error);
        that.signOut(-1);
      });
    }
  }

  /** */
  anonymousAuthentication() {
    const that = this;
    this.g.wdLog(['anonymousAuthentication: ']);
    const tiledeskToken = that.storageService.getItem('tiledeskToken');
    if (tiledeskToken) {
      that.createFirebaseToken(tiledeskToken, that.g.projectid)
      .subscribe(firebaseToken => {
        that.authenticateFirebaseCustomToken(firebaseToken);
      }, error => {
        console.log('createFirebaseToken: ', error);
        that.signOut(-1);
      });
    } else {
      this.signinAnonymously()
      .subscribe(response => {
        that.g.wdLog(['signinAnonymously: ', response]);
        if (response.token) {
          that.g.wdLog(['salvo tiledesk token:: ', response.token]);
          that.g.tiledeskToken = response.token;
          // remove tiledeskToken from storage
          // this.storageService.removeItemForSuffix('_tiledeskToken');
          that.storageService.setItem('tiledeskToken', response.token);
          // that.storageService.setItemWithoutProjectId('tiledeskToken', tiledeskToken);
          that.createFirebaseToken(response.token, that.g.projectid)
          .subscribe(firebaseToken => {
            that.authenticateFirebaseCustomToken(firebaseToken);
          }, error => {
            console.log('createFirebaseToken: ', error);
            that.signOut(-1);
          });
        }
      }, error => {
        console.log('Error creating firebase token: ', error);
        that.signOut(-1);
      });
    }
  }

  /** */
  private resigninAnonymously(tiledeskToken) {
    const url = this.API_URL + 'auth/resigninAnonymously';
    this.g.wdLog(['url', url]);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', tiledeskToken);
    const body = {
      'id_project': this.g.projectid
    };
    this.g.wdLog(['------------------> body: ', JSON.stringify(body)]);
    return this.http
      .post(url, JSON.stringify(body), { headers })
      .map((response) => response.json());
  }

  /** */
  private signinAnonymously() {
    const url = this.API_URL + 'auth/signinAnonymously';
    this.g.wdLog(['url', url]);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const body = {
      'id_project': this.g.projectid
    };
    this.g.wdLog(['------------------> body: ', JSON.stringify(body)]);
    return this.http
      .post(url, JSON.stringify(body), { headers })
      .map((response) => response.json());
  }

  public signInWithCustomToken(token: string) {
    this.g.wdLog(['salvo tiledesk token:: ', token]);
    this.g.tiledeskToken = token;
    this.storageService.setItem('tiledeskToken', token);
    // this.storageService.setItemWithoutProjectId('tiledeskToken', token);
    this.g.autoStart = true;
    const url = this.API_URL + 'auth/signinWithCustomToken';
    this.g.wdLog(['url', url]);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', token);
    return this.http
    .post(url, null, { headers })
    .map((response) => response.json());
  }
  /** */
  // token è un Tiledesk token ritorna Firebase Token
  public createFirebaseToken(token, projectId?) {
    // const url = this.API_URL + projectId + '/firebase/createtoken';
    const url = this.API_URL + 'chat21/firebase/auth/createCustomToken';
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', token);
    return this.http
      .post(url, null, { headers })
      .map((response) => response.text());
  }

  /** */
  authenticateFirebaseCustomToken(token) {
    this.g.wdLog(['1 - authService.authenticateFirebaseCustomToken', token]);
    this.g.firebaseToken = token;
    this.storageService.setItemWithoutProjectId('firebaseToken', token);
    const that = this;
    firebase.auth().setPersistence(this.getFirebaseAuthPersistence()).then(function() {
      // Sign-out successful.
      that.g.wdLog(['2 - authService.signInWithCustomToken', token]);
      firebase.auth().signInWithCustomToken(token)
      .then(function(response) {
        // console.log('-------------- signInWithCustomToken -------------------', response);
        that.g.setParameter('signInWithCustomToken', true);
        that.storageService.setItemWithoutProjectId('shemaVersion', environment.storage_prefix);
        that.user = response.user;
        if (that.unsubscribe) {
          that.unsubscribe();
        }
        that.g.wdLog(['obsLoggedUser - authService.authenticateFirebaseCustomToken']);
        that.obsLoggedUser.next(200);
      })
      .catch(function(error) {
        // console.log('---------------------------------');
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/invalid-custom-token') {
          // alert('The token you provided is not valid.');
        } else {
          console.error(error);
        }
        // if (that.unsubscribe) {
        //   that.unsubscribe();
        // }
        // that.g.wdLog(['authenticateFirebaseCustomToken ERROR: ', error]);
        // that.signOut(-1);
      });
    })
    .catch(function(error) {
      console.error('Error setting firebase auth persistence', error);
      that.signOut(-1);
    });
  }

  // -------------- END SIGN IN ANONYMOUSLY  -------------- //




  /** */
  authenticateFirebaseAnonymously() {
    this.g.wdLog(['authenticateFirebaseAnonymously']);
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
            that.obsLoggedUser.next(200);
          })
          .catch(function(error) {
              const errorCode = error.code;
              const errorMessage = error.message;
              if (that.unsubscribe) {
                that.unsubscribe();
              }
              that.g.wdLog(['signInAnonymously ERROR: ', errorCode, errorMessage]);
              that.signOut(-1);
          });
        })
    .catch(function(error) {
      console.error('Error setting firebase auth persistence', error);
      that.signOut(-1);
    });
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
        that.obsLoggedUser.next(200);
      })
      .catch(function(error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (that.unsubscribe) {
          that.unsubscribe();
        }
        that.g.wdLog(['authenticateFirebaseWithEmailAndPassword ERROR: ', errorCode, errorMessage]);
        that.signOut(-1);
      });
    })
    .catch(function(error) {
      console.error('Error setting firebase auth persistence', error);
      that.signOut(-1);
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

  signOut(codice: number) {
    const that = this;
    // return this.firebaseAuth.auth.signOut()
    return firebase.auth().signOut()
    .then(value => {
      that.g.wdLog(['Nice, signOut OK!', value]);
      that.hideIFrame();
      if (that.unsubscribe) {
        that.unsubscribe();
      }
      that.g.wdLog(['signOut', codice]);
      that.g.wdLog(['obsLoggedUser', codice]);
      that.obsLoggedUser.next(codice);
    })
    .catch(err => {
      that.g.wdLog(['Something went wrong in signOut:', err.message]);
      // that.obsLoggedUser.next(firebase.auth().currentUser);
      that.obsLoggedUser.next(400);
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


  getFirebaseAuthPersistence() {
    return firebase.auth.Auth.Persistence.NONE;
    /*
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
    */
  }


}
