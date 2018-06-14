environment=$(< current_version.ts)
start="CURR_VER_PROD = '0."
end="'"
one=${environment#*$start}
build=${one%%$end*} #two=${one%,*} -> %% prendo la prima istanza; % prendo la seconda
NEW_BUILD=$(($build+1))
#sed -i -e "s/$start$build/$start$NEW_BUILD/g" current_version.ts
sed -i -e "s/$start$build/$start$NEW_BUILD/g" current_version.ts
#ng build --prod --base-href #/$NEW_BUILD/
<<<<<<< HEAD
#ng build --prod --base-href
=======
>>>>>>> 25372f1dcdd589c579ebbed6e13047a059b6064f
ng build --prod --base-href --output-hashing none
cd dist
#aws s3 sync . s3://tiledesk-widget/dev/0/$NEW_BUILD/
aws s3 sync . s3://tiledesk-widget/
cd ..

aws cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"

echo new version deployed on s3://tiledesk-widget/
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget/index.html