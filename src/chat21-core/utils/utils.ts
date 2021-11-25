import * as moment from 'moment/moment';
import 'moment/locale/it.js';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/storage';

import { environment } from '../../environments/environment';
// tslint:disable-next-line:max-line-length
import {
  MAX_WIDTH_IMAGES,
  STORAGE_PREFIX,
  TYPE_DIRECT,
  TYPE_SUPPORT_GROUP
} from './constants';

import {
  avatarPlaceholder,
  getColorBck,
  getImageUrlThumbFromFirebasestorage
 } from './utils-user';
import { time } from 'console';
import { ConversationModel } from '../models/conversation';
/**
 * Shortest description  for phone and tablet
 * Nota: eseguendo un test su desktop in realtà lo switch avviene a 921px 767px
 */
export function windowsMatchMedia() {
  const mq = window.matchMedia('(max-width: 767px)');
  if (mq.matches) {
    console.log('window width is less than 767px ');
    return false;
  } else {
    console.log('window width is at least 767px');
    return true;
  }
}

/**
 * chiamata da ChatConversationsHandler
 * restituisce url '/conversations'
 * @param tenant
 */
export function conversationsPathForUserId(tenant, userId) {
  const urlNodeConversations = '/apps/' + tenant + '/users/' + userId + '/conversations';
  return urlNodeConversations;
}
/**
 * chiamata da ArchivedConversationsHandler
 * restituisce url '/archived_conversations'
 * @param tenant
 */
export function archivedConversationsPathForUserId(tenant, userId) {
  const urlNodeConversations = '/apps/' + tenant + '/users/' + userId + '/archived_conversations';
  return urlNodeConversations;
}
/**
 * chiamata da ChatConversationHandler
 * restituisce url '/messages'
 */
export function conversationMessagesRef(tenant, userId) {
  const urlNode = '/apps/' + tenant + '/users/' + userId + '/messages/';
  return urlNode;
}

/**
 * chiamata da ChatContactsSynchronizer
 * restituisce url '/contacts'
 */
export function contactsRef(tenant) {
  const urlNodeContacts = '/apps/' + tenant + '/contacts/';
  return urlNodeContacts;
}
/**
 * calcolo il tempo trascorso tra due date
 * e lo formatto come segue:
 * gg/mm/aaaa;
 * oggi;
 * ieri;
 * giorno della settimana (lunedì, martedì, ecc)
 */
// export function setHeaderDate_old(timestamp): string {
//   const date = new Date(timestamp);
//   const now: Date = new Date();
//   let labelDays = '';
//   if (now.getFullYear() !== date.getFullYear()) {
//     labelDays = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear();
//   } else if (now.getMonth() !== date.getMonth()) {
//     labelDays = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear();
//   } else if (now.getDay() === date.getDay()) {
//     labelDays = LABEL_TODAY;
//   } else if (now.getDay() - date.getDay() === 1) {
//     labelDays = LABEL_TOMORROW;
//   } else {
//     labelDays = convertDayToString(translate, date.getDay());
//   }
//   // se le date sono diverse o la data di riferimento non è impostata
//   // ritorna la data calcolata
//   // altrimenti torna null
//   return labelDays;
// }

export function setHeaderDate(translate, timestamp): string {
  // const LABEL_TODAY = translate.get('LABEL_TODAY');
  // const LABEL_TOMORROW = translate.get('LABEL_TOMORROW');

  const date = new Date(timestamp);
  const now: Date = new Date();
  let labelDays = '';
  if (now.getFullYear() !== date.getFullYear()) {
    // quest'anno: data esatta
    const month = date.getMonth() + 1;
    labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
  } else if (now.getMonth() !== date.getMonth()) {
    // questo mese: data esatta
    const month = date.getMonth() + 1;
    labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
  } else if (now.getDay() === date.getDay()) {
    // oggi: oggi
    labelDays = moment().calendar(timestamp).split(' ')[0].toLocaleLowerCase();
    // labelDays = LABEL_TODAY;
  } else if (now.getDay() - date.getDay() === 1) {
    // ieri: ieri
    labelDays = moment().calendar(timestamp).split(' ')[0].toLocaleLowerCase();
    // labelDays = LABEL_TOMORROW;
  } else {
    // questa settimana: giorno
    labelDays = convertDayToString(translate, date.getDay());
  }
  // se le date sono diverse o la data di riferimento non è impostata
  // ritorna la data calcolata
  // altrimenti torna null
  return labelDays;
}



/**
 * calcolo il tempo trascorso tra la data passata e adesso
 * utilizzata per calcolare data ultimo accesso utente
 * @param timestamp 
 */
export function setLastDate(translate, timestamp): string {

  const LABEL_TODAY = translate.get('LABEL_TODAY');
  const LABEL_TOMORROW = translate.get('LABEL_TOMORROW');
  const LABEL_TO = translate.get('LABEL_TO');
  const LABEL_LAST_ACCESS = translate.get('LABEL_LAST_ACCESS');

  var date = new Date(timestamp);
  let now: Date = new Date();
  var labelDays = '';
  if (now.getFullYear() !== date.getFullYear()) {
    const month = date.getMonth() + 1;
    labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
  } else if (now.getMonth() !== date.getMonth()) {
    const month = date.getMonth() + 1;
    labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
  } else if (now.getDay() === date.getDay()) {
    labelDays = LABEL_TODAY;
  } else if (now.getDay() - date.getDay() === 1) {
    labelDays = LABEL_TOMORROW;
  } else {
    labelDays = convertDayToString(translate, date.getDay());
  }
  // aggiungo orario
  const orario = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  return LABEL_LAST_ACCESS + ' ' + labelDays + ' ' + LABEL_TO + ' ' + orario;
}

/**
 *
 * @param Map
 * @param timestamp
 */
export function setLastDateWithLabels(translationMap: Map<string, string>, timestamp: string): string {
  const date = new Date(timestamp);
  const now: Date = new Date();
  let labelDays = '';
  if (now.getFullYear() !== date.getFullYear()) {
    const month = date.getMonth() + 1;
    labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
  } else if (now.getMonth() !== date.getMonth()) {
    const month = date.getMonth() + 1;
    labelDays = date.getDay() + '/' + month + '/' + date.getFullYear();
  } else if (now.getDay() === date.getDay()) {
    labelDays = translationMap.get('LABEL_TODAY');
  } else if (now.getDay() - date.getDay() === 1) {
    labelDays = translationMap.get('LABEL_TOMORROW');
  } else {
    const days = translationMap.get('ARRAY_DAYS');
    labelDays =  days[date.getDay()];
  }
  const orario = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  return translationMap.get('LABEL_LAST_ACCESS') + ' ' + labelDays + ' ' + translationMap.get('LABEL_TO') + ' ' + orario;
}

/**
 * 
 * @param translate 
 * @param day 
 */
export function convertDayToString(translate, day) {
  const ARRAY_DAYS = translate.get('ARRAY_DAYS');
  return ARRAY_DAYS[day];
}

export function supports_html5_storage() {
  try {
      return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    this.g.wdLog(['> Error :' + e]);
    return false;
  }
}

export function supports_html5_session() {
  try {
      return 'sessionStorage' in window && window['sessionStorage'] !== null;
  } catch (e) {
    this.g.wdLog(['> Error :' + e]);
    return false;
  }
}

export function setStoragePrefix(): string{
  let prefix = STORAGE_PREFIX;
  try {
      // const sv = 'sv' + environment.shemaVersion + '_';
      // prefix = prefix + sv;
      prefix = environment.storage_prefix + '_';
  } catch (e) {
      this.g.wdLog(['> Error :' + e]);
  }
  return prefix + this.g.projectid + '_';
}


export function convertMessage(messageText) {
  if (messageText) {
    messageText = convert(messageText);
  }
  return messageText;
}

// function convert(str) {
//   str = str.replace(/>/g, '&gt;');
//   str = str.replace(/</g, '&lt;');
//   str = str.replace(/"/g, '&quot;');
//   str = str.replace(/'/g, '&#039;');
//   return str;
// }


/**
 * restituiso indice item nell'array con uid == key
 * @param items
 * @param key
 */
export function searchIndexInArrayForUid(items, key) {
  return items.findIndex(i => i.uid === key);
}

/**
 * trasforma url contenuti nel testo passato in tag <a>
 */
export function urlify(text) {
  // tslint:disable-next-line:max-line-length
  const urlRegex = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
  return text.replace(urlRegex, function (url) {
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'http://' + url;
    }
    // url = convertUrlToTag(url);
    return '<a class="c21-link" href="' + url + '" target="_blank">' + url + '</a>';
  });
}

function convertUrlToTag(url) {
  let popup = false;
  const TEMP = url.split('popup=')[1];
  if (TEMP) { popup = TEMP.split('&')[0]; }
  // tslint:disable-next-line:no-unused-expression
  (TEMP === 'true') ? popup = true : popup = false;
  // tslint:disable-next-line:curly
  if (popup !== true) return '<a class="c21-link" href="' + url + '" target="_blank">' + url + '</a>';
  // tslint:disable-next-line:curly
  else return '<p (click)="openPopup2()">.</p>';

  //// '<a href="#" onclick="windowContext.open("www.google.it", "_system");" >' + url + '</a>';
  //// <a href="#" onclick="openPopup(' + url + ')">' + url + '</a>';
}


export function isPopupUrl(url) {
  try {
    const TEMP = url.split('popup=')[1];
    // può essere seguito da & oppure "
    if (TEMP) {
      if (TEMP.startsWith('true')) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

export function popupUrl(windowContext, html, title) {
  const url = stripTags(html);
  const w = 600;
  const h = 600; // screen.height - 40;
  const left = (screen.width / 2) - (w / 2);
  const top = (screen.height / 2) - (h / 2);

  // tslint:disable-next-line:whitespace
  // tslint:disable-next-line:max-line-length
  const newWindow = windowContext.open(url, '_blank', 'fullscreen=1, titlebar=0, toolbar=no, location=0, status=0, menubar=0, scrollbars=0, resizable=0, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  if (windowContext.focus) {
    newWindow.focus();
  }
}


export function encodeHTML(str) {
  return convert(str);
  // return str.replace(/[\u00A0-\u9999<>&](?!#)/gim, function(i) {
  //   return '&#' + i.charCodeAt(0) + ';';
  // });
}

export function decodeHTML(str) {

  // return str.replace(/&#([0-9]{1,3});/gi, function(match, num) {
  //     // tslint:disable-next-line:radix
  //     return String.fromCharCode( parseInt(num) );
  // });
}

function convert(str) {
  str = str.replace(/&/g, '&amp;');
  str = str.replace(/>/g, '&gt;');
  str = str.replace(/</g, '&lt;');
  str = str.replace(/"/g, '&quot;');
  str = str.replace(/'/g, '&#039;');
  return str;
}

export function stripTags(html) {
  return (html.replace(/<.*?>/g, '')).trim();
}

export function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // .replace(/\n/g, '<br>')
}

export function htmlEntitiesDecode(str) {
  return String(str)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // .replace(/\n/g, '<br>')
}

export function  replaceEndOfLine(text) {
  // const newText =   text.replace(/\n/g, '<br>')
  const newText = text.replace(/[\n\r]/g, '<br>');
  // const newText = text.replace(/<br\s*[\/]?>/gi, '\n')
  return newText;
}

export function isEmoji(str: string) {
  // tslint:disable-next-line:max-line-length
  const ranges = ['(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])'];
  if (str.match(ranges.join('|'))) {
      return true;
  } else {
      return false;
  }
}

export function setColorFromString(str: string) {
  const arrayBckColor = ['#fba76f', '#80d066', '#73cdd0', '#ecd074', '#6fb1e4', '#f98bae'];
  let num = 0;
  if (str) {
    const code = str.charCodeAt((str.length - 1));
    num = Math.round(code % arrayBckColor.length);
  }
  return arrayBckColor[num];
}

export function detectIfIsMobile(windowContext) {
  const isMobile = /Android|iPhone/i.test(windowContext.navigator.userAgent);
  return isMobile;
}

export function convertColorToRGBA(color, opacity) {
  let result = color;
  // console.log('convertColorToRGBA' + color, opacity);
  if ( color.indexOf('#') > -1 ) {
    color = color.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
  } else if ( color.indexOf('rgba') > -1 ) {
    const rgb = color.split(',');
    const r = rgb[0].substring(5);
    const g = rgb[1];
    const b = rgb[2];
    // const b = rgb[2].substring(1, rgb[2].length - 1);
    result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
  } else if ( color.indexOf('rgb(') > -1 ) {
    const rgb = color.split(',');
    // console.log(rgb);
    const r = rgb[0].substring(4);
    const g = rgb[1];
    const b = rgb[2].substring(0, rgb[2].length - 1);
    // console.log(b);
    // console.log(rgb[2].length);
    result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
  }
  // console.log('convertColorToRGBA' + color + result);
  return result;
}


// export function setLanguage(windowContext, translatorService) {
//   if (translatorService.getBrowserLanguage(windowContext)) {
//     return translatorService.getBrowserLanguage(windowContext);
//   }
//   return translatorService.getDefaultLanguage(windowContext);
// }

export function getParameterByName(windowContext: any, name: String) {
  const url = windowContext.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
  // console.log('results----> ', results);
  if (!results) { return null; }
  if (!results[2]) {
    return 'true';
  } else if (results[2] === 'false' || results[2] === '0') {
    return 'false';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


/**
 * function for dynamic sorting
 */
export function compareValues(key, order = 'asc') {
  return function (a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      return 0;
    }
    const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];
    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}

/** */
export function getNowTimestamp() {
  //console.log("timestamp:", moment().valueOf());
  return moment().valueOf();
}

export function getFormatData(timestamp): string {
  var dateString = moment.unix(timestamp / 1000).format('L');
  // const date = new Date(timestamp);
  // const labelDays = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
  return dateString;
}

export function getTimeLastMessage(timestamp: string) {
  const timestampNumber = parseInt(timestamp, null) / 1000;
  const time = getFromNow(timestampNumber);
  return time;
}

// export function getFromNow(windowContext, timestamp) {
//   let browserLang = windowContext.navigator.language;
//   if (this.g.lang && this.g.lang !== '') {
//     browserLang = this.g.lang;
//   }
//   moment.locale(browserLang);
//   // console.log('getFromNow - browserLang: ', browserLang);
//   const date_as_string = moment.unix(timestamp).fromNow();
//   return date_as_string;
// }

export function getFromNow(timestamp): string {
  // var fullDate = new Date(this.news.date.$date)
  // console.log('FULL DATE: ', fullDate);
  // var month = '' + (fullDate.getMonth() + 1)
  // var day = '' + fullDate.getDate()
  // var year = fullDate.getFullYear()
  // var hour = '' + fullDate.getHours()
  // var min = fullDate.getMinutes()
  // var sec = fullDate.getSeconds()
  // if (month.length < 2) month = '0' + month;
  // if (day.length < 2) day = '0' + day;
  // if (hour.length < 2) hour = '0' + hour;
  // console.log('Giorno ', day)
  // console.log('Mese ', month)
  // console.log('Anno ', year)
  // console.log('Ora ', hour)
  // console.log('Min ', min)
  // console.log('Sec', sec)

  // this.dateFromNow = moment(year + month + day, "YYYYMMDD").fromNow()
  // let date_as_string = moment(year + month + day, "YYYYMMDD").fromNow()

  // let date_as_string = moment(year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec).fromNow()
  // let date_as_string = moment("2017-07-03 08:33:37").fromNow()
  //var day = new Date(2017, 8, 16);
  //let date_as_string = moment(day);

  // var dateString = moment.unix(timestamp).format("MM/DD/YYYY");
  // console.log(moment(dateString).fromNow(), dateString);
  // var date = "Thu Aug 19 2017 19:58:03 GMT+0000 (GMT)";
  // console.log(moment(date).fromNow()); // 1 hour ago
  // console.log(moment.unix(1483228800).fromNow());
  // console.log(moment.unix(1501545600).fromNow());
  //console.log("timestamp: ",timestamp, " - 1483228800 - ", moment.unix(1483228800).fromNow());
  // console.log();

  //console.log("window.navigator.language: ", window.navigator.language);

  moment.locale(window.navigator.language);
  let date_as_string = moment.unix(timestamp).fromNow();
  return date_as_string;
}


// export function getUrlImgProfile(uid: string) {
//   const baseLocation = this.g.baseLocation;
//   if (!uid || uid === 'system' ) {
//     return baseLocation + IMG_PROFILE_BOT;
//   } else if ( uid === 'error') {
//     return baseLocation + IMG_PROFILE_DEFAULT;
//   } else {
//       return getImageUrlThumb(uid);
//   }
// }

export function getImageUrlThumb(FIREBASESTORAGE_BASE_URL_IMAGE: string, uid: string) {
  let imageurl = FIREBASESTORAGE_BASE_URL_IMAGE + environment['firebaseConfig'].storageBucket + '/o/profiles%2F' + uid + '%2Fthumb_photo.jpg?alt=media';
  return imageurl;
}


/**
 *
 * @param string
 */
export function stringToBoolean(string: any): any {
  let val = string;
  if (typeof string !== 'string') {
    val = JSON.stringify(string);
    return val;
  }
  if (!string) {
    return;
  }
  switch (val.toLowerCase().trim()) {
      case 'true': case 'yes': case '1': return true;
      case 'false': case 'no': case '0': case null: return false;
      default: return val;
  }
}

export function getUnique(arr, comp) {
  const unique = arr
    .map(e => e[comp])
     // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)
    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e]);
   return unique;
}

export function isJustRecived(startedAt, time) {
  if (time > startedAt) {
    return true;
  }
  return false;
}

export function isGroup(conv: ConversationModel) {
  if (conv && conv.recipient && (conv.recipient.startsWith('group-') || conv.recipient.startsWith('support-group'))) {
      return true
  };
  return false
}

export function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    console.log('ERROR to parse JSON object. Pass a valid Json object: ', e)
    return false;
  }
  return true;
}

export function validateRegex(regex){
  let validRegex = regex
  if(regex.substring(0,1) !== '/')
    validRegex = '/' + regex
  if(regex.substring(regex.length -1, regex.length) !== '/'){
    validRegex = validRegex + '/'
  }
  return validRegex
}


// https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
export function invertColor(hex: string, bw: boolean) {
  let r,g,b;
  if(hex.includes('rgb')){
    hex = rgbToHex(hex)
  }
  if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
      throw new Error('Invalid HEX color.');
  }
  r = parseInt(hex.slice(0, 2), 16);
  g = parseInt(hex.slice(2, 4), 16);
  b = parseInt(hex.slice(4, 6), 16);

  if (bw) {
      // https://stackoverflow.com/a/3943023/112731
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r,2) + padZero(g,2) + padZero(b,2);
}

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}

function rgbToHex(rgb) {
  var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
  var result, r, g, b, hex = "";
  if ( (result = rgbRegex.exec(rgb)) ) {
      r = componentFromStr(result[1], result[2]);
      g = componentFromStr(result[3], result[4]);
      b = componentFromStr(result[5], result[6]);

      hex = "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  return hex;
}

function componentFromStr(numStr, percent) {
  var num = Math.max(0, parseInt(numStr, 10));
  return percent ?
      Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
}


