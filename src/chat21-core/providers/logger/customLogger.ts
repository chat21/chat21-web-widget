import { Inject, Injectable } from '@angular/core';
import { LogLevel } from '../../utils/constants';
import { LoggerService } from './../abstract/logger.service';
@Injectable()
export class CustomLogger extends LoggerService{
    
    
    //private variables
    private logLevel: number = LogLevel.Debug

    constructor(@Inject('isLogEnabled') private isLogEnabled: boolean) {
        super();
    }

    setLoggerConfig(isLogEnabled: boolean, logLevel: number){
        this.isLogEnabled = isLogEnabled;
        this.logLevel = logLevel;
    }

    info(...message) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.Info) {
            console.info(message)
        }
    }
    debug(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.Debug) {
            console.debug(message)
        }
    }
    warn(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.Warn) {
            console.warn(message)
        }
    }
    error(...message: any[]) {
        if(this.isLogEnabled && this.logLevel >= LogLevel.Error){
            console.error(message)
        }
    }

}