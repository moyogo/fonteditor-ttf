var isPointInBound = require('./util').isPointInBound;
function isBoundingBoxCross(b1, b2) {
    var b1lt = isPointInBound(b2, b1, true);
    var b1rt = isPointInBound(b2, {
        x: b1.x + b1.width,
        y: b1.y
    }, true);
    var b1lb = isPointInBound(b2, {
        x: b1.x,
        y: b1.y + b1.height
    }, true);
    var b1rb = isPointInBound(b2, {
        x: b1.x + b1.width,
        y: b1.y + b1.height
    }, true);
    if (b1lt && b1rt && b1lb && b1rb) {
        return 2;
    }
    var b2lt = isPointInBound(b1, b2, true);
    var b2rt = isPointInBound(b1, {
        x: b2.x + b2.width,
        y: b2.y
    }, true);
    var b2lb = isPointInBound(b1, {
        x: b2.x,
        y: b2.y + b2.height
    }, true);
    var b2rb = isPointInBound(b1, {
        x: b2.x + b2.width,
        y: b2.y + b2.height
    }, true);
    if (b2lt && b2rt && b2lb && b2rb) {
        return 3;
    }
    if (false === (b1lt || b1rt || b1lb || b1rb || b2lt || b2rt || b2lb || b2rb)) {
        if (b1.x > b2.x && b1.x < b2.x + b2.width || b1.y > b2.y && b1.y < b2.y + b2.height) {
            return 1;
        }
        return false;
    }
    return 1;
}
module.exports = isBoundingBoxCross;