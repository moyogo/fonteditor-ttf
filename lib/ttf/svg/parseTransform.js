var parseParams = require('./parseParams');
var TRANSFORM_REGEX = /(\w+)\s*\(([\d-.,\s]*)\)/g;
function parseTransform(str) {
    if (!str) {
        return false;
    }
    TRANSFORM_REGEX.lastIndex = 0;
    var transforms = [];
    var match;
    while (match = TRANSFORM_REGEX.exec(str)) {
        transforms.push({
            name: match[1],
            params: parseParams(match[2])
        });
    }
    return transforms;
}
module.exports = parseTransform;