# npm version prerelease --preid=beta
# version=`node -e 'console.log(require("./package.json").version)'`
# echo "version $version"

version="5.0.0-beta.3.13"
if [ "$version" != "" ]; then
    git tag -a "$version" -m "`git log -1 --format=%s`"
    echo "Created a new tag, $version"
    git push --tags
    npm publish
fi