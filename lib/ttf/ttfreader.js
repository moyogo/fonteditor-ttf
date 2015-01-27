var Directory = require('./table/directory');
var supportTables = require('./table/support');
var Reader = require('./reader');
var postName = require('./enum/postName');
var error = require('./error');
function read(buffer) {
    var reader = new Reader(buffer, 0, buffer.byteLength, false);
    var ttf = {};
    ttf.version = reader.readFixed(0);
    if (ttf.version !== 1) {
        error.raise(10101);
    }
    ttf.numTables = reader.readUint16();
    if (ttf.numTables <= 0 || ttf.numTables > 100) {
        error.raise(10101);
    }
    ttf.searchRenge = reader.readUint16();
    ttf.entrySelector = reader.readUint16();
    ttf.rengeShift = reader.readUint16();
    ttf.tables = new Directory(reader.offset).read(reader, ttf);
    if (!ttf.tables.glyf || !ttf.tables.head || !ttf.tables.cmap || !ttf.tables.hmtx) {
        error.raise(10204);
    }
    Object.keys(supportTables).forEach(function (tableName) {
        if (ttf.tables[tableName]) {
            var offset = ttf.tables[tableName].offset;
            ttf[tableName] = new supportTables[tableName](offset).read(reader, ttf);
        }
    });
    if (!ttf.glyf) {
        error.raise(10201);
    }
    reader.dispose();
    return ttf;
}
function resolveGlyf(ttf) {
    var codes = ttf.cmap;
    var glyf = ttf.glyf;
    Object.keys(codes).forEach(function (c) {
        var i = codes[c];
        if (!glyf[i].unicode) {
            glyf[i].unicode = [];
        }
        glyf[i].unicode.push(+c);
    });
    ttf.hmtx.forEach(function (item, i) {
        glyf[i].advanceWidth = item.advanceWidth;
        glyf[i].leftSideBearing = item.leftSideBearing;
    });
    if (ttf.post && 2 === ttf.post.format) {
        var nameIndex = ttf.post.glyphNameIndex;
        var names = ttf.post.names;
        nameIndex.forEach(function (nameIndex, i) {
            if (nameIndex <= 257) {
                glyf[i].name = postName[nameIndex];
            } else {
                glyf[i].name = names[nameIndex - 258] || '';
            }
        });
    }
}
function cleanTables(ttf) {
    delete ttf.tables;
    delete ttf.DSIG;
    delete ttf.GDEF;
    delete ttf.GPOS;
    delete ttf.GSUB;
    delete ttf.gasp;
    delete ttf.hmtx;
    delete ttf.loca;
    delete ttf.post.glyphNameIndex;
    delete ttf.post.names;
    delete ttf.maxp;
}
function TTFReader() {
}
TTFReader.prototype.read = function (buffer) {
    this.ttf = read.call(this, buffer);
    resolveGlyf.call(this, this.ttf);
    cleanTables.call(this, this.ttf);
    return this.ttf;
};
TTFReader.prototype.dispose = function () {
    delete this.ttf;
};
module.exports = TTFReader;