var pathIterator = require('./pathIterator');
var getBezierQ2T = require('../math/getBezierQ2T');
function isOnPath(path, p) {
    var zCount = false;
    pathIterator(path, function (c, p0, p1, p2, i) {
        if (c === 'L') {
            if (Math.abs((p.y - p0.y) * (p.x - p1.x) - (p.y - p1.y) * (p.x - p0.x)) <= 0.001) {
                zCount = i;
                return false;
            }
        } else if (c === 'Q') {
            if (false !== getBezierQ2T(p0, p1, p2, p)) {
                zCount = i;
                return false;
            }
        }
    });
    return zCount;
}
module.exports = isOnPath;