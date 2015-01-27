var computeBoundingBox = require('./computeBoundingBox');
var isOnPath = require('./isOnPath');
var isBoundingBoxCross = require('./isBoundingBoxCross');
var util = require('./pathUtil');
var getPointHash = util.getPointHash;
var getPathHash = util.getPathHash;
var pathIterator = require('./pathIterator');
var getPoint = require('../math/getBezierQ2Point');
function isPathPointsOverlap(path0, path1) {
    var hash = {};
    path1.forEach(function (p) {
        hash[getPointHash(p)] = true;
    });
    var overlapCount = 0;
    path0.forEach(function (p) {
        if (hash[getPointHash(p)]) {
            overlapCount++;
        }
    });
    return overlapCount === path0.length;
}
function isPathPointsOn(path0, path1) {
    var zCount = 0;
    var i0;
    var i1;
    var i2;
    pathIterator(path0, function (c, p0, p1, p2) {
        if (c === 'L') {
            i0 = isOnPath(path1, p0);
            i1 = isOnPath(path1, p1);
            i2 = isOnPath(path1, {
                x: (p0.x + p1.x) / 2,
                y: (p0.y + p1.y) / 2
            });
            if (false === i0 || false === i1 || false === i2 || !path1[i0].onCurve || !path1[i1].onCurve || !path1[i2].onCurve) {
                return false;
            }
            zCount++;
        } else if (c === 'Q') {
            i0 = isOnPath(path1, p0);
            i1 = isOnPath(path1, p2);
            i2 = isOnPath(path1, getPoint(p0, p1, p2, 0.5));
            if (false === i0 || false === i1 || false === i2 || path1[i0].onCurve || path1[i1].onCurve || path1[i2].onCurve) {
                return false;
            }
            zCount++;
        }
    });
    return zCount === path0.length;
}
function isPathOverlap(path0, path1, bound0, bound1) {
    bound0 = bound0 || computeBoundingBox.computePath(path0);
    bound1 = bound1 || computeBoundingBox.computePath(path1);
    if (isBoundingBoxCross(bound0, bound1)) {
        if (getPathHash(path0) === getPathHash(path1)) {
            return 2;
        }
        if (path1.length < path0.length) {
            var tmp = path1;
            path1 = path0;
            path0 = tmp;
        }
        if (isPathPointsOverlap(path0, path1) || isPathPointsOverlap(path1, path0)) {
            return 1;
        }
        if (isPathPointsOn(path0, path1) || isPathPointsOn(path1, path0)) {
            return 1;
        }
    }
    return 0;
}
module.exports = isPathOverlap;