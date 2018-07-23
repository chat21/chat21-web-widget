# Introduction 

This guide will show you how to get started as quickly as possible with the Web SDK from TileDesk. The Web SDK will give businesses and developers the flexibility to build and customize a chat experience that meet their specific design/brand requirements.

# Install the Web HTML Widget

To chat with your visitors embeds the widget on your site
Copy the following script and insert it in the HTML source between the <head> tags:


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

# Events

## Load event

 


