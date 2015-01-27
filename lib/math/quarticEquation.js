var cubeEquation = require('./cubeEquation');
function quarticEquation(a, b, c, d, e) {
    if (a === 0) {
        return cubeEquation(b, c, d, e);
    }
    if (e === 0) {
        return cubeEquation(a, b, c, d);
    }
    if (a !== 1) {
        b /= a;
        c /= a;
        d /= a;
        e /= a;
    }
    var cb;
    var cc;
    var cd;
    var discrim;
    var q;
    var r;
    var RRe;
    var RIm;
    var DRe;
    var DIm;
    var dum1;
    var ERe;
    var EIm;
    var s;
    var t;
    var term1;
    var r13;
    var sqR;
    var y1;
    var z1Re;
    var z1Im;
    var z2Re;
    cb = -c;
    cc = -4 * e + d * b;
    cd = -(b * b * e + d * d) + 4 * c * e;
    q = (3 * cc - cb * cb) / 9;
    r = -(27 * cd) + cb * (9 * cc - 2 * (cb * cb));
    r /= 54;
    discrim = q * q * q + r * r;
    term1 = cb / 3;
    if (discrim > 0) {
        s = r + Math.sqrt(discrim);
        s = s < 0 ? -Math.pow(-s, 1 / 3) : Math.pow(s, 1 / 3);
        t = r - Math.sqrt(discrim);
        t = t < 0 ? -Math.pow(-t, 1 / 3) : Math.pow(t, 1 / 3);
        y1 = -term1 + s + t;
    } else {
        if (discrim === 0) {
            r13 = r < 0 ? -Math.pow(-r, 1 / 3) : Math.pow(r, 1 / 3);
            y1 = -term1 + 2 * r13;
        } else {
            q = -q;
            dum1 = q * q * q;
            dum1 = Math.acos(r / Math.sqrt(dum1));
            r13 = 2 * Math.sqrt(q);
            y1 = -term1 + r13 * Math.cos(dum1 / 3);
        }
    }
    term1 = b / 4;
    sqR = -c + term1 * b + y1;
    RRe = RIm = DRe = DIm = ERe = EIm = z1Re = z1Im = z2Re = 0;
    if (sqR >= 0) {
        if (sqR === 0) {
            dum1 = -(4 * e) + y1 * y1;
            if (dum1 < 0) {
                z1Im = 2 * Math.sqrt(-dum1);
            } else {
                z1Re = 2 * Math.sqrt(dum1);
                z2Re = -z1Re;
            }
        } else {
            RRe = Math.sqrt(sqR);
            z1Re = -(8 * d + b * b * b) / 4 + b * c;
            z1Re /= RRe;
            z2Re = -z1Re;
        }
    } else {
        RIm = Math.sqrt(-sqR);
        z1Im = -(8 * d + b * b * b) / 4 + b * c;
        z1Im /= RIm;
        z1Im = -z1Im;
    }
    z1Re += -(2 * c + sqR) + 3 * b * term1;
    z2Re += -(2 * c + sqR) + 3 * b * term1;
    if (z1Im === 0) {
        if (z1Re >= 0) {
            DRe = Math.sqrt(z1Re);
        } else {
            DIm = Math.sqrt(-z1Re);
        }
        if (z2Re >= 0) {
            ERe = Math.sqrt(z2Re);
        } else {
            EIm = Math.sqrt(-z2Re);
        }
    } else {
        r = Math.sqrt(z1Re * z1Re + z1Im * z1Im);
        r = Math.sqrt(r);
        dum1 = Math.atan2(z1Im, z1Re);
        dum1 /= 2;
        ERe = DRe = r * Math.cos(dum1);
        DIm = r * Math.sin(dum1);
        EIm = -DIm;
    }
    var real = [];
    if (0 === RIm + DIm) {
        real.push(-term1 + (RRe + DRe) / 2);
    }
    if (0 === -DIm + RIm) {
        real.push(-(term1 + DRe / 2) + RRe / 2);
    }
    if (0 === -RIm + EIm) {
        real.push(-(term1 + RRe / 2) + ERe / 2);
    }
    if (0 === RIm + EIm) {
        real.push(-(term1 + (RRe + ERe) / 2));
    }
    var unique = {};
    var result = [];
    for (var i = 0, l = real.length; i < l; i++) {
        if (!unique[real[i]]) {
            result.push(real[i]);
            unique[real[i]] = true;
        }
    }
    return result.length ? result : false;
}
module.exports = quarticEquation;