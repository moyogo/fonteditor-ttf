var pathIterator = require('./pathIterator');
var isBezierRayCross = require('./isBezierRayCross');
var isSegmentRayCross = require('./isSegmentRayCross');
function isInsidePath(path, p) {
    var zCount = 0;
    var joint;
    pathIterator(path, function (c, p0, p1, p2) {
        if (c === 'L') {
            if (joint = isSegmentRayCross(p0, p1, p)) {
                if (joint.length === 2) {
                    if (p.x >= Math.min(joint[0].x, joint[1].x) && p.x <= Math.max(joint[0].x, joint[1].x)) {
                        zCount = 1;
                        return false;
                    }
                    return;
                }
                if (joint[0].x === p.x) {
                    zCount = 1;
                    return false;
                }
                if (p1.y > p0.y) {
                    zCount--;
                } else {
                    zCount++;
                }
            }
        } else if (c === 'Q') {
            var ps = null;
            var pe = null;
            if (joint = isBezierRayCross(p0, p1, p2, p)) {
                if (joint[0].x === p.x || joint[1] && joint[1].x === p.x) {
                    zCount = 1;
                    return false;
                }
                if (joint.length === 2) {
                    return;
                }
                joint = joint[0];
                if (joint.y > p0.y && joint.y < p1.y) {
                    ps = p0;
                    pe = p1;
                } else {
                    ps = p1;
                    pe = p2;
                }
                if (pe.y > ps.y) {
                    zCount--;
                } else {
                    zCount++;
                }
            }
        }
    });
    return !!zCount;
}
module.exports = isInsidePath;