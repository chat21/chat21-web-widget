import { Injectable } from '@angular/core';
import { AppStorageService } from '../../chat21-core/providers/abstract/app-storage.service';
import { Globals } from '../utils/globals';
import { stringToBoolean } from '../utils/utils';


@Injectable()
export class SettingsSaverService {

  constructor(
    private g: Globals,
    private appStorageService: AppStorageService
  ) {}

  /**
   * recupero dallo storage globals e lo assegno a globalsParameters
   * ogni successiva modifica di globals verrà salvata in appStorageService
   */
  initialize() {
    // if (this.appStorageService.getItem('globals')) {
    //   this.globalsParameters = this.appStorageService.getItem('globals');
    // }
    this.setGlobalsSubscription();
  }

  /**
   *
   */
  public setGlobalsSubscription() {
    const that = this;
    this.g.obsObjChanged.subscribe((obj) => {
      if (obj) {
        that.setVariable(obj.key, obj.val);
      }
    });
  }

  /**
  * modifico il valore di un parametro e lo salvo nel dizionario
  * pubblico il dizionario modificato
  * salvo il dictionary in local
  * @param key
  * @param value
  */
  public setVariable(key: string, value: any) {
    const val =  JSON.stringify(value);
    // console.log('========================================');
    // console.log('key: ', key);
    // console.log('val: ', val);
    // console.log('========================================');
    this.appStorageService.setItem(key, stringToBoolean(value));

    //this.g.wdLog(['SET key: ', key, ' - VAL: ', stringToBoolean(value), ' ---------->', JSON.stringify(value) ]);
  }

}
