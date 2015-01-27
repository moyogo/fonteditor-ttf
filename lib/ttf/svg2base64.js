function svg2base64(svg) {
    return 'data:font/svg;charset=utf-8;base64,' + btoa(svg);
}
module.exports = svg2base64;