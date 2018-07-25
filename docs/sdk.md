# Introduction 

This guide will show you how to get started as quickly as possible with the Web SDK from TileDesk. The Web SDK will give businesses and developers the flexibility to build and customize a chat experience that meet their specific design/brand requirements.

# Install the Web HTML Widget

To chat with your visitors embeds the widget on your site.
Copy the following script and insert it in the HTML source between the HEAD tags:

```
    <script type="application/javascript">
        window.tiledeskSettings = 
            {
                projectid: "YOUR_TILEDESK_PROJECT_ID",
                projectname: "YOUR_TILEDESK_PROJECT_NAME",
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

To get your TILEDESK_PROJECT_ID go to the TileDesk Dashboard and click on the Widget item of the menu:

<img src="https://raw.githubusercontent.com/chat21/chat21-web-widget/master/docs/tiledesk-dashboard-widget-screenshots.png"/>



## Configuration ##

You can customize the widget passing these parameters to  window.tiledeskSettings object:
* projectid. The TileDesk project id. Find your TileDesk ProjectID in the TileDesk Dashboard under the Widget menu.
* projectname. The TileDesk project name. Find your TileDesk Project Name in the TileDesk Dashboard under the Widget menu.
* preChatForm: You can require customers to enter information like name and email before sending a chat message by enabling the Pre-Chat form. Permitted values: true, false. The default value is false.
* align: Make the Chat available on the Right or on the Left of the screen. Permitted values: 'right', 'left'. Default value is right.
* calloutTimer: Proactively open the chat windows to increase the customer engagement. Permitted values: -1 (Disabled), 0 (Immediatly) or a positive integer value. For exmaple: 5 (After 5 seconds),  10 (After 10 seconds).
* lang : With this configuration it is possible to force the widget lang. The widget will try to get the browser lang, if it is not possible it will use the default "en" lang

Example for a widget with the preChatForm enabled and a 10 seconds calloutTimer with left alignment:

```
<script type="application/javascript">
  window.tiledeskSettings = 
    {
      projectid: "5af02d8f705ac600147f0cbb",
      projectname: "PROJ-7MAY",
      preChatForm: true,
      calloutTimer: 10,
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

# Events

## window.tiledesk.on(event_name, handler)
Register an event handler to an event type.

The handler will have the signature function(event_data).

event_data is a Javascript CustomEvent. More info about CustomEvent here https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent

Arguments:

| Parameter    | Type      | Required  | Description                 |
| ------------ | --------- | --------- | --------------------------  |
| event_name   | String    | YES       | Event name to bind to       |
| handler      | Function  | YES       | Function with the signature function(event_data) |


Example:

```
 <script type="application/javascript">    
      window.tileDeskAsyncInit = function() {
       window.tiledesk.on('loadParams', function(event_data) {
         console.log("loadParams called", event_data);
       });
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
 

### Before sending messsage
This event will be fired before the message sending. Use this event to add custom attributes to your chat message.

Important payload of event_data:

| Parameter  | Type    | Description                        |
| ---------- | ------- | ---------------------------------- |
| detail     | Object  | the message that is being sent     |


Example. Add a custom attribute (page title) to the message.

```
 <script type="application/javascript">    
      window.tileDeskAsyncInit = function() {
       window.tiledesk.on('beforeMessageSend', function(event_data) {
         var message =  event_data.detail;
         console.log("beforeMessageSend called ", message);
         message.attributes.pagetitle = document.title;
       });
      }
</script>
```

Example. Programmatic setting of the preChatForm data:

```
 <script type="application/javascript">    
      window.tileDeskAsyncInit = function() {
       window.tiledesk.on('beforeMessageSend', function(event_data) {
         var message =  event_data.detail;
         console.log("beforeMessageSend called ", message);
         message.attributes.userName = "Andrew Lee";
         message.attributes.userEmail = "andrewlee@f21.com";
       });
      }
</script>
```


### After messsage sent

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


#### Load Parameters event

This event will be fired before the tiledesk parameters is loaded. Use this event to change at runtime your TileDesk settings.

Example:

```
<script type="application/javascript">    
      window.tileDeskAsyncInit = function() {
       window.tiledesk.on('loadParams', function(event_data) {
         console.log("loadParams called", event_data);
       });
      }
</script>
```



Please see the [project license](b.md) for further details.
