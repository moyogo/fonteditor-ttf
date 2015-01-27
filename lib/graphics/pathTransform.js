function transform(contour, a, b, c, d, e, f) {
    var x;
    var y;
    var p;
    for (var i = 0, l = contour.length; i < l; i++) {
        p = contour[i];
        x = p.x;
        y = p.y;
        p.x = x * a + y * c + e;
        p.y = x * b + y * d + f;
    }
    return contour;
}
module.exports = transform;