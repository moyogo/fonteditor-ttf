var Writer = require('./writer');
var Directory = require('./table/directory');
var supportTables = require('./table/support');
var checkSum = require('./util/checkSum');
var error = require('./error');
var reduceGlyf = require('./util/reduceGlyf');
var pathCeil = require('../graphics/pathCeil');
var tableList = [
    'OS/2',
    'cmap',
    'glyf',
    'head',
    'hhea',
    'hmtx',
    'loca',
    'maxp',
    'name',
    'post'
];
function resolve(ttf) {
    ttf.version = ttf.version || 1;
    ttf.numTables = tableList.length;
    ttf.entrySelector = Math.floor(Math.log(tableList.length) / Math.LN2);
    ttf.searchRange = Math.pow(2, ttf.entrySelector) * 16;
    ttf.rangeShift = tableList.length * 16 - ttf.searchRange;
    ttf.head.checkSumAdjustment = 0;
    ttf.head.magickNumber = 1594834165;
    if (typeof ttf.head.created === 'string') {
        ttf.head.created = /^\d+$/.test(ttf.head.created) ? +ttf.head.created : Date.parse(ttf.head.created);
    }
    ttf.head.modified = Date.now();
    if (!ttf.glyf || ttf.glyf.length === 0) {
        error.raise(10201);
    }
    var checkUnicodeRepeat = {};
    ttf.glyf.forEach(function (glyf, index) {
        if (glyf.unicode) {
            glyf.unicode = glyf.unicode.sort();
            glyf.unicode.forEach(function (u) {
                if (checkUnicodeRepeat[u]) {
                    error.raise(10200, index);
                } else {
                    checkUnicodeRepeat[u] = true;
                }
            });
        }
        if (!glyf.compound && glyf.contours) {
            glyf.contours.forEach(function (contour) {
                pathCeil(contour);
            });
            reduceGlyf(glyf);
        }
        glyf.xMin = Math.round(glyf.xMin || 0);
        glyf.xMax = Math.round(glyf.xMax || 0);
        glyf.yMin = Math.round(glyf.yMin || 0);
        glyf.yMax = Math.round(glyf.yMax || 0);
        glyf.leftSideBearing = Math.round(glyf.leftSideBearing || 0);
        glyf.advanceWidth = Math.round(glyf.advanceWidth || 0);
    });
}
function write(ttf) {
    ttf.support = {};
    var ttfSize = 12 + tableList.length * 16;
    var ttfHeadOffset = 0;
    ttf.support.tables = [];
    tableList.forEach(function (tableName) {
        var offset = ttfSize;
        var tableSize = new supportTables[tableName]().size(ttf);
        var size = tableSize;
        if (tableName === 'head') {
            ttfHeadOffset = offset;
        }
        if (size % 4) {
            size += 4 - size % 4;
        }
        ttf.support.tables.push({
            name: tableName,
            checkSum: 0,
            offset: offset,
            length: tableSize,
            size: size
        });
        ttfSize += size;
    });
    var writer = new Writer(new ArrayBuffer(ttfSize));
    writer.writeFixed(ttf.version);
    writer.writeUint16(ttf.numTables);
    writer.writeUint16(ttf.searchRange);
    writer.writeUint16(ttf.entrySelector);
    writer.writeUint16(ttf.rangeShift);
    !new Directory().write(writer, ttf);
    ttf.support.tables.forEach(function (table) {
        var tableStart = writer.offset;
        !new supportTables[table.name]().write(writer, ttf);
        if (table.length % 4) {
            writer.writeEmpty(4 - table.length % 4);
        }
        table.checkSum = checkSum(writer.getBuffer(), tableStart, table.size);
    });
    ttf.support.tables.forEach(function (table, index) {
        var offset = 12 + index * 16 + 4;
        writer.writeUint32(table.checkSum, offset);
    });
    var ttfCheckSum = (2981146554 - checkSum(writer.getBuffer()) + 4294967296) % 4294967296;
    writer.writeUint32(ttfCheckSum, ttfHeadOffset + 8);
    delete ttf.support;
    var buffer = writer.getBuffer();
    writer.dispose();
    return buffer;
}
function TTFWriter() {
}
TTFWriter.prototype.write = function (ttf) {
    resolve.call(this, ttf);
    var buffer = write.call(this, ttf);
    return buffer;
};
TTFWriter.prototype.dispose = function () {
};
module.exports = TTFWriter;