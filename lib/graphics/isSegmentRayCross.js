var isSegmentCross = require('./isSegmentCross');
function isSegmentRayCross(p0, p1, p) {
    return isSegmentCross(p0, p1, p, {
        x: 100000,
        y: p.y
    });
}
module.exports = isSegmentRayCross;