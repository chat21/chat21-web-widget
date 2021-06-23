import { Injectable } from '@angular/core';
// services
import { NotificationsService } from '../abstract/notifications.service';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/auth';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseNotifications extends NotificationsService {
    
    public BUILD_VERSION: string;
    private FCMcurrentToken: string;
    private userId: string;
    private tenant: string;

    constructor() {
        super();
        console.log('builddddd', this.BUILD_VERSION)
    }

    getNotificationPermissionAndSaveToken(currentUserUid) {
        this.tenant = this.getTenant();
        console.log('FIREBASE-NOTIFICATIONS calling requestPermission - tenant ', this.tenant)
        console.log('FIREBASE-NOTIFICATIONS calling requestPermission - currentUserUid ', currentUserUid)
        this.userId = currentUserUid;
        const messaging = firebase.messaging();
        if (firebase.messaging.isSupported()) {
            // messaging.requestPermission()
            Notification.requestPermission()
                .then(() => {
                    console.log('FIREBASE-NOTIFICATIONS >>>> requestPermission Notification permission granted.');
                    return messaging.getToken()
                })
                .then(FCMtoken => {
                    console.log('FIREBASE-NOTIFICATIONS >>>> requestPermission FCMtoken', FCMtoken)
                    // Save FCM Token in Firebase
                    this.FCMcurrentToken = FCMtoken;
                    this.updateToken(FCMtoken, currentUserUid)
                })
                .catch((err) => {
                    console.log('FIREBASE-NOTIFICATION >>>> requestPermission ERR: Unable to get permission to notify.', err);
                });
        }
    }

    removeNotificationsInstance(callback: (string) => void) {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                console.log('FIREBASE-NOTIFICATION - User is signed in. ', user)

            } else {
                console.log('FIREBASE-NOTIFICATION - No user is signed in. ', user)
            }
        });

        console.log('FIREBASE-NOTIFICATION >>>> removeNotificationsInstance > this.userId', this.userId);
        console.log('FIREBASE-NOTIFICATION >>>> removeNotificationsInstance > FCMcurrentToken', this.FCMcurrentToken);

        const urlNodeFirebase = '/apps/' + this.tenant
        const connectionsRefinstancesId = urlNodeFirebase + '/users/' + this.userId + '/instances/'

        let connectionsRefURL = '';
        if (connectionsRefinstancesId) {
            connectionsRefURL = connectionsRefinstancesId + '/' + this.FCMcurrentToken;
            const connectionsRef = firebase.database().ref().child(connectionsRefURL);
            
            connectionsRef.remove()
                .then(() => {
                    console.log("FIREBASE-NOTIFICATION >>>> removeNotificationsInstance > Remove succeeded.")
                    callback('success')
                }).catch((error) => {
                    console.log("FIREBASE-NOTIFICATION >>>> removeNotificationsInstance Remove failed: " + error.message)
                    callback('error')
                }).finally(() => {
                    console.log('FIREBASE-NOTIFICATION COMPLETED');
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
