var computeBoundingBox = require('./computeBoundingBox');
var pathSplit = require('./join/pathSplit');
var pathAdjust = require('./pathAdjust');
var pathRotate = require('./pathRotate');
var pathUtil = require('./pathUtil');
var interpolate = pathUtil.interpolate;
var deInterpolate = pathUtil.deInterpolate;
var getSegmentPathJoint = require('./join/getSegmentPathJoint');
var lang = require('../common/lang');
var circlePath = require('./path/circle');
function getOval(rx, ry, angle, center) {
    var path = lang.clone(circlePath);
    var bound = computeBoundingBox.computePath(path);
    var scaleX = rx / bound.width;
    pathAdjust(path, 1, 1, -(bound.x + bound.width / 2), -(bound.y + bound.height / 2));
    pathAdjust(path, scaleX, scaleX * ry / rx);
    if (angle !== 0) {
        pathRotate(path, angle);
    }
    pathAdjust(path, 1, 1, center.x, center.y);
    return path;
}
function getArc(rx, ry, angle, largeArc, sweep, p0, p1) {
    if (rx === 0 || ry === 0) {
        return [
            p0,
            p1
        ];
    }
    var f = angle % 360 * Math.PI / 180;
    var sinf = Math.sin(f);
    var cosf = Math.cos(f);
    if (rx < 0) {
        rx = -rx;
    }
    if (ry < 0) {
        ry = -ry;
    }
    var x1 = p0.x;
    var y1 = p0.y;
    var x2 = p1.x;
    var y2 = p1.y;
    var k1 = (x1 - x2) / 2;
    var k2 = (y1 - y2) / 2;
    var x1_ = cosf * k1 + sinf * k2;
    var y1_ = -sinf * k1 + cosf * k2;
    var ita = Math.sqrt(Math.pow(x1_ / rx, 2) + Math.pow(y1_ / ry, 2));
    if (ita > 1) {
        rx = ita * rx;
        ry = ita * ry;
    }
    k1 = rx * rx * y1_ * y1_ + ry * ry * x1_ * x1_;
    if (k1 === 0) {
        return [];
    }
    k1 = Math.sqrt(Math.abs(rx * rx * ry * ry / k1 - 1));
    if (sweep === largeArc) {
        k1 = -k1;
    }
    var cx_ = k1 * rx * y1_ / ry;
    var cy_ = -k1 * ry * x1_ / rx;
    var cx = cosf * cx_ - sinf * cy_ + (x1 + x2) / 2;
    var cy = sinf * cx_ + cosf * cy_ + (y1 + y2) / 2;
    var p0_ = {
        x: x1,
        y: y1
    };
    var p1_ = {
        x: x2,
        y: y2
    };
    pathAdjust([
        p0_,
        p1_
    ], 1.1, 1.1, -(x1 + x2) / 2, -(y1 + y2) / 2);
    pathAdjust([
        p0_,
        p1_
    ], 1, 1, (x1 + x2) / 2, (y1 + y2) / 2);
    var ovalPath = interpolate(getOval(2 * rx, 2 * ry, f >= 0 ? f : f + Math.PI, {
        x: cx,
        y: cy
    }));
    var result = getSegmentPathJoint(ovalPath, p0_, p1_);
    if (result && result.length > 1) {
        var ovalPaths = pathSplit(ovalPath, result.map(function (p) {
            p.index = p.index1;
            return p;
        }));
        var clockwise = y1 > y2 ? 1 : y1 < y2 ? -1 : x1 > x2 ? 1 : -1;
        if (Math.abs(cx - (x1 + x2) / 2) < 0.01 && Math.abs(cy - (y1 + y2) / 2) < 0.01) {
            if (sweep && clockwise === 1 || sweep === 0 && clockwise === -1) {
                ovalPath = ovalPaths[0];
            } else {
                ovalPath = ovalPaths[1];
            }
        } else {
            if (largeArc && ovalPaths[1].length > ovalPaths[0].length) {
                ovalPath = ovalPaths[1];
            } else {
                if (clockwise === 1) {
                    ovalPath = ovalPaths[0];
                } else {
                    ovalPath = ovalPaths[1];
                }
            }
        }
        ovalPath = deInterpolate(ovalPath);
        var end = ovalPath[ovalPath.length - 1];
        if (Math.abs(p0.x - end.x) < 1 && Math.abs(p0.y - end.y) < 1) {
            ovalPath = ovalPath.reverse();
        }
        return ovalPath;
    }
    return [
        p0,
        p1
    ];
}
module.exports = getArc;