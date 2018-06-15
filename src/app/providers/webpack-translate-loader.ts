// // webpack-translate-loader.ts
// import { TranslateLoader } from '@ngx-translate/core';
// // import { Observable } from 'rxjs/Observable';
// import { Observable } from 'rxjs/Rx';
// import 'rxjs/add/observable/fromEvent';

// export class WebpackTranslateLoader implements TranslateLoader {
//     getTranslation(lang: string): Observable<any> {

//         console.log("WebpackTranslateLoader::getTranslation::lang", lang);
//         console.log("WebpackTranslateLoader::getTranslation::${lang}.json", System.import(`../../assets/i18n/${lang}.json`));

//         return Observable.fromPromise(System.import(`../../assets/i18n/${lang}.json`));
//     }
// }