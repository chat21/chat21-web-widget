var tiledeskroot = document.createElement('app-root');
//aTag.setAttribute('href',"yourlink.htm");
//aTag.innerHTML = "link text";
document.body.appendChild(tiledeskroot);


var inline_script = document.createElement('script');
inline_script.async=false;
inline_script.setAttribute('src','https://widget.tiledesk.com/inline.bundle.js');
document.body.appendChild(inline_script);

var polyfills_script = document.createElement('script');
polyfills_script.async=false;
polyfills_script.setAttribute('src','https://widget.tiledesk.com/polyfills.bundle.js');
document.body.appendChild(polyfills_script);

var styles_script = document.createElement('script');
styles_script.async=false;
styles_script.setAttribute('src','https://widget.tiledesk.com/styles.bundle.js');
document.body.appendChild(styles_script);

var vendor_script = document.createElement('script');
vendor_script.async=false;
vendor_script.setAttribute('src','https://widget.tiledesk.com/vendor.bundle.js');
document.body.appendChild(vendor_script);

var maintd_script = document.createElement('script');
maintd_script.async = false;
maintd_script.setAttribute('src','https://widget.tiledesk.com/main.bundle.js');
document.body.appendChild(maintd_script);
