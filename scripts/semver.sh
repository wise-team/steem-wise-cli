#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.." # parent dir of scripts dir
cd "${DIR}"

VERSION=$1

if [ -z "${VERSION}" ]; then
    echo "You must specify new version"
    exit 1
fi


echo "Updating steem-wise-cli to ${VERSION}"
node -e " \
var packageFileContents = require(\"./package.json\"); \
packageFileContents.version = \"${VERSION}\"; \
packageFileContents.dependencies[\"steem-wise-core\"] = \"^${VERSION}\"; \
require('fs').writeFileSync(\"./package.json\", JSON.stringify(packageFileContents, null, 2), \"utf8\"); \
"
echo "Updating version succeeded"


echo "Building..."
npm install
npm run build
echo "Build successful"


echo "Creating git tag"
git add package.json package-lock.json
git commit -m "Semver ${VERSION}"
git tag -a "v${VERSION}" -m "Steem WISE command line tool version ${VERSION}"
git push --tags
echo "Done creating tag"

echo "Publishing to npmjs.com registry"
npm publish

echo "Done"