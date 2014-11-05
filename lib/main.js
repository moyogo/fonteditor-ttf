/**
 * @file main.js
 * @author mengke01
 * @date 
 * @description
 * ttf模块的导出函数
 */

module.exports = {
    TTF: require('./ttf/ttf'),
    TTFReader: require('./ttf/ttfreader'),
    TTFWriter: require('./ttf/ttfwriter'),
    ttf2eot: require('./ttf/ttf2eot'),
    eot2ttf: require('./ttf/eot2ttf'),
    ttf2woff: require('./ttf/ttf2woff'),
    woff2ttf: require('./ttf/woff2ttf'),
    ttf2svg: require('./ttf/ttf2svg'),
    svg2ttfobject: require('./ttf/svg2ttfobject'),
    Reader: require('./ttf/reader'),
    Writer: require('./ttf/writer')
};