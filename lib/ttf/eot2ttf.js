var Reader = require('./reader');
var error = require('./error');
function eot2ttf(eotBuffer, options) {
    options = options || {};
    var eotReader = new Reader(eotBuffer, 0, eotBuffer.byteLength, true);
    var magicNumber = eotReader.readUint16(34);
    if (magicNumber !== 20556) {
        error.raise(10110);
    }
    var version = eotReader.readUint32(8);
    if (version !== 131073 && version !== 65536 && version !== 131074) {
        error.raise(10110);
    }
    var eotSize = eotBuffer.byteLength || eotBuffer.length;
    var fontSize = eotReader.readUint32(4);
    var fontOffset = 82;
    var familyNameSize = eotReader.readUint16(fontOffset);
    fontOffset += 4 + familyNameSize;
    var styleNameSize = eotReader.readUint16(fontOffset);
    fontOffset += 4 + styleNameSize;
    var versionNameSize = eotReader.readUint16(fontOffset);
    fontOffset += 4 + versionNameSize;
    var fullNameSize = eotReader.readUint16(fontOffset);
    fontOffset += 2 + fullNameSize;
    if (version === 131073 || version === 131074) {
        var rootStringSize = eotReader.readUint16(fontOffset + 2);
        fontOffset += 4 + rootStringSize;
    }
    if (version === 131074) {
        fontOffset += 10;
        var signatureSize = eotReader.readUint16(fontOffset);
        fontOffset += 2 + signatureSize;
        fontOffset += 4;
        var eudcFontSize = eotReader.readUint32(fontOffset);
        fontOffset += 4 + eudcFontSize;
    }
    if (fontOffset + fontSize > eotSize) {
        error.raise(10001);
    }
    if (eotBuffer.slice) {
        return eotBuffer.slice(fontOffset, fontOffset + fontSize);
    }
    var Writer = require('./writer');
    var bytes = eotReader.readBytes(fontOffset, fontSize);
    return new Writer(new ArrayBuffer(fontSize)).writeBytes(bytes).getBuffer();
}
module.exports = eot2ttf;