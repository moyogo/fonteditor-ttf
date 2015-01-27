var SEGMENT_REGEX = /\-?\d+(?:\.\d+)?\b/g;
function getSegment(d) {
    return +d.trim();
}
module.exports = function (str) {
    if (!str) {
        return [];
    }
    var matchs = str.match(SEGMENT_REGEX);
    return matchs ? matchs.map(getSegment) : [];
};