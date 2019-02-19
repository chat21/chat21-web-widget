import { Injectable } from '@angular/core';
import { Globals } from '../utils/globals';

@Injectable()
export class StorageService {

  constructor(public g: Globals) { }

  public getItem (key): any {
    const newKey = this.g.projectid + '_' + key;
    if (this.g.persistence === 'local') {
      return localStorage.getItem(newKey);
    } else if (this.g.persistence === 'session') {
      return sessionStorage.getItem(newKey);
    } else {
      return localStorage.getItem(newKey);
    }
  }

  public setItem (key, value) {
    const newKey = this.g.projectid + '_' + key;
    if (this.g.persistence === 'local') {
      return localStorage.setItem(newKey, value);
    } else if (this.g.persistence === 'session') {
      return sessionStorage.setItem(newKey, value);
    } else {
      return localStorage.setItem(newKey, value);
    }
  }

  public removeItem(key: string) {
    const newKey = this.g.projectid + '_' + key;
    if (this.g.persistence === 'local') {
      return localStorage.removeItem(newKey);
    } else if (this.g.persistence === 'session') {
      return sessionStorage.removeItem(newKey);
    } else {
      return localStorage.removeItem(newKey);
    }
  }

  public clear () {
    if (this.g.persistence === 'local') {
      return localStorage.clear();
    } else if (this.g.persistence === 'session') {
      return sessionStorage.clear();
    } else {
      return localStorage.clear();
    }
  }


}
