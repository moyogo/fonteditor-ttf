var extend = require('../common/lang').extend;
var curry = require('../common/lang').curry;
var error = require('./error');
if (typeof ArrayBuffer === 'undefined' || typeof DataView === 'undefined') {
    throw 'not support ArrayBuffer and DataView';
}
var dataType = {
    'Int8': 1,
    'Int16': 2,
    'Int32': 4,
    'Uint8': 1,
    'Uint16': 2,
    'Uint32': 4,
    'Float32': 4,
    'Float64': 8
};
var proto = {};
function read(type, offset, littleEndian) {
    if (undefined === offset) {
        offset = this.offset;
    }
    if (undefined === littleEndian) {
        littleEndian = this.littleEndian;
    }
    if (undefined === dataType[type]) {
        return this['read' + type](offset, littleEndian);
    }
    var size = dataType[type];
    this.offset = offset + size;
    return this.view['get' + type](offset, littleEndian);
}
Object.keys(dataType).forEach(function (type) {
    proto['read' + type] = curry(read, type);
});
function Reader(buffer, offset, length, littleEndian) {
    var bufferLength = buffer.byteLength || buffer.length;
    this.offset = offset || 0;
    this.length = length || bufferLength - this.offset;
    this.littleEndian = littleEndian || false;
    this.view = new DataView(buffer, this.offset, this.length);
}
Reader.prototype = {
    constructor: Reader,
    read: read,
    readBytes: function (offset, length) {
        if (arguments.length === 1) {
            length = arguments[0];
            offset = this.offset;
        }
        if (length < 0 || offset + length > this.length) {
            error.raise(10001, this.length, offset + length);
        }
        var buffer = [];
        for (var i = 0; i < length; ++i) {
            buffer.push(this.view.getUint8(offset + i));
        }
        this.offset = offset + length;
        return buffer;
    },
    readString: function (offset, length) {
        if (arguments.length === 1) {
            length = arguments[0];
            offset = this.offset;
        }
        if (length < 0 || offset + length > this.length) {
            error.raise(10001, this.length, offset + length);
        }
        var value = '';
        for (var i = 0; i < length; ++i) {
            var c = this.readUint8(offset + i);
            value += String.fromCharCode(c);
        }
        this.offset = offset + length;
        return value;
    },
    readChar: function (offset) {
        return this.readString(offset, 1);
    },
    readFixed: function (offset) {
        if (undefined === offset) {
            offset = this.offset;
        }
        var val = this.readInt32(offset, false) / 65536;
        return Math.ceil(val * 100000) / 100000;
    },
    readLongDateTime: function (offset) {
        if (undefined === offset) {
            offset = this.offset;
        }
        var delta = -2077545600000;
        var time = this.readUint32(offset + 4, false);
        var date = new Date();
        date.setTime(time * 1000 + delta);
        return date;
    },
    seek: function (offset) {
        if (undefined === offset) {
            this.offset = 0;
        }
        if (offset < 0 || offset > this.length) {
            error.raise(10001, this.length, offset);
        }
        this.offset = offset;
        return this;
    },
    dispose: function () {
        delete this.view;
    }
};
extend(Reader.prototype, proto);
module.exports = Reader;