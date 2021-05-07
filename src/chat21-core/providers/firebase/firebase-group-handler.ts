import { AppConfigService } from './../../../app/providers/app-config.service';
import { GroupsHandlerService } from './../abstract/groups-handler.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/storage';

// models
import { ConversationModel } from '../../models/conversation';

// services
//import { DatabaseProvider } from '../database';

// utils
import { CustomLogger } from '../logger/customLogger';
import { GroupModel } from '../../models/group';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { avatarPlaceholder } from '../../../app/utils/utils';
import { getColorBck } from '../../utils/utils-user';



// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseGroupsHandler extends GroupsHandlerService {

    // BehaviorSubject
    BSgroupDetail: BehaviorSubject<GroupModel>;
    SgroupDetail: Subject<GroupModel>;
    groupAdded: BehaviorSubject<GroupModel>;
    groupChanged: BehaviorSubject<GroupModel>;
    groupRemoved: BehaviorSubject<GroupModel>;

    // public params
    conversations: Array<ConversationModel> = [];
    uidConvSelected: string;

    // private params
    private tenant: string;
    private loggedUserId: string;
    private ref: firebase.database.Query;
    private BASE_URL = this.appConfig.getConfig().firebaseConfig.chat21ApiUrl;

    private logger: CustomLogger = new CustomLogger(true);

    // private audio: any;
    // private setTimeoutSound: any;

    constructor(
        public http: HttpClient,
        public appConfig: AppConfigService
    ) {
        super();
    }

    /**
     * inizializzo groups handler
     */
    initialize(tenant: string, loggedUserId: string) {
        this.logger.printLog('initialize GROUP-HANDLER');
        this.tenant = tenant;
        this.loggedUserId = loggedUserId;
    }

    /**
     * mi connetto al nodo groups
     * creo la reference
     * mi sottoscrivo a change, removed, added
     */
    connect() {
        const urlNodeGroups = '/apps/' + this.tenant + '/users/' + this.loggedUserId + '/groups';
        this.logger.printDebug('connect -------> groups::', urlNodeGroups)
        this.ref = firebase.database().ref(urlNodeGroups)
        this.ref.on('child_added', (childSnapshot) => {
            this.logger.printDebug('groups child_added ------->', childSnapshot.val())
            // that.added(childSnapshot);
        });
        this.ref.on('child_changed', (childSnapshot) => {
            this.logger.printDebug('groups child_changed ------->', childSnapshot.val())
            // that.changed(childSnapshot);
        });
        this.ref.on('child_removed', (childSnapshot) => {
            this.logger.printDebug('groups child_removed ------->', childSnapshot.val())
            // that.removed(childSnapshot);
        });
    }

    /**
     * mi connetto al nodo groups/GROUPID
     * creo la reference
     * mi sottoscrivo a value
     */
    getDetail(groupId: string, callback?: (group: GroupModel)=>void): Promise<GroupModel>{
        const urlNodeGroupById = '/apps/' + this.tenant + '/users/' + this.loggedUserId + '/groups/' + groupId;
        this.logger.printDebug('getDetail -------> urlNodeGroupById::', urlNodeGroupById)
        const ref = firebase.database().ref(urlNodeGroupById)
        return new Promise((resolve) => {
            ref.off()
            ref.on('value', (childSnapshot) => {
                console.log('group info::', childSnapshot.val())
                const group: GroupModel = childSnapshot.val();
                group.uid = childSnapshot.key
                // that.BSgroupDetail.next(group)
                if (callback) {
                    callback(group)
                }
                resolve(group)

            });
        });

    }

    onGroupChange(groupId: string): Observable<GroupModel> {
        const that = this;
        const urlNodeGroupById = '/apps/' + this.tenant + '/users/' + this.loggedUserId + '/groups/' + groupId;
        this.logger.printDebug('onGroupChange -------> urlNodeGroupById::', urlNodeGroupById)
        const ref = firebase.database().ref(urlNodeGroupById)
        ref.off()
        ref.on('value', (childSnapshot) => {
            this.groupValue(childSnapshot)
        });
        // return that.BSgroupDetail
        return this.SgroupDetail

    }

    create(groupName: string, members: [string], callback?: (res: any, error: any) => void): Promise<any> {
        var that = this;
        let listMembers = {};
        members.forEach(member => {
            listMembers[member] = 1
        });

        return new Promise((resolve, reject) =>{
            this.getFirebaseToken((error, idToken) => {
                console.log('FIREBASE-GROUPS-HANDLER CREATE GROUP idToken', idToken, error)
                if (idToken) {
                    const httpOptions = {
                        headers: new HttpHeaders({
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + idToken,
                        })
                    }
                    const body = {
                        "group_name": groupName,
                        "group_members": listMembers
                    }
                    const url = that.BASE_URL + '/api/' + that.tenant + '/groups'
                    console.log('createGROUP URL : ', url);
                    that.http.post(url, body, httpOptions).toPromise().then((res) => {
                        callback(res, null);
                        resolve(res)
                    }).catch(function (error) {
                        // Handle error
                        console.log('createGROUP error: ', error);
                        callback(null, error);
                        reject(error);
                    });
                }else{
                    callback(null, error)
                    reject(error)
                }
            });
        });
    }

    join(groupId: string, member: string, callback?: (res: any, error: any) => void) {
        var that = this;
        return new Promise((resolve, reject) =>{
            this.getFirebaseToken((error, idToken) => {
                console.log('FIREBASE-GROUPS-HANDLER JOIN GROUP idToken', idToken, error)
                if (idToken) {
                    const httpOptions = {
                        headers: new HttpHeaders({
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + idToken,
                        })
                    }
                    const body = {
                        "member_id": member
                    }
                    const url = that.BASE_URL + '/api/' + that.tenant + '/groups/' + groupId + '/members'
                    console.log('createGROUP URL : ', url);
                    that.http.post(url, body, httpOptions).toPromise().then((res) => {
                        callback(res, null);
                        resolve(res)
                    }).catch(function (error) {
                        // Handle error
                        console.log('createGROUP error: ', error);
                        callback(null, error);
                        reject(error);
                    });
                }else{
                    callback(null, error)
                    reject(error)
                }
            });
        });
    }

    leave(groupId: string, callback?: (res: any, error: any) => void): Promise<any> {
        var that = this;
        return new Promise((resolve, reject) =>{
            this.getFirebaseToken((error, idToken) => {
                console.log('FIREBASE-GROUPS-HANDLER LEAVE CONV idToken', idToken, error)
                if (idToken) {
                    const httpOptions = {
                        headers: new HttpHeaders({
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + idToken,
                        })
                    }
                    const url = that.BASE_URL + '/api/' + that.tenant + '/groups/' + groupId + '/members/' + that.loggedUserId
                    console.log('leaveGROUP URL : ', url);
                    that.http.delete(url, httpOptions).toPromise().then((res) => {
                        callback(res, null);
                        resolve(res)
                    }).catch(function (error) {
                        // Handle error
                        console.log('idToken error: ', error);
                        callback(null, error);
                        reject(error);
                    });
                }else{
                    callback(null, error)
                    reject(error)
                }
            });
        });
    }


    dispose() {
        this.conversations = [];
        this.uidConvSelected = '';
        this.ref.off();
        // this.ref.off("child_changed");
        // this.ref.off("child_removed");
        // this.ref.off("child_added");
        this.logger.printDebug('DISPOSE::: ', this.ref)
    }

    // // -------->>>> PRIVATE METHOD SECTION START <<<<---------------//
    private getFirebaseToken(callback) {
        const firebase_currentUser = firebase.auth().currentUser;
        console.log(' // firebase current user ', firebase_currentUser);
        if (firebase_currentUser) {
            firebase_currentUser.getIdToken(/* forceRefresh */ true)
                .then(function (idToken) {
                    // qui richiama la callback
                    callback(null, idToken);

                }).catch(function (error) {
                    // Handle error
                    console.log('idToken.', error);
                    callback(error, null);
                });
        }
    }

    private groupValue(childSnapshot: any){
        const that = this;
        console.log('group detail::', childSnapshot.val(), childSnapshot)
        const group: GroupModel = childSnapshot.val();
        console.log('FIREBASE-GROUP-HANDLER group ', group)
        if (group) {
            group.uid = childSnapshot.key
            // that.BSgroupDetail.next(group)
            let groupCompleted = this.completeGroup(group)
            this.SgroupDetail.next(groupCompleted)
            
        } 
    }

    private completeGroup(group: any): GroupModel{
        group.avatar = avatarPlaceholder(group.name);
        group.color = getColorBck(group.name);
        return group 
    }
    // // -------->>>> PRIVATE METHOD SECTION SECTION END <<<<---------------//

}
