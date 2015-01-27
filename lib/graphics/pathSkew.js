function pathSkew(contour, angle, offsetX, offsetY) {
    angle = angle === undefined ? 0 : angle;
    var x = offsetX || 0;
    var tan = Math.tan(angle);
    var p;
    var i;
    var l;
    if (x === 0) {
        for (i = 0, l = contour.length; i < l; i++) {
            p = contour[i];
            p.x += tan * (p.y - offsetY);
        }
    } else {
        for (i = 0, l = contour.length; i < l; i++) {
            p = contour[i];
            p.y += tan * (p.x - offsetX);
        }
    }
    return contour;
}
module.exports = pathSkew;