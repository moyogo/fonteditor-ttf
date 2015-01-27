var TTFReader = require('./ttfreader');
var error = require('./error');
function listUnicode(unicode) {
    return unicode.map(function (u) {
        return '\\' + u.toString(16);
    }).join(',');
}
function ttfobject2icon(ttf, options) {
    var glyfList = [];
    var filtered = ttf.glyf.filter(function (g) {
        return g.name !== '.notdef' && g.name !== '.null' && g.name !== 'nonmarkingreturn' && g.unicode && g.unicode.length;
    });
    filtered.forEach(function (g) {
        glyfList.push({
            code: '&#x' + g.unicode[0].toString(16) + ';',
            codeName: listUnicode(g.unicode),
            name: g.name
        });
    });
    return {
        fontFamily: ttf.name.fontFamily || 'fonteditor',
        iconPrefix: options.iconPrefix || 'icon',
        glyfList: glyfList
    };
}
function ttf2icon(ttfBuffer, options) {
    options = options || {};
    if (ttfBuffer instanceof ArrayBuffer) {
        var reader = new TTFReader();
        var ttfObject = reader.read(ttfBuffer);
        reader.dispose();
        return ttfobject2icon(ttfObject, options);
    } else if (ttfBuffer.version && ttfBuffer.glyf) {
        return ttfobject2icon(ttfBuffer, options);
    }
    error.raise(10101);
}
module.exports = ttf2icon;