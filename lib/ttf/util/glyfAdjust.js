var pathAdjust = require('../../graphics/pathAdjust');
var pathCeil = require('../../graphics/pathCeil');
var computeBoundingBox = require('../../graphics/computeBoundingBox');
function glyfAdjust(g, scaleX, scaleY, offsetX, offsetY, ceil) {
    scaleX = scaleX || 1;
    scaleY = scaleY || 1;
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    if (g.contours && g.contours.length) {
        if (scaleX !== 1 || scaleY !== 1) {
            g.contours.forEach(function (contour) {
                pathAdjust(contour, scaleX, scaleY);
            });
        }
        if (offsetX !== 0 || offsetY !== 0) {
            g.contours.forEach(function (contour) {
                pathAdjust(contour, 1, 1, offsetX, offsetY);
            });
        }
        if (false !== ceil) {
            g.contours.forEach(function (contour) {
                pathCeil(contour);
            });
        }
    }
    var advanceWidth = g.advanceWidth;
    if (undefined === g.xMin || undefined === g.yMax || undefined === g.leftSideBearing || undefined === g.advanceWidth) {
        var bound;
        if (g.contours && g.contours.length) {
            bound = computeBoundingBox.computePathBox.apply(this, g.contours);
        } else {
            bound = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
        }
        g.xMin = bound.x;
        g.xMax = bound.x + bound.width;
        g.yMin = bound.y;
        g.yMax = bound.y + bound.height;
        g.leftSideBearing = g.xMin;
        if (undefined !== advanceWidth) {
            g.advanceWidth = Math.round(advanceWidth * scaleX + offsetX);
        } else {
            g.advanceWidth = g.xMax + Math.abs(g.xMin);
        }
    } else {
        g.xMin = Math.round(g.xMin * scaleX + offsetX);
        g.xMax = Math.round(g.xMax * scaleX + offsetX);
        g.yMin = Math.round(g.yMin * scaleY + offsetY);
        g.yMax = Math.round(g.yMax * scaleY + offsetY);
        g.leftSideBearing = Math.round(g.leftSideBearing * scaleX + offsetX);
        g.advanceWidth = Math.round(advanceWidth * scaleX + offsetX);
    }
    return g;
}
module.exports = glyfAdjust;