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
function write(type, value, offset, littleEndian) {
    if (undefined === offset) {
        offset = this.offset;
    }
    if (undefined === littleEndian) {
        littleEndian = this.littleEndian;
    }
    if (undefined === dataType[type]) {
        return this['write' + type](value, offset, littleEndian);
    }
    var size = dataType[type];
    this.offset = offset + size;
    this.view['set' + type](offset, value, littleEndian);
    return this;
}
Object.keys(dataType).forEach(function (type) {
    proto['write' + type] = curry(write, type);
});
function Writer(buffer, offset, length, littleEndian) {
    var bufferLength = buffer.byteLength || buffer.length;
    this.offset = offset || 0;
    this.length = length || bufferLength - this.offset;
    this.littleEndian = littleEndian || false;
    this.view = new DataView(buffer, this.offset, this.length);
}
Writer.prototype = {
    constructor: Writer,
    write: write,
    writeBytes: function (value, length, offset) {
        length = length || value.byteLength || value.length;
        var i;
        if (!length) {
            return this;
        }
        if (undefined === offset) {
            offset = this.offset;
        }
        if (length < 0 || offset + length > this.length) {
            error.raise(10002, this.length, offset + length);
        }
        if (value instanceof ArrayBuffer) {
            var view = new DataView(value, 0, length);
            var littleEndian = this.littleEndian;
            for (i = 0; i < length; ++i) {
                this.view.setUint8(offset + i, view.getUint8(i, littleEndian), littleEndian);
            }
        } else {
            for (i = 0; i < length; ++i) {
                this.view.setUint8(offset + i, value[i], littleEndian);
            }
        }
        this.offset = offset + length;
        return this;
    },
    writeEmpty: function (length, offset) {
        if (length < 0) {
            error.raise(10002, this.length, length);
        }
        if (undefined === offset) {
            offset = this.offset;
        }
        var littleEndian = this.littleEndian;
        for (var i = 0; i < length; ++i) {
            this.view.setUint8(offset + i, 0, littleEndian);
        }
        this.offset = offset + length;
        return this;
    },
    writeString: function (str, length, offset) {
        str = str || '';
        if (undefined === offset) {
            offset = this.offset;
        }
        length = length || str.replace(/[^\x00-\xff]/g, '11').length;
        if (length < 0 || offset + length > this.length) {
            error.raise(10002, this.length, offset + length);
        }
        this.seek(offset);
        for (var i = 0, l = str.length, charCode; i < l; ++i) {
            charCode = str.charCodeAt(i) || 0;
            if (charCode > 127) {
                this.writeUint16(charCode);
            } else {
                this.writeUint8(charCode);
            }
        }
        this.offset = offset + length;
        return this;
    },
    writeChar: function (value, offset) {
        return this.writeString(value, offset);
    },
    writeFixed: function (value, offset) {
        if (undefined === offset) {
            offset = this.offset;
        }
        this.writeInt32(Math.round(value * 65536), offset);
        return this;
    },
    writeLongDateTime: function (value, offset) {
        if (undefined === offset) {
            offset = this.offset;
        }
        var delta = -2077545600000;
        if (typeof value === 'undefined') {
            value = delta;
        } else if (typeof value.getTime === 'function') {
            value = value.getTime();
        } else if (/^\d+$/.test(value)) {
            value = +value;
        } else {
            value = Date.parse(value);
        }
        var time = Math.round((value - delta) / 1000);
        this.writeUint32(0, offset);
        this.writeUint32(time, offset + 4);
        return this;
    },
    seek: function (offset) {
        if (undefined === offset) {
            this.offset = 0;
        }
        if (offset < 0 || offset > this.length) {
            error.raise(10002, this.length, offset);
        }
        this._offset = this.offset;
        this.offset = offset;
        return this;
    },
    head: function () {
        this.offset = this._offset || 0;
        return this;
    },
    getBuffer: function () {
        return this.view.buffer;
    },
    dispose: function () {
        delete this.view;
    }
};
extend(Writer.prototype, proto);
module.exports = Writer;