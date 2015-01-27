var is = {};
var toString = toString || Object.prototype.toString;
[
    'String',
    'Array',
    'Function',
    'Date',
    'Object'
].forEach(function (type) {
    is['is' + type] = function (obj) {
        return obj != null && toString.call(obj).slice(8, -1) === type;
    };
});
function curry(fn) {
    var xargs = [].slice.call(arguments, 1);
    return function () {
        var args = xargs.concat([].slice.call(arguments));
        return fn.apply(this, args);
    };
}
function generic(method) {
    return function () {
        return Function.call.apply(method, arguments);
    };
}
function bind(fn, thisArg) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function () {
        return fn.apply(thisArg, args.concat(Array.prototype.slice.call(arguments)));
    };
}
function inherits(subClass, superClass) {
    var Empty = function () {
    };
    Empty.prototype = superClass.prototype;
    var selfPrototype = subClass.prototype;
    var proto = subClass.prototype = new Empty();
    Object.keys(selfPrototype).forEach(function (key) {
        proto[key] = selfPrototype[key];
    });
    subClass.prototype.constructor = subClass;
    return subClass;
}
function extend(target, source) {
    for (var i = 1, len = arguments.length; i < len; i++) {
        source = arguments[i];
        if (!source) {
            continue;
        }
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}
function overwrite(thisObj, thatObj, fields) {
    if (!thatObj) {
        return thisObj;
    }
    fields = fields || Object.keys(thatObj);
    fields.forEach(function (field) {
        if (thisObj.hasOwnProperty(field)) {
            if (thisObj[field] && typeof thisObj[field] === 'object' && thatObj[field] && typeof thatObj[field] === 'object') {
                overwrite(thisObj[field], thatObj[field]);
            } else {
                thisObj[field] = thatObj[field];
            }
        }
    });
    return thisObj;
}
var hasOwnProperty = Object.prototype.hasOwnProperty;
function clone(source) {
    if (!source || typeof source !== 'object') {
        return source;
    }
    var cloned = source;
    if (is.isArray(source)) {
        cloned = source.slice().map(clone);
    } else if (is.isObject(source) && 'isPrototypeOf' in source) {
        cloned = {};
        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                cloned[key] = clone(source[key]);
            }
        }
    }
    return cloned;
}
function throttle(func, wait) {
    var context;
    var args;
    var timeout;
    var result;
    var previous = 0;
    var later = function () {
        previous = new Date();
        timeout = null;
        result = func.apply(context, args);
    };
    return function () {
        var now = new Date();
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
        } else if (!timeout) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
}
function debounce(func, wait, immediate) {
    var timeout;
    var result;
    return function () {
        var context = this;
        var args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
        }
        return result;
    };
}
var exports = {
    extend: extend,
    overwrite: overwrite,
    bind: bind,
    inherits: inherits,
    curry: curry,
    uncurry: generic,
    clone: clone,
    throttle: throttle,
    debounce: debounce
};
extend(exports, is);
module.exports = exports;