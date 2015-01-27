var getJoint = require('./getJoint');
module.exports = function (path, p0, p1, i) {
    return getJoint(path, 'L', p0, p1, 0, i || 0);
};