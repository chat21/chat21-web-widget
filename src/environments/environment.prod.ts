import { firebaseConfig } from '../environments/firebase-config'; // please comment on this line when changing the values ​​of firebase {}
export const environment = {
  production: true,
  version: require('../../package.json').version, // https://stackoverflow.com/questions/34907682/how-to-display-app-version-in-angular2
  remoteConfig: false, // for performance don't load settings from remote
  firebase: {
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    databaseURL: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId
  },
  apiUrl: 'https://api.tiledesk.com/v1/',
  tenant: 'tilechat',
  defaultLang : 'en',
  shemaVersion : '1'
};
