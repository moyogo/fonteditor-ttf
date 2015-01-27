function interpolate(path) {
    var newPath = [];
    for (var i = 0, l = path.length; i < l; i++) {
        var next = i === l - 1 ? 0 : i + 1;
        newPath.push(path[i]);
        if (!path[i].onCurve && !path[next].onCurve) {
            newPath.push({
                x: (path[i].x + path[next].x) / 2,
                y: (path[i].y + path[next].y) / 2,
                onCurve: true
            });
        }
    }
    return newPath;
}
function deInterpolate(path) {
    var newPath = [];
    for (var i = 0, l = path.length; i < l; i++) {
        var next = i === l - 1 ? 0 : i + 1;
        var prev = i === 0 ? l - 1 : i - 1;
        if (!path[prev].onCurve && path[i].onCurve && !path[next].onCurve && Math.abs(2 * path[i].x - path[prev].x - path[next].x) < 0.001 && Math.abs(2 * path[i].y - path[prev].y - path[next].y) < 0.001) {
            continue;
        }
        newPath.push(path[i]);
    }
    return newPath;
}
function isClockWise(path) {
    if (path.length < 3) {
        return 0;
    }
    var zCount = 0;
    for (var i = 0, l = path.length; i < l; i++) {
        var cur = path[i];
        var prev = i === 0 ? path[l - 1] : path[i - 1];
        var next = i === l - 1 ? path[0] : path[i + 1];
        var z = (cur.x - prev.x) * (next.y - cur.y) - (cur.y - prev.y) * (next.x - cur.x);
        if (z < 0) {
            zCount--;
        } else if (z > 0) {
            zCount++;
        }
    }
    return zCount === 0 ? 0 : zCount < 0 ? 1 : -1;
}
function getPointHash(p) {
    return (p.x * 31 + p.y) * 31 + (p.onCurve ? 1 : 0);
}
function getPathHash(path) {
    var hash = 0;
    var seed = 131;
    path.forEach(function (p) {
        hash = 2147483647 & hash * seed + getPointHash(p);
    });
    return hash;
}
function removeOverlapPoints(points) {
    var hash = {};
    var ret = [];
    for (var i = 0, l = points.length; i < l; i++) {
        var hashcode = points[i].x * 31 + points[i].y;
        if (!hash[hashcode]) {
            ret.push(points[i]);
            hash[hashcode] = 1;
        }
    }
    return ret;
}
module.exports = {
    interpolate: interpolate,
    deInterpolate: deInterpolate,
    isClockWise: isClockWise,
    removeOverlapPoints: removeOverlapPoints,
    getPointHash: getPointHash,
    getPathHash: getPathHash
};