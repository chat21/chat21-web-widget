var tiledeskroot = document.createElement('app-root');

var tiledeskScriptLocation = document.getElementById("tiledesk-jssdk").src;
console.log("tiledeskScriptLocation", tiledeskScriptLocation);
var tiledeskScriptBaseLocation = tiledeskScriptLocation.replace("/tiledesk.js","");
console.log("tiledeskScriptBaseLocation", tiledeskScriptBaseLocation);

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
console.log("window.tiledesk created");


try {
    window.tileDeskAsyncInit();
    console.log("window.tileDeskAsyncInit() called");
}catch(er) {
    console.log("error calling window.tileDeskAsyncInit()",er);
}

//aTag.setAttribute('href',"yourlink.htm");
//aTag.innerHTML = "link text";
document.body.appendChild(tiledeskroot);

function appendJs(url) {
    var script1 = document.createElement('script');
    script1.async=false;
    script1.setAttribute('src', url);
    document.body.appendChild(script1);
}

//  var origin = window.document.location.origin;
//  console.log("origin", origin);

//  var locationhref = window.document.location.href;
//  locationhref = locationhref.replace("/tiledesk.js","");
//  console.log("locationhref", locationhref);

// var locationhref = "."
// if (window.tiledeskSettings && window.tiledeskSettings.development) {

// }

appendJs(tiledeskScriptBaseLocation+'/inline.bundle.js');
appendJs(tiledeskScriptBaseLocation+'/polyfills.bundle.js');

if (window.tiledeskSettings && window.tiledeskSettings.development) {
    appendJs(tiledeskScriptBaseLocation+'/styles.bundle.js');
    appendJs(tiledeskScriptBaseLocation+'/vendor.bundle.js');
}

appendJs(tiledeskScriptBaseLocation+'/main.bundle.js');





