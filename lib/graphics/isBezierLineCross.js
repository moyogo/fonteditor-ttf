var bezierQ2Equation = require('../math/bezierQ2Equation');
var ceilPoint = require('./util').ceilPoint;
function isBezierLineCross(p0, p1, p2, s0, s1) {
    var result;
    if (s0.y === s1.y) {
        result = bezierQ2Equation(p0.y + p2.y - 2 * p1.y, 2 * (p1.y - p0.y), p0.y - s0.y);
    } else if (s0.x === s1.x) {
        result = bezierQ2Equation(p0.x + p2.x - 2 * p1.x, 2 * (p1.x - p0.x), p0.x - s0.x);
    } else {
        var k = (s1.y - s0.y) / (s1.x - s0.x);
        var b1 = s0.y - k * s0.x;
        var a = p0.x + p2.x - 2 * p1.x;
        var b = 2 * (p1.x - p0.x);
        var c = p0.x;
        var d = p0.y + p2.y - 2 * p1.y;
        var e = 2 * (p1.y - p0.y);
        var f = p0.y;
        result = bezierQ2Equation(k * a - d, k * b - e, k * c + b1 - f);
    }
    if (result) {
        return result.map(function (t) {
            return ceilPoint({
                x: p0.x * Math.pow(1 - t, 2) + 2 * p1.x * t * (1 - t) + p2.x * Math.pow(t, 2),
                y: p0.y * Math.pow(1 - t, 2) + 2 * p1.y * t * (1 - t) + p2.y * Math.pow(t, 2)
            });
        });
    }
    return false;
}
module.exports = isBezierLineCross;