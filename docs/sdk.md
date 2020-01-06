# Web SDK version 2.0

For the old versione of the widget see [here](./sdkv1.md). 

This guide will show you how to get started as quickly as possible with the Web SDK from TileDesk. The Web SDK will give businesses and developers the flexibility to build and customize a chat experience that meet their specific design/brand requirements.

# Install the Web HTML Widget

To chat with your visitors embed the widget on your site.
Copy the following script and insert it in the HTML source between the HEAD tags:

```
    <script type="application/javascript">
        window.tiledeskSettings = 
            {
                projectid: "YOUR_TILEDESK_PROJECT_ID"
            };
            (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id; //js.async=!0;
            js.src = "https://widget.tiledesk.com/v2/tiledesk.js";
            fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'tiledesk-jssdk'));
    </script>
```

To get your TILEDESK_PROJECT_ID go to the TileDesk Dashboard and click on the Widget item of the menu:

<img src="https://raw.githubusercontent.com/chat21/chat21-web-widget/master/docs/tiledesk-dashboard-widget-screenshots.png"/>



## Configuration ##

You can customize the widget passing these parameters to  window.tiledeskSettings object:

* **projectid**. The TileDesk project id. Find your TileDesk ProjectID in the TileDesk Dashboard under the Widget menu.

* **preChatForm**: You can require customers to enter information like name and email before sending a chat message by enabling the Pre-Chat form. Permitted values: true, false. The default value is false.

* **align**: Make the chat available on the Right or on the Left of the screen. Permitted values: 'right', 'left'. Default value is right.

* **calloutTimer**: Proactively open the chat windows to increase the customer engagement. Permitted values: -1 (Disabled), 0 (Immediatly) or a positive integer value. For exmaple: 5 (After 5 seconds),  10 (After 10 seconds).

* **calloutTitle** : The title of the callout window.

* **calloutMsg** :  The message of the callout window.

* **userFullname**: Current user fullname. Set this parameter to specify the visitor fullname.

* **userEmail**: Current user email address. Set this parameter to specify the visitor email address.

* **welcomeTitle**: The welcome title to show on the widget home page.

* **welcomeMsg**: Set the widget welcome message. Value type : string

* **widgetTitle**: Set the widget title label shown in the widget header. Value type : string. The default value is Tiledesk.

* **logoChat**: The url of the logo to show on the widget home page.

* **lang** : With this configuration it is possible to force the widget lang. The widget will try to get the browser lang, if it is not possible it will use the default "en" lang

* **hideHeaderCloseButton**: Hide the close button in the widget header. Permitted values: true, false. The default value is false.

* **isOpen**: if it is true, the chat window is automatically open when the widget is loaded. Permitted values: true, false. Default value : false

* **fullscreenMode**: if it is true, the chat window is open in fullscreen mode. Permitted values: true, false. Default value : false

* **themeColor**: allows you to change the main widget's color (color of the header, color of the launcher button, other minor elements). Permitted values: Hex color codes, e.g. #87BC65 and RGB color codes, e.g. rgb(135,188,101)

* **themeForegroundColor**: allows you to change text and icons' color. Permitted values: Hex color codes, e.g. #425635 and RGB color codes, e.g. rgb(66,86,53)

* **showWidgetNameInConversation**. If you want to display the widget title in the conversations, set the showWidgetNameInConversation field to true. It is advisable if you need to manage multiple projects. Value type : boolean. The default value is false.

* **allowTranscriptDownload**: allows the user to download the chat transcript. The download button appears when the chat is closed by the operator. Permittet values: true, false. Default value: false

* **marginX**: Set the side margin, left or right depending on the align property. Default value : 20px

* **marginY**: Set the distance from the page bottom margin. Default value : 20px

* **persistence**: You can specify how the Authentication state persists when using the Tiledesk JS SDK. This includes the ability to specify whether a signed in user should be indefinitely persisted until explicit sign out or cleared when the window is closed. Permittet values: local, session. Default value : local. Local value indicates that the state will be persisted even when the browser window is closed. An explicit sign out is needed to clear that state. Session value indicates that the state will only persist in the current session or tab, and will be cleared when the tab or window in which the user authenticated is closed. 


### Example 1. Widget with user fullname and email

```
<script type="application/javascript">
      window.tiledeskSettings = 
          {
              projectid: "5b55e806c93dde00143163dd",
              userFullname: "Andrea Leo",
              userEmail: "andrea.leo@f21.it"
          };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id; //js.async=!0;
        js.src = "./tiledesk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'tiledesk-jssdk'));
    </script>
```
### Example 2. Widget with preChatForm and left alignment:

```
<script type="application/javascript">
  window.tiledeskSettings = 
    {
      projectid: "5b55e806c93dde00143163dd",
      preChatForm: true,
      align: 'left'
    };
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id; //js.async=!0;
      js.src = "https://widget.tiledesk.com/tiledesk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'tiledesk-jssdk'));
</script>
```



# Methods

## Open the widget

This will open the widget:

```
window.tiledesk.open();
```
## Minimize the widget

This will minimize the widget:

```
window.tiledesk.close();
```


# Events

## window.tiledesk.on(event_name, handler)
Register an event handler to an event type.

The handler will have the signature function(event_data).

event_data is a Javascript CustomEvent. More info about CustomEvent [here](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent)

Arguments:

| Parameter    | Type      | Required  | Description                 |
| ------------ | --------- | --------- | --------------------------  |
| event_name   | String    | YES       | Event name to bind to       |
| handler      | Function  | YES       | Function with the signature function(event_data) |


### Example 3. Logging of widget events

```
 <script type="application/javascript">    
      window.tileDeskAsyncInit = function() {
       window.tiledesk.on('beforeMessageSend', function(event_data) {
         var message =  event_data.detail;
         console.log("beforeMessageSend called ", message);
       });
       window.tiledesk.on('afterMessageSend', function(event_data) {
         var message =  event_data.detail;
         console.log("afterMessageSend called ", message);
       });
      }
</script>
```

[Full example here]( https://github.com/chat21/chat21-web-widget/blob/master/src/test.html)
 

## Load Parameters event

This event will be fired before the tiledesk parameters is loaded. Use this event to change at runtime your TileDesk settings.

Important payload of event_data:

| Parameter               | Type      | Description                      |
| ----------------------- | --------- | -------------------------------- |
| detail.default_settings | Object    | the constructor default settings |

### Example 4. Widget with visitor fullname and email from localStorage

```
<script type="application/javascript">    
    //set fullname to localstorage
    localStorage.setItem("user_fullname", "Andrea from localStorage");
    localStorage.setItem("user_email", "andrea.leo@f21.it");
    
      window.tileDeskAsyncInit = function() {
       window.tiledesk.on('loadParams', function(event_data) {
          window.tiledeskSettings.userFullname = localStorage.getItem("user_fullname");
          window.tiledeskSettings.userEmail = localStorage.getItem("user_email");
       });
      }
</script>
```
[Full example here]( https://github.com/chat21/chat21-web-widget/blob/master/src/test.html)


### Example 5. Widget with welcome message with current date

```
<script type="application/javascript">    
      window.tileDeskAsyncInit = function() {
       window.tiledesk.on('loadParams', function(event_data) {
         window.tiledeskSettings.welcomeMsg = " Hello at: " + new Date().toLocaleString();
       });
      }
</script>
```


## Before sending messsage
This event will be fired before the message sending. Use this event to add user information or custom attributes to your chat message.

Important payload of event_data:

| Parameter  | Type    | Description                        |
| ---------- | ------- | ---------------------------------- |
| detail     | Object  | the message that is being sent     |

Example. Programmatic setting custom user metadata

```
 <script type="application/javascript">    
      window.tileDeskAsyncInit = function() {
       window.tiledesk.on('beforeMessageSend', function(event_data) {
         var message =  event_data.detail;
         message.attributes.userCompany = "Frontiere21";
       });
      }
</script>
```

[Full example here]( https://github.com/chat21/chat21-web-widget/blob/master/src/test.html)


Example. Add a custom attribute (page title) to the message.

```
 <script type="application/javascript">    
      window.tileDeskAsyncInit = function() {
       window.tiledesk.on('beforeMessageSend', function(event_data) {
         var message =  event_data.detail;
         message.attributes.pagetitle = document.title;
       });
      }
</script>
```

[Full example here]( https://github.com/chat21/chat21-web-widget/blob/master/src/test.html)





## After messsage sent

This event is generated after the message has been sent.

Important payload of event_data:

| Parameter    | Type      | Description                         |
| ------------ | --------- | ----------------------------------  |
| detail       | Object    | the message that was sent           |


Example:

```
 <script type="application/javascript">    
      window.tileDeskAsyncInit = function() {
        window.tiledesk.on('afterMessageSend', function(event_data) {
          var message =  event_data.detail;
          console.log("afterMessageSend called ", message);
       });
      }
</script>
```




# Enabling authenticated visitors in the Chat widget
You can configure your widget to authenticate visitors using the Javascript API and JWT token.
More info [here](./auth.md)