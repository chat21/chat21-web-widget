import { ElementRef, Injectable } from '@angular/core';
// services
import { Globals } from '../utils/globals';
import { stringToBoolean, convertColorToRGBA, getParameterByName } from '../utils/utils';
import { TemplateBindingParseResult } from '@angular/compiler';
import { StorageService } from './storage.service';

@Injectable()
export class LocalSettingsService {

    constructor(
        private storageService: StorageService
    ) {}

    load(globals: Globals, el: ElementRef) {
        console.log('LocalSettingsService load ------------> ', globals);
        this.setVariablesFromAttributeHtml(globals, el);
        this.setVariablesFromSettings(globals);
        this.setVariableFromUrlParameters(globals);
        this.setVariableFromStorage(globals);
    }

    /**
     * 0: getVariablesFromAttributeHtml
     *
     */
    setVariablesFromAttributeHtml(globals: Globals, el: ElementRef) {
        console.log('getVariablesFromAttributeHtml');
        const projectid = el.nativeElement.getAttribute('projectid');
        if (projectid !== null) {
            // globals.projectid = projectid;
            globals.setParameters('projectid', projectid);
        }
        console.log('projectid: ', projectid);
    }

    /**
    * 1: getVariablesFromSettings
    */
    setVariablesFromSettings(globals: Globals) {
        console.log('setVariablesFromSettings');
        const windowContext = globals.windowContext;
        console.log('windowContext', globals.windowContext);
        if (!windowContext['tiledesk']) {
            return;
        } else {
            const baseLocation =  windowContext['tiledesk'].getBaseLocation();
            if (baseLocation !== undefined) {
                // globals.setParameters('baseLocation', baseLocation);
                globals.baseLocation = baseLocation;
            }
        }
        let TEMP: any;
        const tiledeskSettings = windowContext['tiledeskSettings'];
        console.log('tiledeskSettings: ', tiledeskSettings);

        TEMP = tiledeskSettings['tenant'];

        // globals[key] = val;

        console.log('2 - tenant:: ', TEMP);
        if (TEMP !== undefined) {
            globals.tenant = TEMP;
            // globals.setParameters('tenant', TEMP);
        }
        TEMP = tiledeskSettings['recipientId'];
        console.log('3 - recipientId:: ', TEMP);
        if (TEMP !== undefined) {
            globals.recipientId = TEMP;
            // globals.setParameters('recipientId', TEMP);
        }
        TEMP = tiledeskSettings['projectid'];
        console.log('4 - projectid:: ', TEMP);
        if (TEMP !== undefined) {
            globals.projectid = TEMP;
            // globals.setParameters('projectid', TEMP);
        }
        TEMP = tiledeskSettings['widgetTitle'];
        console.log('5 - widgetTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.widgetTitle = TEMP;
            // globals.setParameters('widgetTitle', TEMP);
        }
        TEMP = tiledeskSettings['poweredBy'];
        console.log('6 - poweredBy:: ', TEMP);
        if (TEMP !== undefined) {
            globals.poweredBy = TEMP;
            // globals.setParameters('poweredBy', TEMP);
        }
        TEMP = tiledeskSettings['userId'];
        console.log('7 - userId:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userId = TEMP;
            // globals.setParameters('userId', TEMP);
        }
        TEMP = tiledeskSettings['userEmail'];
        console.log('8 - userEmail:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userEmail = TEMP;
            // globals.setParameters('userEmail', TEMP);
        }
        TEMP = tiledeskSettings['userPassword'];
        console.log('9 - userPassword:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userPassword = TEMP;
            // globals.setParameters('userPassword', TEMP);
        }
        TEMP = tiledeskSettings['userFullname'];
        console.log('10 - userFullname:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userFullname = TEMP;
            // globals.setParameters('userFullname', TEMP);
        }
        TEMP = tiledeskSettings['preChatForm'];
        console.log('11 - preChatForm:: ', TEMP);
        if (TEMP !== undefined) {
            globals.preChatForm = (TEMP === false) ? false : true;
            // globals.setParameters('preChatForm', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['isOpen'];
        console.log('12 - isOpen:: ', TEMP);
        if (TEMP !== undefined) {
            globals.isOpen = (TEMP === false) ? false : true;
            // globals.setParameters('isOpen', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['channelType'];
        console.log('13 - channelType:: ', TEMP);
        if (TEMP !== undefined) {
            globals.channelType = TEMP;
            // globals.setParameters('channelType', TEMP);
        }
        TEMP = tiledeskSettings['lang'];
        console.log('14 - lang:: ', TEMP);
        if (TemplateBindingParseResult) {
            globals.lang = TEMP;
            // globals.setParameters('lang', TEMP);
        }
        TEMP = tiledeskSettings['align'];
        console.log('15 - align:: ', TEMP);
        if (TEMP !== undefined) {
            globals.align = TEMP;
            // globals.setParameters('align', TEMP);
        }
        TEMP = tiledeskSettings['marginX'];
        console.log('16 - marginX:: ', TEMP);
        if (TEMP !== undefined) {
            globals.marginX = TEMP;
            // globals.setParameters('marginX', TEMP);
        }
        TEMP = tiledeskSettings['marginY'];
        console.log('17 - marginY:: ', TEMP);
        if (TEMP !== undefined) {
            globals.marginY = TEMP;
            // globals.setParameters('marginY', TEMP);
        }
        TEMP = tiledeskSettings['calloutTimer'];
        console.log('18 - calloutTimer:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutTimer = TEMP;
            // globals.setParameters('calloutTimer', TEMP);
        }
        TEMP = tiledeskSettings['calloutTitle'];
        console.log('19 - calloutTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutTitle = TEMP;
            // globals.setParameters('calloutTitle', TEMP);
        }
        TEMP = tiledeskSettings['calloutMsg'];
        console.log('20 - calloutMsg:: ', TEMP);
        if (TEMP !== undefined) {
            globals.calloutMsg = TEMP;
            // globals.setParameters('calloutMsg', TEMP);
        }
        TEMP = tiledeskSettings['fullscreenMode'];
        console.log('21 - fullscreenMode:: ', TEMP);
        if (TEMP !== undefined) {
            globals.fullscreenMode = TEMP;
            // globals.setParameters('fullscreenMode', TEMP);
        }
        TEMP = tiledeskSettings['hideHeaderCloseButton'];
        console.log('22 - hideHeaderCloseButton:: ', TEMP);
        if (TEMP !== undefined) {
            globals.hideHeaderCloseButton = TEMP;
            // globals.setParameters('hideHeaderCloseButton', TEMP);
        }
        TEMP = tiledeskSettings['themeColor'];
        console.log('23 - themeColor:: ', TEMP);
        if (TEMP !== undefined) {
            globals.themeColor = convertColorToRGBA(TEMP, 100);
            // globals.setParameters('themeColor', convertColorToRGBA(TEMP, 100));
        }
        TEMP = tiledeskSettings['themeForegroundColor'];
        console.log('24 - themeForegroundColor:: ', TEMP);
        if (TEMP !== undefined) {
            globals.themeForegroundColor = convertColorToRGBA(TEMP, 100);
            // globals.setParameters('themeForegroundColor', convertColorToRGBA(TEMP, 100));
        }
        TEMP = tiledeskSettings['allowTranscriptDownload'];
        console.log('25 - allowTranscriptDownload:: ', TEMP);
        if (TEMP !== undefined) {
            globals.allowTranscriptDownload = TEMP;
            // globals.setParameters('allowTranscriptDownload', TEMP);
        }
        TEMP = tiledeskSettings['userToken'];
        console.log('26 - userToken:: ', TEMP);
        if (TEMP !== undefined) {
            globals.userToken = TEMP;
            // globals.setParameters('userToken', TEMP);
        }
        TEMP = tiledeskSettings['startFromHome'];
        console.log('27 - startFromHome:: ', TEMP);
        if (TEMP !== undefined) {
            globals.startFromHome = (TEMP === false) ? false : true;
            // globals.setParameters('startFromHome', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['logoChat'];
        console.log('28 - logoChat:: ', TEMP);
        if (TEMP !== undefined) {
            globals.logoChat = TEMP;
            // globals.setParameters('logoChat', TEMP);
        }
        TEMP = tiledeskSettings['wellcomeTitle'];
        console.log('29 - wellcomeTitle:: ', TEMP);
        if (TEMP !== undefined) {
            globals.wellcomeTitle = TEMP;
            // globals.setParameters('wellcomeTitle', TEMP);
        }
        TEMP = tiledeskSettings['wellcomeMsg'];
        console.log('30 - wellcomeMsg:: ', TEMP);
        if (TEMP !== undefined) {
            globals.wellcomeMsg = TEMP;
            // globals.setParameters('wellcomeMsg', TEMP);
        }
        TEMP = tiledeskSettings['autoStart'];
        console.log('31 - autoStart:: ', TEMP);
        if (TEMP !== undefined) {
            globals.autoStart = (TEMP === false) ? false : true;
            // globals.setParameters('autoStart', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['isShown'];
        console.log('32 - isShown:: ', TEMP);
        if (TEMP !== undefined) {
            globals.isShown = (TEMP === false) ? false : true;
            // globals.setParameters('isShown', (TEMP === false) ? false : true);
        }
        // TEMP = tiledeskSettings['isLogoutEnabled'];
        // if (TEMP !== undefined) {
        //   this.isLogoutEnabled = (TEMP === false) ? false : true;
        // }
        TEMP = tiledeskSettings['isLogEnabled'];
        console.log('33 - isLogEnabled:: ', TEMP);
        if (TEMP !== undefined) {
            globals.isLogEnabled = (TEMP === false) ? false : true;
            // globals.setParameters('isLogEnabled', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['filterByRequester'];
        console.log('34 - filterByRequester:: ', TEMP);
        if (TEMP !== undefined) {
            globals.filterByRequester = (TEMP === false) ? false : true;
            // globals.setParameters('filterByRequester', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['persistence'];
        console.log('35 - persistence:: ', TEMP);
        if (TEMP !== undefined) {
            globals.persistence = TEMP;
            // globals.setParameters('persistence', TEMP);
        }
        TEMP = tiledeskSettings['showWaitTime'];
        console.log('36 - showWaitTime:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showWaitTime = (TEMP === false) ? false : true;
            // globals.setParameters('showWaitTime', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showAvailableAgents'];
        console.log('37 - showAvailableAgents:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showAvailableAgents = (TEMP === false) ? false : true;
            // globals.setParameters('showAvailableAgents', (TEMP === false) ? false : true);
        }
        TEMP = tiledeskSettings['showLogoutOption'];
        console.log('38 - showLogoutOption:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showLogoutOption = (TEMP === false) ? false : true;
            // globals.setParameters('showLogoutOption', (TEMP === false) ? false : true);
        }

        TEMP = tiledeskSettings['showWidgetNameInConversation'];
        console.log('39 - showWidgetNameInConversation:: ', TEMP);
        if (TEMP !== undefined) {
            globals.showWidgetNameInConversation = (TEMP === false) ? false : true;
            // globals.setParameters('showWidgetNameInConversation', (TEMP === false) ? false : true);
        }

  }





    /**
    * 2: setVariableFromUrlParameters
    */
    setVariableFromUrlParameters(globals: Globals) {
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
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_marginX');
        if (TEMP) {
            globals.marginX = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_marginY');
        if (TEMP) {
            globals.marginY = stringToBoolean(TEMP);
        }

        TEMP = getParameterByName(windowContext, 'tiledesk_wellcomemsg');
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

        TEMP = getParameterByName(windowContext, 'tiledesk_wellcomeMsg');
        if (TEMP) {
            globals.wellcomeMsg = stringToBoolean(TEMP);
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
     * 3: setVariableFromStorage
     * recupero il dictionary global dal local storage
     * aggiorno tutti i valori di globals
     * @param globals
     */
    setVariableFromStorage(globals: Globals) {
        // console.log('setVariableFromStorage :::::::: SET VARIABLE ---------->', Object.keys(globals));
        for (const key of Object.keys(globals)) {
            const val = this.storageService.getItem(key);

            console.log('SET globals KEY ---------->', key);
            console.log('SET globals VAL ---------->', val);
            if (val && val !== null) {
                // globals.setParameters(key, val);
                globals[key] = stringToBoolean(val);
            }
            console.log('SET globals == ---------->', globals);
        }

        // if (this.storageService.getItem('globals')) {
        //     const globalVar = JSON.parse(this.storageService.getItem('globals'));
        //     console.log('globalVar', globalVar);
        //     console.log('KEYS: ', Object.keys(globalVar));
        //     for (const key of Object.keys(globalVar)) {
        //         console.log('key', key);
        //         console.log('globalVar.key', globalVar[key]);
        //         globals.setParameters(key, globalVar[key]);
        //     }
        // }
    }


}
