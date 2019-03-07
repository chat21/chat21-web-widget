// The file contents for the current environment will overwrite these during build2.
// The build2 system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build2 --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  version: require('../../package.json').version, // https://stackoverflow.com/questions/34907682/how-to-display-app-version-in-angular2
  remoteConfig: true,
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
