import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';

@Injectable()
export class AuthService {
  // public user: Observable<firebase.User>;
  // public user: firebase.User;
  public user: any;
  private token: string;
  obsLoggedUser: BehaviorSubject<any>;
  obsCurrentUser: BehaviorSubject<any>;

  unsubscribe: any;
  API_URL: string;

  constructor(
    private firebaseAuth: AngularFireAuth,
    public http: Http
  ) {
    // this.user = firebaseAuth.authState;
    this.obsLoggedUser = new BehaviorSubject<any>(null);
    this.obsCurrentUser = new BehaviorSubject<any>(null);

    this.API_URL = environment.apiUrl;
  }


  



  onAuthStateChanged() {
    const that = this;
    // https://stackoverflow.com/questions/37370224/firebase-stop-listening-onauthstatechanged
    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        console.log('NO CURRENT USER PASSO NULL');
        that.obsCurrentUser.next(0);
      } else {
        console.log('PASSO CURRENT USER');
        that.user = firebase.auth().currentUser;
        that.obsCurrentUser.next(that.user);
      }
    });
  }

  getCurrentUser() {
    return firebase.auth().currentUser;
  }


  getIdToken() {
    // console.log('Notification permission granted.');
    const that = this;
    firebase.auth().currentUser.getIdToken()/* true: forceRefresh */
    .then(function(idToken) {
        that.token = idToken;
        console.log('******************** ---------------> idToken.', idToken);
    }).catch(function(error) {
        console.error('idToken ERROR: ', error);
    });
  }

  getToken() {
    return this.token;
  }


  authenticateFirebaseAnonymously() {
    const that = this;
    firebase.auth().signInAnonymously()
    .then(function(user) {
      that.user = user;
      that.unsubscribe();
      that.obsLoggedUser.next(user);
      that.getIdToken();
    })
    .catch(function(error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        that.unsubscribe();
        that.obsLoggedUser.next(null);
        console.log('signInAnonymously ERROR: ', errorCode, errorMessage);
    });
  }

  authenticateFirebaseCustomToken(token) {
    console.log("authService.authenticateFirebaseCustomToken", token);
    const that = this;
    // firebase.auth().currentUser.getIdToken()
    // .then(function(idToken) {
    //   // Send token to your backend via HTTPS
    //   console.log('idToken: ', idToken);
    //   // ...
    // }).catch(function(error) {
    //   // Handle error
    // });
   
      // console.log('token: ', token);
      // Sign-out successful.
      firebase.auth().signInWithCustomToken(token)
      .then(function(user) {
        that.user = user;
        that.unsubscribe();
        that.obsLoggedUser.next(user);
        that.getToken();
      })
      .catch(function(error) {
          const errorCode = error.code;
          const errorMessage = error.message;
          that.unsubscribe();
          that.obsLoggedUser.next(null);
          console.log('authenticateFirebaseCustomToken ERROR: ', errorCode, errorMessage);
      });
  }



  authenticateFirebaseWithEmailAndPassword(email, password) {
    const that = this;
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(user) {
      that.user = user;
      that.unsubscribe();
      that.obsLoggedUser.next(user);
      that.getIdToken();
    })
    .catch(function(error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      that.unsubscribe();
      that.obsLoggedUser.next(null);
      console.log('authenticateFirebaseWithEmailAndPassword ERROR: ', errorCode, errorMessage);
    });
  }


  logout() {
    return this.firebaseAuth.auth.signOut();
  }


  signOut() {
    return firebase.auth().signOut();
    // .then(function() {
    //   // Sign-out successful.
    // }).catch(function(error) {
    //   // An error happened.
    // });
  }



  signup(email: string, password: string) {
    this.firebaseAuth
      .auth
      .createUserWithEmailAndPassword(email, password)
      .then(value => {
        console.log('Success!', value);
      })
      .catch(err => {
        console.log('Something went wrong:', err.message);
      });
  }

  login(email: string, password: string) {
    this.firebaseAuth
      .auth
      .signInWithEmailAndPassword(email, password)
      .then(value => {
        console.log('Nice, it worked!');
      })
      .catch(err => {
        console.log('Something went wrong:', err.message);
      });
  }

  logout2() {
    this.firebaseAuth
      .auth
      .signOut();
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

  public createToken(token, projectId) {
    const url = this.API_URL + projectId + '/firebase/createtoken';

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'JWT ' + token);
    return this.http
      .post(url, null, { headers })
      .map((response) => response.json());
  }



}
