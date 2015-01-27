var glyFlag = require('../enum/glyFlag');
var componentFlag = require('../enum/componentFlag');
function sizeof(glyf, glyfSupport) {
    if (!glyf.contours || 0 === glyf.contours.length) {
        return 0;
    }
    var result = 12 + glyf.contours.length * 2 + glyfSupport.flags.length;
    glyfSupport.xCoord.forEach(function (x) {
        result += 0 <= x && x <= 255 ? 1 : 2;
    });
    glyfSupport.yCoord.forEach(function (y) {
        result += 0 <= y && y <= 255 ? 1 : 2;
    });
    return result;
}
function sizeofCompound(glyf) {
    var size = 10;
    var transform;
    glyf.glyfs.forEach(function (g) {
        transform = g.transform;
        size += 4;
        if (transform.e < 0 || transform.e > 127 || transform.f < 0 || transform.f > 127) {
            size += 4;
        } else {
            size += 2;
        }
        if (transform.b || transform.c) {
            size += 8;
        } else {
            if (transform.a !== 1 || transform.d !== 1) {
                size += transform.a === transform.d ? 2 : 4;
            }
        }
    });
    return size;
}
function getFlags(glyf, glyfSupport) {
    if (!glyf.contours || 0 === glyf.contours.length) {
        return glyfSupport;
    }
    var flags = [];
    var xCoord = [];
    var yCoord = [];
    var contours = glyf.contours;
    var contour;
    var prev;
    var first = true;
    for (var j = 0, cl = contours.length; j < cl; j++) {
        contour = contours[j];
        for (var i = 0, l = contour.length; i < l; i++) {
            var point = contour[i];
            if (first) {
                xCoord.push(point.x);
                yCoord.push(point.y);
                first = false;
            } else {
                xCoord.push(point.x - prev.x);
                yCoord.push(point.y - prev.y);
            }
            flags.push(point.onCurve ? glyFlag.ONCURVE : 0);
            prev = point;
        }
    }
    var flagsC = [];
    var xCoordC = [];
    var yCoordC = [];
    var x;
    var y;
    var prevFlag;
    var repeatPoint = -1;
    flags.forEach(function (flag, index) {
        x = xCoord[index];
        y = yCoord[index];
        if (index === 0) {
            if (-255 <= x && x <= 255) {
                flag += glyFlag.XSHORT;
                if (x >= 0) {
                    flag += glyFlag.XSAME;
                }
                x = Math.abs(x);
            }
            if (-255 <= y && y <= 255) {
                flag += glyFlag.YSHORT;
                if (y >= 0) {
                    flag += glyFlag.YSAME;
                }
                y = Math.abs(y);
            }
            flagsC.push(prevFlag = flag);
            xCoordC.push(x);
            yCoordC.push(y);
        } else {
            if (x === 0) {
                flag += glyFlag.XSAME;
            } else {
                if (-255 <= x && x <= 255) {
                    flag += glyFlag.XSHORT;
                    if (x > 0) {
                        flag += glyFlag.XSAME;
                    }
                    x = Math.abs(x);
                }
                xCoordC.push(x);
            }
            if (y === 0) {
                flag += glyFlag.YSAME;
            } else {
                if (-255 <= y && y <= 255) {
                    flag += glyFlag.YSHORT;
                    if (y > 0) {
                        flag += glyFlag.YSAME;
                    }
                    y = Math.abs(y);
                }
                yCoordC.push(y);
            }
            if (flag === prevFlag) {
                if (-1 === repeatPoint) {
                    repeatPoint = flagsC.length - 1;
                    flagsC[repeatPoint] |= glyFlag.REPEAT;
                    flagsC.push(1);
                } else {
                    ++flagsC[repeatPoint + 1];
                }
            } else {
                repeatPoint = -1;
                flagsC.push(prevFlag = flag);
            }
        }
    });
    glyfSupport.flags = flagsC;
    glyfSupport.xCoord = xCoordC;
    glyfSupport.yCoord = yCoordC;
    return glyfSupport;
}
module.exports = {
    write: function (writer, ttf) {
        ttf.glyf.forEach(function (glyf, index) {
            if (!glyf.compound && (!glyf.contours || 0 === glyf.contours.length)) {
                return;
            }
            writer.writeInt16(glyf.compound ? -1 : glyf.contours.length);
            writer.writeInt16(glyf.xMin);
            writer.writeInt16(glyf.yMin);
            writer.writeInt16(glyf.xMax);
            writer.writeInt16(glyf.yMax);
            var i;
            var l;
            var flags;
            if (glyf.compound) {
                for (i = 0, l = glyf.glyfs.length; i < l; i++) {
                    flags = componentFlag.ARGS_ARE_XY_VALUES + componentFlag.ROUND_XY_TO_GRID;
                    if (i < l - 1) {
                        flags += componentFlag.MORE_COMPONENTS;
                    }
                    var g = glyf.glyfs[i];
                    flags += g.useMyMetrics ? componentFlag.USE_MY_METRICS : 0;
                    flags += g.overlapCompound ? componentFlag.OVERLAP_COMPOUND : 0;
                    var transform = g.transform;
                    var a = transform.a;
                    var b = transform.b;
                    var c = transform.c;
                    var d = transform.d;
                    var e = transform.e;
                    var f = transform.f;
                    if (e < 0 || e > 127 || f < 0 || f > 127) {
                        flags += componentFlag.ARG_1_AND_2_ARE_WORDS;
                    }
                    if (b || c) {
                        flags += componentFlag.WE_HAVE_A_TWO_BY_TWO;
                    } else {
                        if (a !== 1 || d !== 1 && a === d) {
                            flags += componentFlag.WE_HAVE_A_SCALE;
                        } else if (a !== 1 || d !== 1) {
                            flags += componentFlag.WE_HAVE_AN_X_AND_Y_SCALE;
                        }
                    }
                    writer.writeUint16(flags);
                    writer.writeUint16(g.glyphIndex);
                    if (componentFlag.ARG_1_AND_2_ARE_WORDS & flags) {
                        writer.writeInt16(e);
                        writer.writeInt16(f);
                    } else {
                        writer.writeUint8(e);
                        writer.writeUint8(f);
                    }
                    if (componentFlag.WE_HAVE_A_SCALE & flags) {
                        writer.writeInt16(Math.round(a * 16384));
                    } else if (componentFlag.WE_HAVE_AN_X_AND_Y_SCALE & flags) {
                        writer.writeInt16(Math.round(a * 16384));
                        writer.writeInt16(Math.round(d * 16384));
                    } else if (componentFlag.WE_HAVE_A_TWO_BY_TWO & flags) {
                        writer.writeInt16(Math.round(a * 16384));
                        writer.writeInt16(Math.round(b * 16384));
                        writer.writeInt16(Math.round(c * 16384));
                        writer.writeInt16(Math.round(d * 16384));
                    }
                }
            } else {
                var endPtsOfContours = -1;
                glyf.contours.forEach(function (contour) {
                    endPtsOfContours += contour.length;
                    writer.writeUint16(endPtsOfContours);
                });
                writer.writeUint16(0);
                flags = ttf.support.glyf[index].flags;
                for (i = 0, l = flags.length; i < l; i++) {
                    writer.writeUint8(flags[i]);
                }
                var xCoord = ttf.support.glyf[index].xCoord;
                for (i = 0, l = xCoord.length; i < l; i++) {
                    if (0 <= xCoord[i] && xCoord[i] <= 255) {
                        writer.writeUint8(xCoord[i]);
                    } else {
                        writer.writeInt16(xCoord[i]);
                    }
                }
                var yCoord = ttf.support.glyf[index].yCoord;
                for (i = 0, l = yCoord.length; i < l; i++) {
                    if (0 <= yCoord[i] && yCoord[i] <= 255) {
                        writer.writeUint8(yCoord[i]);
                    } else {
                        writer.writeInt16(yCoord[i]);
                    }
                }
            }
            var glyfSize = ttf.support.glyf[index].glyfSize;
            if (glyfSize % 4) {
                writer.writeEmpty(4 - glyfSize % 4);
            }
        });
        return writer;
    },
    size: function (ttf) {
        ttf.support.glyf = [];
        var tableSize = 0;
        ttf.glyf.forEach(function (glyf) {
            var glyfSupport = {};
            glyfSupport = glyf.compound ? glyfSupport : getFlags(glyf, glyfSupport);
            var glyfSize = glyf.compound ? sizeofCompound(glyf) : sizeof(glyf, glyfSupport);
            var size = glyfSize;
            if (size % 4) {
                size += 4 - size % 4;
            }
            glyfSupport.glyfSize = glyfSize;
            glyfSupport.size = size;
            ttf.support.glyf.push(glyfSupport);
            tableSize += size;
        });
        ttf.support.glyf.tableSize = tableSize;
        ttf.head.indexToLocFormat = tableSize > 65536 ? 1 : 0;
        return ttf.support.glyf.tableSize;
    }
};