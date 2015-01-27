var reducePath = require('../../graphics/reducePath');
function reduceGlyf(glyf) {
    var contours = glyf.contours;
    var contour;
    var length;
    for (var j = contours.length - 1; j >= 0; j--) {
        contour = contours[j];
        reducePath(contour);
        length = contour.length;
        if (0 === length || 2 === length) {
            contours.splice(j, 1);
            continue;
        }
    }
    if (0 === glyf.contours.length) {
        delete glyf.contours;
    }
    return glyf;
}
module.exports = reduceGlyf;