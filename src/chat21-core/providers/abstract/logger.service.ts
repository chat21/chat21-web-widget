import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export abstract class LoggerService {

  constructor() { }

  abstract printLog(...message: any[])
  abstract printDebug(...message: any[])
  abstract printWarn(...message: any[])
  abstract printInfo(...message: any[])
  abstract printError(...message: any[])
}
