import * as moment from 'moment/moment';
import 'moment/locale/it.js';
import { ARRAY_DAYS, LABEL_TODAY, LABEL_TOMORROW, LABEL_LAST_ACCESS, LABEL_TO } from './constants';

/**
 * calcolo il tempo trascorso tra due date
 * e lo formatto come segue:
 * gg/mm/aaaa;
 * oggi;
 * ieri;
 * giorno della settimana (lunedì, martedì, ecc)
 */
export function setHeaderDate(timestamp): string {
    const date = new Date(timestamp);
    const now: Date = new Date();
    let labelDays = '';
    console.log('setHeaderDate **************', now, date);
    if (now.getFullYear() !== date.getFullYear()) {
      labelDays = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear();
    } else if (now.getMonth() !== date.getMonth()) {
      labelDays = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear();
    } else if (now.getDay() === date.getDay()) {
      labelDays = LABEL_TODAY;
    } else if (now.getDay() - date.getDay() === 1) {
      labelDays = LABEL_TOMORROW;
    } else {
      labelDays = convertDayToString(date.getDay());
    }
    // se le date sono diverse o la data di riferimento non è impostata
    // ritorna la data calcolata
    // altrimenti torna null
    return labelDays;
}

export function convertDayToString(day) {
    const arrayDays = ARRAY_DAYS;
    return arrayDays[day];
}

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
    // console.log('convertUrlToTag 2 **************', url);
    return '<a href="' + url + '" target="_blank">' + url + '</a>';
  });
}

function convertUrlToTag(url) {
  let popup = false;
  const TEMP = url.split('popup=')[1];
  if (TEMP) { popup = TEMP.split('&')[0]; }
  // tslint:disable-next-line:no-unused-expression
  (TEMP === 'true') ? popup = true : popup = false;
  console.log('convertUrlToTag 1 **************', TEMP);
  // tslint:disable-next-line:curly
  if (popup !== true) return '<a href="' + url + '" target="_blank">' + url + '</a>';
  // tslint:disable-next-line:curly
  else return '<p (click)="openPopup2()">zzz</p>';

  //// '<a href="#" onclick="window.open("www.google.it", "_system");" >' + url + '</a>';
  //// <a href="#" onclick="openPopup(' + url + ')">' + url + '</a>';
}

export function openPopup2() {
  // const myWindow = window.open(url, 'Video Chat', 'width=100%,height=300');
  console.log('myWindow 1 **************');
  // return myWindow;
}

export function isPopupUrl(url) {
  const TEMP = url.split('popup=')[1];
  // può essere seguito da & oppure "
  if (TEMP) {
    if (TEMP.startsWith('true')) {
      // console.log('isPopupUrl::::: ', TEMP.startsWith('true'));
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export function popupUrl(html, title) {
  const url = this.strip_tags(html);
  const w = 600;
  const h = 600; // screen.height - 40;
  const left = (screen.width / 2) - ( w / 2);
  const top = (screen.height / 2) - ( h / 2);

  // tslint:disable-next-line:whitespace
  // tslint:disable-next-line:max-line-length
  const newWindow = window.open(url, '_blank', 'fullscreen=1, titlebar=0, toolbar=no, location=0, status=0, menubar=0, scrollbars=0, resizable=0, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  if (window.focus) {
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

export function strip_tags(html) {
  return (html.replace( /<.*?>/g, '' )).trim();
}

