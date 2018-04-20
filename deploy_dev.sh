environment=$(< src/environments/environment.ts)
start="build: '"
end="'"
one=${environment#*$start}
build=${one%%$end*} #two=${one%,*} -> %% prendo la prima istanza; % prendo la seconda
NEW_BUILD=$(($build + 1))

# ng build --prod --base-href /$NEW_BUILD/
ng build --base-href
cd dist
aws s3 sync . s3://tiledesk-widget/dev/0/$NEW_BUILD/
cd ..
sed -i -e "s/$start$build/$start$NEW_BUILD/g" src/environments/environment.ts

echo new version deployed on s3://tiledesk-widget/dev/0/$NEW_BUILD/
echo available on https://s3.eu-west-1.amazonaws.com/tiledesk-widget/dev/0/$NEW_BUILD/index.html
