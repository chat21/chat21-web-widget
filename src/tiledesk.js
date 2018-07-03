var tiledeskroot = document.createElement('app-root');
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
appendJs('./styles.bundle.js');
appendJs('./vendor.bundle.js');
appendJs('./main.bundle.js');