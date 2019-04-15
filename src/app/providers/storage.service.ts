import { Injectable } from '@angular/core';
import { Globals } from '../utils/globals';
import { supports_html5_storage, supports_html5_session } from '../utils/utils';

@Injectable()
export class StorageService {

  constructor(public g: Globals) { }

  // globals.setParameters(key, globalVar.key.value);
  // globals.getParameters('windowContext');

  public getItem (key): any {
    // const newKey = this.g.projectid + '_' + key;
    const newKey = this.g.projectid + '_' + key;
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
    const newKey = this.g.projectid + '_' + key;
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
    const newKey = this.g.projectid + '_' + key;
    // if (this.g.persistence === 'local') {
    if (this.g.persistence === 'local') {
      if (supports_html5_storage()) {
        return localStorage.removeItem(newKey);
      } else {
        console.warn('localStorage is not defind. Storage disabled');
        return null;
      }
    // } else if (this.g.persistence === 'session') {
    } else if (this.g.persistence === 'session') {
      if (supports_html5_session()) {
        return sessionStorage.removeItem(newKey);
      } else {
        console.warn('sessionStorage is not defind. Storage disabled');
        return null;
      }
    // } else if (this.g.persistence === 'none') {
    } else if (this.g.persistence === 'none') {
      return null;
    } else {
      if (supports_html5_storage()) {
        return localStorage.removeItem(newKey);
      } else {
        console.warn('localStorage is not defind. Storage disabled');
        return null;
      }
    }
  }

  public clear () {
    // if (this.g.persistence === 'local') {
    if (this.g.persistence === 'local') {
      if (supports_html5_storage()) {
        return localStorage.clear();
      } else {
        console.warn('localStorage is not defind. Storage disabled');
        return null;
      }
    // } else if (this.g.persistence === 'session') {
    } else if (this.g.persistence === 'session') {
      if (supports_html5_session()) {
        return sessionStorage.clear();
      } else {
        console.warn('sessionStorage is not defind. Storage disabled');
        return null;
      }
    // } else if (this.g.persistence === 'none') {
    } else if (this.g.persistence === 'none') {
      return null;
    } else {
      if (supports_html5_storage) {
        return localStorage.clear();
      } else {
        console.warn('localStorage is not defind. Storage disabled');
        return null;
      }
    }
  }


}
