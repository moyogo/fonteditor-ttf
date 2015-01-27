var matrixTransform = require('./transform');
var computeBoundingBox = require('./computeBoundingBox');
var lang = require('../common/lang');
function getGlyfBound(glyf) {
    var points = [];
    var glyfs = glyf.glyfs;
    glyfs.forEach(function (g) {
        var glyph = g.glyf;
        if (!glyph || !glyph.contours) {
            return;
        }
        var bound = getContoursBound(glyph.contours, glyph.transform);
        points.push(bound, {
            x: bound.x + bound.width,
            y: bound.y + bound.height
        });
    });
    return computeBoundingBox.computeBounding(points);
}
function getContoursBound(contours, transform) {
    var cloned = lang.clone(contours);
    if (transform) {
        matrixTransform(cloned, transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
    }
    return computeBoundingBox.computePathBox.apply(null, cloned);
}
module.exports = {
    getGlyfBound: getGlyfBound,
    getContoursBound: getContoursBound
};