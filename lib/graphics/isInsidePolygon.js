var isSegmentRayCross = require('./isSegmentRayCross');
function isInsidePolygon(points, p) {
    var zCount = 0;
    var p0;
    var p1;
    var result;
    for (var i = 0, l = points.length; i < l; i++) {
        p0 = points[i];
        p1 = points[i === l - 1 ? 0 : i + 1];
        if (result = isSegmentRayCross(p0, p1, p)) {
            if (result.y === p.y) {
                return true;
            }
            zCount += result.length;
        }
    }
    return !!(zCount % 2);
}
module.exports = isInsidePolygon;