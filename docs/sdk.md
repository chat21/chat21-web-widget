# Introduction 

This guide will show you how to get started as quickly as possible with the Web SDK from TileDesk. The Web SDK will give businesses and developers the flexibility to build and customize a chat experience that meet their specific design/brand requirements.

# Install the Web HTML Widget

To chat with your visitors embeds the widget on your site.
Copy the following script and insert it in the HTML source between the head tags:


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

To get your TILEDESK_PROJECT_ID go in the TileDesk Dashboard and click on the Widget item of the menu:

<img src="https://raw.githubusercontent.com/chat21/chat21-web-widget/master/docs/tiledesk-dashboard-widget-screenshots.png"/>



## Configuration ##

info passing variables:  
* projectid. The TileDesk project id
* projectname. The TileDesk project name
* preChatForm: You can require customers to enter information, like name and email, by enabling the Pre-Chat form. Permitted values: true, false. The default value is false.
* align: Make the Chat available on the Right or on the Left of the  screen. Permitted values: 'right', 'left'. Default value is right.
* calloutTimer: Proactively open the chat windows to increase the customer engagement. Permitted values: -1 (Disabled), 0 (Immediatly) or a positive integer value. For exmaple: 5 (After 5 seconds),  10 (After 10 seconds).
* poweredBy: "Powered by" message visibile on the chat footer.
* lang : With this configuration it is possible to force the widget lang. The widget will try to get the browser lang, if it is not possible it will use the default "en" lang

# Events

## Load event

 


