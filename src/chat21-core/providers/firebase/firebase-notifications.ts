import { LoggerInstance } from './../logger/loggerInstance';
import { Injectable } from '@angular/core';
// services
import { NotificationsService } from '../abstract/notifications.service';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/auth';
import { LoggerService } from '../abstract/logger.service';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseNotifications extends NotificationsService {
    
    public BUILD_VERSION: string;
    private FCMcurrentToken: string;
    private userId: string;
    private tenant: string;
    private logger: LoggerService = LoggerInstance.getInstance()
    constructor() {
        super();
        this.logger.debug('builddddd', this.BUILD_VERSION)
    }

    getNotificationPermissionAndSaveToken(currentUserUid) {
        this.tenant = this.getTenant();
        this.logger.debug('[FIREBASE-NOTIFICATIONS] calling requestPermission - tenant ', this.tenant)
        this.logger.debug('[FIREBASE-NOTIFICATIONS] calling requestPermission - currentUserUid ', currentUserUid)
        this.userId = currentUserUid;
        const messaging = firebase.messaging();
        if (firebase.messaging.isSupported()) {
            // messaging.requestPermission()
            Notification.requestPermission()
                .then(() => {
                    this.logger.debug('[FIREBASE-NOTIFICATIONS] >>>> requestPermission Notification permission granted.');
                    return messaging.getToken()
                })
                .then(FCMtoken => {
                    this.logger.debug('[FIREBASE-NOTIFICATIONS] >>>> requestPermission FCMtoken', FCMtoken)
                    // Save FCM Token in Firebase
                    this.FCMcurrentToken = FCMtoken;
                    this.updateToken(FCMtoken, currentUserUid)
                })
                .catch((err) => {
                    this.logger.error('FIREBASE-NOTIFICATION >>>> requestPermission ERR: Unable to get permission to notify.', err);
                });
        }
    }

    removeNotificationsInstance(callback: (string) => void) {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                this.logger.debug('FIREBASE-NOTIFICATION - User is signed in. ', user)

            } else {
                this.logger.debug('FIREBASE-NOTIFICATION - No user is signed in. ', user)
            }
        });

        this.logger.debug('FIREBASE-NOTIFICATION >>>> removeNotificationsInstance > this.userId', this.userId);
        this.logger.debug('FIREBASE-NOTIFICATION >>>> removeNotificationsInstance > FCMcurrentToken', this.FCMcurrentToken);

        const urlNodeFirebase = '/apps/' + this.tenant
        const connectionsRefinstancesId = urlNodeFirebase + '/users/' + this.userId + '/instances/'

        let connectionsRefURL = '';
        if (connectionsRefinstancesId) {
            connectionsRefURL = connectionsRefinstancesId + '/' + this.FCMcurrentToken;
            const connectionsRef = firebase.database().ref().child(connectionsRefURL);
            
            connectionsRef.remove()
                .then(() => {
                    this.logger.debug("FIREBASE-NOTIFICATION >>>> removeNotificationsInstance > Remove succeeded.")
                    callback('success')
                }).catch((error) => {
                    this.logger.error("FIREBASE-NOTIFICATION >>>> removeNotificationsInstance Remove failed: " + error.message)
                    callback('error')
                }).finally(() => {
                    this.logger.debug('FIREBASE-NOTIFICATION COMPLETED');
                })
        }
    }

    // removeNotificationsInstance() {
    //     let promise = new Promise((resolve, reject) => {
    //         this.appStoreService.getInstallation(this.projectId).then((res) => {
    //             console.log("Get Installation Response: ", res);
    //             resolve(res);
    //         }).catch((err) => {
    //             console.error("Error getting installation: ", err);
    //             reject(err);
    //         })
    //     })
    //     return promise;
    // }


    // ********** PRIVATE METHOD - START ****************//
    private updateToken(FCMcurrentToken, currentUserUid) {
        console.log('FIREBASE-NOTIFICATION >>>> getPermission > updateToken ', FCMcurrentToken);
        // this.afAuth.authState.take(1).subscribe(user => {
        if (!currentUserUid || !FCMcurrentToken) {
            return
        };

        const connection = FCMcurrentToken;
        const updates = {};
        const urlNodeFirebase = '/apps/' + this.tenant
        const connectionsRefinstancesId = urlNodeFirebase + '/users/' + currentUserUid + '/instances/';

        // this.connectionsRefinstancesId = this.urlNodeFirebase + "/users/" + userUid + "/instances/";
        const device_model = {
            device_model: navigator.userAgent,
            language: navigator.language,
            platform: 'ionic',
            platform_version: this.BUILD_VERSION
        }

        updates[connectionsRefinstancesId + connection] = device_model;

        console.log('FIREBASE-NOTIFICATION >>>> getPermission > updateToken in DB', updates);
        firebase.database().ref().update(updates)
    }
    // ********** PRIVATE METHOD - END ****************//



}
