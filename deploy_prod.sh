npm version patch
version=`node -e 'console.log(require("./package.json").version)'`
echo "version $version"

if [ "$version" != "" ]; then
    git tag -a "v$version" -m "`git log -1 --format=%s`"
    echo "Created a new tag, v$version"
    git push --tags
    npm publish
fi

# --build-optimizer=false if localstorage is disabled (webview) appears https://github.com/firebase/angularfire/issues/970
ng build --prod --base-href --output-hashing none --build-optimizer=false

cd dist
aws s3 sync . s3://tiledesk-widget/v3/
# --cache-control max-age=604800
cd ..

aws  cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"
echo new version deployed $version on s3://tiledesk-widget/v3
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget/v3/index.html