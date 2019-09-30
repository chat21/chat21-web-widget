import { Injectable } from '@angular/core';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/database';

import { Globals } from '../utils/globals';

@Injectable()
export class ChatPresenceHandlerService {
  public urlNodeFirebase: string;
  public myConnectionsRef; // : firebase.database.Reference;
  public lastOnlineRef; // : firebase.database.Reference;


  constructor(
    public g: Globals
  ) {
  }


  initialize() {
    this.urlNodeFirebase = '/apps/' + this.g.tenant ;
  }

  /**
   * controlla se esiste una connessione per l'utente analizzato,
   * verificando se esiste un nodo in presence/uid/connections
   * mi sottosrivo al nodo
   * se non esiste pubblico utente offline
   * se esiste pubblico utente online
   * @param userid
   */
  userIsOnline(userid) {
    // const that = this;
    // const myConnectionsRefURL = this.urlNodeFirebase + '/presence/' + userid + '/connections';
    // const connectionsRef = firebase.database().ref().child(myConnectionsRefURL);
    // connectionsRef.on('value', (child) => {
    //   if ( child.val() ) {
    //     that.events.publish('statusUser:online-' + userid, userid, 'online');
    //   } else {
    //     that.events.publish('statusUser:offline-' + userid, userid, 'offline');
    //   }
    // });
  }
  /**
   * mi sottoscrivo al nodo presence/uid/lastOnline
   * e recupero la data dell'ultimo stato online
   * pubblico lastConnectionDate
   * @param userid
   */
  lastOnlineForUser(userid) {
    // const that = this;
    // const lastOnlineRefURL = this.urlNodeFirebase + '/presence/' + userid + '/lastOnline';
    // const lastOnlineRef = firebase.database().ref().child(lastOnlineRefURL);
    // lastOnlineRef.on('value', (child) => {
    //   if (child.val()) {
    //     const lastConnectionDate = that.getTimeLastConnection(child.val());
    //     that.events.publish('lastConnectionDate-' + userid, userid, lastConnectionDate);
    //   }
    // });
  }

  /**
   * calcolo tempo trascorso tra ora e timestamp passato
   * @param timestamp
   */
  getTimeLastConnection(timestamp: string) {
    // //let timestampNumber = parseInt(timestamp)/1000;
    // const time = setLastDate(this.translate, timestamp);
    // return time;
  }

  /**
   * recupero la reference di lastOnline del currentUser
   * usata in setupMyPresence
   * @param userid
   */
  lastOnlineRefForUser(userid) {
    const lastOnlineRefURL = this.urlNodeFirebase + '/presence/' + userid + '/lastOnline';
    const lastOnlineRef = firebase.database().ref().child(lastOnlineRefURL);
    return lastOnlineRef;
  }

  /**
   * recupero la reference di connections (online/offline) del currentUser
   * usata in setupMyPresence
   * @param userid
   */
  onlineRefForUser(userid) {
    const myConnectionsRefURL = this.urlNodeFirebase + '/presence/' + userid + '/connections';
    this.g.wdLog(['onlineRefForUser *****', myConnectionsRefURL]);
    const connectionsRef = firebase.database().ref().child(myConnectionsRefURL);
    return connectionsRef;
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
   * @param userid
   * https://firebase.google.com/docs/database/web/offline-capabilities#section-connection-state
   */
  setupMyPresence(userid) {
    const that = this;
    that.g.wdLog(['setupMyPresence: ', userid]);
    this.myConnectionsRef = this.onlineRefForUser(userid);
    this.lastOnlineRef = this.lastOnlineRefForUser(userid);
    const connectedRefURL = '/.info/connected';
    const conn = firebase.database().ref(connectedRefURL);

    conn.on('value', function(dataSnapshot) {
      if (dataSnapshot.val() === true) {
        that.g.wdLog(['setupMyPresence: val: ' + dataSnapshot.val() + that.myConnectionsRef]);
        if (that.myConnectionsRef) {
          // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
          const con = that.myConnectionsRef.push();

          // When I disconnect, remove this device
          con.onDisconnect().remove(function(err) {
            if (err) {
              console.error('could not establish onDisconnect event', err);
            }
          });

          // Add this device to my connections list
          // this value could contain info about the device or a timestamp too
          con.set(true);

          // When I disconnect, update the last time I was seen online
          const now: Date = new Date();
          const timestamp = now.valueOf();
          that.lastOnlineRef.onDisconnect().set(timestamp, function(err) {
            if (err) {
              console.error('could not establish onDisconnect event', err);
            }
          });
        } else {
          that.g.wdLog(['This is an error. self.deviceConnectionRef already set. Cannot be set again.']);
        }
      }
    });
  }

  /**
   * rimuovo la references su lastOnline
   * rimuovo la references su connection
   */
  goOffline() {
    this.g.wdLog(['goOffline.', this.myConnectionsRef]);
    this.removeConnectionReference();
    this.removeLastOnlineReference();
  }

  removeConnectionReference() {
    if (this.myConnectionsRef) {
      this.myConnectionsRef.off();
      this.g.wdLog(['goOffline 1', this.myConnectionsRef]);
      this.myConnectionsRef.remove();
      this.g.wdLog(['goOffline 2', this.myConnectionsRef]);
      this.myConnectionsRef = null;
    }
  }

  removeLastOnlineReference() {
    if (this.lastOnlineRef) {
      this.lastOnlineRef.off();
      this.lastOnlineRef.remove();
    }
    this.lastOnlineRef = null;
  }


}
