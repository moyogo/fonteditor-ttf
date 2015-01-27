var unicodeName = require('../enum/unicodeName');
var postName = require('../enum/postName');
function stringify(str) {
    return decodeURIComponent(encodeURIComponent(str).replace(/%00([\x00-\xff])/g, '$1'));
}
var string = {
    stringify: stringify,
    getUnicodeName: function (unicode) {
        var unicodeNameIndex = unicodeName[unicode];
        if (undefined !== unicodeNameIndex) {
            return postName[unicodeNameIndex];
        }
        return 'uni' + unicode.toString(16).toUpperCase();
    },
    toUTF8Bytes: function (str) {
        str = stringify(str);
        var byteArray = [];
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) <= 127) {
                byteArray.push(str.charCodeAt(i));
            } else {
                var h = encodeURIComponent(str.charAt(i)).slice(1).split('%');
                for (var j = 0; j < h.length; j++) {
                    byteArray.push(parseInt(h[j], 16));
                }
            }
        }
        return byteArray;
    },
    toUCS2Bytes: function (str) {
        str = stringify(str);
        var byteArray = [];
        var ch;
        for (var i = 0; i < str.length; ++i) {
            ch = str.charCodeAt(i);
            byteArray.push(ch >> 8);
            byteArray.push(ch & 255);
        }
        return byteArray;
    },
    readPascalString: function (byteArray) {
        var strArray = [];
        var i = 0;
        var l = byteArray.length;
        while (i < l) {
            var strLength = byteArray[i++];
            var str = '';
            while (strLength-- > 0 && i < l) {
                str += String.fromCharCode(byteArray[i++]);
            }
            str = stringify(str);
            strArray.push(str);
        }
        return strArray;
    },
    getPascalStringBytes: function (str) {
        var bytes = [];
        var length = str ? str.length < 256 ? str.length : 255 : 0;
        bytes.push(length);
        for (var i = 0; i < length; i++) {
            var c = str.charCodeAt(i);
            bytes.push(c < 128 ? c : 42);
        }
        return bytes;
    }
};
module.exports = string;