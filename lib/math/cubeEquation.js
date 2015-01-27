var quadraticEquation = require('./quadraticEquation');
function cubeEquation(a, b, c, d) {
    if (a === 0) {
        return quadraticEquation(b, c, d);
    }
    if (d === 0) {
        return quadraticEquation(a, b, c);
    }
    if (a !== 1) {
        b /= a;
        c /= a;
        d /= a;
    }
    var disc;
    var q;
    var r;
    var dum1;
    var s;
    var t;
    var term1;
    var r13;
    q = (3 * c - b * b) / 9;
    r = -(27 * d) + b * (9 * c - 2 * (b * b));
    r /= 54;
    disc = q * q * q + r * r;
    term1 = b / 3;
    if (disc > 0) {
        s = r + Math.sqrt(disc);
        s = s < 0 ? -Math.pow(-s, 1 / 3) : Math.pow(s, 1 / 3);
        t = r - Math.sqrt(disc);
        t = t < 0 ? -Math.pow(-t, 1 / 3) : Math.pow(t, 1 / 3);
        return [-term1 + s + t];
    }
    var r1;
    var r2;
    var r3;
    if (disc === 0) {
        r13 = r < 0 ? -Math.pow(-r, 1 / 3) : Math.pow(r, 1 / 3);
        r1 = -term1 + 2 * r13;
        r2 = -(r13 + term1);
        r3 = r2;
        return r1 === r2 ? r1 : [
            r1,
            r2
        ];
    }
    q = -q;
    dum1 = q * q * q;
    dum1 = Math.acos(r / Math.sqrt(dum1));
    r13 = 2 * Math.sqrt(q);
    r1 = -term1 + r13 * Math.cos(dum1 / 3);
    r2 = -term1 + r13 * Math.cos((dum1 + 2 * Math.PI) / 3);
    r3 = -term1 + r13 * Math.cos((dum1 + 4 * Math.PI) / 3);
    return [
        r1,
        r2,
        r3
    ];
}
module.exports = cubeEquation;