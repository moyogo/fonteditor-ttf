var contour2svg = require('./contour2svg');
function contours2svg(contours) {
    if (!contours.length) {
        return '';
    }
    return contours.map(function (contour) {
        return contour2svg(contour);
    }).join('');
}
module.exports = contours2svg;