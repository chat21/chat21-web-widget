import { CustomLogger } from './../logger/customLogger';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';

// services
// import { EventsService } from '../events-service';
import { PresenceService } from '../abstract/presence.service';
import { LoggerService } from '../abstract/logger.service';
import { LoggerInstance } from '../logger/loggerInstance';

// utils
// import { setLastDate } from '../../utils/utils';
// import { environment } from '../../../environments/environment';

// @Injectable({providedIn: 'root'})
@Injectable()
export class FirebasePresenceService extends PresenceService {

  // BehaviorSubject
  // BSIsOnline: BehaviorSubject<any>;
  BSIsOnline: BehaviorSubject<any>;
  BSLastOnline: BehaviorSubject<any>;


  // public params
  public tenant: string;

  // private params
  private urlNodePresence: string;
  private onlineConnectionsRef: any;
  private lastOnlineConnectionsRef: any;
  private keyConnectionRef: any;
  private logger: LoggerService = LoggerInstance.getInstance();
  online_member = []
  constructor() {
    super();
  }

  /**
   *
   */
  public initialize() {
    this.urlNodePresence = '/apps/' + this.tenant + '/presence/';
  }

  /**
   * userIsOnline
   * @param userid
   */
  // public userIsOnline(userid: string) {
  //   this.logger.printDebug('FIREBASEPresenceSERVICE::userIsOnline', userid);
  //   console.log('CONVERSATION-DETAIL group detail userIsOnline', userid);
  //   const that = this;
  //   const urlNodeConnections = this.urlNodePresence + userid + '/connections';
  //   this.logger.printDebug('FIREBASEPresenceSERVICE::userIsOnline: ', urlNodeConnections);
  //   const connectionsRef = firebase.database().ref().child(urlNodeConnections);
  //   connectionsRef.on('value', (child) => {
  //     this.logger.printDebug('FIREBASEPresenceSERVICE::is-online-' + userid);
  //     if (child.val()) {
  //       console.log('CONVERSATION-DETAIL group detail userIsOnline id user', userid, '- child.val: ', child.val());
  //       this.BSIsOnline.next({uid: userid, isOnline: true});
  //       console.log('CONVERSATION-DETAIL group detail userIsOnline 1', userid);
  //     } else {
  //       this.BSIsOnline.next({uid: userid, isOnline: false});
  //       console.log('CONVERSATION-DETAIL group detail userIsOnline 2', userid);
  //     }
  //   });
  // }

  public userIsOnline(userid: string): Observable<any> {
    const that = this;
    let local_BSIsOnline = new BehaviorSubject<any>(null);
    const urlNodeConnections = this.urlNodePresence + userid + '/connections';
    this.logger.printDebug('FIREBASEPresenceSERVICE::userIsOnline: ', urlNodeConnections);
    const connectionsRef = firebase.database().ref().child(urlNodeConnections);
    connectionsRef.off()
    connectionsRef.on('value', (child) => {
      that.logger.printDebug('FIREBASEPresenceSERVICE::CONVERSATION-DETAIL group detail userIsOnline id user', userid, '- child.val: ', child.val());
      if (child.val()) {
        that.BSIsOnline.next({ uid: userid, isOnline: true });
        local_BSIsOnline.next({ uid: userid, isOnline: true });
      } else {
        that.BSIsOnline.next({ uid: userid, isOnline: false });
        local_BSIsOnline.next({ uid: userid, isOnline: false });
      }
    });
    return local_BSIsOnline
  }


  /**
   * lastOnlineForUser
   * @param userid
   */
  public lastOnlineForUser(userid: string) {
    this.logger.printDebug('FIREBASEPresenceSERVICE::lastOnlineForUser', userid);
    const that = this;
    const lastOnlineRef = this.referenceLastOnlineForUser(userid);
    lastOnlineRef.on('value', (child) => {
      if (child.val()) {
        this.BSLastOnline.next({ uid: userid, lastOnline: child.val() });
      } else {
        this.BSLastOnline.next({ uid: userid, lastOnline: null });
      }
    });
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
   *  https://firebase.google.com/docs/database/web/offline-capabilities?hl=it
   * @param userid
   */
  public setPresence(userid: string): void {
    this.onlineConnectionsRef = this.referenceOnlineForUser(userid);
    this.lastOnlineConnectionsRef = this.referenceLastOnlineForUser(userid);
    const connectedRefURL = '/.info/connected';
    const conn = firebase.database().ref(connectedRefURL);
    conn.on('value', (dataSnapshot) => {
      this.logger.printDebug('FIREBASEPresenceSERVICE::self.deviceConnectionRef: ', dataSnapshot.val());
      if (dataSnapshot.val()) {
        if (this.onlineConnectionsRef) {
          this.keyConnectionRef = this.onlineConnectionsRef.push(true);
          this.keyConnectionRef.onDisconnect().remove();
          const now: Date = new Date();
          const timestamp = now.valueOf();
          this.lastOnlineConnectionsRef.onDisconnect().set(timestamp);
        } else {
          this.logger.printError('FIREBASEPresenceSERVICE::setPresence --> This is an error. self.deviceConnectionRef already set. Cannot be set again.');
        }
      }
    });
  }

  /**
   * removePresence
   * richiamato prima del logout
   */
  public removePresence(): void {
    if (this.onlineConnectionsRef) {
      const now: Date = new Date();
      const timestamp = now.valueOf();
      this.lastOnlineConnectionsRef.set(timestamp);
      this.onlineConnectionsRef.off();
      this.onlineConnectionsRef.remove();
      this.logger.printDebug('FIREBASEPresenceSERVICE::goOffline onlineConnectionsRef', this.onlineConnectionsRef);
    }
  }

  /**
   * recupero la reference di lastOnline del currentUser
   * usata in setupMyPresence
   * @param userid
   */
  private referenceLastOnlineForUser(userid: string): firebase.database.Reference {
    const urlNodeLastOnLine = this.urlNodePresence + userid + '/lastOnline';
    const lastOnlineRef = firebase.database().ref().child(urlNodeLastOnLine);
    return lastOnlineRef;
  }

  /**
   * recupero la reference di connections (online/offline) del currentUser
   * usata in setupMyPresence
   * @param userid
   */
  private referenceOnlineForUser(userid: string): firebase.database.Reference {
    const urlNodeConnections = this.urlNodePresence + userid + '/connections';
    const connectionsRef = firebase.database().ref().child(urlNodeConnections);
    return connectionsRef;
  }

}
