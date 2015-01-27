var getJoint = require('./getJoint');
var pathIterator = require('../pathIterator');
function getPathJoint(path0, path1) {
    var joint = [];
    var result;
    pathIterator(path0, function (c, p0, p1, p2, i) {
        if (c === 'L') {
            result = getJoint(path1, 'L', p0, p1, 0, i);
        } else if (c === 'Q') {
            result = getJoint(path1, 'Q', p0, p1, p2, i);
        }
        if (result) {
            joint = joint.concat(result);
        }
    });
    return joint.length ? joint : false;
}
module.exports = getPathJoint;