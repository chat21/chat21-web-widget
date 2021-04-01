import { Inject, Injectable } from '@angular/core';
import { LoggerService } from './../abstract/logger.service';
@Injectable()
export class CustomLogger extends LoggerService{
    
    
    //private variables
    //private logger: NGXLogger

    constructor(@Inject('isLogEnabled') private isLogEnabled: boolean ) {
        super();
    }

    printLog(...message: any[]) {
        if(this.isLogEnabled && message && message.length > 0){
            console.log(message)
        }
    }
    printDebug(...message: any[]) {
        if(this.isLogEnabled && message && message.length > 0){
            console.debug('%c' + message, ' color: #3F888F')
        }
    }
    printError(...message: any[]) {
        if(this.isLogEnabled && message && message.length > 0){
            console.error('%c' + message, ' color: red')
        }
    }

}