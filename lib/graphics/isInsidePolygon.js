/**
 * @file 判断点是否在polygon内部
 * @author mengke01(kekee000@gmail.com)
 */



        var isSegmentRayCross = require('./isSegmentRayCross');

        /**
         * 多边形包含判断, 射线法
         *
         * @param {Array.<Object>} points 多边形点
         * @param {Object} p 点
         * @return {boolean} 是否包含
         */
        function isInsidePolygon(points, p) {

            var zCount = 0;
            var p0;
            var p1;
            var result;
            for (var i = 0, l = points.length; i < l; i++) {
                p0 = points[i];
                p1 = points[i === l - 1 ? 0 : i + 1];

                if ((result = isSegmentRayCross(p0, p1, p))) {
                    // 在线段上
                    if (result.y === p.y) {
                        return true;
                    }
                    zCount += result.length;
                }
            }

            return !!(zCount % 2);
        }

        module.exports = isInsidePolygon;
    
