import { Injectable } from '@angular/core';
import { Globals } from '../utils/globals';
import { supports_html5_storage, supports_html5_session } from '../utils/utils';
import { STORAGE_PREFIX } from '../utils/constants';


@Injectable()
export class StorageService {

  constructor(public g: Globals) { }

  // globals.setParameter(key, globalVar.key.value);
  // globals.getParameters('windowContext');

  public getItem (key): any {
    // const newKey = this.g.projectid + '_' + key;
    const newKey = STORAGE_PREFIX + this.g.projectid + '_' + key; // this.g.projectid + '_' + key;
    // if (this.g.persistence === 'local') {
    if (this.g.persistence === 'local') {
      if (supports_html5_storage()) {
        return localStorage.getItem(newKey);
      } else {
        console.warn('localStorage is not defind. Storage disabled');
        return null;
      }
    // } else if (this.g.persistence === 'session') {
    } else if (this.g.persistence === 'session') {
      if (supports_html5_session()) {
        return sessionStorage.getItem(newKey);
      } else {
        console.warn('sessionStorage is not defind. Storage disabled');
        return null;
      }
    // } else if (this.g.persistence === 'none') {
    } else if (this.g.persistence === 'none') {
      return null;
    } else {
      if (supports_html5_storage()) {
        return localStorage.getItem(newKey);
      } else {
        console.warn('localStorage is not defind. Storage disabled');
        return null;
      }
    }
  }

  public setItem (key, value) {
    this.removeItem(key);
    // const newKey = this.g.projectid + '_' + key;
    const newKey = STORAGE_PREFIX + this.g.projectid + '_' + key;  // this.g.projectid + '_' + key;
    // if (this.g.persistence === 'local') {
    if (this.g.persistence === 'local') {
      if (supports_html5_storage()) {
        return localStorage.setItem(newKey, value);
      } else {
        console.warn('localStorage is not defind. Storage disabled');
        return null;
      }
    // } else if (this.g.persistence === 'session') {
    } else if (this.g.persistence === 'session') {
      if (supports_html5_session()) {
        return sessionStorage.setItem(newKey, value);
      } else {
        console.warn('sessionStorage is not defind. Storage disabled');
        return null;
      }
    // } else if (this.g.persistence === 'none') {
    } else if (this.g.persistence === 'none') {
      return null;
    } else {
      if (supports_html5_storage()) {
        return localStorage.setItem(newKey, value);
      } else {
        console.warn('localStorage is not defind. Storage disabled');
        return null;
      }
    }
  }

  public removeItem(key: string) {
    // const newKey = this.g.projectid + '_' + key;
    const newKey = STORAGE_PREFIX + this.g.projectid + '_' + key;  // this.g.projectid + '_' + key;
    // console.log('removeItem:: ', newKey);
    // if (this.g.persistence === 'local') {
    return this.removeItemForKey(newKey);
  }

  public removeItemForKey(key: string) {
    // console.log('removeItemForKey:: ', key);
    if (this.g.persistence === 'local') {
      if (supports_html5_storage()) {
        return localStorage.removeItem(key);
      } else {
        console.warn('localStorage is not defind. Storage disabled');
        return null;
      }
    } else if (this.g.persistence === 'session') {
      if (supports_html5_session()) {
        return sessionStorage.removeItem(key);
      } else {
        console.warn('sessionStorage is not defind. Storage disabled');
        return null;
      }
    } else if (this.g.persistence === 'none') {
      return null;
    } else {
      if (supports_html5_storage()) {
        return localStorage.removeItem(key);
      } else {
        console.warn('localStorage is not defind. Storage disabled');
        return null;
      }
    }
  }

  public clear () {
    // if (this.g.persistence === 'local') {
    const prefixKey = STORAGE_PREFIX + this.g.projectid;
    const arrayKey: Array<string>  = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.indexOf(prefixKey) !== -1) {
        arrayKey.push(key);
      }
    }

    for (let i = 0; i < arrayKey.length; i++) {
      // console.log('CLAER KEY: ', arrayKey[i]);
      // localStorage.removeItem(arrayKey[i]);
      this.removeItemForKey(arrayKey[i]);
    }

  }


}
