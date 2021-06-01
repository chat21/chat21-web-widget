function ready(callbackFunction){
    if(document.readyState != 'loading')
      callbackFunction()
    else
      document.addEventListener("DOMContentLoaded", callbackFunction)
}

ready(event => {
    // console.log('DOM is ready, call initWidget');
    initWidget();
});

function appendJs(url) {
    var script1 = document.createElement('script');
    script1.async=false;
    script1.setAttribute('src', url);
    document.body.appendChild(script1);
}

  function initWidget() {
    var tiledeskroot = document.createElement('chat-root');

    var tiledeskScriptLocation = document.getElementById("tiledesk-jssdk").src;
    // console.log("tiledeskScriptLocation", tiledeskScriptLocation);
    var tiledeskScriptBaseLocation = tiledeskScriptLocation.replace("/tiledesk.js","");
   // console.log("tiledeskScriptBaseLocation", tiledeskScriptBaseLocation);
    
    window.tiledesk = new function() {
        //this.type = "macintosh";
        this.on = function (event_name, handler) {
                //console.log("addEventListener for "+ event_name, handler);
                tiledeskroot.addEventListener(event_name, handler);
        };
        this.getBaseLocation = function() {
            return tiledeskScriptBaseLocation;
        }
    }
    // console.log("window.tiledesk created");
    
    
    try {
        window.tileDeskAsyncInit();
        // console.log("tileDeskAsyncInit() called");
    }catch(er) {
        // console.log("tileDeskAsyncInit() doesn't exists",er);
    }
    
    //aTag.setAttribute('href',"yourlink.htm");
    //aTag.innerHTML = "link text";
    document.body.appendChild(tiledeskroot);
    
   
    
    
    appendJs(tiledeskScriptBaseLocation+'/inline.bundle.js');
    appendJs(tiledeskScriptBaseLocation+'/polyfills.bundle.js');
    
    //remove development check with  --build-optimizer=false
    // if (window.tiledeskSettings && window.tiledeskSettings.development) {
        appendJs(tiledeskScriptBaseLocation+'/styles.bundle.js');
        appendJs(tiledeskScriptBaseLocation+'/vendor.bundle.js');
    // }
    
    appendJs(tiledeskScriptBaseLocation+'/main.bundle.js');
  }







