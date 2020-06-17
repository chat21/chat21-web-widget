// import { firebaseConfig } from '../environments/firebase-config';
// please comment on this line when changing the values ​​of firebase {}
export const environment = {
  production: true,
  version: require('../../package.json').version, // https://stackoverflow.com/questions/34907682/how-to-display-app-version-in-angular2
  remoteConfig: true, // for performance don't load settings from remote
  remoteConfigUrl: './widget-config.json',
  loadRemoteTranslations: true,
  remoteTranslationsUrl: 'https://api.tiledesk.com/v2/',
  firebase: {
    apiKey: 'CHANGEIT',
    authDomain: 'CHANGEIT',
    databaseURL: 'CHANGEIT',
    projectId: 'CHANGEIT',
    storageBucket: 'CHANGEIT',
    messagingSenderId: 'CHANGEIT'
  },
  apiUrl: 'https://api.tiledesk.com/v2/',
  tenant: 'tilechat',
  defaultLang : 'en',
  shemaVersion : '1'
};
