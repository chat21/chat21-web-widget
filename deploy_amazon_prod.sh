# npm version patch
version=`node -e 'console.log(require("./package.json").version)'`
echo "version $version"

# --build-optimizer=false if localstorage is disabled (webview) appears https://github.com/firebase/angularfire/issues/970
ng build --prod --env=prod --base-href --output-hashing none --build-optimizer=false

cd dist
aws s3 sync . s3://tiledesk-widget/v5/$version/
aws s3 sync . s3://tiledesk-widget/v5/
# --cache-control max-age=604800
cd ..

aws  cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"
echo new version deployed $version on s3://tiledesk-widget/v5
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget/v5/index.html
echo https://widget.tiledesk.com/v5/index.html
echo https://widget.tiledesk.com/v5/$version/index.html