var table = require('./table');
var struct = require('./struct');
var string = require('../util/string');
var unicodeName = require('../enum/unicodeName');
var Posthead = table.create('posthead', [
    [
        'format',
        struct.Fixed
    ],
    [
        'italicAngle',
        struct.Fixed
    ],
    [
        'underlinePosition',
        struct.Int16
    ],
    [
        'underlineThickness',
        struct.Int16
    ],
    [
        'isFixedPitch',
        struct.Uint32
    ],
    [
        'minMemType42',
        struct.Uint32
    ],
    [
        'maxMemType42',
        struct.Uint32
    ],
    [
        'minMemType1',
        struct.Uint32
    ],
    [
        'maxMemType1',
        struct.Uint32
    ],
    [
        'numberOfGlyphs',
        struct.Uint16
    ]
]);
var post = table.create('post', [], {
    read: function (reader, ttf) {
        var tbl = null;
        var format = reader.readFixed(this.offset);
        if (format === 2) {
            tbl = new Posthead(this.offset).read(reader, ttf);
            tbl.format = format;
            var numberOfGlyphs = ttf.maxp.numGlyphs;
            var glyphNameIndex = [];
            for (var i = 0; i < numberOfGlyphs; ++i) {
                glyphNameIndex.push(reader.readUint16());
            }
            var pascalStringOffset = reader.offset;
            var pascalStringLength = ttf.tables.post.length - (pascalStringOffset - this.offset);
            var pascalStringBytes = reader.readBytes(reader.offset, pascalStringLength);
            tbl.glyphNameIndex = glyphNameIndex;
            tbl.names = string.readPascalString(pascalStringBytes);
        } else {
            tbl = { format: format };
        }
        return tbl;
    },
    write: function (writer, ttf) {
        var numberOfGlyphs = ttf.glyf.length;
        var post = ttf.post || {};
        writer.writeFixed(2);
        writer.writeFixed(post.italicAngle || 0);
        writer.writeInt16(post.underlinePosition || 0);
        writer.writeInt16(post.underlineThickness || 0);
        writer.writeUint32(post.isFixedPitch || 0);
        writer.writeUint32(post.minMemType42 || 0);
        writer.writeUint32(post.maxMemType42 || 0);
        writer.writeUint32(post.minMemType1 || 0);
        writer.writeUint32(post.maxMemType1 || 0);
        writer.writeUint16(numberOfGlyphs);
        var nameIndexs = ttf.support.post.nameIndexs;
        for (var i = 0, l = nameIndexs.length; i < l; i++) {
            writer.writeUint16(nameIndexs[i]);
        }
        ttf.support.post.glyphNames.forEach(function (name) {
            writer.writeBytes(name);
        });
    },
    size: function (ttf) {
        var numberOfGlyphs = ttf.glyf.length;
        var glyphNames = [];
        var nameIndexs = [];
        var size = 34 + numberOfGlyphs * 2;
        var nameIndex = 0;
        for (var i = 0; i < numberOfGlyphs; i++) {
            if (i === 0) {
                nameIndexs.push(0);
            } else {
                var glyf = ttf.glyf[i];
                var unicode = glyf.unicode ? glyf.unicode[0] : 0;
                var unicodeNameIndex = unicodeName[unicode];
                if (undefined !== unicodeNameIndex) {
                    nameIndexs.push(unicodeNameIndex);
                } else {
                    var name = glyf.name;
                    if (!name || name.charCodeAt(0) < 32) {
                        name = string.getUnicodeName(unicode);
                    }
                    nameIndexs.push(258 + nameIndex++);
                    var bytes = string.getPascalStringBytes(name);
                    glyphNames.push(bytes);
                    size += bytes.length;
                }
            }
        }
        ttf.post = ttf.post || {};
        ttf.post.format = ttf.post.format || 2;
        ttf.post.maxMemType1 = numberOfGlyphs;
        ttf.support.post = {
            nameIndexs: nameIndexs,
            glyphNames: glyphNames
        };
        return size;
    }
});
module.exports = post;