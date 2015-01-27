function pathAdjust(contour, scaleX, scaleY, offsetX, offsetY) {
    scaleX = scaleX === undefined ? 1 : scaleX;
    scaleY = scaleY === undefined ? 1 : scaleY;
    var x = offsetX || 0;
    var y = offsetY || 0;
    var p;
    for (var i = 0, l = contour.length; i < l; i++) {
        p = contour[i];
        p.x = scaleX * (p.x + x);
        p.y = scaleY * (p.y + y);
    }
    return contour;
}
module.exports = pathAdjust;