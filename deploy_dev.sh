npm version prerelease --preid=beta
version=`node -e 'console.log(require("./package.json").version)'`
echo "version $version"


# URL_VER=${version//[.]//}
# echo 'URL_VER: ---->'$URL_VER

if [ "$version" != "" ]; then
   # git tag -a "v$version-RC" -m "`git log -1 --format=%s`"
   # echo "Created a new tag, v$version"
    git push --tags
    npm publish --tag RC
fi



# environment=$(< current_version.ts)
# start="CURR_VER_DEV = '"
# two="."
# end="'"

# one=${environment#*$start}
# ver=${one%%$two*}

# one=${environment#*$two}
# build=${one%%$end*}

# #echo '---->'$ver
# #echo '---->'$build
# ##two=${one%,*} -> %% prendo la prima istanza; % prendo la seconda
# #newbuild=$(($build+1))
# newbuild=$(echo "$build + 1" | bc)
# #echo '---->'$newbuild
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

# --build-optimizer=false if localstorage is disabled (webview) appears https://github.com/firebase/angularfire/issues/970
ng build --prod --base-href --output-hashing none  --build-optimizer=false

cd dist
aws  s3 sync --profile f21 . s3://tiledesk-widget/dev/$version/
cd ..
echo new version deployed on s3://tiledesk-widget/dev/$version
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget/dev/$version/index.html



# environment=$(< current_version.ts)
# start="CURR_VER_DEV = '1."
# end="'"
# one=${environment#*$start}
# build=${one%%$end*} #two=${one%,*} -> %% prendo la prima istanza; % prendo la seconda
# NEW_BUILD=$(($build+1))
# sed -i -e "s/$start$build/$start$NEW_BUILD/g" current_version.ts
# #sed -i -e "s/$start$build/$start$NEW_BUILD/g" current_version.ts

# #ng build --prod --base-href #/$NEW_BUILD/
# # ng build --base-href 
# ng build --prod --base-href --output-hashing none
# cd dist
# #aws --profile f21 s3 sync . s3://tiledesk-widget/dev/0/$NEW_BUILD/
# aws  s3 sync . s3://tiledesk-widget/dev/0/$NEW_BUILD/
# cd ..


# echo new version deployed on s3://tiledesk-widget/dev/0/$NEW_BUILD/
# echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget/dev/0/$NEW_BUILD/index.html

# # aws cloudfront create-invalidation --distribution-id E3EJDWEHY08CZZ --paths "/*"
# # aws cloudfront create-invalidation --distribution-id $CDN_DISTRIBUTION_ID --paths "/*"