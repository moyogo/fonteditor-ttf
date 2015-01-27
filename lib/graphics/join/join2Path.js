var isPathCross = require('../isPathCross');
var isInsidePath = require('../isInsidePath');
var isPathOverlap = require('../isPathOverlap');
var reducePath = require('../reducePath');
var getBezierQ2Point = require('../../math/getBezierQ2Point');
var Relation = require('./relation');
var util = require('../pathUtil');
var interpolate = util.interpolate;
var pathSplit = require('./pathSplit');
var pathCombine = require('./pathCombine');
var getVirtualJoint = require('./getVirtualJoint');
function getPathCross(path0, path1) {
    if (isPathOverlap(path0, path1)) {
        return 2;
    }
    var inPath = isInsidePath(path1, path0[1].onCurve ? {
        x: (path0[0].x + path0[1].x) / 2,
        y: (path0[0].y + path0[1].y) / 2
    } : getBezierQ2Point(path0[0], path0[1], path0[2], 0.5));
    return inPath ? 1 : 0;
}
function join2Path(path0, path1, relation) {
    var direction0 = util.isClockWise(path0);
    var direction1 = util.isClockWise(path1);
    if (2 === isPathOverlap(path0, path1)) {
        if ((relation === Relation.join || relation === Relation.intersect) && direction0 === direction1) {
            return [path0];
        }
        return [];
    }
    var newPath0 = interpolate(reducePath(path0));
    var newPath1 = interpolate(reducePath(path1));
    var joint = isPathCross(newPath0, newPath1);
    if (joint) {
        var virtualJoint = getVirtualJoint(newPath0, newPath1, joint);
        if (virtualJoint.inCount === joint.length) {
            joint = 3;
        } else if (virtualJoint.outCount === joint.length) {
            joint = 2;
        }
    }
    var splitedPaths0;
    var splitedPaths1;
    var getJoinedPath = function (joint) {
        splitedPaths0 = pathSplit(newPath0, joint.map(function (p) {
            p.index = p.index0;
            return p;
        }));
        var inPath = false;
        var inPathBefore = -1;
        var onlyPointCross = false;
        var isOverlap = false;
        splitedPaths0 = splitedPaths0.map(function (path) {
            var splited = {};
            splited.path = path;
            splited.cross = getPathCross(path, path1);
            splited.direction = direction0;
            splited.origin = path0;
            if (splited.cross) {
                inPath = true;
            }
            if (2 === splited.cross) {
                isOverlap = true;
            }
            if (inPathBefore === splited.cross && 0 === inPathBefore) {
                onlyPointCross = true;
            }
            inPathBefore = splited.cross;
            return splited;
        });
        if (!inPath) {
            if (relation === Relation.join || relation === Relation.tangency) {
                return [
                    path0,
                    path1
                ];
            } else if (relation === Relation.intersect) {
                return [];
            }
        }
        splitedPaths1 = pathSplit(newPath1, joint.map(function (p) {
            p.index = p.index1;
            return p;
        }));
        if (onlyPointCross) {
            return [
                path0,
                path1
            ];
        }
        if (!isOverlap) {
            var isCross = getPathCross(splitedPaths1[0], path0);
            splitedPaths1 = splitedPaths1.map(function (path) {
                var splited = {};
                splited.path = path;
                splited.cross = isCross ? 1 : 0;
                splited.direction = direction1;
                splited.origin = newPath1;
                isCross = !isCross;
                return splited;
            });
        } else {
            splitedPaths1 = splitedPaths1.map(function (path) {
                var splited = {};
                splited.path = path;
                splited.cross = getPathCross(path, path0);
                splited.direction = direction1;
                splited.origin = newPath1;
                return splited;
            });
        }
        if (relation === Relation.join && direction0 !== direction1) {
            relation = Relation.tangency;
        }
        if (relation === Relation.intersect && direction0 !== direction1) {
            return [];
        }
        splitedPaths0.direction = direction0;
        splitedPaths1.direction = direction1;
        return pathCombine(splitedPaths0, splitedPaths1, relation);
    };
    if (relation === Relation.join || relation === Relation.tangency) {
        if (!joint) {
            return [
                path0,
                path1
            ];
        } else if (joint === 2) {
            if (direction0 === direction1) {
                return [path0];
            }
            return [
                path0,
                path1
            ];
        } else if (joint === 3) {
            if (direction0 === direction1) {
                return [path1];
            }
            return [
                path0,
                path1
            ];
        }
        return getJoinedPath(joint);
    } else if (relation === Relation.intersect) {
        if (!joint) {
            return [];
        } else if (joint === 2) {
            if (direction0 === direction1) {
                return [path1];
            }
            return [];
        } else if (joint === 3) {
            if (direction0 === direction1) {
                return [path0];
            }
            return [];
        }
        return getJoinedPath(joint);
    }
    return [
        path0,
        path1
    ];
}
module.exports = join2Path;