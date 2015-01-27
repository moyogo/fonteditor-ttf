var parseParams = require('./parseParams');
function polygon2contour(points) {
    if (!points || !points.length) {
        return null;
    }
    var contours = [];
    var segments = parseParams(points);
    for (var i = 0, l = segments.length; i < l; i += 2) {
        contours.push({
            x: segments[i],
            y: segments[i + 1],
            onCurve: true
        });
    }
    return contours;
}
module.exports = polygon2contour;