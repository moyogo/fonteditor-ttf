var bytes2base64 = require('./util/bytes2base64');
function eot2base64(arrayBuffer) {
    return 'data:font/eot;charset=utf-8;base64,' + bytes2base64(arrayBuffer);
}
module.exports = eot2base64;