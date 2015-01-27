var computeBoundingBox = require('../../graphics/computeBoundingBox');
var pathAdjust = require('../../graphics/pathAdjust');
var circlePath = require('../../graphics/path/circle');
var lang = require('../../common/lang');
function oval2contour(cx, cy, rx, ry) {
    if (undefined === ry) {
        ry = rx;
    }
    var bound = computeBoundingBox.computePath(circlePath);
    var scaleX = +rx * 2 / bound.width;
    var scaleY = +ry * 2 / bound.height;
    var centerX = bound.width * scaleX / 2;
    var centerY = bound.height * scaleY / 2;
    var path = lang.clone(circlePath);
    pathAdjust(path, scaleX, scaleY);
    pathAdjust(path, 1, 1, +cx - centerX, +cy - centerY);
    return path;
}
module.exports = oval2contour;