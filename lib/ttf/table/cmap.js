var table = require('./table');
var readWindowsAllCodes = require('../util/readWindowsAllCodes');
var cmapWriter = require('./cmapwriter');
function readSubTable(reader, ttf, subTable, cmapOffset) {
    var i;
    var l;
    var glyphIdArray;
    var startOffset = cmapOffset + subTable.offset;
    subTable.format = reader.readUint16(startOffset);
    if (subTable.format === 0) {
        var format0 = subTable;
        format0.length = reader.readUint16();
        format0.language = reader.readUint16();
        glyphIdArray = [];
        for (i = 0, l = format0.length - 6; i < l; i++) {
            glyphIdArray.push(reader.readUint8());
        }
        format0.glyphIdArray = glyphIdArray;
    } else if (subTable.format === 4) {
        var format4 = subTable;
        format4.length = reader.readUint16();
        format4.language = reader.readUint16();
        format4.segCountX2 = reader.readUint16();
        format4.searchRange = reader.readUint16();
        format4.entrySelector = reader.readUint16();
        format4.rangeShift = reader.readUint16();
        var segCount = format4.segCountX2 / 2;
        var endCode = [];
        for (i = 0; i < segCount; ++i) {
            endCode.push(reader.readUint16());
        }
        format4.endCode = endCode;
        format4.reservedPad = reader.readUint16();
        var startCode = [];
        for (i = 0; i < segCount; ++i) {
            startCode.push(reader.readUint16());
        }
        format4.startCode = startCode;
        var idDelta = [];
        for (i = 0; i < segCount; ++i) {
            idDelta.push(reader.readUint16());
        }
        format4.idDelta = idDelta;
        format4.idRangeOffsetOffset = reader.offset;
        var idRangeOffset = [];
        for (i = 0; i < segCount; ++i) {
            idRangeOffset.push(reader.readUint16());
        }
        format4.idRangeOffset = idRangeOffset;
        var glyphCount = (format4.length - (reader.offset - startOffset)) / 2;
        format4.glyphIdArrayOffset = reader.offset;
        glyphIdArray = [];
        for (i = 0; i < glyphCount; ++i) {
            glyphIdArray.push(reader.readUint16());
        }
        format4.glyphIdArray = glyphIdArray;
    } else if (subTable.format === 6) {
        var format6 = subTable;
        format6.length = reader.readUint16();
        format6.language = reader.readUint16();
        format6.firstCode = reader.readUint16();
        format6.entryCount = reader.readUint16();
        format6.glyphIdArrayOffset = reader.offset;
        var glyphIndexArray = [];
        var entryCount = format6.entryCount;
        for (i = 0; i < entryCount; ++i) {
            glyphIndexArray.push(reader.readUint16());
        }
        format6.glyphIdArray = glyphIndexArray;
    } else if (subTable.format === 12) {
        var format12 = subTable;
        format12.reserved = reader.readUint16();
        format12.length = reader.readUint32();
        format12.language = reader.readUint32();
        format12.nGroups = reader.readUint32();
        var groups = [];
        var nGroups = format12.nGroups;
        for (i = 0; i < nGroups; ++i) {
            var group = {};
            group.start = reader.readUint32();
            group.end = reader.readUint32();
            group.startId = reader.readUint32();
            groups.push(group);
        }
        format12.groups = groups;
    } else {
        throw 'not support cmap format:' + subTable.format;
    }
}
var cmap = table.create('cmap', [], {
    read: function (reader, ttf) {
        var tcmap = {};
        var cmapOffset = this.offset;
        reader.seek(cmapOffset);
        tcmap.version = reader.readUint16();
        var numberSubtables = tcmap.numberSubtables = reader.readUint16();
        var subTables = tcmap.tables = [];
        var offset = reader.offset;
        for (var i = 0, l = numberSubtables; i < l; i++) {
            var subTable = {};
            subTable.platformID = reader.readUint16(offset);
            subTable.encodingID = reader.readUint16(offset + 2);
            subTable.offset = reader.readUint32(offset + 4);
            readSubTable(reader, ttf, subTable, cmapOffset);
            subTables.push(subTable);
            offset += 8;
        }
        var cmap = readWindowsAllCodes(subTables);
        return cmap;
    },
    write: cmapWriter.write,
    size: cmapWriter.size
});
module.exports = cmap;