function toQuad(p1, c1, c2, p2) {
    var x = (3 * c2.x - p2.x + 3 * c1.x - p1.x) / 4;
    var y = (3 * c2.y - p2.y + 3 * c1.y - p1.y) / 4;
    return [
        p1,
        {
            x: x,
            y: y
        },
        p2
    ];
}
function bezierCubic2Q2(p1, c1, c2, p2) {
    var mx = p2.x - 3 * c2.x + 3 * c1.x - p1.x;
    var my = p2.y - 3 * c2.y + 3 * c1.y - p1.y;
    if (mx * mx + my * my <= 4) {
        return [toQuad(p1, c1, c2, p2)];
    }
    var mp = {
        x: (p2.x + 3 * c2.x + 3 * c1.x + p1.x) / 8,
        y: (p2.y + 3 * c2.y + 3 * c1.y + p1.y) / 8
    };
    return [
        toQuad(p1, {
            x: (p1.x + c1.x) / 2,
            y: (p1.y + c1.y) / 2
        }, {
            x: (p1.x + 2 * c1.x + c2.x) / 4,
            y: (p1.y + 2 * c1.y + c2.y) / 4
        }, mp),
        toQuad(mp, {
            x: (p2.x + c1.x + 2 * c2.x) / 4,
            y: (p2.y + c1.y + 2 * c2.y) / 4
        }, {
            x: (p2.x + c2.x) / 2,
            y: (p2.y + c2.y) / 2
        }, p2)
    ];
}
module.exports = bezierCubic2Q2;