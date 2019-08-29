// The file contents for the current environment will overwrite these during build2.
// The build2 system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build2 --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// tslint:disable-next-line:max-line-length
// import { firebaseConfig } from '../environments/firebase-config'; // please comment on this line when changing the values ​​of firebase {}

export const environment = {
  production: false,
  version: require('../../package.json').version, // https://stackoverflow.com/questions/34907682/how-to-display-app-version-in-angular2
  remoteConfig: true,
  // remoteConfigUrl: 'http://localhost/api/chat21/config',
  // remoteConfigUrl: window.location.hostname + '/api/chat21/config',
  // remoteConfigUrl: `${ window.location.protocol }//${ window.location.hostname}` + '/api/chat21/config',
  remoteConfigUrl: '/firebase-config.json',
  firebase: {
    apiKey: 'CHANGEIT',
    authDomain: 'CHANGEIT',
    databaseURL: 'CHANGEIT',
    projectId: 'CHANGEIT',
    storageBucket: 'CHANGEIT',
    messagingSenderId: 'CHANGEIT'

    // apiKey: firebaseConfig.apiKey,
    // authDomain: firebaseConfig.authDomain,
    // databaseURL: firebaseConfig.databaseURL,
    // projectId: firebaseConfig.projectId,
    // storageBucket: firebaseConfig.storageBucket,
    // messagingSenderId: firebaseConfig.messagingSenderId
  },
  apiUrl: 'http://localhost/api/',
  tenant: 'tilechat',
  defaultLang : 'en',
  shemaVersion : '1'
};
