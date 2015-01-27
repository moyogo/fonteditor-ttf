var quarticEquation = require('./quarticEquation');
function bezierQuarticEquation(a, b, c, d, e) {
    var result = quarticEquation(a, b, c, d, e);
    if (!result) {
        return result;
    }
    var filter = result.filter(function (item) {
        return item >= 0 && item <= 1;
    });
    return filter.length ? filter : false;
}
module.exports = bezierQuarticEquation;