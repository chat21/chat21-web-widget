import { LogLevel } from './../../utils/constants';
import { Inject, Injectable } from '@angular/core';
import { LoggerService } from './../abstract/logger.service';
@Injectable()
export class CustomLogger extends LoggerService{
    
    
    //private variables
    private logLevel: number = LogLevel.DEBUG
    private isLogEnabled: boolean = true;
    constructor() {
        super();
    }

    setLoggerConfig(isLogEnabled: boolean, logLevel: string){
        this.isLogEnabled = isLogEnabled;
        if (typeof logLevel === 'string') {
            this.logLevel = LogLevel[logLevel.toUpperCase()];
        } else {
            console.error('logLevel is not a string. See the chat21-ionic README.md')
        }
    }

    info(...message) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.INFO) {
            console.info(message)
        }
    }
    debug(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.DEBUG) {
            console.debug(message)
        }
    }
    warn(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.WARN) {
            console.warn(message)
        }
    }
    error(...message: any[]) {
        if(this.isLogEnabled && this.logLevel >= LogLevel.ERROR){
            console.error(message)
        }
    }

    log(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.DEBUG) {
            console.log(message)
        }
    }

}