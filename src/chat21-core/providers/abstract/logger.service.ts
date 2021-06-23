import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export abstract class LoggerService {

  constructor() { }

  abstract setLoglevel(logLevel: number);
  abstract printLog(...message: any[])
  abstract printDebug(...message: any[])
  abstract printWarn(...message: any[])
  abstract printInfo(...message: any[])
  abstract printError(...message: any[])
}
