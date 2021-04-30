import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { GroupModel } from '../../models/group';
import { GroupsHandlerService } from '../../providers/abstract/groups-handler.service';
import { CustomLogger } from '../logger/customLogger';
import { Chat21Service } from './chat-service';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class MQTTGroupsHanlder extends GroupsHandlerService {
    
    // BehaviorSubject
    BSgroupDetail: BehaviorSubject<GroupModel>;
    SgroupDetail: Subject<GroupModel>;
    groupAdded: BehaviorSubject<GroupModel>;
    groupChanged: BehaviorSubject<GroupModel>;
    groupRemoved: BehaviorSubject<GroupModel>;

    // private params
    private tenant: string;
    private loggedUserId: string;
    private logger: CustomLogger = new CustomLogger(true);
    
    constructor(
        public chat21Service: Chat21Service
    ) {
        super();
    }

    /**
     * inizializzo groups handler
     */
    initialize(tenant: string, loggedUserId: string): void {
        this.logger.printLog('initialize GROUP-HANDLER MQTT');
        this.tenant = tenant;
        this.loggedUserId = loggedUserId;

    }

    /**
     * mi connetto al nodo groups
     * creo la reference
     * mi sottoscrivo a change, removed, added
     */
    connect(): void {
//        throw new Error('Method not implemented.');
         console.log('Method not implemented.');
    }

    /**
     * mi connetto al nodo groups/GROUPID
     * creo la reference
     * mi sottoscrivo a value
     */
    getDetail(groupId: string, callback?: (group: GroupModel) => void): Promise<GroupModel> {
        //throw new Error('Method not implemented.');
          console.log('Method not implemented.');
          return;
    }

    onGroupChange(groupId: string): Observable<GroupModel> {
        return this.SgroupDetail
    }

    leave(groupId: string, callback?: () => void): Promise<any> {
        //throw new Error('Method not implemented.');
        console.log('Method not implemented.');
        return;
    }

    create(groupId: string, callback?: () => void): Promise<any> {
        //throw new Error('Method not implemented.');
        console.log('Method not implemented.');
        return;
    }

    dispose(): void {
        //throw new Error('Method not implemented.');
        console.log('Method not implemented.');
    }
      
  }
