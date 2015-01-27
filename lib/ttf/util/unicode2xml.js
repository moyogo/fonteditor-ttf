var string = require('../../common/string');
function unicode2xml(unicodeList) {
    if (typeof unicodeList === 'number') {
        unicodeList = [unicodeList];
    }
    return unicodeList.map(function (u) {
        if (u < 32) {
            return '';
        }
        return u >= 32 && u <= 255 ? string.encodeHTML(String.fromCharCode(u).toLowerCase()) : '&#x' + u.toString(16) + ';';
    }).join('');
}
module.exports = unicode2xml;