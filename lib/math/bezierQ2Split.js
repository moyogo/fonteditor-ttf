var getBezierQ2T = require('./getBezierQ2T');
var getPoint = require('./getBezierQ2Point');
function bezierQ2Split(p0, p1, p2, point) {
    var t;
    var p;
    if (typeof point === 'number') {
        t = point;
        p = getPoint(p0, p1, p2, t);
    } else if (typeof point === 'object') {
        p = point;
        t = getBezierQ2T(p0, p1, p2, p);
        if (false === t) {
            return false;
        }
    }
    if (t === 0 || t === 1) {
        return [[
                p0,
                p1,
                p2
            ]];
    }
    return [
        [
            p0,
            {
                x: p0.x + (p1.x - p0.x) * t,
                y: p0.y + (p1.y - p0.y) * t
            },
            p
        ],
        [
            p,
            {
                x: p1.x + (p2.x - p1.x) * t,
                y: p1.y + (p2.y - p1.y) * t
            },
            p2
        ]
    ];
}
module.exports = bezierQ2Split;