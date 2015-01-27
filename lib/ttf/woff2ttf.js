var Reader = require('./reader');
var Writer = require('./writer');
var error = require('./error');
function woff2ttf(woffBuffer, options) {
    options = options || {};
    var reader = new Reader(woffBuffer);
    var signature = reader.readUint32(0);
    var flavor = reader.readUint32(4);
    if (signature !== 2001684038 || flavor !== 65536) {
        reader.dispose();
        error.raise(10102);
    }
    var numTables = reader.readUint16(12);
    var ttfSize = reader.readUint32(16);
    var tableEntries = [];
    var tableEntry;
    var i;
    var l;
    for (i = 0; i < numTables; ++i) {
        reader.seek(44 + i * 20);
        tableEntry = {
            tag: reader.readString(reader.offset, 4),
            offset: reader.readUint32(),
            compLength: reader.readUint32(),
            length: reader.readUint32(),
            checkSum: reader.readUint32()
        };
        var deflateData = reader.readBytes(tableEntry.offset, tableEntry.compLength);
        if (deflateData.length < tableEntry.length) {
            if (!options.inflate) {
                reader.dispose();
                error.raise(10105);
            }
            tableEntry.data = options.inflate(deflateData);
        } else {
            tableEntry.data = deflateData;
        }
        tableEntry.length = tableEntry.data.length;
        tableEntries.push(tableEntry);
    }
    var writer = new Writer(new ArrayBuffer(ttfSize));
    var entrySelector = Math.floor(Math.log(numTables) / Math.LN2);
    var searchRange = Math.pow(2, entrySelector) * 16;
    var rangeShift = numTables * 16 - searchRange;
    writer.writeFixed(1);
    writer.writeUint16(numTables);
    writer.writeUint16(searchRange);
    writer.writeUint16(entrySelector);
    writer.writeUint16(rangeShift);
    var tblOffset = 12 + 16 * tableEntries.length;
    for (i = 0, l = tableEntries.length; i < l; ++i) {
        tableEntry = tableEntries[i];
        writer.writeString(tableEntry.tag);
        writer.writeUint32(tableEntry.checkSum);
        writer.writeUint32(tblOffset);
        writer.writeUint32(tableEntry.length);
        tblOffset += tableEntry.length + (tableEntry.length % 4 ? 4 - tableEntry.length % 4 : 0);
    }
    for (i = 0, l = tableEntries.length; i < l; ++i) {
        tableEntry = tableEntries[i];
        writer.writeBytes(tableEntry.data);
        if (tableEntry.length % 4) {
            writer.writeEmpty(4 - tableEntry.length % 4);
        }
    }
    return writer.getBuffer();
}
module.exports = woff2ttf;