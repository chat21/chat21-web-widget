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
export function setHeaderDate(timestamp, lastDate): string {
    const date = new Date(timestamp);
    const now: Date = new Date();
    let labelDays = '';
    console.log('setHeaderDate **************', timestamp, lastDate, date);
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
    if (lastDate !== labelDays || lastDate == null || lastDate === '') {
      return labelDays;
    } else {
      return null;
    }
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
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
  }
