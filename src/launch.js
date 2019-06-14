/** */
ready(event => {
    console.log('DOM is ready, call initWidget');
    initWidget();
});

/** */
function ready(callbackFunction){
    if(document.readyState != 'loading')
      callbackFunction()
    else
      document.addEventListener("DOMContentLoaded", callbackFunction)
}
                                     
/** */
function loadIframe(tiledeskScriptBaseLocation) {
    var containerDiv = document.createElement('div');
    containerDiv.setAttribute('id','tiledesk-container');
    containerDiv.classList.add("closed");
    document.body.appendChild(containerDiv);
    
    var iDiv = document.createElement('div');
    iDiv.setAttribute('id','tiledeskdiv');
    containerDiv.appendChild(iDiv);

    var ifrm = document.createElement("iframe");
    //ifrm.setAttribute("src", tiledeskScriptBaseLocation+"/index.html?windowcontext=window.parent");
    // projectid= '5b55e806c93dde00143163dd'
    var srcTileDesk =  `
        <html lang="en">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <title>Tilechat Widget</title>
        <base href="./">
        <link rel="icon" type="image/x-icon" href="favicon.ico">
        </head>
        <body>
            <tiledeskwidget-root></tiledeskwidget-root>
            <script type="text/javascript" src="${tiledeskScriptBaseLocation}/inline.bundle.js"></script>
            <script type="text/javascript" src="${tiledeskScriptBaseLocation}/polyfills.bundle.js"></script>
            <script type="text/javascript" src="${tiledeskScriptBaseLocation}/styles.bundle.css"></script>
            <script type="text/javascript" src="${tiledeskScriptBaseLocation}/vendor.bundle.js"></script>
            <script type="text/javascript" src="${tiledeskScriptBaseLocation}/main.bundle.js"></script>
        </body>
        </html>
        `;
        //ifrm.setAttribute("srcdoc", srcTileDesk);
        //ifrm.document.write(srcTileDesk);
    ifrm.setAttribute('id','tiledeskiframe');
    ifrm.setAttribute('tiledesk_context','parent');
    // ifrm.style.display = 'none';

    /** */
    window.tiledesk.on('onInit', function(event_data) {
        console.log("launch onInit isopen", window.tiledesk.angularcomponent.component.g.isOpen);
        if (window.tiledesk.angularcomponent.component.g.isOpen) {
            containerDiv.classList.add("open");
            containerDiv.classList.remove("closed");
            iDiv.classList.remove("callout");
        } else {
            containerDiv.classList.add("closed");
            containerDiv.classList.remove("open");
        }         
    });
    /** */
    window.tiledesk.on('onOpen', function(event_data) {
        console.log("launch onOpen");
        containerDiv.classList.add("open");
        containerDiv.classList.remove("closed");
        iDiv.classList.remove("callout");
    });
    /** */
    window.tiledesk.on('onClose', function(event_data) {
        console.log("launch onClose");
        containerDiv.classList.add("closed");
        containerDiv.classList.remove("open");
    });
    /** */
    window.tiledesk.on('onOpenEyeCatcher', function(event_data) {
        console.log("launch onOpenEyeCatcher", event_data);
        iDiv.classList.add("callout");
    });
     /** */
     window.tiledesk.on('onClosedEyeCatcher', function(event_data) {
        console.log("launch onClosedEyeCatcher", event_data);
        iDiv.classList.remove("callout");
    });
    iDiv.appendChild(ifrm);  
    ifrm.contentWindow.document.open();
    ifrm.contentWindow.document.write(srcTileDesk);
    ifrm.contentWindow.document.close();
}

/**
 * 
 */
function initWidget() {
    
    var tiledeskroot = document.createElement('tiledeskwidget-root');
    var tiledeskScriptLocation = document.getElementById("tiledesk-jssdk").src;
    var tiledeskScriptBaseLocation = tiledeskScriptLocation.replace("/launch.js","");
    window.tiledesk = new function() {
        //this.type = "macintosh";
        this.tiledeskroot = tiledeskroot;
        console.log(" this.tiledeskroot",  this.tiledeskroot);
        this.on = function (event_name, handler) {
            //console.log("addEventListener for "+ event_name, handler);
            tiledeskroot.addEventListener(event_name, handler);
        };
        this.getBaseLocation = function() {
            return tiledeskScriptBaseLocation;
        }
    }
    console.log("window.tiledesk created");
    try {
        window.tileDeskAsyncInit();
        console.log("tileDeskAsyncInit() called");
    }catch(er) {
        console.log("tileDeskAsyncInit() doesn't exists",er);
    }
    document.body.appendChild(tiledeskroot);

    initCSSWidget(tiledeskScriptBaseLocation);
    loadIframe(tiledeskScriptBaseLocation);
}

function initCSSWidget(tiledeskScriptBaseLocation) {
    var cssId = 'iframeCss';  // you could encode the css path itself to generate id..
    // if (!document.getElementById(cssId))
    // {
        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
        link.id   = cssId;
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = tiledeskScriptBaseLocation+'/iframe-style.css';
        link.media = 'all';
        head.appendChild(link);
    // }
}
