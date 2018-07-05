var tiledeskroot = document.createElement('app-root');

window.tiledesk = new function() {
    //this.type = "macintosh";
    this.on = function (event_name, handler) {
            //console.log("addEventListener for "+ event_name, handler);
            tiledeskroot.addEventListener(event_name, handler);
        };
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




appendJs('./inline.bundle.js');
appendJs('./polyfills.bundle.js');

if (window.tiledeskSettings && window.tiledeskSettings.development) {
    appendJs('./styles.bundle.js');
    appendJs('./vendor.bundle.js');
}

appendJs('./main.bundle.js');





