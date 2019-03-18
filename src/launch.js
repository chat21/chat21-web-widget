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
    containerDiv.setAttribute('id','tiledeskdiv');
    containerDiv.setAttribute('class','tiledesk-messenger-frame');
    containerDiv.setAttribute('id','tiledesk-container');
    containerDiv.style.width = '0px';
    containerDiv.style.height = '0px';
    containerDiv.style.right = '0px';
    containerDiv.style.bottom = '0px';
    containerDiv.style.display = 'block';
    containerDiv.style.position = 'fixed';
    // containerDiv.setAttribute('style', 'position: fixed; width:0px; height: 0px; bottom: 0px; right:0px; display: block; z-index: 2147483647');      
    document.body.appendChild(containerDiv);
    

    var iDiv = document.createElement('div');
    iDiv.style.width = '100%';
    iDiv.style.height = 'calc(100% - 20px)';
    iDiv.style.maxHeight = '600px';
    iDiv.style.right = '20px';
    iDiv.style.bottom = '0px';
    iDiv.style.display = 'block';
    iDiv.style.position = 'fixed';
    // iDiv.setAttribute('style', 'width: 100px!important; height: 100px; right: 20px; bottom: 0px; display: block; position: fixed!important; z-index: 2147483000!important');
    containerDiv.appendChild(iDiv);

    var ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", tiledeskScriptBaseLocation+"/index.html?windowcontext=window.parent");
    // ifrm.setAttribute('style', 'width: calc(100% - 10px); height: 100%; position: absolute; border-width: 0px; left: 5px;');           
    ifrm.style.width = 'calc(100% - 10px)';
    ifrm.style.height = 'calc(100% - 20px)';
    ifrm.style.borderWidth = '0px';
    ifrm.style.right = '5px';
    ifrm.style.left = '5px';
    ifrm.style.bottom = '20px';
    ifrm.style.display = 'block';
    ifrm.style.position = 'absolute';

    /** */
    window.tiledesk.on('onInit', function(event_data) {
        console.log("launch onInit isopen", window.tiledesk.angularcomponent.component.g.isOpen);
        if (window.tiledesk.angularcomponent.component.g.isOpen) {
            iDiv.style.width = "376px";
            iDiv.style.height = 'calc(100% - 20px)';
            ifrm.style.boxShadow = "rgba(0, 0, 0, 0.2) 0 0 10px";
        } else {
            iDiv.style.width = "100px";
            iDiv.style.height = "100px";
            ifrm.style.boxShadow = "none";
        }         
    });

    /** */
    window.tiledesk.on('onOpen', function(event_data) {
        console.log("launch onOpen");
        iDiv.style.width = "376px";
        iDiv.style.height = 'calc(100% - 20px)';
        ifrm.style.boxShadow = "rgba(0, 0, 0, 0.2) 0 0 10px";
    });

    /** */
    window.tiledesk.on('onClose', function(event_data) {
        console.log("launch onClose");
        iDiv.style.width = "100px";
        iDiv.style.height = "100px";
        ifrm.style.boxShadow = "none";
    });

    /** */
    window.tiledesk.on('onOpenEyeCatcher', function(event_data) {
        console.log("launch onOpenEyeCatcher");
        iDiv.style.width = "370px";
        iDiv.style.height = "120px";
        ifrm.style.boxShadow = "none";
    });
    iDiv.appendChild(ifrm);  
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
    loadIframe(tiledeskScriptBaseLocation);
}
