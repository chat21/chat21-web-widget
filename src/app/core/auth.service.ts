import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';



@Injectable()
export class AuthService {
  // public user: Observable<firebase.User>;
  // public user: firebase.User;
  public user: any;
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
    // console.log('Notification permission granted.');
    const that = this;
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
    .then(function(idToken) {
        that.token = idToken;
        // console.log('idToken.', idToken);
    }).catch(function(error) {
        console.error('idToken ERROR: ', error);
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



    /**
   * 1 - imposto reference online/offline
   * 2 - imposto reference lastConnection
   * 3 - mi sincronizzo con /.info/connected
   * 4 - se il valore esiste l'utente è online
   * 5 - aggiungo nodo a connection (true)
   * 6 - aggiungo job su onDisconnect di deviceConnectionRef che rimuove nodo connection
   * 7 - aggiungo job su onDisconnect di lastOnlineRef che imposta timestamp
   * 8 - salvo reference connected nel singlelton !!!!! DA FARE
   */
  setupMyPresence(userid, tenant) {
    const that = this;
    const myConnectionsRef = this.onlineRefForUser(userid, tenant);
    const lastOnlineRef = this.lastOnlineRefForUser(userid, tenant);
    const connectedRefURL = '/.info/connected';
    const conn = firebase.database().ref(connectedRefURL);
    conn.on('value', function(dataSnapshot) {
      if (dataSnapshot.val()) {
        console.log('self.deviceConnectionRef: ', myConnectionsRef);
        if (myConnectionsRef) {
          const conection = true;
          myConnectionsRef.push(conection);
          myConnectionsRef.onDisconnect().remove();
          const now: Date = new Date();
          const timestamp = now.valueOf();
          lastOnlineRef.onDisconnect().set(timestamp);
        } else {
          console.log('This is an error. self.deviceConnectionRef already set. Cannot be set again.');
        }
      }
    });
  }
  /**
   * recupero la reference di lastOnline del currentUser
   * usata in setupMyPresence
   */
  lastOnlineRefForUser(userid, tenant) {
    const lastOnlineRefURL = '/apps/' + tenant + '/presence/' + userid + '/lastOnline';
    const lastOnlineRef = firebase.database().ref().child(lastOnlineRefURL);
    return lastOnlineRef;
  }

  /**
   * recupero la reference di connections (online/offline) del currentUser
   * usata in setupMyPresence
   */
  onlineRefForUser(userid, tenant) {
    const myConnectionsRefURL = '/apps/' + tenant + '/presence/' + userid + '/connections';
    const connectionsRef = firebase.database().ref().child(myConnectionsRefURL);
    return connectionsRef;
  }

}
