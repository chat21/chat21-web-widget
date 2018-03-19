# chat21-web-widget

Chat21-web-widget is a Free Live Chat Widget built on Firebase with Angular4 that lets you support and chat with visitors and customers on your website. 

With Chat21-web-widget you can:
* Invite your website visitors to share feedback and suggestions to better understand their needs.
* Answer questions from website visitors instantly to increase trust
* Add a code snippet to your website easly 
* It's a HTML5 widget built with Google Firebase, Angular4 and Bootstrap

# Features
* Send a direct message to an agent with push notifications
* Receive realtime support from your agents
* Configure the widget with company logo and colors
* Chat21 Web Widget is free and open source. Download it on github

# Screenshot
<img width="488" alt="dialogo_widgetchat_2" src="https://user-images.githubusercontent.com/32564846/37611161-e299ad10-2ba1-11e8-8c14-ef7376e7e1b4.png">

## Installation

Copy this code into your html pages:

```
<app-root preChatForm tenant='' recipientId='' projectid='' userId='' userEmail='' userPassword='' userFullname=''></app-root>

<script type="text/javascript" src="https://chat21-web.firebaseapp.com/inline.bundle.js"></script>
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
info passing variables:  
preChatForm if exist enable form email and fullname
recipientId='' 
projectid='' 
userId='' 
userEmail='' 
userPassword='' 
userFullname=''
Install and configure the  webapp chat for agent here : https://github.com/chat21/chat21-ionic

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Deploy to Firebase 
Run `firebase deploy` and open 'https://chat21-web.firebaseapp.com'
