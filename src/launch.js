function ready(callbackFunction){
    if(document.readyState != 'loading')
      callbackFunction()
    else
      document.addEventListener("DOMContentLoaded", callbackFunction)
}

ready(event => {
    console.log('DOM is ready, call initWidget');
    initWidget();
});


                                     


function loadIframe(tiledeskScriptBaseLocation) {
    var containerDiv = document.createElement('div');
    containerDiv.setAttribute('id','tiledesk-container');
    containerDiv.setAttribute('style', 'position: fixed; width:0px; height: 0px; bottom: 0px; right:0px; display: block; z-index: 2147483647');      

    document.body.appendChild(containerDiv);
    
   



    var iDiv = document.createElement('div');
    containerDiv.setAttribute('id','tiledeskdiv');
    containerDiv.setAttribute('class','tiledesk-messenger-frame');
    //iDiv.setAttribute('style', 'width: 376px!important; height: calc(100% - 20px - 80px - 20px); right: 20px; bottom: calc(20px + 80px); display: block; position: fixed!important; z-index: 2147483000!important');
    iDiv.setAttribute('style', 'width: 100px!important; height: 100px; right: 20px; bottom: 0px; display: block; position: fixed!important; z-index: 2147483000!important');
    
    containerDiv.appendChild(iDiv);


    var ifrm = document.createElement("iframe");
    // ifrm.setAttribute('windowcontext', 'window.parent');
    ifrm.setAttribute("src", "http://localhost:4200/index.html?windowcontext=window.parent");
    ifrm.setAttribute('style', 'width: 100%; height: 100%; position: absolute');           

    window.tiledesk.on('onInit', function(event_data) {
        console.log("launch onInit isopen", window.tiledesk.angularcomponent.component.g.isOpen);
        // setTimeout(function(){ 
        //     console.log("onInit loadParams isopen", window.tiledesk.angularcomponent.component.g.isOpen);
        // }, 3000);

        if (window.tiledesk.angularcomponent.component.g.isOpen) {
            iDiv.style.width = "376px";
            iDiv.style.height = "600px";
        } else {
            iDiv.style.width = "100px";
            iDiv.style.height = "100px";
        }
                      
    });

    window.tiledesk.on('onOpen', function(event_data) {
        console.log("launch onOpen");
        iDiv.style.width = "376px";
        iDiv.style.height = "600px";
    });
    window.tiledesk.on('onClose', function(event_data) {
        console.log("launch onClose");
        iDiv.style.width = "100px";
        iDiv.style.height = "100px";
    });
    window.tiledesk.on('onOpenEyeCatcher', function(event_data) {
        console.log("launch onOpenEyeCatcher");
        iDiv.style.width = "300px";
        iDiv.style.height = "200px";
    });

    //var html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Tilechat Widget</title><base target="_parent"><base href=""><link rel="icon" type="image/x-icon" href="favicon.ico"><link href="${tiledeskScriptBaseLocation}/styles.bundle.css" rel="stylesheet"/></head><body><tiledeskwidget-root projectid="5b55e806c93dde00143163dd"></tiledeskwidget-root><script type="text/javascript" src="${tiledeskScriptBaseLocation}/launcht.js"></script><script type="text/javascript" src="${tiledeskScriptBaseLocation}/inline.bundle.js"></script><script type="text/javascript" src="${tiledeskScriptBaseLocation}/polyfills.bundle.js"></script><script type="text/javascript" src="${tiledeskScriptBaseLocation}/main.bundle.js"></script></body></html>`    

    // var html = `
    // <!doctype html>
    //     <html lang="en">
    //     <head>
    //         <meta charset="utf-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    //         <title>Tilechat Widget</title>
    //         <base href="./">
    //         <link rel="icon" type="image/x-icon" href="favicon.ico">
    //     </head>
    //     <body>
    //         <tiledeskwidget-root projectid="5b55e806c93dde00143163dd">
    //         </tiledeskwidget-root>
    //         <script type="text/javascript" src="${tiledeskScriptBaseLocation}/launcht.js"></script>
    //         <script type="text/javascript" src="${tiledeskScriptBaseLocation}/inline.bundle.js"></script>
    //         <script type="text/javascript" src="${tiledeskScriptBaseLocation}/polyfills.bundle.js"></script>
    //         <script type="text/javascript" src="${tiledeskScriptBaseLocation}/styles.bundle.js"></script>
    //         <script type="text/javascript" src="${tiledeskScriptBaseLocation}/vendor.bundle.js"></script>
    //         <script type="text/javascript" src="${tiledeskScriptBaseLocation}/main.bundle.js"></script>
    //     </body>
    //     </html>`;    
    // //var html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Tilechat Widget</title><base target="_parent"><base href=""><link rel="icon" type="image/x-icon" href="favicon.ico"><link href="https://widget.tiledesk.com/v2/styles.bundle.css" rel="stylesheet"/></head><body><tiledeskwidget-root projectid="5b55e806c93dde00143163dd"></tiledeskwidget-root><script type="text/javascript" src="https://widget.tiledesk.com/v2/inline.bundle.js"></script><script type="text/javascript" src="https://widget.tiledesk.com/v2/polyfills.bundle.js"></script><script type="text/javascript" src="https://widget.tiledesk.com/v2/main.bundle.js"></script></body></html>'    
    // ifrm.srcdoc = html;
    
    // globalidopen = false;

    // ifrm.onload= function () {
    //     console.log("ifrm.onload", window, window.parent);
    //     //ifrmBalloon.document.addEventListener("click", function(){ alert("Hello World!"); });
    //     ifrm.contentWindow.document.body.onclick = function() {
    //         console.log("click baloon"); 
    //         //iDiv.style.width = "376px!important;";
    //         if (globalidopen==false) {
    //             globalidopen = true;
    //             iDiv.style.width = "376px";
    //             //iDiv.style.height = "calc(100% - 20px - 80px - 20px);";
    //             iDiv.style.height = "600px";
    //         }else {
    //             globalidopen = false;
    //             iDiv.style.width = "100px";
    //             //iDiv.style.height = "calc(100% - 20px - 80px - 20px);";
    //             iDiv.style.height = "100px";
    //         }
           
    //     }

    // }

    iDiv.appendChild(ifrm);  



}

  function initWidget() {


   



    var tiledeskroot = document.createElement('tiledeskwidget-root');
    

    var tiledeskScriptLocation = document.getElementById("tiledesk-jssdk").src;
    // console.log("tiledeskScriptLocation", tiledeskScriptLocation);
    var tiledeskScriptBaseLocation = tiledeskScriptLocation.replace("/launch.js","");
   // console.log("tiledeskScriptBaseLocation", tiledeskScriptBaseLocation);
    
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
    
    //aTag.setAttribute('href',"yourlink.htm");
    //aTag.innerHTML = "link text";
    document.body.appendChild(tiledeskroot);


    loadIframe(tiledeskScriptBaseLocation);
    
  }







