
var fs = require('fs');
var TTFReader = require('../lib/ttf/ttfreader');
var TTFWriter = require('../lib/ttf/ttfwriter');
var TTF = require('../lib/ttf/ttf');

var util = require('./util');

function readttf(file) {
    var data = fs.readFileSync(file);
    var arrayBuffer = util.toArrayBuffer(data);
    return arrayBuffer;
} 


function adjustttf(ttfObject) {
    var ttf = new TTF(ttfObject);

    // 设置unicode编码
    ttf.setUnicode('$E001');

    // 翻转ttf
    ttf.adjustGlyf({
        reverse: true,
        mirror: true,
        scale: 0.5
    });

    return ttf.ttf;
}


var arrayBuffer = readttf('../test/font/iconfont.ttf');

var ttfObject = new TTFReader().read(arrayBuffer);

ttfObject = adjustttf(ttfObject);

var ttfBuffer = new TTFWriter().write(ttfObject);
// 写ttf
fs.writeFileSync('./output/iconfont-modify.ttf', util.toBuffer(ttfBuffer));
