var isPointInBound = require('./util').isPointInBound;
var isSegmentCross = require('./isSegmentCross');
function isBoundingBoxSegmentCross(bound, s0, s1) {
    if (isPointInBound(bound, s0) || isPointInBound(bound, s1)) {
        return true;
    }
    if (isSegmentCross(bound, {
            x: bound.x,
            y: bound.y + bound.height
        }, s0, s1) || isSegmentCross(bound, {
            x: bound.x + bound.width,
            y: bound.y
        }, s0, s1) || isSegmentCross({
            x: bound.x + bound.width,
            y: bound.y
        }, {
            x: bound.x + bound.width,
            y: bound.y + bound.height
        }, s0, s1) || isSegmentCross({
            x: bound.x,
            y: bound.y + bound.height
        }, {
            x: bound.x + bound.width,
            y: bound.y + bound.height
        }, s0, s1)) {
        return true;
    }
    return false;
}
module.exports = isBoundingBoxSegmentCross;