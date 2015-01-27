var computeBoundingBox = require('./computeBoundingBox');
var getSegmentPathJoint = require('./join/getSegmentPathJoint');
var pathSplit = require('./join/pathSplit');
var isBoundingBoxSegmentCross = require('./isBoundingBoxSegmentCross');
var util = require('./pathUtil');
var interpolate = util.interpolate;
var deInterpolate = util.deInterpolate;
function pathSplitBySegment(path, p0, p1) {
    var bound = computeBoundingBox.computePath(path);
    if (!isBoundingBoxSegmentCross(bound, p0, p1)) {
        return false;
    }
    path = interpolate(path);
    var result = getSegmentPathJoint(path, p0, p1);
    if (result && result.length > 1) {
        var splitedPaths = pathSplit(path, result.map(function (p) {
            p.index = p.index1;
            return p;
        }));
        var last = splitedPaths.length - 1;
        splitedPaths[last].direction = util.isClockWise(splitedPaths[last]);
        for (var i = last - 1; i > 0; i--) {
            splitedPaths[i].direction = util.isClockWise(splitedPaths[i]);
            if (splitedPaths[i].direction !== splitedPaths[i + 1].direction) {
                var prevPrev = i === last - 1 ? 0 : i + 2;
                var newPath = splitedPaths[prevPrev].concat(splitedPaths[i]);
                newPath.direction = splitedPaths[i + 1].direction;
                if (prevPrev === 0) {
                    splitedPaths[0] = newPath;
                    splitedPaths.splice(i, 1);
                } else {
                    splitedPaths[i] = newPath;
                    splitedPaths.splice(prevPrev, 1);
                }
            }
        }
        return splitedPaths.map(function (path) {
            return deInterpolate(path);
        });
    }
    return false;
}
module.exports = pathSplitBySegment;