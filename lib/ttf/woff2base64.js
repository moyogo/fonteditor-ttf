var bytes2base64 = require('./util/bytes2base64');
function woff2base64(arrayBuffer) {
    return 'data:font/woff;charset=utf-8;base64,' + bytes2base64(arrayBuffer);
}
module.exports = woff2base64;