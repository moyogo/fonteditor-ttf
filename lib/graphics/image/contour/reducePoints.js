/**
 * @file 消减点
 * @author mengke01(kekee000@gmail.com)
 */




        var douglasPeuckerReducePoints = require('../../../graphics/image/contour/douglasPeuckerReducePoints');
        var makeLink = require('../../../graphics/pathUtil').makeLink;
        var vector = require('../../../graphics/vector');
        var getCos = vector.getCos;


        /**
         * 消减非必要的点
         *
         * @param  {Array} contour 轮廓点集
         * @param  {number} firstIndex   起始索引
         * @param  {number} lastIndex    结束索引
         * @param  {number} scale    缩放级别
         * @param  {number} threshold    消减阈值，see `douglasPeuckerReducePoints`
         * @return {Array}  消减后的点集
         */
        function reducePoints(contour, firstIndex, lastIndex, scale, threshold) {
            var points = douglasPeuckerReducePoints(contour, firstIndex, lastIndex, scale, threshold);
            points = makeLink(points);

            var start = points[0];
            var tinyDist = 3 * scale;
            var rightAngle = Math.PI / 2;

            var cur = start;
            do {

                if (cur.visited) {
                    cur = cur.next;
                    continue;
                }

                if (Math.abs(cur.x - cur.next.x) <= tinyDist && Math.abs(cur.y - cur.next.y) <= tinyDist) {
                    var cos = getCos(
                        cur.x - cur.prev.x,
                        cur.y - cur.prev.y,
                        cur.next.next.x - cur.next.x,
                         cur.next.next.y - cur.next.y
                    );
                    var theta = Math.acos(cos > 1 ? 1 : cos);
                    // 小于直角则考虑移除点
                    if (theta < rightAngle) {
                        // 顶角
                        if (
                            cur.x >= cur.prev.x && cur.x >= cur.next.x
                            || cur.x <= cur.prev.x && cur.x <= cur.next.x
                            || cur.y >= cur.prev.y && cur.y >= cur.next.y
                            || cur.y <= cur.prev.y && cur.y <= cur.next.y

                        ) {
                            cur.next.deleted = true;
                        }
                        else {
                            cur.deleted = true;
                        }
                    }

                    cur.visited = cur.next.visited = true;
                }

                cur = cur.next;
            } while (cur !== start);

            return points.filter(function (p) {
                delete p.visited;
                return !p.deleted;
            });
        }

        module.exports = reducePoints;
    
