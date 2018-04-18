import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';



@Injectable()
export class AuthService {
  // public user: Observable<firebase.User>;
  public user: firebase.User;
  public token: string;
  obsLoggedUser: BehaviorSubject<any>;

  constructor(
    private firebaseAuth: AngularFireAuth
  ) {
    // this.user = firebaseAuth.authState;
    this.obsLoggedUser = new BehaviorSubject<any>(null);
  }

  getCurrentUser() {
    const that = this;
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        console.log('PASSO OFFLINE AL CHAT MANAGER');
        that.obsLoggedUser.next(null);
      } else {
        console.log('1 - user OK ***', that.obsLoggedUser);
        that.user = firebase.auth().currentUser;
        that.obsLoggedUser.next(that.user);
        that.getToken();
      }
    });
  }

  getToken() {
    console.log('Notification permission granted.');
    const that = this;
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
    .then(function(idToken) {
        that.token = idToken;
        console.log('idToken.', idToken);
    }).catch(function(error) {
        console.log('idToken ERROR: ', error);
    });
  }


  authenticateFirebaseAnonymously() {
    const that = this;
    firebase.auth().signInAnonymously()
    .then(function(user) {
      that.user = user;
      that.obsLoggedUser.next(user);
      that.getToken();
    })
    .catch(function(error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        that.obsLoggedUser.next(null);
        console.log('signInAnonymously ERROR: ', errorCode, errorMessage);
    });
  }


  logout() {
    return this.firebaseAuth
      .auth
      .signOut();
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

}
