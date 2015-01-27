function encodeDelta(delta) {
    return delta > 32767 ? delta - 65536 : delta < -32767 ? delta + 65536 : delta;
}
function getSegments(glyfUnicodes, bound) {
    var prevGlyph = null;
    var result = [];
    var segment = {};
    glyfUnicodes.forEach(function (glyph) {
        if (bound === undefined || glyph.unicode <= bound) {
            if (prevGlyph === null || glyph.unicode !== prevGlyph.unicode + 1 || glyph.id !== prevGlyph.id + 1) {
                if (prevGlyph !== null) {
                    segment.end = prevGlyph.unicode;
                    result.push(segment);
                    segment = {
                        start: glyph.unicode,
                        startId: glyph.id,
                        delta: encodeDelta(glyph.id - glyph.unicode)
                    };
                } else {
                    segment.start = glyph.unicode;
                    segment.startId = glyph.id;
                    segment.delta = encodeDelta(glyph.id - glyph.unicode);
                }
            }
            prevGlyph = glyph;
        }
    });
    if (prevGlyph !== null) {
        segment.end = prevGlyph.unicode;
        result.push(segment);
    }
    return result;
}
function getFormat0Segment(glyfUnicodes) {
    var unicodes = [];
    glyfUnicodes.forEach(function (u) {
        if (u.unicode !== undefined && u.unicode < 256) {
            unicodes.push([
                u.unicode,
                u.id
            ]);
        }
    });
    unicodes.sort(function (a, b) {
        return a[0] - b[0];
    });
    return unicodes;
}
function writeSubTable0(writer, unicodes) {
    writer.writeUint16(0);
    writer.writeUint16(262);
    writer.writeUint16(0);
    var i = -1;
    var unicode;
    while (unicode = unicodes.shift()) {
        while (++i < unicode[0]) {
            writer.writeUint8(0);
        }
        writer.writeUint8(unicode[1]);
        i = unicode[0];
    }
    while (++i < 256) {
        writer.writeUint8(0);
    }
    return writer;
}
function writeSubTable4(writer, segments) {
    writer.writeUint16(4);
    writer.writeUint16(24 + segments.length * 8);
    writer.writeUint16(0);
    var segCount = segments.length + 1;
    var maxExponent = Math.floor(Math.log(segCount) / Math.LN2);
    var searchRange = 2 * Math.pow(2, maxExponent);
    writer.writeUint16(segCount * 2);
    writer.writeUint16(searchRange);
    writer.writeUint16(maxExponent);
    writer.writeUint16(2 * segCount - searchRange);
    segments.forEach(function (segment) {
        writer.writeUint16(segment.end);
    });
    writer.writeUint16(65535);
    writer.writeUint16(0);
    segments.forEach(function (segment) {
        writer.writeUint16(segment.start);
    });
    writer.writeUint16(65535);
    segments.forEach(function (segment) {
        writer.writeUint16(segment.delta);
    });
    writer.writeUint16(1);
    for (var i = 0, l = segments.length; i < l; i++) {
        writer.writeUint16(0);
    }
    writer.writeUint16(0);
    return writer;
}
function writeSubTable12(writer, segments) {
    writer.writeUint16(12);
    writer.writeUint16(0);
    writer.writeUint32(16 + segments.length * 12);
    writer.writeUint32(0);
    writer.writeUint32(segments.length);
    segments.forEach(function (segment) {
        writer.writeUint32(segment.start);
        writer.writeUint32(segment.end);
        writer.writeUint32(segment.startId);
    });
    return writer;
}
function writeSubTableHeader(writer, platform, encoding, offset) {
    writer.writeUint16(platform);
    writer.writeUint16(encoding);
    writer.writeUint32(offset);
    return writer;
}
var writer = {
    write: function (writer, ttf) {
        var hasGLyphsOver2Bytes = ttf.support.cmap.hasGLyphsOver2Bytes;
        writer.writeUint16(0);
        writer.writeUint16(hasGLyphsOver2Bytes ? 4 : 3);
        var subTableOffset = 4 + (hasGLyphsOver2Bytes ? 32 : 24);
        var format4Size = ttf.support.cmap.format4Size;
        var format0Size = ttf.support.cmap.format0Size;
        writeSubTableHeader(writer, 0, 3, subTableOffset);
        writeSubTableHeader(writer, 1, 0, subTableOffset + format4Size);
        writeSubTableHeader(writer, 3, 1, subTableOffset);
        if (hasGLyphsOver2Bytes) {
            writeSubTableHeader(writer, 3, 10, subTableOffset + format4Size + format0Size);
        }
        writeSubTable4(writer, ttf.support.cmap.format4Segments);
        writeSubTable0(writer, ttf.support.cmap.format0Segments);
        if (hasGLyphsOver2Bytes) {
            writeSubTable12(writer, ttf.support.cmap.format12Segments);
        }
        return writer;
    },
    size: function (ttf) {
        ttf.support.cmap = {};
        var glyfUnicodes = [];
        ttf.glyf.forEach(function (glyph, index) {
            var unicodes = glyph.unicode;
            if (typeof glyph.unicode === 'number') {
                unicodes = [glyph.unicode];
            }
            if (unicodes && unicodes.length) {
                unicodes.forEach(function (unicode) {
                    glyfUnicodes.push({
                        unicode: unicode,
                        id: unicode !== 65535 ? index : 0
                    });
                });
            }
        });
        glyfUnicodes = glyfUnicodes.sort(function (a, b) {
            return a.unicode - b.unicode;
        });
        ttf.support.cmap.unicodes = glyfUnicodes;
        var unicodes2Bytes = glyfUnicodes;
        ttf.support.cmap.format4Segments = getSegments(unicodes2Bytes, 65535);
        ttf.support.cmap.format4Size = 24 + ttf.support.cmap.format4Segments.length * 8;
        ttf.support.cmap.format0Segments = getFormat0Segment(glyfUnicodes);
        ttf.support.cmap.format0Size = 262;
        var hasGLyphsOver2Bytes = unicodes2Bytes.some(function (glyph) {
            return glyph.unicode > 65535;
        });
        if (hasGLyphsOver2Bytes) {
            ttf.support.cmap.hasGLyphsOver2Bytes = hasGLyphsOver2Bytes;
            var unicodes4Bytes = glyfUnicodes;
            ttf.support.cmap.format12Segments = getSegments(unicodes4Bytes);
            ttf.support.cmap.format12Size = 16 + ttf.support.cmap.format12Segments.length * 12;
        }
        var size = 4 + (hasGLyphsOver2Bytes ? 32 : 24) + ttf.support.cmap.format0Size + ttf.support.cmap.format4Size + (hasGLyphsOver2Bytes ? ttf.support.cmap.format12Size : 0);
        return size;
    }
};
module.exports = writer;