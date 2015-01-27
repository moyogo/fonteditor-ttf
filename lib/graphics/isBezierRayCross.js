var isBezierLineCross = require('./isBezierLineCross');
function isBezierRayCross(p0, p1, p2, p) {
    if (0 === ((p0.y > p.y) + (p1.y > p.y) + (p2.y > p.y)) % 3) {
        return false;
    }
    var result = isBezierLineCross(p0, p1, p2, p, {
        x: 100000,
        y: p.y
    });
    if (result) {
        var filter = result.filter(function (item) {
            return item.x >= p.x;
        });
        return filter.length ? filter : false;
    }
    return false;
}
module.exports = isBezierRayCross;