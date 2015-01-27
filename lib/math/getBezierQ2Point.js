function getPoint(p0, p1, p2, t) {
    return {
        x: p0.x * Math.pow(1 - t, 2) + 2 * p1.x * t * (1 - t) + p2.x * Math.pow(t, 2),
        y: p0.y * Math.pow(1 - t, 2) + 2 * p1.y * t * (1 - t) + p2.y * Math.pow(t, 2)
    };
}
module.exports = getPoint;