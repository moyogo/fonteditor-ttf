var lang = require('../common/lang');
var string = require('./util/string');
var pathAdjust = require('../graphics/pathAdjust');
var pathCeil = require('../graphics/pathCeil');
var computeBoundingBox = require('../graphics/computeBoundingBox');
var glyfAdjust = require('./util/glyfAdjust');
function adjustToEmBox(glyfList, ascent, descent, ajdustToEmPadding) {
    glyfList.forEach(function (g) {
        if (g.contours && g.contours.length) {
            var rightSideBearing = g.advanceWidth - g.xMax;
            var bound = computeBoundingBox.computePath.apply(null, g.contours);
            var scale = (ascent - descent - ajdustToEmPadding) / bound.height;
            var center = (ascent + descent) / 2;
            var yOffset = center - (bound.y + bound.height / 2) * scale;
            g.contours.forEach(function (contour) {
                if (scale !== 1) {
                    pathAdjust(contour, scale, scale);
                }
                pathAdjust(contour, 1, 1, 0, yOffset);
                pathCeil(contour);
            });
            var box = computeBoundingBox.computePathBox.apply(null, g.contours);
            g.xMin = box.x;
            g.xMax = box.x + box.width;
            g.yMin = box.y;
            g.yMax = box.y + box.height;
            g.leftSideBearing = g.xMin;
            g.advanceWidth = g.xMax + rightSideBearing;
        }
    });
    return glyfList;
}
function adjustPos(glyfList, leftSideBearing, rightSideBearing, verticalAlign) {
    var changed = false;
    if (null != leftSideBearing) {
        changed = true;
        glyfList.forEach(function (g) {
            if (g.leftSideBearing !== leftSideBearing) {
                glyfAdjust(g, 1, 1, leftSideBearing - g.leftSideBearing);
            }
        });
    }
    if (null != rightSideBearing) {
        changed = true;
        glyfList.forEach(function (g) {
            g.advanceWidth = g.xMax + rightSideBearing;
        });
    }
    if (null != verticalAlign) {
        changed = true;
        glyfList.forEach(function (g) {
            if (g.contours && g.contours.length) {
                var bound = computeBoundingBox.computePath.apply(this, g.contours);
                var offset = verticalAlign - bound.y;
                glyfAdjust(g, 1, 1, 0, offset);
            }
        });
    }
    return changed ? glyfList : [];
}
function merge(ttf, imported, options) {
    options = options || {};
    var list = imported.glyf.filter(function (g, index) {
        return g.contours && g.contours.length && g.name !== '.notdef' && g.name !== '.null' && g.name !== 'nonmarkingreturn';
    });
    if (options.adjustGlyf) {
        var ascent = ttf.hhea.ascent;
        var descent = ttf.hhea.descent;
        var ajdustToEmPadding = 16;
        adjustPos(list, 16, 16);
        adjustToEmBox(list, ascent, descent, ajdustToEmPadding);
        list.forEach(function (g) {
            ttf.glyf.push(g);
        });
    } else if (options.scale) {
        var scale = 1;
        if (imported.head.unitsPerEm && imported.head.unitsPerEm !== ttf.head.unitsPerEm) {
            scale = ttf.head.unitsPerEm / imported.head.unitsPerEm;
        }
        list.forEach(function (g) {
            glyfAdjust(g, scale, scale);
            ttf.glyf.push(g);
        });
    }
    return list;
}
function TTF(ttf) {
    this.ttf = ttf;
}
TTF.prototype.codes = function () {
    return Object.keys(this.ttf.cmap);
};
TTF.prototype.getCodeGlyfIndex = function (c) {
    var charCode = typeof c === 'number' ? c : c.charCodeAt(0);
    var glyfIndex = this.ttf.cmap[charCode] || 0;
    return glyfIndex;
};
TTF.prototype.getCodeGlyf = function (c) {
    var glyfIndex = this.getCodeGlyfIndex(c);
    return this.getIndexGlyf(glyfIndex);
};
TTF.prototype.getIndexGlyf = function (glyfIndex) {
    var glyfList = this.ttf.glyf;
    var glyf = glyfList[glyfIndex];
    return glyf;
};
TTF.prototype.set = function (ttf) {
    delete this.ttf;
    this.ttf = ttf;
    return this;
};
TTF.prototype.get = function () {
    return this.ttf;
};
TTF.prototype.addGlyf = function (glyf) {
    return this.insertGlyf(glyf);
};
TTF.prototype.insertGlyf = function (glyf, insertIndex) {
    if (insertIndex >= 0 && insertIndex < this.ttf.glyf.length) {
        this.ttf.glyf.splice(insertIndex, 0, glyf);
    } else {
        this.ttf.glyf.push(glyf);
    }
    return [glyf];
};
TTF.prototype.mergeGlyf = function (imported, options) {
    var list = merge(this.ttf, imported, options);
    return list;
};
TTF.prototype.removeGlyf = function (indexList) {
    var glyf = this.ttf.glyf;
    var removed = [];
    for (var i = glyf.length - 1; i >= 0; i--) {
        if (indexList.indexOf(i) >= 0) {
            removed.push(glyf[i]);
            glyf.splice(i, 1);
        }
    }
    return removed;
};
TTF.prototype.setUnicode = function (unicode, indexList) {
    var glyf = this.ttf.glyf;
    var list = [];
    if (indexList && indexList.length) {
        var first = indexList.indexOf(0);
        if (first >= 0) {
            indexList.splice(first, 1);
        }
        list = indexList.map(function (item) {
            return glyf[item];
        });
    } else {
        list = glyf.slice(1);
    }
    if (list.length > 1) {
        var less32 = function (u) {
            return u < 33;
        };
        list = list.filter(function (g) {
            return !g.unicode || !g.unicode.some(less32);
        });
    }
    if (list.length) {
        unicode = Number('0x' + unicode.slice(1));
        list.forEach(function (g) {
            if (unicode === 160 || unicode === 12288) {
                unicode++;
            }
            g.unicode = [unicode];
            g.name = string.getUnicodeName(unicode);
            unicode++;
        });
    }
    return list;
};
TTF.prototype.genGlyfName = function (indexList) {
    var glyf = this.ttf.glyf;
    var list = [];
    if (indexList && indexList.length) {
        list = indexList.map(function (item) {
            return glyf[item];
        });
    } else {
        list = glyf;
    }
    if (list.length) {
        var first = this.ttf.glyf[0];
        list.forEach(function (g) {
            if (g === first) {
                g.name = '.notdef';
            } else {
                if (g.unicode && g.unicode.length) {
                    g.name = string.getUnicodeName(g.unicode[0]);
                } else {
                    g.name = '.notdef';
                }
            }
        });
    }
    return list;
};
TTF.prototype.appendGlyf = function (glyfList, indexList) {
    var glyf = this.ttf.glyf;
    var result = glyfList.slice(0);
    if (indexList && indexList.length) {
        var l = Math.min(glyfList.length, indexList.length);
        for (var i = 0; i < l; i++) {
            glyf[indexList[i]] = glyfList[i];
        }
        glyfList = glyfList.slice(l);
    }
    if (glyfList.length) {
        Array.prototype.splice.apply(glyf, [
            glyf.length,
            0
        ].concat(glyfList));
    }
    return result;
};
TTF.prototype.adjustGlyfPos = function (indexList, setting) {
    var glyfList = this.getGlyf(indexList);
    return adjustPos(glyfList, setting.leftSideBearing, setting.rightSideBearing, setting.verticalAlign);
};
TTF.prototype.adjustGlyf = function (indexList, setting) {
    var glyfList = this.getGlyf(indexList);
    var changed = false;
    if (setting.reverse || setting.mirror) {
        changed = true;
        glyfList.forEach(function (g) {
            if (g.contours && g.contours.length) {
                var offsetX = g.xMax + g.xMin;
                var offsetY = g.yMax + g.yMin;
                g.contours.forEach(function (contour) {
                    pathAdjust(contour, setting.mirror ? -1 : 1, setting.reverse ? -1 : 1);
                    pathAdjust(contour, 1, 1, setting.mirror ? offsetX : 0, setting.reverse ? offsetY : 0);
                });
            }
        });
    }
    if (setting.scale && setting.scale !== 1) {
        changed = true;
        var scale = setting.scale;
        glyfList.forEach(function (g) {
            if (g.contours && g.contours.length) {
                glyfAdjust(g, scale, scale);
            }
        });
    } else if (setting.ajdustToEmBox) {
        changed = true;
        var ascent = this.ttf.hhea.ascent;
        var descent = this.ttf.hhea.descent;
        var ajdustToEmPadding = 2 * (setting.ajdustToEmPadding || 0);
        adjustToEmBox(glyfList, ascent, descent, ajdustToEmPadding);
    }
    return changed ? glyfList : [];
};
TTF.prototype.getGlyf = function (indexList) {
    var glyf = this.ttf.glyf;
    if (indexList && indexList.length) {
        return indexList.map(function (item) {
            return glyf[item];
        });
    }
    return glyf;
};
TTF.prototype.replaceGlyf = function (glyf, index) {
    if (index >= 0 && index < this.ttf.glyf.length) {
        this.ttf.glyf[index] = glyf;
        return [glyf];
    }
    return [];
};
TTF.prototype.setGlyf = function (glyfList) {
    delete this.glyf;
    this.ttf.glyf = glyfList || [];
    return this.ttf.glyf;
};
TTF.prototype.setName = function (name) {
    if (name) {
        name.fontFamily = name.fontFamily || 'fonteditor';
        name.fontSubFamily = name.fontSubFamily || 'Medium';
        name.fullName = name.fontFamily;
        this.ttf.name = name;
    }
    return this.ttf.name;
};
TTF.prototype.setHead = function (head) {
    if (head) {
        if (head.unitsPerEm && head.unitsPerEm >= 64 && head.unitsPerEm <= 16384) {
            this.ttf.head.unitsPerEm = head.unitsPerEm;
        }
        if (head.lowestRecPPEM && head.lowestRecPPEM >= 8 && head.lowestRecPPEM <= 16384) {
            this.ttf.head.lowestRecPPEM = head.lowestRecPPEM;
        }
        if (head.created) {
            this.ttf.head.created = head.created;
        }
    }
    return this.ttf.head;
};
TTF.prototype.setHhea = function (fields) {
    lang.overwrite(this.ttf.hhea, fields, [
        'ascent',
        'descent',
        'lineGap'
    ]);
    return this.ttf.hhea;
};
TTF.prototype.setOS2 = function (fields) {
    lang.overwrite(this.ttf['OS/2'], fields, [
        'usWinAscent',
        'usWinDescent',
        'sTypoAscender',
        'sTypoDescender',
        'sTypoLineGap',
        'sxHeight',
        'bXHeight',
        'usWeightClass',
        'usWidthClass',
        'yStrikeoutPosition',
        'yStrikeoutSize',
        'achVendID',
        'bFamilyType',
        'bSerifStyle',
        'bWeight',
        'bProportion',
        'bContrast',
        'bStrokeVariation',
        'bArmStyle',
        'bLetterform',
        'bMidline',
        'bXHeight'
    ]);
    return this.ttf['OS/2'];
};
TTF.prototype.setPost = function (fields) {
    lang.overwrite(this.ttf.post, fields, [
        'underlinePosition',
        'underlineThickness'
    ]);
    return this.ttf.post;
};
TTF.prototype.calcMetrics = function () {
    var ascent = -16384;
    var descent = 16384;
    var uX = 120;
    var uH = 72;
    var sxHeight;
    var sCapHeight;
    this.ttf.glyf.forEach(function (g) {
        if (g.yMax > ascent) {
            ascent = g.yMax;
        }
        if (g.yMin < descent) {
            descent = g.yMin;
        }
        if (g.unicode) {
            if (g.unicode.indexOf(uX) >= 0) {
                sxHeight = g.yMax;
            }
            if (g.unicode.indexOf(uH) >= 0) {
                sCapHeight = g.yMax;
            }
        }
    });
    ascent = Math.round(ascent);
    descent = Math.round(descent);
    return {
        ascent: ascent,
        descent: descent,
        sTypoAscender: ascent,
        sTypoDescender: descent,
        usWinAscent: ascent,
        usWinDescent: -descent,
        sxHeight: sxHeight || 0,
        sCapHeight: sCapHeight || 0
    };
};
module.exports = TTF;