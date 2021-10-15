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
    private vapidkey: string;
    private logger: LoggerService = LoggerInstance.getInstance();
    constructor() {
        super();
    }

    initialize(tenant: string, vapId: string): void {
        this.tenant = tenant
        this.vapidkey = vapId
        this.logger.info('[FIREBASE-NOTIFICATIONS] initialize - tenant ', this.tenant)


        if (!('serviceWorker' in navigator)) {
            // , disable or hide UI.
            this.logger.error("[FIREBASE-NOTIFICATIONS] initialize - Service Worker isn't supported on this browser", navigator)
            return;
        }
        if (('serviceWorker' in navigator)) {
            // this.logger.log("[FIREBASE-NOTIFICATIONS] initialize - Service Worker is supported on this browser ", navigator)
            navigator.serviceWorker.getRegistrations().then((serviceWorkerRegistrations) => {
                this.logger.log("[FIREBASE-NOTIFICATIONS] initialize - Service Worker is supported on this browser serviceWorkerRegistrations", serviceWorkerRegistrations)
                if (serviceWorkerRegistrations.length > 0) {
                    serviceWorkerRegistrations.forEach(registration => {
                        this.logger.log("[FIREBASE-NOTIFICATIONS] initialize - Service Worker is supported on this browser registration ", registration)
                        // this.logger.log("[FIREBASE-NOTIFICATIONS] initialize - Service Worker is supported on this browser registrations scriptURL", registrations.active.scriptURL)
                        // this.logger.log("[FIREBASE-NOTIFICATIONS] initialize - Service Worker is supported on this browser registrations state", registrations.active.state)

                    });
                } else {
                    this.logger.log("[FIREBASE-NOTIFICATIONS] initialize - Service Worker is supported on this browser - !not registered",)
                    // navigator.serviceWorker.register('http://localhost:8101/firebase-messaging-sw.js')
                    //     .then(function (registration) {
                    //         console.log('Service worker successfully registered.');
                    //         return registration;
                    //     }).catch(function (err) {
                    //         console.error('Unable to register service worker.', err);
                    //     });
                }
            });
        }
    }

    getNotificationPermissionAndSaveToken(currentUserUid) {
        // this.tenant = this.getTenant();
        this.logger.log('[FIREBASE-NOTIFICATIONS] calling requestPermission - tenant ', this.tenant)
        this.logger.log('[FIREBASE-NOTIFICATIONS] calling requestPermission - currentUserUid ', currentUserUid)
        this.userId = currentUserUid;
        // Service Worker explicit registration to explicitly define sw location at a path
        // const swRegistration = async () => {
        //     try {
        //         await navigator.serviceWorker.register('http://localhost:8101/firebase-messaging-sw.js');
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }


      
        if (firebase.messaging.isSupported()) {
            const messaging = firebase.messaging(); 
            // messaging.requestPermission()
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> requestPermission Notification permission granted.');

                    return messaging.getToken({ vapidKey: this.vapidkey })
                }
            }).then(FCMtoken => {
                this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> requestPermission FCMtoken', FCMtoken)
                // Save FCM Token in Firebase
                this.FCMcurrentToken = FCMtoken;
                this.updateToken(FCMtoken, currentUserUid)
            }).catch((err) => {
                this.logger.error('[FIREBASE-NOTIFICATIONS] >>>> requestPermission ERR: Unable to get permission to notify.', err);
            });
        } else {
            this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> FIREBASE MESSAGING IS NOT SUPPORTED')
        }
    }

    // getNotificationPermissionAndSaveToken(currentUserUid) {
    //     // this.tenant = this.getTenant();
    //     this.logger.log('[FIREBASE-NOTIFICATIONS] calling requestPermission - tenant ', this.tenant)
    //     this.logger.log('[FIREBASE-NOTIFICATIONS] calling requestPermission - currentUserUid ', currentUserUid)
    //     this.userId = currentUserUid;
    //     const messaging = firebase.messaging();
    //     if (firebase.messaging.isSupported()) {
    //         // messaging.requestPermission()
    //         Notification.requestPermission().then((permission) => {
    //             if (permission === 'granted') {
    //                 this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> requestPermission Notification permission granted.');
    //                 messaging.getToken({ vapidKey: 'BOsgS2ADwspKdWAmiFDZXEYqY1HSYADVfJT3j67wsySh3NxaViJqoabPJH8WM02wb5r8cQIm5TgM0UK047Z1D1c'}).then((currentToken) => {
    //                     if (currentToken) {
    //                         this.sendTokenToServer(currentToken);
    //     // updateUIForPushEnabled(currentToken);

    //                     } else {
    //                       // Show permission request UI
    //                       console.log('No registration token available. Request permission to generate one.');
    //                       // ...
    //                     }
    //                   }).catch((err) => {
    //                     console.log('An error occurred while retrieving token. ', err);
    //                     // ...
    //                   });

    //                 resetUI()

    //             } else {
    //                 this.logger.error('Unable to get permission to notify.');
    //             }
    //         })

    //     }
    // }

    //  sendTokenToServer(currentToken) {
    //     if (!this.isTokenSentToServer()) {
    //       console.log('Sending token to server...');
    //       // TODO(developer): Send the current token to your server.
    //       this.setTokenSentToServer(true);
    //     } else {
    //       console.log('Token already sent to server so won\'t send it again ' +
    //           'unless it changes');
    //     }
    //   }

    //   isTokenSentToServer() {
    //     return window.localStorage.getItem('sentToServer') === '1';
    //   }

    //   setTokenSentToServer(sent) {
    //     window.localStorage.setItem('sentToServer', sent ? '1' : '0');
    //   }

    removeNotificationsInstance(callback: (string) => void) {
        var self = this;
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                self.logger.debug('[FIREBASE-NOTIFICATIONS] - User is signed in. ', user)

            } else {
                self.logger.debug('[FIREBASE-NOTIFICATIONS] - No user is signed in. ', user)
            }
        });

        this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > this.userId', this.userId);
        this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > FCMcurrentToken', this.FCMcurrentToken);
        // this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > this.tenant', this.tenant);
        const urlNodeFirebase = '/apps/' + this.tenant
        const connectionsRefinstancesId = urlNodeFirebase + '/users/' + this.userId + '/instances/'
        this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> connectionsRefinstancesId ', connectionsRefinstancesId);
        let connectionsRefURL = '';
        if (connectionsRefinstancesId) {
            connectionsRefURL = connectionsRefinstancesId + this.FCMcurrentToken;
            const connectionsRef = firebase.database().ref().child(connectionsRefURL);
            this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> connectionsRef ', connectionsRef);
            this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> connectionsRef url ', connectionsRefURL);
            connectionsRef.off()
            connectionsRef.remove()
                .then(() => {
                    this.logger.log("[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > Remove succeeded.")
                    callback('success')
                }).catch((error) => {
                    this.logger.error("[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance Remove failed: " + error.message)
                    callback('error')
                }).finally(() => {
                    this.logger.log('[FIREBASE-NOTIFICATIONS] COMPLETED');
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
        this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> getPermission > updateToken ', FCMcurrentToken);
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

        this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> getPermission > updateToken in DB', updates);
        firebase.database().ref().update(updates)
    }
    // ********** PRIVATE METHOD - END ****************//



}
