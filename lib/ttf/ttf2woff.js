var Reader = require('./reader');
var Writer = require('./writer');
var string = require('../common/string');
var error = require('./error');
function metadata2xml(metadata) {
    var xml = '' + '<?xml version="1.0" encoding="UTF-8"?>' + '<metadata version="1.0">';
    metadata.uniqueid = metadata.uniqueid || 'fonteditor.' + Date.now();
    xml += '<uniqueid id="' + string.encodeHTML(metadata.uniqueid) + '" />';
    if (metadata.vendor) {
        xml += '<vendor name="' + string.encodeHTML(metadata.vendor.name) + '"' + ' url="' + string.encodeHTML(metadata.vendor.url) + '" />';
    }
    if (metadata.credit) {
        xml += '<credits>';
        var credits = metadata.credit instanceof Array ? metadata.credit : [metadata.credit];
        credits.forEach(function (credit) {
            xml += '<credit name="' + string.encodeHTML(credit.name) + '"' + ' url="' + string.encodeHTML(credit.url) + '"' + ' role="' + string.encodeHTML(credit.role || 'Contributor') + '" />';
        });
        xml += '</credits>';
    }
    if (metadata.description) {
        xml += '<description><text xml:lang="en">' + string.encodeHTML(metadata.description) + '</text></description>';
    }
    if (metadata.license) {
        xml += '<license url="' + string.encodeHTML(metadata.license.url) + '"' + ' id="' + string.encodeHTML(metadata.license.id) + '"><text xml:lang="en">';
        xml += string.encodeHTML(metadata.license.text);
        xml += '</text></license>';
    }
    if (metadata.copyright) {
        xml += '<copyright><text xml:lang="en">';
        xml += string.encodeHTML(metadata.copyright);
        xml += '</text></copyright>';
    }
    if (metadata.trademark) {
        xml += '<trademark><text xml:lang="en">' + string.encodeHTML(metadata.trademark) + '</text></trademark>';
    }
    if (metadata.licensee) {
        xml += '<licensee name="' + string.encodeHTML(metadata.licensee) + '"/>';
    }
    xml += '</metadata>';
    return xml;
}
function ttf2woff(ttfBuffer, options) {
    options = options || {};
    var woffHeader = {
        signature: 2001684038,
        flavor: 65536,
        length: 0,
        numTables: 0,
        reserved: 0,
        totalSfntSize: 0,
        majorVersion: 0,
        minorVersion: 0,
        metaOffset: 0,
        metaLength: 0,
        metaOrigLength: 0,
        privOffset: 0,
        privLength: 0
    };
    var ttfReader = new Reader(ttfBuffer);
    var tableEntries = [];
    var numTables = ttfReader.readUint16(4);
    var tableEntry;
    var deflatedData;
    var i;
    var l;
    if (numTables <= 0 || numTables > 100) {
        error.raise(10101);
    }
    ttfReader.seek(12);
    for (i = 0; i < numTables; ++i) {
        tableEntry = {
            tag: ttfReader.readString(ttfReader.offset, 4),
            checkSum: ttfReader.readUint32(),
            offset: ttfReader.readUint32(),
            length: ttfReader.readUint32()
        };
        var entryOffset = ttfReader.offset;
        if (tableEntry.tag === 'head') {
            woffHeader.majorVersion = ttfReader.readUint16(tableEntry.offset + 4);
            woffHeader.minorVersion = ttfReader.readUint16(tableEntry.offset + 6);
        }
        var sfntData = ttfReader.readBytes(tableEntry.offset, tableEntry.length);
        if (options.deflate) {
            deflatedData = options.deflate(sfntData);
            if (deflatedData.length < sfntData.length) {
                tableEntry.data = deflatedData;
                tableEntry.deflated = true;
            } else {
                tableEntry.data = sfntData;
            }
        } else {
            tableEntry.data = sfntData;
        }
        tableEntry.compLength = tableEntry.data.length;
        tableEntries.push(tableEntry);
        ttfReader.seek(entryOffset);
    }
    if (!tableEntries.length) {
        error.raise(10204);
    }
    tableEntries = tableEntries.sort(function (a, b) {
        return a.tag === b.tag ? 0 : a.tag < b.tag ? -1 : 1;
    });
    var woffSize = 44 + 20 * numTables;
    var ttfSize = 12 + 16 * numTables;
    for (i = 0, l = tableEntries.length; i < l; ++i) {
        tableEntry = tableEntries[i];
        tableEntry.offset = woffSize;
        woffSize += tableEntry.compLength + (tableEntry.compLength % 4 ? 4 - tableEntry.compLength % 4 : 0);
        ttfSize += tableEntry.length + (tableEntry.length % 4 ? 4 - tableEntry.length % 4 : 0);
    }
    var metadata = null;
    if (options.metadata) {
        var xml = require('./util/string').toUTF8Bytes(metadata2xml(options.metadata));
        if (options.deflate) {
            deflatedData = options.deflate(xml);
            if (deflatedData.length < xml.length) {
                metadata = deflatedData;
            } else {
                metadata = xml;
            }
        } else {
            metadata = xml;
        }
        woffHeader.metaLength = metadata.length;
        woffHeader.metaOrigLength = xml.length;
        woffHeader.metaOffset = woffSize;
        woffSize += woffHeader.metaLength + (woffHeader.metaLength % 4 ? 4 - woffHeader.metaLength % 4 : 0);
    }
    woffHeader.numTables = tableEntries.length;
    woffHeader.length = woffSize;
    woffHeader.totalSfntSize = ttfSize;
    var woffWriter = new Writer(new ArrayBuffer(woffSize));
    woffWriter.writeUint32(woffHeader.signature);
    woffWriter.writeUint32(woffHeader.flavor);
    woffWriter.writeUint32(woffHeader.length);
    woffWriter.writeUint16(woffHeader.numTables);
    woffWriter.writeUint16(woffHeader.reserved);
    woffWriter.writeUint32(woffHeader.totalSfntSize);
    woffWriter.writeUint16(woffHeader.majorVersion);
    woffWriter.writeUint16(woffHeader.minorVersion);
    woffWriter.writeUint32(woffHeader.metaOffset);
    woffWriter.writeUint32(woffHeader.metaLength);
    woffWriter.writeUint32(woffHeader.metaOrigLength);
    woffWriter.writeUint32(woffHeader.privOffset);
    woffWriter.writeUint32(woffHeader.privLength);
    for (i = 0, l = tableEntries.length; i < l; ++i) {
        tableEntry = tableEntries[i];
        woffWriter.writeString(tableEntry.tag);
        woffWriter.writeUint32(tableEntry.offset);
        woffWriter.writeUint32(tableEntry.compLength);
        woffWriter.writeUint32(tableEntry.length);
        woffWriter.writeUint32(tableEntry.checkSum);
    }
    for (i = 0, l = tableEntries.length; i < l; ++i) {
        tableEntry = tableEntries[i];
        woffWriter.writeBytes(tableEntry.data);
        if (tableEntry.compLength % 4) {
            woffWriter.writeEmpty(4 - tableEntry.compLength % 4);
        }
    }
    if (metadata) {
        woffWriter.writeBytes(metadata);
        if (woffHeader.metaLength % 4) {
            woffWriter.writeEmpty(4 - woffHeader.metaLength % 4);
        }
    }
    return woffWriter.getBuffer();
}
module.exports = ttf2woff;