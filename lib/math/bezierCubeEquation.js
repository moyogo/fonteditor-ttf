var cubeEquation = require('./cubeEquation');
function bezierCubeEquation(a, b, c, d) {
    var result = cubeEquation(a, b, c, d);
    if (!result) {
        return result;
    }
    var filter = result.filter(function (item) {
        return item >= 0 && item <= 1;
    });
    return filter.length ? filter : false;
}
module.exports = bezierCubeEquation;