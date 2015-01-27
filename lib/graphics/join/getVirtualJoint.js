var isInsidePath = require('../isInsidePath');
var getBezierQ2Point = require('../../math/getBezierQ2Point');
function getVirtualJoint(path0, path1, joint) {
    if (!joint) {
        return {};
    }
    var outCount = 0;
    var inCount = 0;
    var virtualPoints = [];
    var prevIndex = -1;
    joint.forEach(function (p) {
        var index = p.index0;
        if (index === prevIndex) {
            return;
        }
        var cur = index;
        var next = index === path0.length - 1 ? 0 : index + 1;
        var prev = index === 0 ? path0.length - 1 : index - 1;
        var curPoint = path0[cur];
        var nextPoint = path0[next];
        var prevPoint = path0[prev];
        var b0;
        var b1;
        var b2;
        var p2;
        var ip1;
        var ip2;
        if (curPoint.onCurve) {
            b1 = isInsidePath(path1, {
                x: (curPoint.x + p.x) / 2,
                y: (curPoint.y + p.y) / 2
            });
            b2 = isInsidePath(path1, {
                x: (nextPoint.x + p.x) / 2,
                y: (nextPoint.y + p.y) / 2
            });
            if (!b1 && !b2) {
                outCount++;
                p.virtual = true;
                virtualPoints.push(p);
            } else if (Math.abs(cur.x - p.x) < 0.01 && Math.abs(cur.y - p.y) < 0.01) {
                if (!prevPoint.onCurve) {
                    ip2 = prev - 1 === 0 ? path0.length - 1 : prev - 1;
                    p2 = path0[ip2];
                    if (!p2.onCurve) {
                        p2 = {
                            x: (prevPoint.x + p2.x) / 2,
                            y: (prevPoint.y + p2.y) / 2
                        };
                    }
                    prevPoint = getBezierQ2Point(curPoint, prevPoint, p2, 0.5);
                }
                b0 = isInsidePath(path1, prevPoint);
                if (b0 && b2) {
                    inCount++;
                    p.virtual = true;
                    virtualPoints.push(p);
                } else if (!b0 && !b2) {
                    outCount++;
                    p.virtual = true;
                    virtualPoints.push(p);
                }
            }
        } else {
            if (Math.abs(prevPoint.x - p.x) < 0.01 && Math.abs(prevPoint.y - p.y) < 0.01) {
                b2 = isInsidePath(path1, getBezierQ2Point(prevPoint, curPoint, nextPoint, 0.5));
                ip1 = prev - 1 === 0 ? path0.length - 1 : prev - 1;
                if (path0[ip1].onCurve) {
                    b0 = isInsidePath(path1, path0[ip1]);
                } else {
                    ip2 = ip1 - 1 === 0 ? path0.length - 1 : ip1 - 1;
                    b0 = isInsidePath(path1, getBezierQ2Point(prevPoint, path0[ip1], path0[ip2], 0.5));
                }
            } else {
                b0 = isInsidePath(path1, prevPoint);
                b2 = isInsidePath(path1, nextPoint);
            }
            if (b0 && b2) {
                inCount++;
                virtualPoints.push(p);
            } else if (!b0 && !b2) {
                outCount++;
                virtualPoints.push(p);
            }
        }
        prevIndex = index;
    });
    return {
        inCount: inCount,
        outCount: outCount,
        points: virtualPoints
    };
}
module.exports = getVirtualJoint;