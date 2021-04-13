import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export abstract class ConversationHandlerBuilderService {

  constructor() { }

  abstract build(): any;
}
