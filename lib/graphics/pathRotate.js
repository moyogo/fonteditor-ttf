function pathRotate(contour, angle, centerX, centerY) {
    angle = angle === undefined ? 0 : angle;
    var x = centerX || 0;
    var y = centerY || 0;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var px;
    var py;
    var p;
    for (var i = 0, l = contour.length; i < l; i++) {
        p = contour[i];
        px = cos * (p.x - x) - sin * (p.y - y);
        py = cos * (p.y - y) + sin * (p.x - x);
        p.x = px + x;
        p.y = py + y;
    }
    return contour;
}
module.exports = pathRotate;