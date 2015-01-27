function pathCeil(contour) {
    var p;
    for (var i = 0, l = contour.length; i < l; i++) {
        p = contour[i];
        p.x = Math.round(p.x);
        p.y = Math.round(p.y);
    }
    return contour;
}
module.exports = pathCeil;