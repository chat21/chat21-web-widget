import { Injectable } from '@angular/core';
import { AppStorageService } from './abstract/app-storage.service';
import { STORAGE_PREFIX } from '../utils/constants';
import { supports_html5_storage, supports_html5_session } from '../utils/utils';

@Injectable()
export class LocalSessionStorage extends AppStorageService{
    
    private storagePrefix: string = STORAGE_PREFIX;
    private projectID: string;
    private persistence: string;
    
    initialize(storagePrefix: string, persistence: string, projectID: string): void {
        console.log('****** initialize APPSTORAGE *******')
        this.storagePrefix = storagePrefix;
        this.projectID = projectID;
        this.persistence = persistence;
        console.log('****** END initialize APPSTORAGE *******', this.storagePrefix, this.persistence, this.projectID)
    }

    /** GET item in local/session storage from key value
     *  @param key
     */
    getItem(key: string) {
        let prefix;
        try {
            // const sv = 'sv' + environment.shemaVersion + '_';
            // prefix = prefix + sv;
            prefix = this.storagePrefix + '_';
        } catch (e) {
            console.log('> Error :' + e);
        }
        const newKey = prefix + this.projectID + '_' + key;
        return this.getValueForKey(newKey);
    }

    /** SET new item in local/session storage
     *  @param key
     *  @param value
     */
    setItem(key: string, value: any): void {
        this.removeItem(key);
        let prefix;
        try {
            // const sv = 'sv' + environment.shemaVersion + '_';
            // prefix = prefix + sv;
            prefix = this.storagePrefix + '_';
        } catch (e) {
            console.log('> Error :' + e);
        }
        const newKey = prefix + this.projectID + '_' + key;
        this.saveValueForKey(newKey, value);
    }

    /** GET item in local/session storage from key value without project id SUFFIX
     *  @param key
     */
    getItemWithoutProjectID(key: string) {
        let prefix;
        try {
            // const sv = 'sv' + environment.shemaVersion + '_';
            // prefix = prefix + sv;
            prefix = this.storagePrefix + '_';
        } catch (e) {
            console.log('> Error :' + e);
        }
        const newKey = prefix + key;
        return this.getValueForKey(newKey);
    }

    /** SET new item in local/session storage without project id SUFFIX
     *  @param key
     *  @param value
     */
    setItemWithoutProjectID(key: string, value: any): void {
        this.removeItem(key);
        let prefix = STORAGE_PREFIX;
        try {
            // const sv = 'sv' + environment.shemaVersion + '_';
            // prefix = prefix + sv;
            prefix = this.storagePrefix + '_';
        } catch (e) {
            console.log('> Error :' + e);
        }
        const newKey = prefix + key;
        this.saveValueForKey(newKey, value);
    }

    removeItem(key: string): void {
        let prefix;
        try {
            // const sv = 'sv' + environment.shemaVersion + '_';
            // prefix = prefix + sv;
            prefix = this.storagePrefix + '_';
        } catch (e) {
            console.log('> Error :' + e);
        }
        const newKey = prefix + this.projectID + '_' + key;
        return this.removeItemForKey(newKey);
    }

    clear(): void {
        let prefix;
        try {
            // const sv = 'sv' + environment.shemaVersion + '_';
            // prefix = prefix + sv;
            prefix = this.storagePrefix + '_';
        } catch (e) {
            console.log('> Error :' + e);
        }
        const prefixKey = prefix + this.projectID
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


    // ---------- PRIVATE METHODS start --------------- //

    private getValueForKey(key) {
        if (this.persistence === 'local') {
          if (supports_html5_storage()) {
            console.log('getValueForKey: ', key);
            return localStorage.getItem(key);
          } else {
            console.warn('localStorage is not defind. Storage disabled');
            return null;
          }
        } else if (this.persistence === 'session') {
          if (supports_html5_session()) {
            return sessionStorage.getItem(key);
          } else {
            console.warn('sessionStorage is not defind. Storage disabled');
            return null;
          }
        } else if (this.persistence === 'none') {
          return null;
        } else {
          if (supports_html5_storage()) {
            return localStorage.getItem(key);
          } else {
            console.warn('localStorage is not defind. Storage disabled');
            return null;
          }
        }
    }

    private saveValueForKey(key, value) {
        if (this.persistence === 'local') {
          if (supports_html5_storage()) {
            return localStorage.setItem(key, value);
          } else {
            console.warn('localStorage is not defind. Storage disabled');
            return null;
          }
        } else if (this.persistence === 'session') {
          if (supports_html5_session()) {
            return sessionStorage.setItem(key, value);
          } else {
            console.warn('sessionStorage is not defind. Storage disabled');
            return null;
          }
        } else if (this.persistence === 'none') {
          return null;
        } else {
          if (supports_html5_storage()) {
            return localStorage.setItem(key, value);
          } else {
            console.warn('localStorage is not defind. Storage disabled');
            return null;
          }
        }
    }

    private removeItemForKey(key: string) {
        if (this.persistence === 'local') {
          if (supports_html5_storage()) {
            return localStorage.removeItem(key);
          } else {
            console.warn('localStorage is not defind. Storage disabled');
            return null;
          }
        } else if (this.persistence === 'session') {
          if (supports_html5_session()) {
            return sessionStorage.removeItem(key);
          } else {
            console.warn('sessionStorage is not defind. Storage disabled');
            return null;
          }
        } else if (this.persistence === 'none') {
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

}