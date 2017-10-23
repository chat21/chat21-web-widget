# chat21-web-widget

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.4.


## Installation

Copy this code into your html pages:

```
<app-root></app-root>
<script type="text/javascript" src="inline.bundle.js"></script>
<script type="text/javascript" src="https://chat21-web.firebaseapp.com/polyfills.bundle.js"></script>
<script type="text/javascript" src="https://chat21-web.firebaseapp.com/scripts.bundle.js"></script>
<script type="text/javascript" src="https://chat21-web.firebaseapp.com/styles.bundle.js"></script>
<script type="text/javascript" src="https://chat21-web.firebaseapp.com/vendor.bundle.js"></script>
<script type="text/javascript" src="https://chat21-web.firebaseapp.com/main.bundle.js">
</script>

<script type="text/javascript">
chat21_tenant="frontiere21";
chat21_agentId="<UID>";
</script>
```


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Deploy to Firebase 
Run `firebase deploy` and open 'https://chat21-web.firebaseapp.com'