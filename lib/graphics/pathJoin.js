var join2Path = require('./join/join2Path');
var Relation = require('./join/relation');
function pathJoin(paths, relation) {
    if (paths.length === 1) {
        if (relation === Relation.intersect) {
            return [];
        }
        return paths;
    } else if (paths.length === 2) {
        return join2Path(paths[0], paths[1], relation);
    }
    var startPaths = [paths[0]];
    var leftPath = paths.slice(1);
    var curPath;
    var joinFlag = 0;
    var putToResult = function (path) {
        path.joinFlag = (path.joinFlag || 0) + (1 << joinFlag);
        leftPath.push(path);
    };
    while (curPath = leftPath.shift()) {
        for (var i = 0, l = startPaths.length; i < l; i++) {
            if (curPath.joinFlag && startPaths[i].joinFlag && curPath.joinFlag & startPaths[i].joinFlag) {
                continue;
            }
            var result = join2Path(curPath, startPaths[i], relation);
            if (relation === Relation.intersect && !result.length) {
                return [];
            }
            if (result.length === 2 && result[0] === curPath && result[1] === startPaths[i]) {
                continue;
            } else {
                startPaths.splice(i, 1);
                joinFlag++;
                result.forEach(putToResult);
                break;
            }
        }
        if (i === l) {
            startPaths.push(curPath);
        } else if (!startPaths.length) {
            startPaths.push(leftPath.shift());
        }
    }
    return startPaths;
}
pathJoin.Relation = Relation;
module.exports = pathJoin;