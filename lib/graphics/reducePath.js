function redundant(prev, p, next) {
    if ((p.onCurve && next.onCurve || !p.onCurve && !next.onCurve) && Math.pow(p.x - next.x, 2) + Math.pow(p.y - next.y, 2) <= 1) {
        return true;
    }
    if (p.onCurve && prev.onCurve && next.onCurve && Math.abs((next.y - p.y) * (prev.x - p.x) - (prev.y - p.y) * (next.x - p.x)) <= 0.001) {
        return true;
    }
    return false;
}
function reducePath(contour) {
    if (!contour.length) {
        return contour;
    }
    var prev;
    var next;
    var p;
    for (var i = contour.length - 1, last = i; i >= 0; i--) {
        p = contour[i];
        next = i === last ? contour[0] : contour[i + 1];
        prev = i === 0 ? contour[last] : contour[i - 1];
        if (redundant(prev, p, next)) {
            contour.splice(i, 1);
            last--;
            continue;
        }
    }
    return contour;
}
module.exports = reducePath;