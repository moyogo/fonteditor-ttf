function getAngle(x1, y1, x2, y2) {
    var angle = Math.acos((x1 * x2 + y1 * y2) / Math.sqrt(x1 * x1 + y1 * y1) / Math.sqrt(x2 * x2 + y2 * y2));
    if (x1 * y2 - x2 * y1 < 0) {
        angle = 2 * Math.PI - angle;
    }
    return angle;
}
module.exports = getAngle;