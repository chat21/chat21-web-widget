import { Injectable } from '@angular/core';
import { Globals } from '../utils/globals';

@Injectable()
export class StorageService {

  constructor(public g: Globals) { }

  public getItem (key): any {
    if (this.g.persistence === 'local') {
      return localStorage.getItem(key);
    } else if (this.g.persistence === 'session') {
      return sessionStorage.getItem(key);
    } else {
      return localStorage.getItem(key);
    }
  }

  public setItem (key, value) {
    if (this.g.persistence === 'local') {
      return localStorage.setItem(key, value);
    } else if (this.g.persistence === 'session') {
      return sessionStorage.setItem(key, value);
    } else {
      return localStorage.setItem(key, value);
    }
  }

  public removeItem(key: string) {
    if (this.g.persistence === 'local') {
      return localStorage.removeItem(key);
    } else if (this.g.persistence === 'session') {
      return sessionStorage.removeItem(key);
    } else {
      return localStorage.removeItem(key);
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
