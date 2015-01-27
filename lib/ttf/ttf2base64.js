var bytes2base64 = require('./util/bytes2base64');
function ttf2base64(arrayBuffer) {
    return 'data:font/ttf;charset=utf-8;base64,' + bytes2base64(arrayBuffer);
}
module.exports = ttf2base64;