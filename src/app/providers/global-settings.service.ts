import { LogLevel } from './../../chat21-core/utils/constants';
import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
// services
import { Globals } from '../utils/globals';
import { getImageUrlThumb, stringToBoolean, convertColorToRGBA, getParameterByName, stringToNumber } from '../utils/utils';

import { TemplateBindingParseResult } from '@angular/compiler';
import { AppConfigService } from './app-config.service';
import { __core_private_testing_placeholder__ } from '@angular/core/testing';
import { ProjectModel } from '../../models/project';
import { AppStorageService } from '../../chat21-core/providers/abstract/app-storage.service';
import { LoggerService } from '../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../chat21-core/providers/logger/loggerInstance';
import { invertColor, isJsonString } from '../../chat21-core/utils/utils';


@Injectable()
export class GlobalSettingsService {
    globals: Globals;
    el: ElementRef;
    obsSettingsService: BehaviorSubject<boolean>;
    private logger: LoggerService = LoggerInstance.getInstance()

    constructor(
        public http: Http,
        private appStorageService: AppStorageService,
        // private settingsService: SettingsService,
        public appConfigService: AppConfigService
    ) {
        this.obsSettingsService = new BehaviorSubject<boolean>(null);
    }

    /**
     * load paramiters
     * 0 - imposto globals con i valori di default
     * 1 - imposto il projectId
     * 2 - recupero i parametri principali dal settings: projectid, persistence, userToken, userId, filterByRequester
     * 3 - recupero i parametri dal server
     * 4 - attendo la risposta del server e richiamo setParameters per il settaggio dei parametri
     */
    initWidgetParamiters(globals: Globals, el: ElementRef) {
        const that = this;
        this.globals = globals;
        this.el = el;
        // ------------------------------- //
        /**
        * SETTING LOCAL DEFAULT:
        * set the default globals parameters
        */
        this.globals.initDefafultParameters();

        /** SET PROJECT ID */
        let projectid: string;
        try {
            projectid = this.setProjectId();
        } catch (error) {
            this.logger.error('[GLOBAL-SET] > Error :' + error);
            return;
        }

        /** SET main Paramiters */
        this.setMainParametersFromSettings(globals);

        /**SET TENANT parameter */
        this.globals.tenant = this.appConfigService.getConfig().firebaseConfig.tenant
        /**SET LOGLEVEL parameter */
        this.globals.logLevel = this.appConfigService.getConfig().logLevel
        /**SET PERSISTENCE parameter */
        this.globals.persistence = this.appConfigService.getConfig().authPersistence

        // ------------------------------- //
        /** LOAD PARAMETERS FROM SERVER
         * load parameters from server
         * set parameters in globals
        */
        // const projectid = globals.projectid;
        this.getProjectParametersById(projectid).subscribe( response => {
            const project = response['project'];
            // console.log('1 - setParameters ', project);
            if (project) {
                that.globals.project.initialize(
                    project['id'],
                    project['activeOperatingHours'],
                    project['channels'],
                    project['name'],
                    project['createdAt'],
                    project['createdBy'],
                    project['isActiveSubscription'],
                    project['profile'],
                    project['agents'],
                    project['trialDays'],
                    project['type'],
                    project['status'],
                    project['trialDaysLeft'],
                    project['trialExpired'],
                    project['updatedAt'],
                    project['versions']
                );
            }
            // console.log('globals.project ----------------->', that.globals.project);
            that.setParameters(response);
        }, (error) => {
            // console.log('2 - ::getProjectParametersById', error);
            that.setParameters(null);
        }, () => {
            // console.log('3 - setParameters ');
            // that.setParameters(null);
        });

    }

    /** SET PROGECTID **
     * set projectId with the following order:
     * 1 - get projectId from settings
     * 2 - get projectId from attributeHtml
     * 3 - get projectId from UrlParameters
    */
    setProjectId() {
        // get projectid for settings//
        try {
            const projectid = this.globals.windowContext['tiledeskSettings']['projectid'];
            if (projectid) { this.globals.projectid = projectid; }
            // this.globals.setParameter('projectid', projectid);
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setProjectId 1 > Error :' + error);
        }

        // get projectid for attributeHtml//
        try {
            const projectid = this.el.nativeElement.getAttribute('projectid');
            if (projectid) { this.globals.projectid = projectid; }
            // this.globals.setParameter('projectid', projectid);
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setProjectId 2 > Error :' + error);
        }

        // get projectid for UrlParameters//
        try {
            const projectid = getParameterByName(this.globals.windowContext, 'tiledesk_projectid');
            if (projectid) { this.globals.projectid = projectid; }
            // this.globals.setParameter('projectid', projectid);
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setProjectId 3 > Error :' + error);
        }

        // this.logger.debug('[GLOBAL-SET] setProjectId projectid: ', this.globals.projectid);
        return this.globals.projectid;
    }

    /**
     * 1: get Project Id From Settings
     * recupero i parametri principali dal settings:
     * projectid
     * persistence
     * filterByRequester
     * userToken
     * userId
     * ...
     */
    // https://www.davidbcalhoun.com/2011/checking-for-undefined-null-and-empty-variables-in-javascript/
    setMainParametersFromSettings(globals: Globals) {
        let tiledeskSettings: any;
        try {
            const baseLocation = this.globals.windowContext['tiledesk'].getBaseLocation();
            this.logger.debug('[GLOBAL-SET] 1 > baseLocation: ', baseLocation);
            if (typeof baseLocation !== 'undefined') { this.globals.baseLocation = baseLocation; }
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setMainParametersFromSettings baseLocation > Error :', error);
        }
        try {
            tiledeskSettings = this.globals.windowContext['tiledeskSettings'];
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setMainParametersFromSettings tiledeskSettings > Error :', error);
        }
        try {
            const persistence = tiledeskSettings['persistence'];
            if (typeof persistence !== 'undefined') { this.globals.persistence = persistence; }
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setMainParametersFromSettings persistence > Error :', error);
        }
        // try {
        //     const userToken = tiledeskSettings['userToken'];
        //     if (typeof userToken !== 'undefined') { this.globals.userToken = userToken; }
        // } catch (error) {
        //     this.logger.error('[GLOBAL-SET] setMainParametersFromSettings userToken > Error :', error);
        // }
        // try {
        //     const userId = tiledeskSettings['userId'];
        //     if (typeof userId !== 'undefined') { this.globals.userId = userId; }
        // } catch (error) {
        //     this.logger.error('[GLOBAL-SET] setMainParametersFromSettings userId > Error :', error);
        // }
        try {
            const filterByRequester = tiledeskSettings['filterByRequester'];
            this.logger.debug('[GLOBAL-SET] setMainParametersFromSettings  > filterByRequester: ', filterByRequester);
            if (typeof filterByRequester !== 'undefined') { this.globals.filterByRequester = (filterByRequester === true) ? true : false; }
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setMainParametersFromSettings filterByRequester > Error :', error);
        }
        try {
            const isLogEnabled = tiledeskSettings['isLogEnabled'];
            if (typeof isLogEnabled !== 'undefined') { this.globals.isLogEnabled = (isLogEnabled === true) ? true : false; }
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setMainParametersFromSettings isLogEnabled > Error :', error);
        }
        try {
            const departmentID = tiledeskSettings['departmentID'];
            if (typeof departmentID !== 'undefined') { this.globals.departmentID = departmentID; }
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setMainParametersFromSettings departmentID > Error :', error);
        }

        try {
            const showAttachmentButton = tiledeskSettings['showAttachmentButton'];
            // tslint:disable-next-line:max-line-length
            if (typeof showAttachmentButton !== 'undefined') { this.globals.showAttachmentButton = (showAttachmentButton === true) ? true : false; }
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setMainParametersFromSettings showAttachmentButton > Error :', error);
        }

        try {
            const showAllConversations = tiledeskSettings['showAllConversations'];
            // tslint:disable-next-line:max-line-length
            if (typeof showAllConversations !== 'undefined') { this.globals.showAllConversations = (showAllConversations === true) ? true : false; }
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setMainParametersFromSettings showAllConversations > Error :', error);
        }


        // try {
        //     const privacyField = tiledeskSettings['privacyField'];
        //     if (typeof privacyField !== 'undefined') { this.globals.privacyField = privacyField; }
        // } catch (error) {
        //     this.logger.error('[GLOBAL-SET] setMainParametersFromSettings privacyField > Error :', error);
        // }


        // -------------------------------------- //
        // const windowContext = globals.windowContext;
        // if (!windowContext['tiledesk']) {
        //     // mi trovo in una pg index senza iframe
        //     return;
        // } else {
        //     // mi trovo in una pg con iframe
        //     const baseLocation =  windowContext['tiledesk'].getBaseLocation();
        //     if (baseLocation !== undefined) {
        //         globals.baseLocation = baseLocation;
        //     }
        // }

        // let TEMP: any;
        // const tiledeskSettings = windowContext['tiledeskSettings'];
        // TEMP = tiledeskSettings['projectid'];
        // if (TEMP !== undefined) {
        //     globals.projectid = TEMP;
        // }
        // TEMP = tiledeskSettings['persistence'];
        // // this.logger.debug('[GLOBAL-SET] setMainParametersFromSettings - persistence:: ', TEMP);
        // if (TEMP !== undefined) {
        //     globals.persistence = TEMP;
        //     // globals.setParameter('persistence', TEMP);
        // }
        // TEMP = tiledeskSettings['userToken'];
        // // this.logger.debug('[GLOBAL-SET] setMainParametersFromSettings - userToken:: ', TEMP);
        // if (TEMP !== undefined) {
        //     globals.userToken = TEMP;
        //     // globals.setParameter('userToken', TEMP);
        // }
        // TEMP = tiledeskSettings['userId'];
        // // this.logger.debug('[GLOBAL-SET] setMainParametersFromSettings - userId:: ', TEMP);
        // if (TEMP !== undefined) {
        //     globals.userId = TEMP;
        //     // globals.setParameter('userId', TEMP);
        // }
        // TEMP = tiledeskSettings['filterByRequester'];
        // // this.logger.debug('[GLOBAL-SET] setMainParametersFromSettings - filterByRequester:: ', TEMP);
        // if (TEMP !== undefined) {
        //     globals.filterByRequester = (TEMP === false) ? false : true;
        //     // globals.setParameter('filterByRequester', (TEMP === false) ? false : true);
        // }
        // TEMP = tiledeskSettings['isLogEnabled'];
        // // this.logger.debug('[GLOBAL-SET] setMainParametersFromSettings - isLogEnabled:: ', TEMP);
        // if (TEMP !== undefined) {
        //     globals.isLogEnabled = (TEMP === false) ? false : true;
        //     // globals.setParameter('isLogEnabled', (TEMP === false) ? false : true);
        // }
    }

    /**
     *
     */
    // setProjectIdAndPrimaryParametersFromEl(el: ElementRef, globals: Globals) {
    //     // https://stackoverflow.com/questions/45732346/externally-pass-values-to-an-angular-application
    //     let TEMP: any;
    //     TEMP = el.nativeElement.getAttribute('projectid');
    //     if (TEMP !== null) {
    //         globals.projectid = TEMP;
    //     }
    // }

    /**
     * 2: getProjectParametersByIdFromServer
     * recupero i parametri dal server
    */
    // getProjectParametersById(globals: Globals, el: ElementRef) {
    //     const that = this;
    //     return new Promise((res, rej) => {
    //         const id = globals.projectid;
    //         this.settingsService.getProjectParametersById(id)
    //         .subscribe(response => {
    //             res(response);
    //         },
    //         errMsg => {
    //             that.logger.error('[GLOBAL-SET] getProjectParametersById --> http ERROR MESSAGE', errMsg);
    //             rej(errMsg);
    //         },
    //         () => {
    //             that.logger.debug('[GLOBAL-SET] getProjectParametersById --> API ERROR NESSUNO');
    //             rej('NULL');
    //         });
    //     });
    // }

    /**
     * 3: setParameters
     * imposto i parametri secondo il seguente ordine:
     * A: se il server ha restituito dei parametri imposto i parametri in global
     * B: imposto i parametri recuperati da settings in global
     * C: imposto i parametri recuperati da attributes html in global
     * D: imposto i parametri recuperati da url parameters in global
     * E: imposto i parametri recuperati dallo storage in global
    */
    setParameters(response: any ) {
        this.logger.debug('[GLOBAL-SET] ***** setParameters ***** ', response)
        if (response !== null) {
            this.setVariablesFromService(this.globals, response);
        }
        this.setVariablesFromSettings(this.globals);
        this.setVariablesFromAttributeHtml(this.globals, this.el);
        this.setVariablesFromUrlParameters(this.globals);
        this.setVariableFromStorage(this.globals);
        this.setDepartmentFromExternal();
        /** set color with gradient from theme's colors */
        this.globals.setColorWithGradient();
        /** set css iframe from parameters */
        this.setCssIframe();

        this.logger.debug('[GLOBAL-SET] ***** END SET PARAMETERS *****');
        this.obsSettingsService.next(true);
    }

    /**
     *
     */
    setCssIframe() {
        // tslint:disable-next-line:max-line-length
        // this.logger.debug('[GLOBAL-SET] ***** setCssIframe *****', this.globals.windowContext.document.getElementById('tiledeskdiv'));
        const divTiledeskiframe = this.globals.windowContext.document.getElementById('tiledeskdiv');
        if (!divTiledeskiframe) {
            return;
        }
        if (this.globals.align === 'left') {
            divTiledeskiframe.classList.add('align-left');
            divTiledeskiframe.style.left =  this.globals.marginX;
        } else {
            divTiledeskiframe.classList.add('align-right');
            divTiledeskiframe.style.right =  this.globals.marginX;
        }
        if (this.globals.isMobile === false) {
            divTiledeskiframe.style.bottom =  this.globals.marginY;
        } else {
            divTiledeskiframe.style.bottom =  '0px';
        }
        // console.log('this.globals.fullscreenMode' + this.globals.fullscreenMode);
        if (this.globals.fullscreenMode === true) {
            divTiledeskiframe.style.left = 0;
            divTiledeskiframe.style.right = 0;
            divTiledeskiframe.style.top = 0;
            divTiledeskiframe.style.bottom = 0;
            divTiledeskiframe.style.width = '100%';
            divTiledeskiframe.style.height = '100%';
            divTiledeskiframe.style.maxHeight = 'none';
            divTiledeskiframe.style.maxWidth = 'none';
        }
    }
    /**
     * A: setVariablesFromService
     */
    setVariablesFromService(globals: Globals, response: any) {
        this.logger.debug('[GLOBAL-SET] > setVariablesFromService :' , response);
        this.globals = globals;
        // DEPARTMENTS
        try {
            const departments = response.departments;
            // console.log('---->departments', response.departments);
            if (typeof departments !== 'undefined') {
                // globals.setParameter('departments', response.departments);
                this.initDepartments(departments);
            }
        } catch (error) {
            this.initDepartments(null);
            this.logger.error('[GLOBAL-SET] setVariablesFromService > Error is departments: ', error);
        }

        // DEPARTMENTS
        // if (response && response.departments !== null) {
        //     this.logger.debug('[GLOBAL-SET] response DEP ::::', response.departments);
        //     // globals.setParameter('departments', response.departments);
        //     this.initDepartments(response.departments);
        // }

        // AVAILABLE AGENTS
        try {
            const user_available = response.user_available;
            if (typeof user_available !== 'undefined') {
                this.logger.debug('[GLOBAL-SET] setVariablesFromService > user_available ::::', user_available);
                this.setAvailableAgentsStatus(user_available);
            }
        } catch (error) {
            this.setAvailableAgentsStatus(null);
            this.logger.error('[GLOBAL-SET] setVariablesFromService > Error is departments: ', error);
        }

        // AVAILABLE AGENTS
        // if (response && response.user_available !== null) {
        //     //this.logger.error('[GLOBAL-SET] setVariablesFromService > user_available ::::', response.user_available);
        //     this.setAvailableAgentsStatus(response.user_available);
        // }

        // WIDGET
        try {
            const variables = response.project.widget;
            if (typeof variables !== 'undefined') {
                for (const key of Object.keys(variables)) {
                    if (key === 'align' && variables[key] === 'left') {
                        const divWidgetContainer = globals.windowContext.document.getElementById('tiledeskdiv');
                        divWidgetContainer.style.left = '0!important';
                    } else if (key === 'align' && variables[key] === 'right') {
                        const divWidgetContainer = globals.windowContext.document.getElementById('tiledeskdiv');
                        divWidgetContainer.style.right = '0!important';
                    }
                    // if (variables[key] && variables[key] !== null && key !== 'online_msg')  {
                    //     globals[key] = stringToBoolean(variables[key]); //-> fare test perchè se param è !== string allora ritorna string e non boolean
                    // }
                    if (variables.hasOwnProperty('calloutTimer')) {
                        globals['calloutTimer'] = variables['calloutTimer'];
                    }
                    if (variables.hasOwnProperty('dynamicWaitTimeReply')) {
                        globals['dynamicWaitTimeReply'] = variables['dynamicWaitTimeReply'];
                    }
                    if (variables.hasOwnProperty('logoChat')) {
                        globals['logoChat'] = variables['logoChat'];
                    }
                    if (variables.hasOwnProperty('preChatForm')) {
                        globals['preChatForm'] = variables['preChatForm'];
                    }
                    if (variables.hasOwnProperty('preChatFormCustomFieldsEnabled')) {
                        if(variables.hasOwnProperty('preChatFormJson'))
                            globals['preChatFormJson'] = variables['preChatFormJson'];
                    }
                    if (variables.hasOwnProperty('themeColor')) {
                        globals['themeColor'] = variables['themeColor'];
                        globals['bubbleSentBackground']=variables['themeColor'];
                        globals['bubbleSentTextColor']= invertColor(variables['themeColor'], true)
                    }
                    if (variables.hasOwnProperty('themeForegroundColor')) {
                        // globals[key] = stringToBoolean(variables[key]); -> fare test perchè se param è !== string allora ritorna string e non boolean
                        globals['themeForegroundColor'] = variables['themeForegroundColor'];
                        // globals['bubbleMsgSentTextColor'] = variables['themeForegroundColor'];
                    }
                    
                }
            }
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setVariablesFromService widget > Error :', error);
        }

        // IP
        try {
            const strIp = response['ip'];
            const IP = strIp.split(',').shift();
            if ( !this.globals.attributes ) {
                this.globals.attributes = {};
            }
            this.globals.attributes['ipAddress'] = IP;
            this.globals.setAttributeParameter('ipAddress', IP);
            this.logger.debug('[GLOBAL-SET] setVariablesFromService > ipAddress :', IP);
            // console.log('this.globals.attributes.IP ----------------->', this.globals.attributes);
        } catch (error) {
            this.logger.error('[GLOBAL-SET] setVariablesFromService > ipAddress > Error :', error);
        }

        // if (response && response.project && response.project.widget !== null) {
        //     this.logger.debug('[GLOBAL-SET] setVariablesFromService response.widget: ', response.project.widget);
        //     const variables = response.project.widget;
        //     if (!variables || variables === undefined) {
        //         return;
        //     }
        //     for (const key of Object.keys(variables)) {
        //         // this.logger.debug('[GLOBAL-SET] setVariablesFromService SET globals from service KEY ---------->', key);
        //         // this.logger.debug('[GLOBAL-SET] setVariablesFromService SET globals from service VAL ---------->', variables[key]);
        //         // sposto l'intero frame a sx se align è = left
        //         if (key === 'align' && variables[key] === 'left') {
        //             const divWidgetContainer = globals.windowContext.document.getElementById('tiledeskiframe');
        //             divWidgetContainer.style.left = '0';
        //         }
        //         if (variables[key] && variables[key] !== null) {
        //             globals[key] = stringToBoolean(variables[key]);
        //         }
        //     }
        //     // this.logger.error('[GLOBAL-SET] setVariablesFromService SET globals == ---------->', globals);
        // }
    }

    /**
    * B: getVariablesFromSettings
    */
    setVariablesFromSettings(globals: Globals) {
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings');
        const windowContext = globals.windowContext;
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings windowContext', globals.windowContext);
        if (!windowContext['tiledesk']) {
            return;
        } else {
            const baseLocation =  windowContext['tiledesk'].getBaseLocation();
            if (baseLocation !== undefined) {
                // globals.setParameter('baseLocation', baseLocation);
                globals.baseLocation = baseLocation;
            }
        }
        let TEMP: any;
        const tiledeskSettings = windowContext['tiledeskSettings'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > tiledeskSettings: ', tiledeskSettings);
        TEMP = tiledeskSettings['tenant'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings >  tenant:: ', TEMP);
        if (TEMP !== undefined) {
            globals.tenant = TEMP;
            // globals.setParameter('tenant', TEMP);
        }
        TEMP = tiledeskSettings['recipientId'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > recipientId:: ', TEMP);
        if (TEMP !== undefined) {
            globals.recipientId = TEMP;
            // globals.setParameter('recipientId', TEMP);
        }
        TEMP = tiledeskSettings['widgetTitle'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > widgetTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.widgetTitle = TEMP;
            // globals.setParameter('widgetTitle', TEMP);
        }
        TEMP = tiledeskSettings['poweredBy'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > poweredBy:: ', TEMP);
        if (TEMP !== undefined) {
            globals.poweredBy = TEMP;
            // globals.setParameter('poweredBy', TEMP);
        }
        TEMP = tiledeskSettings['userEmail'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > userEmail:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userEmail = TEMP;
            // globals.setParameter('userEmail', TEMP);
        }
        TEMP = tiledeskSettings['userFullname'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > userFullname:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userFullname = TEMP;
            // globals.setParameter('userFullname', TEMP);
        }
        TEMP = tiledeskSettings['preChatForm'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > preChatForm:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.preChatForm = (TEMP === true) ? true : false;
            // globals.setParameter('preChatForm', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['isOpen'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > isOpen:: ', TEMP);
        if (TEMP !== undefined) {
            globals.isOpen = (TEMP === true) ? true : false;
            // globals.setParameter('isOpen', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['channelType'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > channelType:: ', TEMP);
        if (TEMP !== undefined) {
            globals.channelType = TEMP;
            // globals.setParameter('channelType', TEMP);
        }
        TEMP = tiledeskSettings['lang'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > lang:: ', TEMP);
        if (TemplateBindingParseResult) {
            globals.lang = TEMP;
            // globals.setParameter('lang', TEMP);
        }
        TEMP = tiledeskSettings['align'];
        if (TEMP !== undefined) {
            globals.align = TEMP;
            const divWidgetContainer = windowContext.document.getElementById('tiledeskdiv');
            if (globals.align === 'left') {
                divWidgetContainer.classList.add('align-left');
            } else {
                divWidgetContainer.classList.add('align-right');
            }
        }
        TEMP = tiledeskSettings['marginX'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > marginX:: ', TEMP);
        if (TEMP !== undefined) {
            globals.marginX = TEMP;
            // globals.setParameter('marginX', TEMP);
        }
        TEMP = tiledeskSettings['marginY'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > marginY:: ', TEMP);
        if (TEMP !== undefined) {
            globals.marginY = TEMP;
            // globals.setParameter('marginY', TEMP);
        }
        TEMP = tiledeskSettings['launcherWidth'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > launcherWidth:: ', TEMP);
        if (TEMP !== undefined) {
            globals.launcherWidth = TEMP;
            // globals.setParameter('launcherWidth', TEMP);
        }
        TEMP = tiledeskSettings['launcherHeight'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > launcherHeight:: ', TEMP);
        if (TEMP !== undefined) {
            globals.launcherHeight = TEMP;
            // globals.setParameter('launcherHeight', TEMP);
        }
        TEMP = tiledeskSettings['baloonImage'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > baloonImage:: ', TEMP);
        if (TEMP !== undefined) {
            globals.baloonImage = TEMP;
            // globals.setParameter('baloonImage', TEMP);
        }
        TEMP = tiledeskSettings['baloonShape'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > baloonShape:: ', TEMP);
        if (TEMP !== undefined) {
            globals.baloonShape = TEMP;
            // globals.setParameter('baloonShape', TEMP);
        }
        TEMP = tiledeskSettings['calloutTimer'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > calloutTimer:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutTimer = TEMP;
            // globals.setParameter('calloutTimer', TEMP);
        }
        TEMP = tiledeskSettings['calloutTitle'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > calloutTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutTitle = TEMP;
            // globals.setParameter('calloutTitle', TEMP);
        }
        TEMP = tiledeskSettings['calloutMsg'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > calloutMsg:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutMsg = TEMP;
            // globals.setParameter('calloutMsg', TEMP);
        }
        TEMP = tiledeskSettings['fullscreenMode'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > fullscreenMode:: ', TEMP);
        if (TEMP !== undefined) {
            globals.fullscreenMode = TEMP;
            // globals.setParameter('fullscreenMode', TEMP);
        }
        TEMP = tiledeskSettings['hideHeaderCloseButton'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > hideHeaderCloseButton:: ', TEMP);
        if (TEMP !== undefined) {
            globals.hideHeaderCloseButton = TEMP;
            // globals.setParameter('hideHeaderCloseButton', TEMP);
        }
        TEMP = tiledeskSettings['themeColor'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > themeColor:: ', TEMP);
        if (TEMP !== undefined) {
            globals.themeColor = convertColorToRGBA(TEMP, 100);
            globals.bubbleSentBackground = convertColorToRGBA(TEMP, 100);
            globals.bubbleSentTextColor = invertColor(TEMP, true)
            // globals.setParameter('themeColor', convertColorToRGBA(TEMP, 100));
        }
        TEMP = tiledeskSettings['themeForegroundColor'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > themeForegroundColor:: ', TEMP);
        if (TEMP !== undefined) {
            globals.themeForegroundColor = convertColorToRGBA(TEMP, 100);
            // globals.bubbleMsgSentTextColor = convertColorToRGBA(TEMP, 100);
            // globals.setParameter('themeForegroundColor', convertColorToRGBA(TEMP, 100));
        }
        TEMP = tiledeskSettings['allowTranscriptDownload'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > allowTranscriptDownload:: ', TEMP);
        if (TEMP !== undefined) {
            globals.allowTranscriptDownload = (TEMP === true) ? true : false;
            // globals.setParameter('allowTranscriptDownload', TEMP);
        }
        TEMP = tiledeskSettings['startFromHome'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > startFromHome:: ', TEMP);
        if (TEMP !== undefined) {
            globals.startFromHome = (TEMP === true) ? true : false;
            // globals.setParameter('startFromHome', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['logoChat'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > logoChat:: ', TEMP);
        if (TEMP !== undefined) {
            globals.logoChat = TEMP;
            // globals.setParameter('logoChat', TEMP);
        }
        TEMP = tiledeskSettings['welcomeTitle'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > welcomeTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.welcomeTitle = TEMP;
            // globals.setParameter('welcomeTitle', TEMP);
        }
        TEMP = tiledeskSettings['welcomeMsg'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > welcomeMsg:: ', TEMP);
        if (TEMP !== undefined) {
            globals.welcomeMsg = TEMP;
            // globals.setParameter('welcomeMsg', TEMP);
        }
        TEMP = tiledeskSettings['autoStart'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > autoStart:: ', TEMP);
        if (TEMP !== undefined) {
            globals.autoStart = (TEMP === true) ? true : false;
            // globals.setParameter('autoStart', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['startHidden'];
        if (TEMP !== undefined) {
            globals.startHidden = (TEMP === true) ? true : false;
        }
        TEMP = tiledeskSettings['isShown'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > isShown:: ', TEMP);
        if (TEMP !== undefined) {
            globals.isShown = (TEMP === true) ? true : false;
            // globals.setParameter('isShown', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['filterByRequester'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > filterByRequester:: ', TEMP);
        if (TEMP !== undefined) {
            globals.filterByRequester = (TEMP === true) ? true : false;
            // globals.setParameter('filterByRequester', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showWaitTime'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > showWaitTime:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showWaitTime = (TEMP === true) ? true : false;
            // globals.setParameter('showWaitTime', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showAvailableAgents'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > showAvailableAgents:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showAvailableAgents = (TEMP === true) ? true : false;
            // globals.setParameter('showAvailableAgents', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showLogoutOption'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > showLogoutOption:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showLogoutOption = (TEMP === true) ? true : false;
            // globals.setParameter('showLogoutOption', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['customAttributes'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > customAttributes:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.customAttributes = TEMP;
        }
        TEMP = tiledeskSettings['showAttachmentButton'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > showAttachmentButton:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.showAttachmentButton = (TEMP === true) ? true : false;
        }
        TEMP = tiledeskSettings['showAllConversations'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > showAllConversations:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.showAllConversations = (TEMP === true) ? true : false;
        }
        // TEMP = tiledeskSettings['privacyField'];
        // // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > privacyField:: ', TEMP]);
        // if (TEMP !== undefined) {
        //     globals.privacyField = TEMP;
        // }
        TEMP = tiledeskSettings['dynamicWaitTimeReply'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > dynamicWaitTimeReply:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.dynamicWaitTimeReply = TEMP;
        }
        TEMP = tiledeskSettings['soundEnabled'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > soundEnabled:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.soundEnabled = TEMP;
        }
        TEMP = tiledeskSettings['openExternalLinkButton'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > openExternalLinkButton:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.openExternalLinkButton = TEMP;
        }
        TEMP = tiledeskSettings['hideHeaderConversationOptionsMenu'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > hideHeaderConversationOptionsMenu:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.hideHeaderConversationOptionsMenu = TEMP;
        }
        TEMP = tiledeskSettings['hideSettings'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > hideSettings:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.hideSettings = TEMP;
        }
        TEMP = tiledeskSettings['logLevel'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > logLevel:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.logLevel = TEMP;
        }
        TEMP = tiledeskSettings['preChatFormJson'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > preChatFormJson:: ', TEMP]);
        if (TEMP !== undefined) {
            if(isJsonString(TEMP)){
                globals.preChatFormJson = TEMP;
            }
        }
        TEMP = tiledeskSettings['bubbleSentBackground'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > bubbleSentBackground:: ', TEMP);
        if (TEMP !== undefined) {
            globals.bubbleSentBackground = convertColorToRGBA(TEMP, 100);
            globals.bubbleSentTextColor = invertColor(TEMP, true)
        }
        TEMP = tiledeskSettings['bubbleSentTextColor'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > bubbleSentTextColor:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.bubbleSentTextColor = convertColorToRGBA(TEMP, 100);
        }
        TEMP = tiledeskSettings['bubbleReceivedBackground'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > bubbleReceivedBackground:: ', TEMP);
        if (TEMP !== undefined) {
            globals.bubbleReceivedBackground = convertColorToRGBA(TEMP, 100);
            globals.bubbleReceivedTextColor = invertColor(TEMP, true)
        }
        TEMP = tiledeskSettings['bubbleReceivedTextColor'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > bubbleReceivedTextColor:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.bubbleReceivedTextColor = convertColorToRGBA(TEMP, 100);
        }
        TEMP = tiledeskSettings['fontSize'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > fontSize:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.fontSize = TEMP;
        }
        TEMP = tiledeskSettings['fontFamily'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > fontFamily:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.fontFamily = TEMP;
        }
        TEMP = tiledeskSettings['buttonFontSize'];
        // this.logger.debug('[GLOBAL-SET] setVariablesFromSettings > buttonFontSize:: ', TEMP]);
        if (TEMP !== undefined) {
            globals.buttonFontSize = TEMP;
        }
        

    }

    /**
     * C: getVariablesFromAttributeHtml
     * desueto, potrebbe essere commentato.
     */
    setVariablesFromAttributeHtml(globals: Globals, el: ElementRef) {
        // this.logger.debug('[GLOBAL-SET] getVariablesFromAttributeHtml', el);
        // const projectid = el.nativeElement.getAttribute('projectid');
        // if (projectid !== null) {
        //     globals.setParameter('projectid', projectid);
        // }
        // https://stackoverflow.com/questions/45732346/externally-pass-values-to-an-angular-application
        let TEMP: any;
        TEMP = el.nativeElement.getAttribute('tenant');
        if (TEMP !== null) {
            this.globals.tenant = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('recipientId');
        if (TEMP !== null) {
            this.globals.recipientId = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('widgetTitle');
        if (TEMP !== null) {
            this.globals.widgetTitle = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('poweredBy');
        if (TEMP !== null) {
            this.globals.poweredBy = TEMP;
        }
        // TEMP = el.nativeElement.getAttribute('userId');
        // if (TEMP !== null) {
        //     this.globals.userId = TEMP;
        // }
        TEMP = el.nativeElement.getAttribute('userEmail');
        if (TEMP !== null) {
            this.globals.userEmail = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('userFullname');
        if (TEMP !== null) {
            this.globals.userFullname = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('preChatForm');
        if (TEMP !== null) {
            this.globals.preChatForm = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('isOpen');
        if (TEMP !== null) {
            this.globals.isOpen = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('channelType');
        if (TEMP !== null) {
            this.globals.channelType = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('lang');
        if (TEMP !== null) {
            this.globals.lang = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('align');
        if (TEMP !== null) {
            this.globals.align = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('marginX');
        if (TEMP !== null) {
            this.globals.marginX = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('marginY');
        if (TEMP !== null) {
            this.globals.marginY = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('launcherWidth');
        if (TEMP !== null) {
            this.globals.launcherWidth = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('launcherHeight');
        if (TEMP !== null) {
            this.globals.launcherHeight= TEMP;
        }
        TEMP = el.nativeElement.getAttribute('baloonImage');
        if (TEMP !== null) {
            this.globals.baloonImage= TEMP;
        }
        TEMP = el.nativeElement.getAttribute('baloonShape');
        if (TEMP !== null) {
            this.globals.baloonShape= TEMP;
        }
        TEMP = el.nativeElement.getAttribute('calloutTimer');
        if (TEMP !== null) {
            this.globals.calloutTimer = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('welcomeMsg');
        if (TEMP !== null) {
            this.globals.welcomeMsg = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('welcomeTitle');
        if (TEMP !== null) {
            this.globals.welcomeTitle = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('calloutTitle');
        if (TEMP !== null) {
            this.globals.calloutTitle = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('calloutMsg');
        if (TEMP !== null) {
            this.globals.calloutMsg = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('startFromHome');
        if (TEMP !== null) {
            this.globals.startFromHome = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('logoChat');
        if (TEMP !== null) {
            this.globals.logoChat = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('autoStart');
        if (TEMP !== null) {
            this.globals.autoStart = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('startHidden');
        if (TEMP !== null) {
            this.globals.startHidden = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('isShown');
        if (TEMP !== null) {
            this.globals.isShown = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('isLogEnabled');
        if (TEMP !== null) {
            this.globals.isLogEnabled = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('filterByRequester');
        if (TEMP !== null) {
            this.globals.filterByRequester = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('showAttachmentButton');
        if (TEMP !== null) {
            this.globals.showAttachmentButton = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('departmentID');
        if (TEMP !== null) {
            this.globals.departmentID = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('showAllConversations');
        if (TEMP !== null) {
            this.globals.showAllConversations = (TEMP === true) ? true : false;
        }
        // TEMP = el.nativeElement.getAttribute('privacyField');
        // if (TEMP !== null) {
        //     this.globals.privacyField = TEMP;
        // }
        TEMP = el.nativeElement.getAttribute('dynamicWaitTimeReply');
        if (TEMP !== null) {
            this.globals.dynamicWaitTimeReply = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('soundEnabled');
        if (TEMP !== null) {
            this.globals.soundEnabled = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('openExternalLinkButton');
        if (TEMP !== null) {
            this.globals.openExternalLinkButton = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('hideHeaderConversationOptionsMenu');
        if (TEMP !== null) {
            this.globals.hideHeaderConversationOptionsMenu = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('hideSettings');
        if (TEMP !== null) {
            this.globals.hideSettings = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('logLevel');
        if (TEMP !== null) {
            this.globals.logLevel = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('preChatFormJson');
        if (TEMP !== null) {
            this.globals.preChatFormJson = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('fontSize');
        if (TEMP !== null) {
            this.globals.fontSize = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('fontFamily');
        if (TEMP !== null) {
            this.globals.fontFamily = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('buttonFontSize');
        if (TEMP !== null) {
            this.globals.buttonFontSize = TEMP;
        }
        
    }


    /**
    * D: setVariableFromUrlParameters
    */
    setVariablesFromUrlParameters(globals: Globals) {
        this.logger.debug('[GLOBAL-SET] setVariablesFromUrlParameters: ');
        const windowContext = globals.windowContext;
        let TEMP: any;
        TEMP = getParameterByName(windowContext, 'tiledesk_tenant');
        if (TEMP) {
            globals.tenant = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_recipientId');
        if (TEMP) {
            globals.recipientId = stringToBoolean(TEMP);
        }

        // TEMP = getParameterByName(windowContext, 'tiledesk_projectid');
        // if (TEMP) {
        //     globals.projectid = stringToBoolean(TEMP);
        // }

        TEMP = getParameterByName(windowContext, 'tiledesk_widgetTitle');
        if (TEMP) {
            globals.widgetTitle = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_poweredBy');
        if (TEMP) {
            globals.poweredBy = stringToBoolean(TEMP);
        }

        // TEMP = getParameterByName(windowContext, 'tiledesk_userid');
        // if (TEMP) {
        //     globals.userId = stringToBoolean(TEMP);
        // }

        TEMP = getParameterByName(windowContext, 'tiledesk_userEmail');
        if (TEMP) {
            globals.userEmail = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_userFullname');
        if (TEMP) {
            globals.userFullname = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_channelType');
        if (TEMP) {
            globals.channelType = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_lang');
        if (TEMP) {
            globals.lang = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_calloutTimer');
        if (TEMP) {
            globals.calloutTimer = Number(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_align');
        if (TEMP) {
            globals.align = stringToBoolean(TEMP);
            const divWidgetContainer = windowContext.document.getElementById('tiledeskdiv');
            if (globals.align === 'left') {
                divWidgetContainer.classList.add('align-left');
            } else {
                divWidgetContainer.classList.add('align-right');
            }
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_marginX');
        if (TEMP) {
            globals.marginX = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_marginY');
        if (TEMP) {
            globals.marginY = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_launcherWidth');
        if (TEMP) {
            globals.launcherWidth = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_launcherHeight');
        if (TEMP) {
            globals.launcherHeight = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_baloonImage');
        if (TEMP) {
            globals.baloonImage = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_baloonShape');
        if (TEMP) {
            globals.baloonShape = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_welcomeMsg');
        if (TEMP) {
            globals.welcomeMsg = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_calloutTitle');
        if (TEMP) {
            globals.calloutTitle = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_calloutMsg');
        if (TEMP) {
            globals.calloutMsg = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_hideHeaderCloseButton');
        if (TEMP) {
            globals.hideHeaderCloseButton = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_themeColor');
        if (TEMP) {
            const themecolor = stringToBoolean(TEMP);
            globals.themeColor = convertColorToRGBA(themecolor, 100);
            globals.bubbleSentBackground = convertColorToRGBA(themecolor, 100);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_themeForegroundColor');
        if (TEMP) {
            const themeforegroundcolor = stringToBoolean(TEMP);
            globals.themeForegroundColor = convertColorToRGBA(themeforegroundcolor, 100);
            globals.bubbleSentTextColor = convertColorToRGBA(themeforegroundcolor, 100);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_logoChat');
        if (TEMP) {
            globals.logoChat = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_welcomeTitle');
        if (TEMP) {
            globals.welcomeTitle = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_autoStart');
        if (TEMP) {
            globals.autoStart = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_startHidden');
        if (TEMP) {
            globals.startHidden = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_isShown');
        if (TEMP) {
            globals.isShown = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_isLogEnabled');
        if (TEMP) {
            globals.isLogEnabled = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_filterByRequester');
        if (TEMP) {
            globals.filterByRequester = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_showWaitTime');
        if (TEMP) {
            globals.showWaitTime = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_showAvailableAgents');
        if (TEMP) {
            globals.showAvailableAgents = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_showLogoutOption');
        if (TEMP) {
            globals.showLogoutOption = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_preChatForm');
        if (TEMP) {
            globals.preChatForm = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_isOpen');
        if (TEMP) {
            globals.isOpen = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_allowTranscriptDownload');
        if (TEMP) {
            globals.allowTranscriptDownload = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_startFromHome');
        if (TEMP) {
            globals.startFromHome = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_fullscreenMode');
        if (TEMP) {
            globals.fullscreenMode = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_customAttributes');
        if (TEMP) {
            globals.customAttributes = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_showAttachmentButton');
        if (TEMP) {
            globals.showAttachmentButton = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_departmentID');
        if (TEMP) {
            globals.departmentID = TEMP;
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_persistence');
        if (TEMP) {
            globals.persistence = TEMP;
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_showAllConversations');
        if (TEMP) {
            globals.showAllConversations = stringToBoolean(TEMP);
        }

        // TEMP = getParameterByName(windowContext, 'tiledesk_privacyField');
        // if (TEMP) {
        //     globals.privacyField = TEMP;
        // }

        TEMP = getParameterByName(windowContext, 'tiledesk_jwt');
        if (TEMP) {
            globals.jwt = TEMP;
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_dynamicWaitTimeReply');
        if (TEMP) {
            globals.dynamicWaitTimeReply = stringToBoolean(TEMP); 
        }
        
        TEMP = getParameterByName(windowContext, 'tiledesk_soundEnabled');
        if (TEMP) {
            globals.soundEnabled = stringToBoolean(TEMP); 
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_openExternalLinkButton');
        if (TEMP) {
            globals.openExternalLinkButton = stringToBoolean(TEMP); 
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_hideHeaderConversationOptionsMenu');
        if (TEMP) {
            globals.hideHeaderConversationOptionsMenu = stringToBoolean(TEMP); 
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_hideSettings');
        if (TEMP) {
            globals.hideSettings = stringToBoolean(TEMP); 
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_logLevel');
        if (TEMP) {
            globals.logLevel = TEMP;
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_preChatFormJson');
        if (TEMP) {
            globals.preChatFormJson = JSON.parse(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_bubbleSentBackground');
        if (TEMP) {
            const bubbleSentBackground = stringToBoolean(TEMP);
            globals.bubbleSentBackground = convertColorToRGBA(bubbleSentBackground, 100);
            globals.bubbleSentTextColor = invertColor(TEMP, true)
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_bubbleSentTextColor');
        if (TEMP) {
            const bubbleSentTextColor = stringToBoolean(TEMP);
            globals.bubbleSentTextColor = convertColorToRGBA(bubbleSentTextColor, 100);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_bubbleReceivedBackground');
        if (TEMP) {
            const bubbleReceivedBackground = stringToBoolean(TEMP);
            globals.bubbleReceivedBackground = convertColorToRGBA(bubbleReceivedBackground, 100);
            globals.bubbleReceivedTextColor = invertColor(TEMP, true)
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_bubbleReceivedTextColor');
        if (TEMP) {
            const bubbleReceivedTextColor = stringToBoolean(TEMP);
            globals.bubbleReceivedTextColor = convertColorToRGBA(bubbleReceivedTextColor, 100);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_fontSize');
        if (TEMP) {
            globals.fontSize = TEMP;
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_fontFamily');
        if (TEMP) {
            globals.fontFamily = TEMP;
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_buttonFontSize');
        if (TEMP) {
            globals.buttonFontSize = TEMP;
        }
        
    }

    /**
     * E: setVariableFromStorage
     * recupero il dictionary global dal local storage
     * aggiorno tutti i valori di globals
     * @param globals
     */
    setVariableFromStorage(globals: Globals) {
        this.logger.debug('[GLOBAL-SET] setVariableFromStorage :::::::: SET VARIABLE ---------->', Object.keys(globals));
        for (const key of Object.keys(globals)) {
            const val = this.appStorageService.getItem(key);
            // this.logger.debug('[GLOBAL-SET] setVariableFromStorage SET globals KEY ---------->', key);
            // this.logger.debug('[GLOBAL-SET] setVariableFromStorage SET globals VAL ---------->', val);
            if (val && val !== null) {
                // globals.setParameter(key, val);
                globals[key] = stringToBoolean(val);
            }
            // this.logger.debug('[GLOBAL-SET] setVariableFromStorage SET globals == ---------->', globals);
        }
    }

     // ========= begin:: GET DEPARTEMENTS ============//
    /**
     * INIT DEPARTMENT:
     * get departments list
     * set department default
     * CALL AUTHENTICATION
    */
    initDepartments(departments: any) {
        this.globals.setParameter('departmentSelected', null);
        this.globals.setParameter('departmentDefault', null);
        this.logger.debug('[GLOBAL-SET] initDepartments departments ::::', departments);
        if (departments === null ) { return; }
        this.globals.departments = departments;
        // console.log('departments.length', departments.length);
        if (departments.length === 1) {
            // UN SOLO DEPARTMENT
            const department = departments[0];
            this.logger.debug('[GLOBAL-SET] initDepartments DEPARTMENT FIRST ::::', departments[0]);
            this.globals.setParameter('departmentDefault', departments[0]);
            if (department && department.online_msg && department.online_msg !== '') {
                this.globals.online_msg = department.online_msg;
            }
            if (department && department.offline_msg && department.offline_msg !== '') {
                this.globals.offline_msg = department.offline_msg;
            }
            // if (department['offline_msg']) {
            //     this.globals.offline_msg = department['offline_msg'];
            // }
            // if (department['online_msg']) {
            //     this.globals.online_msg = department['online_msg'];
            // }
            this.setDepartment(departments[0]);
            // return false;
        } else if (departments.length > 1) {
            // CI SONO + DI 2 DIPARTIMENTI
            this.logger.debug('[GLOBAL-SET] initDepartments > CI SONO + DI 2 DIPARTIMENTI ::::', departments[0]);
            let i = 0;
            departments.forEach(department => {
                if (department['default'] === true) {
                    // this.globals.departmentDefault = department;
                    if (department && department.online_msg && department.online_msg !== '') {
                        this.globals.online_msg = department.online_msg;
                    }
                    if (department && department.offline_msg && department.offline_msg !== '') {
                        this.globals.offline_msg = department.offline_msg;
                    }
                    // if (department['offline_msg']) {
                    //     this.globals.offline_msg = department['offline_msg'];
                    // }
                    // if (department['online_msg']) {
                    //     this.globals.online_msg = department['online_msg'];
                    // }
                    // console.log('this.globals.offline_msg ::::', department['offline_msg']);
                    // console.log('this.globals.online_msg ::::', department['online_msg']);
                    departments.splice(i, 1);
                    return;
                }
                i++;
            });
            this.globals.setParameter('departmentDefault', departments[0]);
            this.setDepartment(departments[0]);
        } else {
            // DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI !!!!
            this.logger.error('[GLOBAL-SET] initDepartments > DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI ::::');
            // return;
        }

        this.setDepartmentFromExternal(); // chiamata ridondante viene fatta nel setParameters come ultima operazione
    }


    setDepartmentFromExternal() {
        // se esiste un departmentID impostato dall'esterno,
        // creo un department di default e lo imposto come department di default
        // this.logger.debug('[GLOBAL-SET] setDepartmentFromExternal > EXTERNAL departmentID ::::' + this.globals.departmentID);
        let isValidID = false;
        if (this.globals.departmentID) {
            this.globals.departments.forEach(department => {
                if (department._id === this.globals.departmentID) {
                    this.logger.debug('[GLOBAL-SET] setDepartmentFromExternal > EXTERNAL DEPARTMENT ::::' + department._id);
                    this.globals.setParameter('departmentDefault', department);
                    this.setDepartment(department);
                    isValidID = true;
                    return;
                }
            });
            if (isValidID === false) {
                // se l'id passato non corrisponde a nessun id dipartimento esistente viene annullato
                // per permettere di passare dalla modale dell scelta del dipartimento se necessario (+ di 1 dipartimento presente)
                this.globals.departmentID = null;
            }
            this.logger.debug('[GLOBAL-SET] setDepartmentFromExternal > END departmentID ::::' + this.globals.departmentID + isValidID);
        }
    }

    /**
     * SET DEPARTMENT:
     * set department selected
     * save department selected in attributes
     * save attributes in this.appStorageService
    */
    setDepartment(department) {
        this.logger.debug('[GLOBAL-SET] setDepartment: ', JSON.stringify(department));
        this.globals.setParameter('departmentSelected', department);
        // let attributes = this.globals.attributes;
        let attributes: any = JSON.parse(this.appStorageService.getItem('attributes'));
        if (!attributes) {
            attributes = {
                departmentId: department._id,
                departmentName: department.name
            };
        } else {
            attributes.departmentId = department._id;
            attributes.departmentName = department.name;
        }

        // this.logger.debug('[GLOBAL-SET] setDepartment > department.online_msg: ', department.online_msg);
        // this.logger.debug('[GLOBAL-SET] setDepartment > department.offline_msg: ', department.offline_msg);
        this.logger.debug('[GLOBAL-SET] setDepartment > setAttributes: ', JSON.stringify(attributes));
        this.globals.setParameter('departmentSelected', department);
        this.globals.setParameter('attributes', attributes);
        this.appStorageService.setItem('attributes', JSON.stringify(attributes));

    }
    // ========= end:: GET DEPARTEMENTS ============//


    // ========= begin:: GET AVAILABLE AGENTS STATUS ============//
    /** setAvailableAgentsStatus
     * verifica se c'è un'agent disponibile
     */
    private setAvailableAgentsStatus(availableAgents) {
        this.globals.setParameter('availableAgentsStatus', false);
        if ( availableAgents === null ) { return; }
        if (availableAgents.length > 0) {
            // this.globals.areAgentsAvailable = true;
            // this.globals.setParameter('areAgentsAvailable', true);
            // this.globals.setParameter('areAgentsAvailableText', this.globals.AGENT_AVAILABLE);
            const arrayAgents = [];
            availableAgents.forEach((element, index: number) => {
                element.imageurl = getImageUrlThumb(element.id);
                arrayAgents.push(element);
                if (index >= 4) { return; }
                // this.logger.debug('[GLOBAL-SET] setAvailableAgentsStatus > index, ' - element->', element);
            });

            // availableAgents.forEach(element => {
            //     element.imageurl = getImageUrlThumb(element.id);
            //     arrayAgents.push(element);
            // });
            // let limit = arrayAgents.length;
            // if (arrayAgents.length > 5) {
            //     limit = 5;
            // }
            this.globals.availableAgents = arrayAgents;
            this.globals.setParameter('availableAgentsStatus', true);
            // this.globals.setParameter('availableAgents', availableAgents);
            // this.logger.debug('[GLOBAL-SET] setAvailableAgentsStatus > element->', this.globals.availableAgents);
            // this.logger.debug('[GLOBAL-SET] setAvailableAgentsStatus > areAgentsAvailable->', this.globals.areAgentsAvailable);
            // this.logger.debug('[GLOBAL-SET] setAvailableAgentsStatus > areAgentsAvailableText->', this.globals.areAgentsAvailableText);
        }

    }
    // ========= end:: GET AVAILABLE AGENTS STATUS ============//


    getProjectParametersById(id: string): Observable<any[]> {
        if(id){
            const API_URL = this.appConfigService.getConfig().apiUrl;
            const url = API_URL + id + '/widgets';
            // console.log('getProjectParametersById: ', url);
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            return this.http.get(url, { headers })
                            .map((response) => response.json());
        }
    }

}
