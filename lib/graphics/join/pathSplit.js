var bezierQ2Split = require('../../math/bezierQ2Split');
var getBezierQ2T = require('../../math/getBezierQ2T');
function sortJoint(path, joint) {
    var length = path.length;
    return joint.sort(function (p0, p1) {
        if (p0.index !== p1.index) {
            return p0.index - p1.index;
        }
        var cur = path[p0.index];
        var next = p0.index === length - 1 ? path[0] : path[p0.index + 1];
        if (cur.onCurve && next.onCurve) {
            return Math.pow(p0.x - cur.x, 2) + Math.pow(p0.y - cur.y, 2) - (Math.pow(p1.x - cur.x, 2) + Math.pow(p1.y - cur.y, 2));
        } else if (!cur.onCurve) {
            var prev = p0.index === 0 ? path[length - 1] : path[p0.index - 1];
            var t1 = getBezierQ2T(prev, cur, next, p0);
            var t2 = getBezierQ2T(prev, cur, next, p1);
            return t1 === t2 ? 0 : t1 < t2 ? -1 : 1;
        }
    });
}
function pathSplit(path, joint) {
    joint = sortJoint(path, joint);
    var jointOffset = 0;
    var i;
    var l;
    for (i = 0, l = joint.length; i < l; i++) {
        var length = path.length;
        var p = joint[i];
        p.index += jointOffset;
        var cur = p.index;
        var next = cur === length - 1 ? 0 : cur + 1;
        if (path[cur].onCurve && path[next].onCurve) {
            if (Math.abs(path[cur].x - p.x) < 0.001 && Math.abs(path[cur].y - p.y) < 0.001) {
                p.index = cur;
                continue;
            }
            if (Math.abs(path[next].x - p.x) < 0.001 && Math.abs(path[next].y - p.y) < 0.001) {
                p.index = next;
                continue;
            }
            path.splice(cur + 1, 0, {
                x: p.x,
                y: p.y,
                onCurve: true
            });
            p.index = cur + 1;
            jointOffset++;
        } else if (!path[cur].onCurve) {
            var prev = cur === 0 ? length - 1 : cur - 1;
            if (Math.abs(path[prev].x - p.x) < 0.001 && Math.abs(path[prev].y - p.y) < 0.001) {
                p.index = prev;
                continue;
            }
            if (Math.abs(path[next].x - p.x) < 0.001 && Math.abs(path[next].y - p.y) < 0.001) {
                p.index = next;
                continue;
            }
            var bezierArray = bezierQ2Split(path[prev], path[cur], path[next], p);
            if (!bezierArray) {
                throw 'can\'t find bezier split point';
            }
            path.splice(cur, 1, bezierArray[0][1], {
                x: p.x,
                y: p.y,
                onCurve: true
            }, bezierArray[1][1]);
            p.index = cur + 1;
            jointOffset += 2;
        } else {
            throw 'joint incorrect';
        }
    }
    joint.sort(function (p0, p1) {
        return p0.index - p1.index;
    });
    var splitedPaths = [];
    var start;
    var end;
    for (i = 0, l = joint.length - 1; i < l; i++) {
        start = joint[i];
        end = joint[i + 1];
        splitedPaths.push(path.slice(start.index, end.index + 1));
    }
    start = end;
    end = joint[0];
    splitedPaths.push(path.slice(start.index).concat(path.slice(0, end.index + 1)));
    return splitedPaths;
}
module.exports = pathSplit;