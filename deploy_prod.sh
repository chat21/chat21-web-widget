# environment=$(< current_version.ts)
# start="CURR_VER_PROD = '1."
# end="'"
# one=${environment#*$start}
# build=${one%%$end*} #two=${one%,*} -> %% prendo la prima istanza; % prendo la seconda
# NEW_BUILD=$(($build+1))
# sed -i -e "s/$start$build/$start$NEW_BUILD/g" current_version.ts
# ng build --prod --base-href --output-hashing none
# cd dist
# aws s3 sync . s3://tiledesk-widget/v2/
# cd ..

environment=$(< current_version.ts)
start="CURR_VER_PROD = '"
two="."
end="'"

one=${environment#*$start}
ver=${one%%$two*}

one=${environment#*$two}
build=${one%%$end*}

newbuild=$(echo "$build + 1" | bc)
if (( $newbuild == 1000 )); then
    NEW_VER=$(echo "$ver + 1" | bc)
    NEW_BUILD=$(printf "%03d" 0)
else
    NEW_VER=$ver
    NEW_BUILD=$(printf "%03d" $newbuild)
fi
echo 'ver: ---->'$NEW_VER
echo 'build: ---->'$NEW_BUILD

sed -i -e "s/$start$ver.$build/$start$NEW_VER.$NEW_BUILD/g" current_version.ts
ng build --prod --base-href --output-hashing none 
#ng build --base-href --output-hashing none
cd dist
aws s3 sync . s3://tiledesk-widget/v2/
cd ..

#aws --profile f21 cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"
aws  cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"
echo new version deployed $NEW_VER/$NEW_BUILD/ on s3://tiledesk-widget/v2
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget/v2/index.html