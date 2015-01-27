function bytes2base64(arrayBuffer) {
    var str = '';
    var length;
    var i;
    if (arrayBuffer instanceof ArrayBuffer) {
        length = arrayBuffer.byteLength;
        var view = new DataView(arrayBuffer, 0, length);
        for (i = 0; i < length; i++) {
            str += String.fromCharCode(view.getUint8(i, false));
        }
    } else if (arrayBuffer instanceof Array) {
        length = arrayBuffer.length;
        for (i = 0; i < length; i++) {
            str += String.fromCharCode(arrayBuffer[i]);
        }
    }
    return btoa(str);
}
module.exports = bytes2base64;