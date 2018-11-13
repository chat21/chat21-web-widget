environment=$(< current_version.ts)
start="CURR_VER_PROD = '0."
end="'"
one=${environment#*$start}
build=${one%%$end*} #two=${one%,*} -> %% prendo la prima istanza; % prendo la seconda
NEW_BUILD=$(($build+1))
#sed -i -e "s/$start$build/$start$NEW_BUILD/g" current_version.ts
sed -i -e "s/$start$build/$start$NEW_BUILD/g" current_version.ts
#ng build --prod --base-href #/$NEW_BUILD/
ng build --prod --base-href --output-hashing none
cd dist
#aws s3 sync . s3://tiledesk-widget/dev/0/$NEW_BUILD/
#aws --profile f21 s3 sync . s3://tiledesk-widget/
aws s3 sync . s3://tiledesk-widget/
cd ..

#aws --profile f21 cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"
aws  cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"

echo new version deployed on s3://tiledesk-widget/
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget/index.html