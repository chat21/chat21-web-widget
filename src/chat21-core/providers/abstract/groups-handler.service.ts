import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { GroupModel } from '../../models/group';

// @Injectable({ providedIn: 'root' })
@Injectable()
export abstract class GroupsHandlerService {

  // BehaviorSubject
  abstract BSgroupDetail: BehaviorSubject<GroupModel> = new BehaviorSubject<GroupModel>(null);
  abstract SgroupDetail: Subject<GroupModel> = new Subject<GroupModel>();
  abstract groupAdded: BehaviorSubject<GroupModel> = new BehaviorSubject<GroupModel>(null);
  abstract groupChanged: BehaviorSubject<GroupModel> = new BehaviorSubject<GroupModel>(null);
  abstract groupRemoved: BehaviorSubject<GroupModel> = new BehaviorSubject<GroupModel>(null);

  abstract initialize(tenant: string, loggedUserId: string): void;
  abstract connect(): void;
  abstract getDetail(groupId: string, callback?:(group: GroupModel)=>void): Promise<GroupModel>;
  abstract onGroupChange(groupId: string): Observable<GroupModel>;
  abstract create(groupName: string, members: [string], callback?:(res: any, error: any)=>void): Promise<any>;
  abstract leave(groupId: string, callback?:(res: any, error: any)=>void): Promise<any>;
  abstract join(groupId: string, member: string, callback?:(res: any, error: any)=>void)
  abstract dispose(): void;
}
