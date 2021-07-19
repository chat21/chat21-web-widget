# npm version prerelease --preid=beta
version=`node -e 'console.log(require("./package.json").version)'`
echo "version $version"

ng build --prod --env=pre --base-href --output-hashing none --build-optimizer=false

# ########## --->>>> NATIVE-MQTT folder START <<<<<------ ########## #

# cd dist
# aws s3 sync . s3://tiledesk-widget-pre/native-mqtt/widget/$version/
# aws s3 sync . s3://tiledesk-widget-pre/native-mqtt/widget/
# cd ..

# #aws  cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"
# # echo new version deployed $NEW_VER/$NEW_BUILD/ on s3://tiledesk-widget-pre/v2
# echo new version deployed $version/ on s3://tiledesk-widget-pre/native-mqtt/widget/ and s3://tiledesk-widget-pre/native-mqtt/widget/$version/
# echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget-pre/native-mqtt/widget/index.html
# echo https://widget-pre.tiledesk.com/v5/index.html
# echo https://widget-pre.tiledesk.com/v5/$version/index.html

# ########## --->>>> NATIVE-MQTT folder END <<<<<------ ########## #


# ########## --->>>> FIREBASE folder START <<<<<------ ########## #
cd dist
aws s3 sync . s3://tiledesk-widget-pre/v5/$version/
aws s3 sync . s3://tiledesk-widget-pre/v5/
cd ..

#aws  cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"
# echo new version deployed $NEW_VER/$NEW_BUILD/ on s3://tiledesk-widget-pre/v2
echo new version deployed $version/ on s3://tiledesk-widget-pre/ and s3://tiledesk-widget-pre/$version/
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget-pre/index.html
echo https://widget-pre.tiledesk.com/index.html
echo https://widget-pre.tiledesk.com/$version/index.html

# ########## --->>>> FIREBASE folder END <<<<<------ ########## #

## AZIONI per committare: 
## 1) modificare package.json e package-lock.json aggiungendo il num di versione nuovo
## 2) aggiornare il CHANGELOG
## 3) fare il commit tramite sourcetree
## 4) da terminale richiamare ./deploy_pre.sh