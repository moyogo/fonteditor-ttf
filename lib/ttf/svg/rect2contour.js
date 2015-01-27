function rect2contour(x, y, width, height) {
    x = +x;
    y = +y;
    width = +width;
    height = +height;
    return [
        {
            x: x,
            y: y,
            onCurve: true
        },
        {
            x: x + width,
            y: y,
            onCurve: true
        },
        {
            x: x + width,
            y: y + height,
            onCurve: true
        },
        {
            x: x,
            y: y + height,
            onCurve: true
        }
    ];
}
module.exports = rect2contour;