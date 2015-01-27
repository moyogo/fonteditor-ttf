var table = require('./table');
var nameIdTbl = require('../enum/nameId');
var string = require('../util/string');
var platformTbl = require('../enum/platform');
var encodingTbl = require('../enum/encoding');
var name = table.create('name', [], {
    read: function (reader) {
        var offset = this.offset;
        reader.seek(offset);
        var nameTbl = {};
        nameTbl.format = reader.readUint16();
        nameTbl.count = reader.readUint16();
        nameTbl.stringOffset = reader.readUint16();
        var nameRecordTbl = [];
        var count = nameTbl.count;
        var i;
        var nameRecord;
        for (i = 0; i < count; ++i) {
            nameRecord = {};
            nameRecord.platform = reader.readUint16();
            nameRecord.encoding = reader.readUint16();
            nameRecord.language = reader.readUint16();
            nameRecord.nameId = reader.readUint16();
            nameRecord.length = reader.readUint16();
            nameRecord.offset = reader.readUint16();
            nameRecordTbl.push(nameRecord);
        }
        offset = offset + nameTbl.stringOffset;
        for (i = 0; i < count; ++i) {
            nameRecord = nameRecordTbl[i];
            nameRecord.name = reader.readString(offset + nameRecord.offset, nameRecord.length);
        }
        var names = {};
        var platform = platformTbl.Microsoft;
        var encoding = encodingTbl.win.UCS2;
        for (i = 0; i < count; ++i) {
            nameRecord = nameRecordTbl[i];
            if (nameRecord.platform === platform && nameRecord.encoding === encoding && nameIdTbl[nameRecord.nameId]) {
                names[nameIdTbl[nameRecord.nameId]] = string.stringify(nameRecord.name);
            }
        }
        return names;
    },
    write: function (writer, ttf) {
        var nameRecordTbl = ttf.support.name;
        writer.writeUint16(0);
        writer.writeUint16(nameRecordTbl.length);
        writer.writeUint16(6 + nameRecordTbl.length * 12);
        var offset = 0;
        nameRecordTbl.forEach(function (nameRecord) {
            writer.writeUint16(nameRecord.platform);
            writer.writeUint16(nameRecord.encoding);
            writer.writeUint16(nameRecord.language);
            writer.writeUint16(nameRecord.nameId);
            writer.writeUint16(nameRecord.name.length);
            writer.writeUint16(offset);
            offset += nameRecord.name.length;
        });
        nameRecordTbl.forEach(function (nameRecord) {
            writer.writeBytes(nameRecord.name);
        });
        return writer;
    },
    size: function (ttf) {
        var names = ttf.name;
        var nameRecordTbl = [];
        var size = 6;
        Object.keys(names).forEach(function (name) {
            var id = nameIdTbl.names[name];
            var utf8Bytes = string.toUTF8Bytes(names[name]);
            var usc2Bytes = string.toUCS2Bytes(names[name]);
            if (undefined !== id) {
                nameRecordTbl.push({
                    nameId: id,
                    platform: 1,
                    encoding: 0,
                    language: 0,
                    name: utf8Bytes
                });
                nameRecordTbl.push({
                    nameId: id,
                    platform: 3,
                    encoding: 1,
                    language: 1033,
                    name: usc2Bytes
                });
                size += 12 * 2 + utf8Bytes.length + usc2Bytes.length;
            }
        });
        var namingOrder = [
            'platform',
            'encoding',
            'language',
            'nameId'
        ];
        nameRecordTbl = nameRecordTbl.sort(function (a, b) {
            var l = 0;
            namingOrder.some(function (name) {
                var o = a[name] - b[name];
                if (o) {
                    l = o;
                    return true;
                }
            });
            return l;
        });
        ttf.support.name = nameRecordTbl;
        return size;
    }
});
module.exports = name;