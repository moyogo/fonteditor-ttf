function multi(matrix, a) {
    return matrix.map(function (item) {
        return item * a;
    });
}
function minus(matrix1, matrix2) {
    return matrix1.map(function (item, index) {
        return item - matrix2[index];
    });
}
function plus(matrix1, matrix2) {
    return matrix1.map(function (item, index) {
        return item + matrix2[index];
    });
}
module.exports = {
    multi: multi,
    minus: minus,
    plus: plus
};