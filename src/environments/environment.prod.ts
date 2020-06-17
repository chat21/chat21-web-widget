export const environment = {
  production: true,
  version: require('../../package.json').version, // https://stackoverflow.com/questions/34907682/how-to-display-app-version-in-angular2
  remoteConfig: false, // for performance don't load settings from remote
  remoteConfigUrl: '/firebase-config.json',
  remoteTranslationsUrl: 'https://api.tiledesk.com/v2/',
  loadRemoteTranslations: true,
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
  shemaVersion : '4'
};
