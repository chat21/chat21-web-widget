import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// services
import { Globals } from '../utils/globals';
import { getImageUrlThumb, stringToBoolean, convertColorToRGBA, getParameterByName } from '../utils/utils';
import { TemplateBindingParseResult } from '@angular/compiler';
import { StorageService } from './storage.service';
import { SettingsService } from './settings.service';
import { AppConfigService } from '../providers/app-config.service';

@Injectable()
export class LocalSettingsService {
    globals: Globals;
    el: ElementRef;
    obsSettingsService: BehaviorSubject<boolean>;

    constructor(
        private storageService: StorageService,
        private settingsService: SettingsService,
        public appConfigService: AppConfigService
    ) {
        this.obsSettingsService = new BehaviorSubject<boolean>(null);
    }

    /**
     * load paramiters
     * 1 - recupero i parametri principali dal settings: projectid, persistence, userToken, userId, filterByRequester
     * 2 - recupero i parametri dal server
     * 3 - attendo la risposta del server e richiamo setParameters per il settaggio dei parametri
     */
    load(globals: Globals, el: ElementRef) {
        this.setProjectIdAndPrimaryParametersFromSettings(globals);
        // console.log('LocalSettingsService load ------------> ', globals);
        if (!globals.projectid) {
            // non c'è iframe!
            this.setProjectIdAndPrimaryParametersFromEl(el, globals);
        }
        this.globals = globals;
        this.el = el;
        const that = this;
        this.getProjectParametersById(globals, el)
        .then(response => {
            // console.log('RESPONSE°°°°°°°°°°°°°°°°°°°° ', response);
            that.setParameters(response);
        })
        .catch(error => {
            that.setParameters(null);
            // console.log('ERRORE°°°°°°°°°°°°°°°°°°°° ');
            console.error(error);
        });
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
    setProjectIdAndPrimaryParametersFromSettings(globals: Globals) {
        const windowContext = globals.windowContext;
        if (!windowContext['tiledesk']) {
            // mi trovo in una pg index senza iframe
            return;
        } else {
            // mi trovo in una pg con iframe
            const baseLocation =  windowContext['tiledesk'].getBaseLocation();
            if (baseLocation !== undefined) {
                globals.baseLocation = baseLocation;
            }
        }
        let TEMP: any;
        const tiledeskSettings = windowContext['tiledeskSettings'];
        TEMP = tiledeskSettings['projectid'];
        if (TEMP !== undefined) {
            globals.projectid = TEMP;
        }
        TEMP = tiledeskSettings['persistence'];
        // console.log('35 - persistence:: ', TEMP);
        if (TEMP !== undefined) {
            globals.persistence = TEMP;
            // globals.setParameter('persistence', TEMP);
        }
        TEMP = tiledeskSettings['userToken'];
        // console.log('26 - userToken:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userToken = TEMP;
            // globals.setParameter('userToken', TEMP);
        }
        TEMP = tiledeskSettings['userId'];
        // console.log('7 - userId:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userId = TEMP;
            // globals.setParameter('userId', TEMP);
        }
        TEMP = tiledeskSettings['filterByRequester'];
        // console.log('8 - filterByRequester:: ', TEMP);
        if (TEMP !== undefined) {
            globals.filterByRequester = (TEMP === false) ? false : true;
            // globals.setParameter('filterByRequester', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['isLogEnabled'];
        // console.log('33 - isLogEnabled:: ', TEMP);
        if (TEMP !== undefined) {
            globals.isLogEnabled = (TEMP === false) ? false : true;
            // globals.setParameter('isLogEnabled', (TEMP === false) ? false : true);
        }
    }

    /**
     *
     * @param el
     * @param globals
     */
    setProjectIdAndPrimaryParametersFromEl(el: ElementRef, globals: Globals) {
        // https://stackoverflow.com/questions/45732346/externally-pass-values-to-an-angular-application
        let TEMP: any;
        TEMP = el.nativeElement.getAttribute('projectid');
        if (TEMP !== null) {
            globals.projectid = TEMP;
        }
        console.log('projectid:: ', TEMP);
    }

    /**
     * 2: getProjectParametersByIdFromServer
     * recupero i parametri dal server
    */
    getProjectParametersById(globals: Globals, el: ElementRef) {
        const that = this;
        return new Promise((res, rej) => {
            const id = globals.projectid;
            this.settingsService.getProjectParametersById(id)
            .subscribe(response => {
                res(response);
            },
            errMsg => {
                globals.wdLog(['http ERROR MESSAGE', errMsg]);
                rej(errMsg);
            },
            () => {
                globals.wdLog(['API ERROR NESSUNO']);
                rej('NULL');
            });
        });
    }

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

        this.globals.setColor();
        this.obsSettingsService.next(true);
    }
        /**
     * A: setVariablesFromService
     */
    setVariablesFromService(globals: Globals, response: any) {
        // console.log('setVariablesFromService', response);
        // DEPARTMENTS
        if (response && response.departments !== null) {
            // console.log('response.departments->', response.departments);
            globals.wdLog(['response DEP ::::', response.departments]);
            // globals.setParameter('departments', response.departments);
            this.initDepartments(response.departments);
        }
        // AVAILABLE AGENTS
        if (response && response.user_available !== null) {
            // console.log('user_available ::::', response.user_available);
            this.setAvailableAgentsStatus(response.user_available);
        }
        // WIDGET
        if (response && response.project && response.project.widget !== null) {
            // console.log('response.widget: ', response.widget);
            const variables = response.project.widget;
            if (!variables || variables === undefined) {
                return;
            }
            for (const key of Object.keys(variables)) {
                // console.log('SET globals from service KEY ---------->', key);
                // console.log('SET globals from service VAL ---------->', variables[key]);
                // sposto l'intero frame a sx se align è = left
                if (key === 'align' && variables[key] === 'left') {
                    const divWidgetContainer = globals.windowContext.document.getElementById('tiledeskiframe');
                    divWidgetContainer.style.left = '0';
                }
                if (variables[key] && variables[key] !== null) {
                    globals[key] = stringToBoolean(variables[key]);
                }
            }
            // console.log('SET globals == ---------->', globals);
        }
    }

    /**
    * B: getVariablesFromSettings
    */
    setVariablesFromSettings(globals: Globals) {
        // console.log('setVariablesFromSettings');
        const windowContext = globals.windowContext;
        // console.log('windowContext', globals.windowContext);
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
        // console.log('tiledeskSettings: ', tiledeskSettings);
        TEMP = tiledeskSettings['tenant'];
        // console.log('2 - tenant:: ', TEMP);
        if (TEMP !== undefined) {
            globals.tenant = TEMP;
            // globals.setParameter('tenant', TEMP);
        }
        TEMP = tiledeskSettings['recipientId'];
        // console.log('3 - recipientId:: ', TEMP);
        if (TEMP !== undefined) {
            globals.recipientId = TEMP;
            // globals.setParameter('recipientId', TEMP);
        }
        TEMP = tiledeskSettings['widgetTitle'];
        // console.log('5 - widgetTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.widgetTitle = TEMP;
            // globals.setParameter('widgetTitle', TEMP);
        }
        TEMP = tiledeskSettings['poweredBy'];
        // console.log('6 - poweredBy:: ', TEMP);
        if (TEMP !== undefined) {
            globals.poweredBy = TEMP;
            // globals.setParameter('poweredBy', TEMP);
        }
        TEMP = tiledeskSettings['userEmail'];
        // console.log('8 - userEmail:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userEmail = TEMP;
            // globals.setParameter('userEmail', TEMP);
        }
        TEMP = tiledeskSettings['userPassword'];
        // console.log('9 - userPassword:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userPassword = TEMP;
            // globals.setParameter('userPassword', TEMP);
        }
        TEMP = tiledeskSettings['userFullname'];
        // console.log('10 - userFullname:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userFullname = TEMP;
            // globals.setParameter('userFullname', TEMP);
        }
        TEMP = tiledeskSettings['preChatForm'];
        // console.log('11 - preChatForm:: ', TEMP);
        if (TEMP !== undefined) {
            globals.preChatForm = (TEMP === false) ? false : true;
            // globals.setParameter('preChatForm', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['isOpen'];
        // console.log('12 - isOpen:: ', TEMP);
        if (TEMP !== undefined) {
            globals.isOpen = (TEMP === false) ? false : true;
            // globals.setParameter('isOpen', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['channelType'];
        // console.log('13 - channelType:: ', TEMP);
        if (TEMP !== undefined) {
            globals.channelType = TEMP;
            // globals.setParameter('channelType', TEMP);
        }
        TEMP = tiledeskSettings['lang'];
        // console.log('14 - lang:: ', TEMP);
        if (TemplateBindingParseResult) {
            globals.lang = TEMP;
            // globals.setParameter('lang', TEMP);
        }
        TEMP = tiledeskSettings['align'];
        // console.log('15 - align:: ', TEMP);
        if (TEMP !== undefined) {
            globals.align = TEMP;
            // console.log('15 - globals.align:: ', globals.align);
            if (globals.align === 'left') {
                const divWidgetContainer = windowContext.document.getElementById('tiledeskiframe');
                divWidgetContainer.style.left = '0';
            }
            // globals.setParameter('align', TEMP);
        }
        TEMP = tiledeskSettings['marginX'];
        // console.log('16 - marginX:: ', TEMP);
        if (TEMP !== undefined) {
            globals.marginX = TEMP;
            // globals.setParameter('marginX', TEMP);
        }
        TEMP = tiledeskSettings['marginY'];
        // console.log('17 - marginY:: ', TEMP);
        if (TEMP !== undefined) {
            globals.marginY = TEMP;
            // globals.setParameter('marginY', TEMP);
        }
        TEMP = tiledeskSettings['calloutTimer'];
        // console.log('18 - calloutTimer:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutTimer = TEMP;
            // globals.setParameter('calloutTimer', TEMP);
        }
        TEMP = tiledeskSettings['calloutTitle'];
        // console.log('19 - calloutTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutTitle = TEMP;
            // globals.setParameter('calloutTitle', TEMP);
        }
        TEMP = tiledeskSettings['calloutMsg'];
        // console.log('20 - calloutMsg:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutMsg = TEMP;
            // globals.setParameter('calloutMsg', TEMP);
        }
        TEMP = tiledeskSettings['fullscreenMode'];
        // console.log('21 - fullscreenMode:: ', TEMP);
        if (TEMP !== undefined) {
            globals.fullscreenMode = TEMP;
            // globals.setParameter('fullscreenMode', TEMP);
        }
        TEMP = tiledeskSettings['hideHeaderCloseButton'];
        // console.log('22 - hideHeaderCloseButton:: ', TEMP);
        if (TEMP !== undefined) {
            globals.hideHeaderCloseButton = TEMP;
            // globals.setParameter('hideHeaderCloseButton', TEMP);
        }
        TEMP = tiledeskSettings['themeColor'];
        // console.log('23 - themeColor:: ', TEMP);
        if (TEMP !== undefined) {
            globals.themeColor = convertColorToRGBA(TEMP, 100);
            // globals.setParameter('themeColor', convertColorToRGBA(TEMP, 100));
        }
        TEMP = tiledeskSettings['themeForegroundColor'];
        // console.log('24 - themeForegroundColor:: ', TEMP);
        if (TEMP !== undefined) {
            globals.themeForegroundColor = convertColorToRGBA(TEMP, 100);
            // globals.setParameter('themeForegroundColor', convertColorToRGBA(TEMP, 100));
        }
        TEMP = tiledeskSettings['allowTranscriptDownload'];
        // console.log('25 - allowTranscriptDownload:: ', TEMP);
        if (TEMP !== undefined) {
            globals.allowTranscriptDownload = TEMP;
            // globals.setParameter('allowTranscriptDownload', TEMP);
        }
        TEMP = tiledeskSettings['startFromHome'];
        // console.log('27 - startFromHome:: ', TEMP);
        if (TEMP !== undefined) {
            globals.startFromHome = (TEMP === false) ? false : true;
            // globals.setParameter('startFromHome', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['logoChat'];
        // console.log('28 - logoChat:: ', TEMP);
        if (TEMP !== undefined) {
            globals.logoChat = TEMP;
            // globals.setParameter('logoChat', TEMP);
        }
        TEMP = tiledeskSettings['wellcomeTitle'];
        // console.log('29 - wellcomeTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.wellcomeTitle = TEMP;
            // globals.setParameter('wellcomeTitle', TEMP);
        }
        TEMP = tiledeskSettings['wellcomeMsg'];
        // console.log('30 - wellcomeMsg:: ', TEMP);
        if (TEMP !== undefined) {
            globals.wellcomeMsg = TEMP;
            // globals.setParameter('wellcomeMsg', TEMP);
        }
        TEMP = tiledeskSettings['autoStart'];
        // console.log('31 - autoStart:: ', TEMP);
        if (TEMP !== undefined) {
            globals.autoStart = (TEMP === false) ? false : true;
            // globals.setParameter('autoStart', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['isShown'];
        // console.log('32 - isShown:: ', TEMP);
        if (TEMP !== undefined) {
            globals.isShown = (TEMP === false) ? false : true;
            // globals.setParameter('isShown', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['filterByRequester'];
        // console.log('34 - filterByRequester:: ', TEMP);
        if (TEMP !== undefined) {
            globals.filterByRequester = (TEMP === false) ? false : true;
            // console.log('34 - globals.filterByRequester:: ', globals.filterByRequester);
            // globals.setParameter('filterByRequester', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showWaitTime'];
        // console.log('36 - showWaitTime:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showWaitTime = (TEMP === false) ? false : true;
            // globals.setParameter('showWaitTime', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showAvailableAgents'];
        // console.log('37 - showAvailableAgents:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showAvailableAgents = (TEMP === false) ? false : true;
            // globals.setParameter('showAvailableAgents', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showLogoutOption'];
        // console.log('38 - showLogoutOption:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showLogoutOption = (TEMP === false) ? false : true;
            // globals.setParameter('showLogoutOption', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showWidgetNameInConversation'];
        // console.log('39 - showWidgetNameInConversation:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showWidgetNameInConversation = (TEMP === false) ? false : true;
            // globals.setParameter('showWidgetNameInConversation', (TEMP === false) ? false : true);
        }
    }

    /**
     * C: getVariablesFromAttributeHtml
     * desueto, potrebbe essere commentato.
     */
    setVariablesFromAttributeHtml(globals: Globals, el: ElementRef) {
        // console.log('getVariablesFromAttributeHtml', el);
        const projectid = el.nativeElement.getAttribute('projectid');
        if (projectid !== null) {
            globals.setParameter('projectid', projectid);
        }
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

    }


    /**
    * D: setVariableFromUrlParameters
    */
    setVariablesFromUrlParameters(globals: Globals) {
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

        TEMP = getParameterByName(windowContext, 'tiledesk_projectid');
        if (TEMP) {
            globals.projectid = stringToBoolean(TEMP);
        }

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
                const divWidgetContainer = windowContext.document.getElementById('tiledeskiframe');
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
        globals.wdLog(['isLogEnabled: ', globals.isLogEnabled]);


        TEMP = getParameterByName(windowContext, 'tiledesk_filterByRequester');
        if (TEMP) {
            globals.filterByRequester = stringToBoolean(TEMP);
            // console.log('tiledesk_filterByRequester:: ', globals.filterByRequester);
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
            // console.log('globals.preChatForm: ' + globals.preChatForm);
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
    }

    /**
     * E: setVariableFromStorage
     * recupero il dictionary global dal local storage
     * aggiorno tutti i valori di globals
     * @param globals
     */
    setVariableFromStorage(globals: Globals) {
        // console.log('setVariableFromStorage :::::::: SET VARIABLE ---------->', Object.keys(globals));
        for (const key of Object.keys(globals)) {
            const val = this.storageService.getItem(key);
            // console.log('SET globals KEY ---------->', key);
            // console.log('SET globals VAL ---------->', val);
            if (val && val !== null) {
                // globals.setParameter(key, val);
                globals[key] = stringToBoolean(val);
            }
            // console.log('SET globals == ---------->', globals);
        }
    }

     // ========= begin:: GET DEPARTEMENTS ============//
    /**
     * INIT DEPARTMENT:
     * get departments list
     * set department default
     * CALL AUTHENTICATION
    */
    initDepartments(departments) {
        this.globals.departments = departments;
        this.globals.setParameter('departmentSelected', null);
        // this.globals.setParameter('departmentDefault', null);
        this.globals.wdLog(['SET DEPARTMENT DEFAULT ::::', departments[0]]);
        this.setDepartment(departments[0]);
        let i = 0;
        departments.forEach(department => {
            if (department['default'] === true) {
                this.globals.setParameter('departmentDefault', department);
                // this.globals.departmentDefault = department;
                departments.splice(i, 1);
                return;
            }
            i++;
        });
        if (departments.length === 1) {
            // UN SOLO DEPARTMENT
            this.globals.wdLog(['DEPARTMENT FIRST ::::', departments[0]]);
            this.setDepartment(departments[0]);
            // return false;
        } else if (departments.length > 1) {
            // CI SONO + DI 2 DIPARTIMENTI
            this.globals.wdLog(['CI SONO + DI 2 DIPARTIMENTI ::::', departments[0]]);
        } else {
            // DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI !!!!
            this.globals.wdLog(['DEPARTMENT DEFAULT NON RESTITUISCE RISULTATI ::::', departments[0]]);
        }
    }

    /**
     * SET DEPARTMENT:
     * set department selected
     * save department selected in attributes
     * save attributes in this.storageService
    */
    setDepartment(department) {
        this.globals.setParameter('departmentSelected', department);
        const attributes = this.globals.attributes;
        if (department && attributes) {
            attributes.departmentId = department._id;
            attributes.departmentName = department.name;
            this.globals.setParameter('attributes', attributes);
            this.globals.setParameter('departmentSelected', department);
            this.globals.wdLog(['setAttributes setDepartment: ', JSON.stringify(attributes)]);
            this.storageService.setItem('attributes', JSON.stringify(attributes));
        }
    }
    // ========= end:: GET DEPARTEMENTS ============//


    // ========= begin:: GET AVAILABLE AGENTS STATUS ============//
    /** setAvailableAgentsStatus
     * verifica se c'è un agent disponibile
     */
    private setAvailableAgentsStatus(availableAgents) {
        // console.log('availableAgents->', availableAgents);
        if (availableAgents.length <= 0) {
            this.globals.setParameter('areAgentsAvailable', false);
            this.globals.setParameter('areAgentsAvailableText', this.globals.AGENT_NOT_AVAILABLE);
            // this.globals.setParameter('availableAgents', null);
            // this.storageService.removeItem('availableAgents');
        } else {
            this.globals.setParameter('areAgentsAvailable', true);
            this.globals.setParameter('areAgentsAvailableText', this.globals.AGENT_AVAILABLE);
            const arrayAgents = [];
            availableAgents.forEach(element => {
                element.imageurl = getImageUrlThumb(element.id);
                arrayAgents.push(element);
            });
            let limit = arrayAgents.length;
            if (arrayAgents.length > 5) {
                limit = 5;
            }
            this.globals.availableAgents = arrayAgents.slice(0, limit);
            // this.globals.setParameter('availableAgents', availableAgents);
            // console.log('element->', this.globals.availableAgents[0]);
        }
        this.globals.setParameter('availableAgentsStatus', true);
    }
    // ========= end:: GET AVAILABLE AGENTS STATUS ============//


}
