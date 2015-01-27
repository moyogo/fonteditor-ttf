var computeBoundingBox = require('./computeBoundingBox');
var getPathJoint = require('./join/getPathJoint');
var isInsidePath = require('./isInsidePath');
var isBoundingBoxCross = require('./isBoundingBoxCross');
var util = require('./pathUtil');
function isPathCross(path0, path1, bound0, bound1) {
    bound0 = bound0 || computeBoundingBox.computePath(path0);
    bound1 = bound1 || computeBoundingBox.computePath(path1);
    if (isBoundingBoxCross(bound0, bound1)) {
        var result = getPathJoint(path0, path1);
        if (!result) {
            if (isInsidePath(path0, path1[0])) {
                return 2;
            } else if (isInsidePath(path1, path0[0])) {
                return 3;
            }
        }
        return util.removeOverlapPoints(result);
    }
    return false;
}
module.exports = isPathCross;