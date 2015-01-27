var string = {
    decodeHTML: function (source) {
        var str = String(source).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        return str.replace(/&#([\d]+);/g, function ($0, $1) {
            return String.fromCharCode(parseInt($1, 10));
        });
    },
    encodeHTML: function (source) {
        return String(source).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },
    getLength: function (source) {
        return String(source).replace(/[^\x00-\xff]/g, '11').length;
    },
    cut: function (str, length, tail) {
        tail = tail || '';
        str = String(str);
        var size = 0;
        var l = str.length;
        for (var i = 0; i < l; i++) {
            size += str.charCodeAt(i) > 255 ? 2 : 1;
            if (size > length) {
                return str.slice(0, i) + tail;
            }
        }
        return str + tail;
    },
    format: function (source, data) {
        return source.replace(/\$\{([\w.]+)\}/g, function ($0, $1) {
            var ref = $1.split('.');
            var refObject = data;
            var level;
            while (refObject != null && (level = ref.shift())) {
                refObject = refObject[level];
            }
            return refObject != null ? refObject : '';
        });
    },
    pad: function (str, size, ch) {
        str = String(str);
        if (str.length > size) {
            return str.slice(str.length - size);
        }
        return new Array(size - str.length + 1).join(ch || '0') + str;
    },
    hashcode: function (str) {
        if (!str) {
            return 0;
        }
        var hash = 0;
        for (var i = 0, l = str.length; i < l; i++) {
            hash = 34359738367 & hash * 31 + str.charCodeAt(i);
        }
        return hash;
    }
};
module.exports = string;