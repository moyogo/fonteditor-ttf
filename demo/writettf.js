
var fs = require('fs');
var TTFReader = require('../lib/ttf/ttfreader');
var TTFWriter = require('../lib/ttf/ttfwriter');
var ttf2eot = require('../lib/ttf/ttf2eot');
var ttf2woff = require('../lib/ttf/ttf2woff');
var ttf2svg = require('../lib/ttf/ttf2svg');


var util = require('./util');

function readttf(file) {
    var data = fs.readFileSync(file);
    var arrayBuffer = util.toArrayBuffer(data);
    return arrayBuffer;
} 

function writettf(filename, buffer) {
    
    var ttfObject  = new TTFReader().read(buffer);
    
    // 写object
    fs.writeFileSync(filename +'.json', JSON.stringify(ttfObject));

    var ttfBuffer = new TTFWriter().write(ttfObject);

    // 写ttf
    fs.writeFileSync(filename +'.ttf', util.toBuffer(ttfBuffer));

    // 写eot
    var eotBuffer = ttf2eot(buffer);
    fs.writeFileSync(filename +'.eot', util.toBuffer(eotBuffer));

    // 写woff
    var woffBuffer = ttf2woff(buffer);
    fs.writeFileSync(filename +'.woff', util.toBuffer(woffBuffer));

    // 写svg
    var svg = ttf2svg(ttfObject);
    fs.writeFileSync(filename +'.svg', svg);

}



var arrayBuffer = readttf('../test/font/iconfont.ttf');

writettf('./output/iconfont', arrayBuffer)