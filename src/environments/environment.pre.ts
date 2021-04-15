// The file contents for the current environment will overwrite these during build2.
// The build2 system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build2 --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// tslint:disable-next-line:max-line-length
// import { firebasePreConfig } from '../environments/firebase-config'; // please comment on this line when changing the values ​​of firebase {}

export const environment = {
  production: true,
  version: require('../../package.json').version, // https://stackoverflow.com/questions/34907682/how-to-display-app-version-in-angular2
  remoteConfig: true,
  remoteConfigUrl: '/widget-config.json',
  remoteTranslationsUrl: 'http://localhost:3000/',
  loadRemoteTranslations: true,
  firebase: {
    apiKey: 'AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4',
    authDomain: 'chat21-pre-01.firebaseapp.com',
    databaseURL: 'https://chat21-pre-01.firebaseio.com',
    projectId: 'chat21-pre-01',
    storageBucket: 'chat21-pre-01.appspot.com',
    messagingSenderId: '269505353043',
    appId: '1:269505353043:web:b82af070572669e3707da6',
    chat21ApiUrl: 'https://us-central1-chat21-pre-01.cloudfunctions.net'
  },
  chat21Config: {
    appId: "tilechat",
    MQTTendpoint: 'mqtt://99.80.197.164:15675/ws', // MQTT endpoint
    APIendpoint: 'http://99.80.197.164:8004/api',
    //loginServiceEndpoint: 'http://console-native.tiledesk.com/api/chat21/native/auth/createCustomToken'
    loginServiceEndpoint: 'http://99.80.197.164:3000/chat21/native/auth/createCustomToken'
  },
  apiUrl: 'http://99.80.197.164:3000/',
  tenant: 'tilechat',
  defaultLang : 'en',
  storage_prefix : 'widget_sv5',
  authPersistence: 'LOCAL',
  chatEngine: 'mqtt',
  supportMode: true,
};


