# npm version patch
version=`node -e 'console.log(require("./package.json").version)'`
ECHO "____________WIDGET-V5______________"
echo "CREATING TAG ON GIT FOR version: $version"
# echo "version $version"

if [ "$version" != "" ]; then
    git tag -a "$version" -m "`git log -1 --format=%s`"
    echo "Created a new tag, $version"
    git push --tags
    npm publish
fi