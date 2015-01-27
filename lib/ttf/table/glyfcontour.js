var glyFlag = require('../enum/glyFlag');
var table = require('./table');
var componentFlag = require('../enum/componentFlag');
var error = require('../error');
function readSimpleGlyf(reader, ttf, offset, glyf) {
    reader.seek(offset);
    var contoursCount = glyf.endPtsOfContours[glyf.endPtsOfContours.length - 1] + 1;
    var i;
    var length;
    var flags = [];
    var flag;
    i = 0;
    while (i < contoursCount) {
        flag = reader.readUint8();
        flags.push(flag);
        i++;
        if (flag & glyFlag.REPEAT && i < contoursCount) {
            var repeat = reader.readUint8();
            for (var j = 0; j < repeat; j++) {
                flags.push(flag);
                i++;
            }
        }
    }
    var coordinates = [];
    var xCoordinates = [];
    var prevX = 0;
    var x;
    for (i = 0, length = flags.length; i < length; ++i) {
        x = 0;
        flag = flags[i];
        if (flag & glyFlag.XSHORT) {
            x = reader.readUint8();
            x = flag & glyFlag.XSAME ? x : -1 * x;
        } else if (flag & glyFlag.XSAME) {
            x = 0;
        } else {
            x = reader.readInt16();
        }
        prevX += x;
        xCoordinates[i] = prevX;
        coordinates[i] = {
            x: prevX,
            y: 0
        };
        if (flag & glyFlag.ONCURVE) {
            coordinates[i].onCurve = true;
        }
    }
    var yCoordinates = [];
    var prevY = 0;
    var y;
    for (i = 0, length = flags.length; i < length; i++) {
        y = 0;
        flag = flags[i];
        if (flag & glyFlag.YSHORT) {
            y = reader.readUint8();
            y = flag & glyFlag.YSAME ? y : -1 * y;
        } else if (flag & glyFlag.YSAME) {
            y = 0;
        } else {
            y = reader.readInt16();
        }
        prevY += y;
        yCoordinates[i] = prevY;
        if (coordinates[i]) {
            coordinates[i].y = prevY;
        }
    }
    if (coordinates.length) {
        var endPtsOfContours = glyf.endPtsOfContours;
        var contours = [];
        contours.push(coordinates.slice(0, endPtsOfContours[0] + 1));
        for (i = 1, length = endPtsOfContours.length; i < length; i++) {
            contours.push(coordinates.slice(endPtsOfContours[i - 1] + 1, endPtsOfContours[i] + 1));
        }
        glyf.contours = contours;
    }
    return glyf;
}
var glyfcontour = table.create('contour', [], {
    read: function (reader, ttf) {
        var offset = this.offset;
        var glyf = glyfcontour.empty();
        var i;
        var length;
        var instructions;
        reader.seek(offset);
        var numberOfContours = reader.readInt16();
        glyf.xMin = reader.readInt16();
        glyf.yMin = reader.readInt16();
        glyf.xMax = reader.readInt16();
        glyf.yMax = reader.readInt16();
        if (numberOfContours >= 0) {
            var endPtsOfContours = [];
            if (numberOfContours >= 0) {
                for (i = 0; i < numberOfContours; i++) {
                    endPtsOfContours.push(reader.readUint16());
                }
                glyf.endPtsOfContours = endPtsOfContours;
            }
            length = reader.readUint16();
            if (length) {
                instructions = [];
                for (i = 0; i < length; ++i) {
                    instructions.push(reader.readUint8());
                }
                glyf.instructions = instructions;
            }
            readSimpleGlyf.call(this, reader, ttf, reader.offset, glyf);
            delete glyf.endPtsOfContours;
        } else {
            glyf.compound = true;
            glyf.glyfs = [];
            var flags;
            var g;
            do {
                flags = reader.readUint16();
                g = {};
                g.flags = flags;
                g.glyphIndex = reader.readUint16();
                var arg1 = 0;
                var arg2 = 0;
                var scaleX = 16384;
                var scaleY = 16384;
                var scale01 = 0;
                var scale10 = 0;
                if (componentFlag.ARG_1_AND_2_ARE_WORDS & flags) {
                    arg1 = reader.readInt16();
                    arg2 = reader.readInt16();
                } else {
                    arg1 = reader.readInt8();
                    arg2 = reader.readInt8();
                }
                if (componentFlag.ROUND_XY_TO_GRID & flags) {
                    arg1 = Math.round(arg1);
                    arg2 = Math.round(arg2);
                }
                if (componentFlag.WE_HAVE_A_SCALE & flags) {
                    scaleX = reader.readInt16();
                    scaleY = scaleX;
                } else if (componentFlag.WE_HAVE_AN_X_AND_Y_SCALE & flags) {
                    scaleX = reader.readInt16();
                    scaleY = reader.readInt16();
                } else if (componentFlag.WE_HAVE_A_TWO_BY_TWO & flags) {
                    scaleX = reader.readInt16();
                    scale01 = reader.readInt16();
                    scale10 = reader.readInt16();
                    scaleY = reader.readInt16();
                }
                if (componentFlag.ARGS_ARE_XY_VALUES & flags) {
                    g.useMyMetrics = !!flags & componentFlag.USE_MY_METRICS;
                    g.overlapCompound = !!flags & componentFlag.OVERLAP_COMPOUND;
                    g.transform = {
                        a: Math.round(10000 * scaleX / 16384) / 10000,
                        b: Math.round(10000 * scale01 / 16384) / 10000,
                        c: Math.round(10000 * scale10 / 16384) / 10000,
                        d: Math.round(10000 * scaleY / 16384) / 10000,
                        e: arg1,
                        f: arg2
                    };
                } else {
                    error.raise(10202);
                }
                glyf.glyfs.push(g);
            } while (componentFlag.MORE_COMPONENTS & flags);
            if (componentFlag.WE_HAVE_INSTRUCTIONS & flags) {
                length = reader.readUint16();
                instructions = [];
                for (i = 0; i < length; ++i) {
                    instructions.push(reader.readUint8());
                }
                glyf.instructions = instructions;
            }
        }
        return glyf;
    }
});
glyfcontour.empty = function () {
    var glyf = {};
    glyf.contours = [];
    return glyf;
};
module.exports = glyfcontour;