// The file contents for the current environment will overwrite these during build2.
// The build2 system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build2 --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// tslint:disable-next-line:max-line-length
// import { firebasePreConfig } from '../environments/firebase-config'; // please comment on this line when changing the values ​​of firebase {}

export const environment = {
  production: true,
  version: require('../../package.json').version,
  remoteConfig: false,
  remoteConfigUrl: '/widget-config.json',
  // remoteConfigUrl: '/widget-config-mqtt.json',
  remoteTranslationsUrl: 'https://tiledesk-server-pre.herokuapp.com/',
  loadRemoteTranslations: true,
  chatEngine: 'firebase',
  uploadEngine: 'firebase',
  fileUploadAccept:"*/*",
  logLevel: 'DEBUG',
  firebaseConfig: {
    apiKey: 'AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4',
    authDomain: 'chat21-pre-01.firebaseapp.com',
    databaseURL: 'https://chat21-pre-01.firebaseio.com',
    projectId: 'chat21-pre-01',
    storageBucket: 'chat21-pre-01.appspot.com',
    messagingSenderId: '269505353043',
    appId: '1:269505353043:web:b82af070572669e3707da6',
    tenant: 'tilechat',
  },
  chat21Config: {
    appId: 'tilechat',
    MQTTendpoint: 'mqtt://localhost:15675/ws', // MQTT endpoint
    APIendpoint: 'http://localhost:8004/api'
  },
  apiUrl: 'https://tiledesk-server-pre.herokuapp.com/',
  baseImageUrl: 'https://firebasestorage.googleapis.com/v0/b/',
  defaultLang : 'en',
  storage_prefix : 'widget_sv5',
  authPersistence: 'LOCAL',
  supportMode: true,
};


