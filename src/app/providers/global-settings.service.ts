import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
// services
import { Globals } from '../utils/globals';
import { getImageUrlThumb, stringToBoolean, convertColorToRGBA, getParameterByName } from '../utils/utils';

import { TemplateBindingParseResult } from '@angular/compiler';
import { StorageService } from './storage.service';
import { AppConfigService } from './app-config.service';
import { __core_private_testing_placeholder__ } from '@angular/core/testing';


@Injectable()
export class GlobalSettingsService {
    globals: Globals;
    el: ElementRef;
    obsSettingsService: BehaviorSubject<boolean>;

    constructor(
        public http: Http,
        private storageService: StorageService,
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
            this.globals.wdLog(['> Error :' + error]);
            return;
        }

        /** SET main Paramiters */
        this.setMainParametersFromSettings(globals);

        // ------------------------------- //
        /** LOAD PARAMETERS FROM SERVER
         * load parameters from server
         * set parameters in globals
        */
        // const projectid = globals.projectid;
        this.getProjectParametersById(projectid)
        .subscribe( response => {
            // console.log('1 - setParameters ', response);
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
            this.globals.wdLog(['> Error :' + error]);
        }

        // get projectid for attributeHtml//
        try {
            const projectid = this.el.nativeElement.getAttribute('projectid');
            if (projectid) { this.globals.projectid = projectid; }
            // this.globals.setParameter('projectid', projectid);
        } catch (error) {
            this.globals.wdLog(['> Error :' + error]);
        }

        // get projectid for UrlParameters//
        try {
            const projectid = getParameterByName(this.globals.windowContext, 'tiledesk_projectid');
            if (projectid) { this.globals.projectid = projectid; }
            // this.globals.setParameter('projectid', projectid);
        } catch (error) {
            this.globals.wdLog(['> Error :' + error]);
        }

        // this.globals.wdLog(['projectid: ', this.globals.projectid);
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
            this.globals.wdLog(['1 > baseLocation: ', baseLocation]);
            if (typeof baseLocation !== 'undefined') { this.globals.baseLocation = baseLocation; }
        } catch (error) {
            this.globals.wdLog(['> Error :' + error]);
        }
        try {
            tiledeskSettings = this.globals.windowContext['tiledeskSettings'];
        } catch (error) {
            this.globals.wdLog(['> Error :' + error]);
        }
        try {
            const persistence = tiledeskSettings['persistence'];
            if (typeof persistence !== 'undefined') { this.globals.persistence = persistence; }
        } catch (error) {
            this.globals.wdLog(['> Error :' + error]);
        }
        try {
            const userToken = tiledeskSettings['userToken'];
            if (typeof userToken !== 'undefined') { this.globals.userToken = userToken; }
        } catch (error) {
            this.globals.wdLog(['> Error :' + error]);
        }
        try {
            const userId = tiledeskSettings['userId'];
            if (typeof userId !== 'undefined') { this.globals.userId = userId; }
        } catch (error) {
            this.globals.wdLog(['> Error :' + error]);
        }
        try {
            const filterByRequester = tiledeskSettings['filterByRequester'];
            this.globals.wdLog(['1 > filterByRequester: ', filterByRequester]);
            if (typeof filterByRequester !== 'undefined') { this.globals.filterByRequester = (filterByRequester === true) ? true : false; }
        } catch (error) {
            this.globals.wdLog(['> Error :' + error]);
        }
        try {
            const isLogEnabled = tiledeskSettings['isLogEnabled'];
            if (typeof isLogEnabled !== 'undefined') { this.globals.isLogEnabled = (isLogEnabled === true) ? true : false; }
        } catch (error) {
            this.globals.wdLog(['> Error :' + error]);
        }
        try {
            const departmentID = tiledeskSettings['departmentID'];
            if (typeof departmentID !== 'undefined') { this.globals.departmentID = departmentID; }
        } catch (error) {
            // this.globals.wdLog(['> Error is handled: ', error);
        }

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
        // // this.globals.wdLog(['35 - persistence:: ', TEMP);
        // if (TEMP !== undefined) {
        //     globals.persistence = TEMP;
        //     // globals.setParameter('persistence', TEMP);
        // }
        // TEMP = tiledeskSettings['userToken'];
        // // this.globals.wdLog(['26 - userToken:: ', TEMP);
        // if (TEMP !== undefined) {
        //     globals.userToken = TEMP;
        //     // globals.setParameter('userToken', TEMP);
        // }
        // TEMP = tiledeskSettings['userId'];
        // // this.globals.wdLog(['7 - userId:: ', TEMP);
        // if (TEMP !== undefined) {
        //     globals.userId = TEMP;
        //     // globals.setParameter('userId', TEMP);
        // }
        // TEMP = tiledeskSettings['filterByRequester'];
        // // this.globals.wdLog(['8 - filterByRequester:: ', TEMP);
        // if (TEMP !== undefined) {
        //     globals.filterByRequester = (TEMP === false) ? false : true;
        //     // globals.setParameter('filterByRequester', (TEMP === false) ? false : true);
        // }
        // TEMP = tiledeskSettings['isLogEnabled'];
        // // this.globals.wdLog(['33 - isLogEnabled:: ', TEMP);
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
    //             globals.wdLog(['http ERROR MESSAGE', errMsg]);
    //             rej(errMsg);
    //         },
    //         () => {
    //             globals.wdLog(['API ERROR NESSUNO']);
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

        this.globals.wdLog(['***************** END SET PARAMETERS *****************']);
        this.obsSettingsService.next(true);
    }

    /**
     *
     */
    setCssIframe() {
        const divTiledeskiframe = this.globals.windowContext.document.getElementById('tiledeskdiv');
        if (!divTiledeskiframe) {
            return;
        }
        if (this.globals.align === 'left') {
            if (this.globals.isMobile === false) {
                divTiledeskiframe.style.left =  this.globals.marginX;
            } else {
                divTiledeskiframe.style.left =  '0px';
            }
        } else if (this.globals.align === 'right') {
            console.log('this.globals.isMobile RIGHT' + this.globals.isMobile);
            if (this.globals.isMobile === false) {
                divTiledeskiframe.style.right =  this.globals.marginX;
            } else {
                divTiledeskiframe.style.right =  '0px';
            }
        }
        if (this.globals.isMobile === false) {
            divTiledeskiframe.style.bottom =  this.globals.marginY;
        } else {
            divTiledeskiframe.style.bottom =  '0px';
        }
        console.log('this.globals.fullscreenMode' + this.globals.fullscreenMode);
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
            this.globals.wdLog(['> Error is departments: ', error]);
        }

        // DEPARTMENTS
        // if (response && response.departments !== null) {
        //     globals.wdLog(['response DEP ::::', response.departments]);
        //     // globals.setParameter('departments', response.departments);
        //     this.initDepartments(response.departments);
        // }

        // AVAILABLE AGENTS
        try {
            const user_available = response.user_available;
            if (typeof user_available !== 'undefined') {
                globals.wdLog(['user_available ::::', user_available]);
                this.setAvailableAgentsStatus(user_available);
            }
        } catch (error) {
            this.setAvailableAgentsStatus(null);
            this.globals.wdLog(['> Error is departments: ', error]);
        }

        // AVAILABLE AGENTS
        // if (response && response.user_available !== null) {
        //     //this.globals.wdLog(['user_available ::::', response.user_available);
        //     this.setAvailableAgentsStatus(response.user_available);
        // }

        // WIDGET
        try {
            const variables = response.project.widget;
            if (typeof variables !== 'undefined') {
                for (const key of Object.keys(variables)) {
                    if (key === 'align' && variables[key] === 'left') {
                        const divWidgetContainer = globals.windowContext.document.getElementById('tiledeskdiv');
                        divWidgetContainer.style.left = '0';
                    }
                    if (variables[key] && variables[key] !== null && key !== 'online_msg')  {
                        globals[key] = stringToBoolean(variables[key]);
                    }
                }
            }
        } catch (error) {
            this.globals.wdLog(['> Error :' + error]);
        }

        // if (response && response.project && response.project.widget !== null) {
        //     this.globals.wdLog(['response.widget: ', response.project.widget);
        //     const variables = response.project.widget;
        //     if (!variables || variables === undefined) {
        //         return;
        //     }
        //     for (const key of Object.keys(variables)) {
        //         // this.globals.wdLog(['SET globals from service KEY ---------->', key);
        //         // this.globals.wdLog(['SET globals from service VAL ---------->', variables[key]);
        //         // sposto l'intero frame a sx se align è = left
        //         if (key === 'align' && variables[key] === 'left') {
        //             const divWidgetContainer = globals.windowContext.document.getElementById('tiledeskiframe');
        //             divWidgetContainer.style.left = '0';
        //         }
        //         if (variables[key] && variables[key] !== null) {
        //             globals[key] = stringToBoolean(variables[key]);
        //         }
        //     }
        //     // this.globals.wdLog(['SET globals == ---------->', globals);
        // }
    }

    /**
    * B: getVariablesFromSettings
    */
    setVariablesFromSettings(globals: Globals) {
        // this.globals.wdLog(['setVariablesFromSettings');
        const windowContext = globals.windowContext;
        // this.globals.wdLog(['windowContext', globals.windowContext);
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
        // this.globals.wdLog(['tiledeskSettings: ', tiledeskSettings);
        TEMP = tiledeskSettings['tenant'];
        // this.globals.wdLog(['2 - tenant:: ', TEMP);
        if (TEMP !== undefined) {
            globals.tenant = TEMP;
            // globals.setParameter('tenant', TEMP);
        }
        TEMP = tiledeskSettings['recipientId'];
        // this.globals.wdLog(['3 - recipientId:: ', TEMP);
        if (TEMP !== undefined) {
            globals.recipientId = TEMP;
            // globals.setParameter('recipientId', TEMP);
        }
        TEMP = tiledeskSettings['widgetTitle'];
        // this.globals.wdLog(['5 - widgetTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.widgetTitle = TEMP;
            // globals.setParameter('widgetTitle', TEMP);
        }
        TEMP = tiledeskSettings['poweredBy'];
        // this.globals.wdLog(['6 - poweredBy:: ', TEMP);
        if (TEMP !== undefined) {
            globals.poweredBy = TEMP;
            // globals.setParameter('poweredBy', TEMP);
        }
        TEMP = tiledeskSettings['userEmail'];
        // this.globals.wdLog(['8 - userEmail:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userEmail = TEMP;
            // globals.setParameter('userEmail', TEMP);
        }
        TEMP = tiledeskSettings['userPassword'];
        // this.globals.wdLog(['9 - userPassword:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userPassword = TEMP;
            // globals.setParameter('userPassword', TEMP);
        }
        TEMP = tiledeskSettings['userFullname'];
        // this.globals.wdLog(['10 - userFullname:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userFullname = TEMP;
            // globals.setParameter('userFullname', TEMP);
        }
        TEMP = tiledeskSettings['preChatForm'];
        // this.globals.wdLog(['11 - preChatForm:: ', TEMP);
        if (TEMP !== undefined) {
            globals.preChatForm = (TEMP === true) ? true : false;
            // globals.setParameter('preChatForm', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['isOpen'];
        // this.globals.wdLog(['12 - isOpen:: ', TEMP);
        if (TEMP !== undefined) {
            globals.isOpen = (TEMP === true) ? true : false;
            // globals.setParameter('isOpen', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['channelType'];
        // this.globals.wdLog(['13 - channelType:: ', TEMP);
        if (TEMP !== undefined) {
            globals.channelType = TEMP;
            // globals.setParameter('channelType', TEMP);
        }
        TEMP = tiledeskSettings['lang'];
        // this.globals.wdLog(['14 - lang:: ', TEMP);
        if (TemplateBindingParseResult) {
            globals.lang = TEMP;
            // globals.setParameter('lang', TEMP);
        }
        TEMP = tiledeskSettings['align'];
        // this.globals.wdLog(['15 - align:: ', TEMP);
        if (TEMP !== undefined) {
            globals.align = TEMP;
            // this.globals.wdLog(['15 - globals.align:: ', globals.align);
            if (globals.align === 'left') {
                const divWidgetContainer = windowContext.document.getElementById('tiledeskdiv');
                divWidgetContainer.style.left = '0';
            }
            // globals.setParameter('align', TEMP);
        }
        TEMP = tiledeskSettings['marginX'];
        // this.globals.wdLog(['16 - marginX:: ', TEMP);
        if (TEMP !== undefined) {
            globals.marginX = TEMP;
            // globals.setParameter('marginX', TEMP);
        }
        TEMP = tiledeskSettings['marginY'];
        // this.globals.wdLog(['17 - marginY:: ', TEMP);
        if (TEMP !== undefined) {
            globals.marginY = TEMP;
            // globals.setParameter('marginY', TEMP);
        }
        TEMP = tiledeskSettings['calloutTimer'];
        // this.globals.wdLog(['18 - calloutTimer:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutTimer = TEMP;
            // globals.setParameter('calloutTimer', TEMP);
        }
        TEMP = tiledeskSettings['calloutTitle'];
        // this.globals.wdLog(['19 - calloutTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutTitle = TEMP;
            // globals.setParameter('calloutTitle', TEMP);
        }
        TEMP = tiledeskSettings['calloutMsg'];
        // this.globals.wdLog(['20 - calloutMsg:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutMsg = TEMP;
            // globals.setParameter('calloutMsg', TEMP);
        }
        TEMP = tiledeskSettings['fullscreenMode'];
        // this.globals.wdLog(['21 - fullscreenMode:: ', TEMP);
        if (TEMP !== undefined) {
            globals.fullscreenMode = TEMP;
            // globals.setParameter('fullscreenMode', TEMP);
        }
        TEMP = tiledeskSettings['hideHeaderCloseButton'];
        // this.globals.wdLog(['22 - hideHeaderCloseButton:: ', TEMP);
        if (TEMP !== undefined) {
            globals.hideHeaderCloseButton = TEMP;
            // globals.setParameter('hideHeaderCloseButton', TEMP);
        }
        TEMP = tiledeskSettings['themeColor'];
        // this.globals.wdLog(['23 - themeColor:: ', TEMP);
        if (TEMP !== undefined) {
            globals.themeColor = convertColorToRGBA(TEMP, 100);
            // globals.setParameter('themeColor', convertColorToRGBA(TEMP, 100));
        }
        TEMP = tiledeskSettings['themeForegroundColor'];
        // this.globals.wdLog(['24 - themeForegroundColor:: ', TEMP);
        if (TEMP !== undefined) {
            globals.themeForegroundColor = convertColorToRGBA(TEMP, 100);
            // globals.setParameter('themeForegroundColor', convertColorToRGBA(TEMP, 100));
        }
        TEMP = tiledeskSettings['allowTranscriptDownload'];
        // this.globals.wdLog(['25 - allowTranscriptDownload:: ', TEMP);
        if (TEMP !== undefined) {
            globals.allowTranscriptDownload = (TEMP === true) ? true : false;
            // globals.setParameter('allowTranscriptDownload', TEMP);
        }
        TEMP = tiledeskSettings['startFromHome'];
        // this.globals.wdLog(['27 - startFromHome:: ', TEMP);
        if (TEMP !== undefined) {
            globals.startFromHome = (TEMP === true) ? true : false;
            // globals.setParameter('startFromHome', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['logoChat'];
        // this.globals.wdLog(['28 - logoChat:: ', TEMP);
        if (TEMP !== undefined) {
            globals.logoChat = TEMP;
            // globals.setParameter('logoChat', TEMP);
        }
        TEMP = tiledeskSettings['wellcomeTitle'];
        // this.globals.wdLog(['29 - wellcomeTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.wellcomeTitle = TEMP;
            // globals.setParameter('wellcomeTitle', TEMP);
        }
        TEMP = tiledeskSettings['wellcomeMsg'];
        // this.globals.wdLog(['30 - wellcomeMsg:: ', TEMP);
        if (TEMP !== undefined) {
            globals.wellcomeMsg = TEMP;
            // globals.setParameter('wellcomeMsg', TEMP);
        }
        TEMP = tiledeskSettings['autoStart'];
        // this.globals.wdLog(['31 - autoStart:: ', TEMP);
        if (TEMP !== undefined) {
            globals.autoStart = (TEMP === true) ? true : false;
            // globals.setParameter('autoStart', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['isShown'];
        // this.globals.wdLog(['32 - isShown:: ', TEMP);
        if (TEMP !== undefined) {
            globals.isShown = (TEMP === true) ? true : false;
            // globals.setParameter('isShown', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['filterByRequester'];
        // this.globals.wdLog(['34 - filterByRequester:: ', TEMP);
        if (TEMP !== undefined) {
            globals.filterByRequester = (TEMP === true) ? true : false;
            // this.globals.wdLog(['34 - globals.filterByRequester:: ', globals.filterByRequester);
            // globals.setParameter('filterByRequester', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showWaitTime'];
        // this.globals.wdLog(['36 - showWaitTime:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showWaitTime = (TEMP === true) ? true : false;
            // globals.setParameter('showWaitTime', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showAvailableAgents'];
        // this.globals.wdLog(['37 - showAvailableAgents:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showAvailableAgents = (TEMP === true) ? true : false;
            // globals.setParameter('showAvailableAgents', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showLogoutOption'];
        // this.globals.wdLog(['38 - showLogoutOption:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showLogoutOption = (TEMP === true) ? true : false;
            // globals.setParameter('showLogoutOption', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showWidgetNameInConversation'];
        // this.globals.wdLog(['39 - showWidgetNameInConversation:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showWidgetNameInConversation = (TEMP === true) ? true : false;
            // globals.setParameter('showWidgetNameInConversation', (TEMP === false) ? false : true);
        }

        TEMP = tiledeskSettings['customAttributes'];
        if (TEMP !== undefined) {
            this.globals.wdLog(['40 - customAttributes:: ', TEMP]);
            globals.customAttributes = TEMP;
        }

        TEMP = tiledeskSettings['hideAttachButton'];
        if (TEMP !== undefined) {
            globals.hideAttachButton = (TEMP === true) ? true : false;
        }
    }

    /**
     * C: getVariablesFromAttributeHtml
     * desueto, potrebbe essere commentato.
     */
    setVariablesFromAttributeHtml(globals: Globals, el: ElementRef) {
        // this.globals.wdLog(['getVariablesFromAttributeHtml', el);
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
        TEMP = el.nativeElement.getAttribute('userId');
        if (TEMP !== null) {
            this.globals.userId = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('userEmail');
        if (TEMP !== null) {
            this.globals.userEmail = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('userPassword');
        if (TEMP !== null) {
            this.globals.userPassword = TEMP;
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
        TEMP = el.nativeElement.getAttribute('calloutTimer');
        if (TEMP !== null) {
            this.globals.calloutTimer = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('wellcomeMsg');
        if (TEMP !== null) {
            this.globals.wellcomeMsg = TEMP;
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
        TEMP = el.nativeElement.getAttribute('wellcomeTitle');
        if (TEMP !== null) {
            this.globals.wellcomeTitle = TEMP;
        }
        TEMP = el.nativeElement.getAttribute('autoStart');
        if (TEMP !== null) {
            this.globals.autoStart = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('isShown');
        if (TEMP !== null) {
            this.globals.isShown = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('isLogoutEnabled');
        if (TEMP !== null) {
          this.globals.isLogoutEnabled = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('isLogEnabled');
        if (TEMP !== null) {
            this.globals.isLogEnabled = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('filterByRequester');
        if (TEMP !== null) {
            this.globals.filterByRequester = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('hideAttachButton');
        if (TEMP !== null) {
            this.globals.hideAttachButton = (TEMP === true) ? true : false;
        }
        TEMP = el.nativeElement.getAttribute('departmentID');
        if (TEMP !== null) {
            this.globals.departmentID = TEMP;
        }

    }


    /**
    * D: setVariableFromUrlParameters
    */
    setVariablesFromUrlParameters(globals: Globals) {
        globals.wdLog(['setVariablesFromUrlParameters: ']);
        const windowContext = globals.windowContext;
        let TEMP: any;
        TEMP = getParameterByName(windowContext, 'tiledesk_tenant');
        if (TEMP) {
            globals.tenant = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_recipientid');
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

        TEMP = getParameterByName(windowContext, 'tiledesk_poweredby');
        if (TEMP) {
            globals.poweredBy = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_userid');
        if (TEMP) {
            globals.userId = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_useremail');
        if (TEMP) {
            globals.userEmail = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_userpassword');
        if (TEMP) {
            globals.userPassword = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_userfullname');
        if (TEMP) {
            globals.userFullname = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_channeltype');
        if (TEMP) {
            globals.channelType = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_lang');
        if (TEMP) {
            // globals.lang = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_callouttimer');
        if (TEMP) {
            globals.calloutTimer = Number(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_align');
        if (TEMP) {
            globals.align = stringToBoolean(TEMP);
            if (globals.align === 'left') {
                const divWidgetContainer = windowContext.document.getElementById('tiledeskdiv');
                divWidgetContainer.style.left = '0';
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

        TEMP = getParameterByName(windowContext, 'tiledesk_wellcomeMsg');
        if (TEMP) {
            globals.wellcomeMsg = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_callouttitle');
        if (TEMP) {
            globals.calloutTitle = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_calloutmsg');
        if (TEMP) {
            globals.calloutMsg = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_hideHeaderCloseButton');
        if (TEMP) {
            globals.hideHeaderCloseButton = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_themecolor');
        if (TEMP) {
            const themecolor = stringToBoolean(TEMP);
            globals.themeColor = convertColorToRGBA(themecolor, 100);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_themeforegroundcolor');
        if (TEMP) {
            const themeforegroundcolor = stringToBoolean(TEMP);
            globals.themeForegroundColor = convertColorToRGBA(themeforegroundcolor, 100);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_logoChat');
        if (TEMP) {
            globals.logoChat = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_wellcomeTitle');
        if (TEMP) {
            globals.wellcomeTitle = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_autoStart');
        if (TEMP) {
            globals.autoStart = stringToBoolean(TEMP);
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
            // this.globals.wdLog(['tiledesk_filterByRequester:: ', globals.filterByRequester);
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

        TEMP = getParameterByName(windowContext, 'tiledesk_prechatform');
        if (TEMP) {
            globals.preChatForm = stringToBoolean(TEMP);
            // this.globals.wdLog(['globals.preChatForm: ' + globals.preChatForm);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_isopen');
        if (TEMP) {
            globals.isOpen = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_allowtranscriptdownload');
        if (TEMP) {
            globals.allowTranscriptDownload = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_showWidgetNameInConversation');
        if (TEMP) {
            globals.showWidgetNameInConversation = stringToBoolean(TEMP);
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
            this.globals.wdLog(['globals.customAttributes: ' + globals.customAttributes]);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_hideAttachButton');
        if (TEMP) {
            globals.hideAttachButton = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_departmentID');
        if (TEMP) {
            globals.departmentID = TEMP;
        }

    }

    /**
     * E: setVariableFromStorage
     * recupero il dictionary global dal local storage
     * aggiorno tutti i valori di globals
     * @param globals
     */
    setVariableFromStorage(globals: Globals) {
        this.globals.wdLog(['setVariableFromStorage :::::::: SET VARIABLE ---------->', Object.keys(globals)]);
        for (const key of Object.keys(globals)) {
            const val = this.storageService.getItem(key);
            this.globals.wdLog(['SET globals KEY ---------->', key]);
            this.globals.wdLog(['SET globals VAL ---------->', val]);
            if (val && val !== null) {
                // globals.setParameter(key, val);
                globals[key] = stringToBoolean(val);
            }
            // this.globals.wdLog(['SET globals == ---------->', globals);
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
        this.globals.wdLog(['departments ::::', departments]);
        if (departments === null ) { return; }
        this.globals.departments = departments;
        // console.log('departments.length', departments.length);
        if (departments.length === 1) {
            // UN SOLO DEPARTMENT
            const department = departments[0];
            this.globals.wdLog(['DEPARTMENT FIRST ::::', departments[0]]);
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
            this.globals.wdLog(['CI SONO + DI 2 DIPARTIMENTI ::::', departments[0]]);
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
            this.globals.wdLog(['DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI ::::']);
            // return;
        }

        this.setDepartmentFromExternal(); // chiamata ridondante viene fatta nel setParameters come ultima operazione
    }


    setDepartmentFromExternal() {
        // se esiste un departmentID impostato dall'esterno,
        // creo un department di default e lo imposto come department di default
        this.globals.wdLog(['EXTERNAL departmentID ::::' + this.globals.departmentID]);
        let isValidID = false;
        if (this.globals.departmentID) {
            this.globals.departments.forEach(department => {
                if (department._id === this.globals.departmentID) {
                    this.globals.wdLog(['EXTERNAL DEPARTMENT ::::' + department._id]);
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
            this.globals.wdLog(['END departmentID ::::' + this.globals.departmentID + isValidID]);
        }
    }

    /**
     * SET DEPARTMENT:
     * set department selected
     * save department selected in attributes
     * save attributes in this.storageService
    */
    setDepartment(department) {
        this.globals.wdLog(['setDepartment: ', JSON.stringify(department)]);
        this.globals.setParameter('departmentSelected', department);
        // let attributes = this.globals.attributes;
        let attributes: any = JSON.parse(this.storageService.getItem('attributes'));
        if (!attributes) {
            attributes = {
                departmentId: department._id,
                departmentName: department.name
            };
        } else {
            attributes.departmentId = department._id;
            attributes.departmentName = department.name;
        }

        // this.globals.wdLog(['department.online_msg: ', department.online_msg]);
        // this.globals.wdLog(['department.offline_msg: ', department.offline_msg]);
        this.globals.wdLog(['setAttributes: ', JSON.stringify(attributes)]);
        this.globals.setParameter('departmentSelected', department);
        this.globals.setParameter('attributes', attributes);
        this.storageService.setItem('attributes', JSON.stringify(attributes));

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
                // this.globals.wdLog([index, ' - element->', element);
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
            // this.globals.wdLog(['element->', this.globals.availableAgents);
            // this.globals.wdLog(['areAgentsAvailable->', this.globals.areAgentsAvailable);
            // this.globals.wdLog(['areAgentsAvailableText->', this.globals.areAgentsAvailableText);
        }

    }
    // ========= end:: GET AVAILABLE AGENTS STATUS ============//


    getProjectParametersById(id: string): Observable<any[]> {
        const API_URL = this.appConfigService.getConfig().apiUrl;
        const url = API_URL + id + '/widgets';
        // console.log('getProjectParametersById: ', url);
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
          .get(url, { headers })
          .map((response) => response.json());
    }

}
