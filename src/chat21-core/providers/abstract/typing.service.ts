import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';


// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export abstract class TypingService {

  // BehaviorSubject
  BSIsTyping: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  BSSetTyping: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // params
  abstract tenant = environment.tenant;

  // functions
  abstract initialize(): void;
  abstract isTyping(idConversation: string, idCurrentUser: string, isDirect: boolean): void;
  abstract setTyping(idConversation: string, message: string, idUser: string, userFullname: string): void;
}
