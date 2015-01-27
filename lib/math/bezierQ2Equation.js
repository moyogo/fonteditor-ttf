var quadraticEquation = require('./quadraticEquation');
function bezierQ2Equation(a, b, c) {
    var result = quadraticEquation(a, b, c);
    if (!result) {
        return result;
    }
    var filter = result.filter(function (item) {
        return item >= 0 && item <= 1;
    });
    return filter.length ? filter : false;
}
module.exports = bezierQ2Equation;