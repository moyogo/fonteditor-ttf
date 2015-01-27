function boundAdjust(bound, scaleX, scaleY, offsetX, offsetY) {
    scaleX = scaleX === undefined ? 1 : scaleX;
    scaleY = scaleY === undefined ? 1 : scaleY;
    var x = offsetX || 0;
    var y = offsetY || 0;
    bound.x = scaleX * (bound.x + x);
    bound.y = scaleY * (bound.y + y);
    bound.width = scaleX * bound.width;
    bound.height = scaleY * bound.height;
    return bound;
}
module.exports = boundAdjust;