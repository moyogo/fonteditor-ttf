var util = require('../pathUtil');
var deInterpolate = util.deInterpolate;
var Relation = require('./relation');
var MAX_COMBINE_PATHS = 50;
function hashcode(p0) {
    return p0.x * 31 + p0.y;
}
function getPathStartHash(paths) {
    var pathHash = {};
    var code;
    paths.forEach(function (splitedPath) {
        var path = splitedPath.path;
        code = hashcode(path[0]);
        if (!pathHash[code]) {
            pathHash[code] = [];
        }
        pathHash[code].push(splitedPath);
        code = hashcode(path[path.length - 1]);
        if (!pathHash[code]) {
            pathHash[code] = [];
        }
        pathHash[code].push(splitedPath);
    });
    return pathHash;
}
function pathCombine(splitedPaths0, splitedPaths1, relation) {
    var selectedPaths = [];
    [
        splitedPaths0,
        splitedPaths1
    ].forEach(function (splitedPaths) {
        for (var i = 0, l = splitedPaths.length; i < l; i++) {
            var splitedPath = splitedPaths[i];
            if (relation === Relation.join && splitedPaths[i].cross !== 1) {
                selectedPaths.push(splitedPath);
            } else if (relation === Relation.intersect && splitedPath.cross !== 0) {
                selectedPaths.push(splitedPath);
            } else if (relation === Relation.tangency) {
                selectedPaths.push(splitedPath);
            }
        }
    });
    var pathStartHash = getPathStartHash(selectedPaths);
    var startPaths = selectedPaths.filter(function (path) {
        if (relation === Relation.join || relation === Relation.tangency) {
            return path.cross === 0;
        } else if (relation === Relation.intersect) {
            return path.cross === 1;
        }
        return false;
    });
    var combinedPaths = [];
    var removePath = function (p, path) {
        var startPaths = pathStartHash[hashcode(p)];
        var index = startPaths.indexOf(path);
        if (index >= 0) {
            startPaths.splice(index, 1);
            if (!startPaths.length) {
                delete pathStartHash[hashcode(p)];
            }
        }
    };
    var curPath;
    while (curPath = startPaths.shift()) {
        var start = curPath.path[0];
        var end = curPath.path[curPath.path.length - 1];
        var combinedPath = curPath.path.slice(0, curPath.path.length - 1);
        var loops = 0;
        var paths;
        while (++loops < MAX_COMBINE_PATHS && (Math.abs(start.x - end.x) > 0.001 || Math.abs(start.y - end.y) > 0.001)) {
            paths = pathStartHash[hashcode(end)];
            if (!paths || !paths.length) {
                throw 'can\'t find paths to combine.';
            }
            var path = null;
            if (paths.length === 2 && paths[0] === curPath) {
                path = paths[1];
            } else if (paths.length === 2 && paths[1] === curPath) {
                path = paths[0];
            } else {
                var overlapPath;
                for (var i = 0, l = paths.length; i < l; i++) {
                    if (paths[i] !== curPath) {
                        if (paths[i].cross === 2 && curPath.origin !== paths[i].origin) {
                            overlapPath = paths[i];
                        } else if (relation === Relation.tangency && curPath.cross !== paths[i].cross && curPath.origin !== paths[i].origin) {
                            path = paths[i];
                            break;
                        } else if (relation === Relation.join && paths[i].cross === 0) {
                            path = paths[i];
                            break;
                        } else if (relation === Relation.intersect && paths[i].cross === 1) {
                            path = paths[i];
                            break;
                        }
                    }
                }
                if (!path) {
                    if (overlapPath) {
                        path = overlapPath;
                    } else {
                        break;
                    }
                }
            }
            var pathPoints = path.path.slice();
            if (Math.abs(end.x - path.path[0].x) > 0.001 || Math.abs(end.y - path.path[0].y) > 0.001) {
                pathPoints = pathPoints.reverse();
            }
            for (var ppIndex = 0, ppLength = pathPoints.length; ppIndex < ppLength; ppIndex++) {
                combinedPath.push(pathPoints[ppIndex]);
            }
            if (relation === Relation.tangency && path.cross === 2) {
            } else {
                removePath(path.path[0], path);
                removePath(end, path);
            }
            var index = startPaths.indexOf(path);
            if (index >= 0) {
                startPaths.splice(index, 1);
            }
            end = pathPoints[path.path.length - 1];
            curPath = path;
        }
        if (loops >= MAX_COMBINE_PATHS) {
            throw 'can\'t find paths to combine.';
        }
        combinedPaths.push(combinedPath);
    }
    if (combinedPaths.length) {
        return combinedPaths.map(function (path) {
            return deInterpolate(path);
        });
    }
    return [];
}
module.exports = pathCombine;