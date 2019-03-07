export const environment = {
  production: true,
  version: require('../../package.json').version, // https://stackoverflow.com/questions/34907682/how-to-display-app-version-in-angular2
  remoteConfig: false, // for performance don't load settings from remote
  firebase: {
    apiKey: 'AIzaSyDWMsqHBKmWVT7mWiSqBfRpS5U8YwTl7H0',
    authDomain: 'chat-v2-dev.firebaseapp.com',
    databaseURL: 'https://chat-v2-dev.firebaseio.com',
    projectId: 'chat-v2-dev',
    storageBucket: 'chat-v2-dev.appspot.com',
    messagingSenderId: '77360455507'
  },
  apiUrl: 'https://api.tiledesk.com/v1/',
  tenant: 'tilechat',
  defaultLang : 'en'
};
