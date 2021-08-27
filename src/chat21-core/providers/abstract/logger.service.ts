import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export abstract class LoggerService {

  constructor() { }

  abstract setLoggerConfig(isLogEnabled: boolean, logLevel: string);
  abstract debug(...message: any[])
  abstract log(...message: any[])
  abstract warn(...message: any[])
  abstract info(...message: any[])
  abstract error(...message: any[])
}
