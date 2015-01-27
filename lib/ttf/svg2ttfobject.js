var string = require('../common/string');
var DOMParser = require('../common/DOMParser');
var path2contours = require('./svg/path2contours');
var svgnode2contours = require('./svg/svgnode2contours');
var contoursTransform = require('./svg/contoursTransform');
var computeBoundingBox = require('../graphics/computeBoundingBox');
var glyfAdjust = require('./util/glyfAdjust');
var error = require('./error');
function loadXML(xml) {
    if (DOMParser) {
        try {
            var domParser = new DOMParser();
            var xmlDoc = domParser.parseFromString(xml, 'text/xml');
            return xmlDoc;
        } catch (exp) {
            error.raise(10103);
        }
    }
    error.raise(10004);
}
function getEmptyObject() {
    return {
        'from': 'svg',
        'OS/2': {},
        'name': {},
        'hhea': {},
        'head': {},
        'post': {},
        'glyf': []
    };
}
function getUnitsPerEm(xMin, xMax, yMin, yMax) {
    var seed = Math.ceil(Math.min(yMax - yMin, xMax - xMin));
    if (!seed) {
        return 1024;
    }
    if (seed <= 128) {
        return seed;
    }
    var unitsPerEm = 128;
    while (unitsPerEm < 16384) {
        if (seed <= 1.2 * unitsPerEm) {
            return unitsPerEm;
        }
        unitsPerEm = unitsPerEm << 1;
    }
    return 1024;
}
function resolve(ttf) {
    if (ttf.from === 'svgfont' && ttf.head.unitsPerEm > 128) {
        ttf.glyf.forEach(function (g) {
            glyfAdjust(g);
        });
    } else {
        var xMin = 16384;
        var xMax = -16384;
        var yMin = 16384;
        var yMax = -16384;
        ttf.glyf.forEach(function (g) {
            if (g.contours) {
                var bound = computeBoundingBox.computePathBox.apply(null, g.contours);
                if (bound) {
                    xMin = Math.min(xMin, bound.x);
                    xMax = Math.max(xMax, bound.x + bound.width);
                    yMin = Math.min(yMin, bound.y);
                    yMax = Math.max(yMax, bound.y + bound.height);
                }
            }
        });
        var unitsPerEm = getUnitsPerEm(xMin, xMax, yMin, yMax);
        var scale = 1024 / unitsPerEm;
        ttf.glyf.forEach(function (g) {
            glyfAdjust(g, scale, scale);
        });
        ttf.head.unitsPerEm = 1024;
    }
    return ttf;
}
function parseFont(xmlDoc, ttf) {
    var metaNode = xmlDoc.getElementsByTagName('metadata')[0];
    var fontNode = xmlDoc.getElementsByTagName('font')[0];
    var fontFaceNode = xmlDoc.getElementsByTagName('font-face')[0];
    if (metaNode && metaNode.textContent) {
        ttf.metadata = string.decodeHTML(metaNode.textContent.trim());
    }
    if (fontNode) {
        ttf.id = fontNode.getAttribute('id') || '';
        ttf.hhea.advanceWidthMax = +(fontNode.getAttribute('horiz-adv-x') || 0);
        ttf.from = 'svgfont';
    }
    if (fontFaceNode) {
        var OS2 = ttf['OS/2'];
        ttf.name.fontFamily = fontFaceNode.getAttribute('font-family') || '';
        OS2.usWeightClass = +(fontFaceNode.getAttribute('font-weight') || 0);
        ttf.head.unitsPerEm = +(fontFaceNode.getAttribute('units-per-em') || 0);
        var panose = (fontFaceNode.getAttribute('panose-1') || '').split(' ');
        [
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
        ].forEach(function (name, i) {
            OS2[name] = +(panose[i] || 0);
        });
        ttf.hhea.ascent = +(fontFaceNode.getAttribute('ascent') || 0);
        ttf.hhea.descent = +(fontFaceNode.getAttribute('descent') || 0);
        OS2.bXHeight = +(fontFaceNode.getAttribute('x-height') || 0);
        var box = (fontFaceNode.getAttribute('bbox') || '').split(' ');
        [
            'xMin',
            'yMin',
            'xMax',
            'yMax'
        ].forEach(function (name, i) {
            ttf.head[name] = +(box[i] || '');
        });
        ttf.post.underlineThickness = +(fontFaceNode.getAttribute('underline-thickness') || 0);
        ttf.post.underlinePosition = +(fontFaceNode.getAttribute('underline-position') || 0);
        var unicodeRange = fontFaceNode.getAttribute('unicode-range');
        if (unicodeRange) {
            unicodeRange.replace(/u\+([0-9A-Z]+)(\-[0-9A-Z]+)?/i, function ($0, a, b) {
                OS2.usFirstCharIndex = Number('0x' + a);
                OS2.usLastCharIndex = b ? Number('0x' + b.slice(1)) : 4294967295;
            });
        }
    }
    return ttf;
}
function parseGlyf(xmlDoc, ttf) {
    var missingNode = xmlDoc.getElementsByTagName('missing-glyph')[0];
    var d;
    var unicode;
    if (missingNode) {
        var missing = { name: '.notdef' };
        if (missingNode.getAttribute('horiz-adv-x')) {
            missing.advanceWidth = +missingNode.getAttribute('horiz-adv-x');
        }
        if (d = missingNode.getAttribute('d')) {
            missing.contours = path2contours(d);
        }
        ttf.glyf.push(missing);
    }
    var glyfNodes = xmlDoc.getElementsByTagName('glyph');
    if (glyfNodes.length) {
        var unicodeMap = function (u) {
            return u.charCodeAt(0);
        };
        for (var i = 0, l = glyfNodes.length; i < l; i++) {
            var node = glyfNodes[i];
            var glyf = { name: node.getAttribute('glyph-name') || node.getAttribute('name') || '' };
            if (node.getAttribute('horiz-adv-x')) {
                glyf.advanceWidth = +node.getAttribute('horiz-adv-x');
            }
            if (unicode = node.getAttribute('unicode')) {
                glyf.unicode = unicode.split('').map(unicodeMap);
            }
            if (d = node.getAttribute('d')) {
                glyf.contours = path2contours(d);
            }
            ttf.glyf.push(glyf);
        }
    }
    return ttf;
}
function mirrorContours(contours) {
    var bound = computeBoundingBox.computePathBox.apply(null, contours);
    contours = contoursTransform(contours, [
        {
            name: 'scale',
            params: [
                1,
                -1
            ]
        },
        {
            name: 'translate',
            params: [
                1,
                bound.height
            ]
        }
    ]);
    return contours;
}
function parsePath(xmlDoc, ttf) {
    var contours;
    var glyf;
    var node;
    var pathNodes = xmlDoc.getElementsByTagName('path');
    if (pathNodes.length) {
        for (var i = 0, l = pathNodes.length; i < l; i++) {
            node = pathNodes[i];
            glyf = { name: node.getAttribute('name') || '' };
            contours = svgnode2contours([node]);
            glyf.contours = contours;
            ttf.glyf.push(glyf);
        }
    }
    contours = svgnode2contours(Array.prototype.slice.call(xmlDoc.getElementsByTagName('*')).filter(function (node) {
        return node.tagName !== 'path';
    }));
    if (contours) {
        glyf = { name: '' };
        glyf.contours = contours;
        ttf.glyf.push(glyf);
    }
}
function parseXML(xmlDoc, options) {
    var ttf = getEmptyObject();
    if (!xmlDoc.getElementsByTagName('svg').length) {
        error.raise(10106);
    }
    parseFont(xmlDoc, ttf);
    if (ttf.from === 'svgfont') {
        parseGlyf(xmlDoc, ttf);
    } else {
        parsePath(xmlDoc, ttf);
    }
    if (!ttf.glyf.length) {
        error.raise(10201);
    }
    if (ttf.from === 'svg') {
        var glyf = ttf.glyf;
        var i;
        var l;
        if (options.combinePath) {
            var combined = [];
            for (i = 0, l = glyf.length; i < l; i++) {
                var contours = glyf[i].contours;
                for (var index = 0, length = contours.length; index < length; index++) {
                    combined.push(contours[index]);
                }
            }
            glyf[0].contours = combined;
            glyf.splice(1);
        }
        for (i = 0, l = glyf.length; i < l; i++) {
            glyf[i].contours = mirrorContours(glyf[i].contours);
        }
    }
    return ttf;
}
function svg2ttfObject(svg, options) {
    options = options || { combinePath: false };
    var xmlDoc = svg;
    if (typeof svg === 'string') {
        xmlDoc = loadXML(svg);
    }
    var ttf = parseXML(xmlDoc, options);
    return resolve(ttf);
}
module.exports = svg2ttfObject;