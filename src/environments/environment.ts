// The file contents for the current environment will overwrite these during build2.
// The build2 system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build2 --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  version: require('../../package.json').version, // https://stackoverflow.com/questions/34907682/how-to-display-app-version-in-angular2
  remoteConfig: true,
  remoteConfigUrl: '/widget-config.json',
  loadRemoteTranslations: true,
  remoteTranslationsUrl: 'http://localhost:3000/',
  chatEngine: 'mqtt',
  uploadEngine: 'native',
  tenant: 'tilechat',
  fileUploadAccept:"*/*",
  logLevel: 2,
  firebaseConfig: {
    apiKey: 'CHANGEIT',
    authDomain: 'CHANGEIT',
    databaseURL: 'CHANGEIT',
    projectId: 'CHANGEIT',
    storageBucket: 'CHANGEIT',
    messagingSenderId: 'CHANGEIT',
    appId: 'CHANGEIT',
  },
  chat21Config: {
    appId: 'tilechat',
    MQTTendpoint: 'mqtt://localhost:15675/ws', // MQTT endpoint
    APIendpoint: 'http://localhost:8004/api'
  },
  apiUrl: 'http://localhost:3000/',
  baseImageUrl: 'https://firebasestorage.googleapis.com/v0/b/',
  defaultLang : 'en',
  storage_prefix : 'widget_sv5',
  authPersistence: 'LOCAL',
  supportMode: true,
};
