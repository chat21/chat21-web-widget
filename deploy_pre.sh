npm version prerelease --preid=beta
version=`node -e 'console.log(require("./package.json").version)'`
echo "version $version"

# environment=$(< current_version.ts)
# start="CURR_VER_PROD = '"
# two="."
# end="'"

# str=${environment#*$start}
# ver=${str%%$two*}
# str=${str#*$two}
# build=${str%%$end*}
# echo 'ver: ---->'$ver
# echo 'build: ---->'$build

# newbuild=$(echo "$build + 1" | bc)
# if (( $newbuild == 1000 )); then
#     NEW_VER=$(echo "$ver + 1" | bc)
#     NEW_BUILD=$(printf "%03d" 0)
# else
#     NEW_VER=$ver
#     NEW_BUILD=$(printf "%03d" $newbuild)
# fi
# echo 'ver: ---->'$NEW_VER
# echo 'build: ---->'$NEW_BUILD

# sed -i -e "s/$start$ver.$build/$start$NEW_VER.$NEW_BUILD/g" current_version.ts

ng build --prod --env=pre --base-href --output-hashing none --build-optimizer=false
cd dist
aws s3 sync . s3://tiledesk-widget-pre/v2/
cd ..

#aws  cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"
# echo new version deployed $NEW_VER/$NEW_BUILD/ on s3://tiledesk-widget-pre/v2
echo new version deployed $version/ on s3://tiledesk-widget-pre/v2
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget-pre/v2/index.html
