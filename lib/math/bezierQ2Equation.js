/**
 * @file 求解二次方程贝塞尔根
 * @author mengke01(kekee000@gmail.com)
 */



        var quadraticEquation = require('./quadraticEquation');

        /**
         * 求解二次方程贝塞尔根
         *
         * @param {number} a a系数
         * @param {number} b b系数
         * @param {number} c c系数
         * @return {Array|boolean} 系数解
         */
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
    
