var computeBoundingBox = require('./computeBoundingBox');
var isBezierLineCross = require('./isBezierLineCross');
var isBoundingBoxCross = require('./isBoundingBoxCross');
var isPointInBound = require('./util').isPointInBound;
function isBezierSegmentCross(p0, p1, p2, s0, s1) {
    var b1 = computeBoundingBox.quadraticBezier(p0, p1, p2);
    var bound = {
        x: Math.min(s0.x, s1.x),
        y: Math.min(s0.y, s1.y),
        width: Math.abs(s0.x - s1.x),
        height: Math.abs(s0.y - s1.y)
    };
    if (isBoundingBoxCross(b1, bound)) {
        var result = isBezierLineCross(p0, p1, p2, s0, s1);
        if (result) {
            return result.filter(function (p) {
                return isPointInBound(bound, p, true);
            });
        }
    }
    return false;
}
module.exports = isBezierSegmentCross;