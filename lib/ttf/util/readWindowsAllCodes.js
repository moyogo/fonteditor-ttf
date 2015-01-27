function readWindowsAllCodes(tables) {
    var codes = {};
    var i;
    var l;
    var start;
    var end;
    var format0 = tables.filter(function (item) {
        return item.format === 0;
    });
    if (format0.length) {
        format0 = format0[0];
        for (i = 0, l = format0.glyphIdArray.length; i < l; i++) {
            if (format0.glyphIdArray[i]) {
                codes[i] = format0.glyphIdArray[i];
            }
        }
    }
    var format12 = tables.filter(function (item) {
        return item.platformID === 3 && item.encodingID === 10 && item.format === 12;
    });
    if (format12.length) {
        format12 = format12[0];
        for (i = 0, l = format12.nGroups; i < l; i++) {
            var group = format12.groups[i];
            var startId = group.startId;
            start = group.start;
            end = group.end;
            for (; start <= end;) {
                codes[start++] = startId++;
            }
        }
    } else {
        var format4 = tables.filter(function (item) {
            return item.platformID === 3 && item.encodingID === 1 && item.format === 4;
        });
        if (format4.length) {
            format4 = format4[0];
            var segCount = format4.segCountX2 / 2;
            var graphIdArrayIndexOffset = (format4.glyphIdArrayOffset - format4.idRangeOffsetOffset) / 2;
            for (i = 0; i < segCount; ++i) {
                for (start = format4.startCode[i], end = format4.endCode[i]; start <= end; ++start) {
                    if (format4.idRangeOffset[i] === 0) {
                        codes[start] = (start + format4.idDelta[i]) % 65536;
                    } else {
                        var index = i + format4.idRangeOffset[i] / 2 + (start - format4.startCode[i]) - graphIdArrayIndexOffset;
                        var graphId = format4.glyphIdArray[index];
                        if (graphId !== 0) {
                            codes[start] = (graphId + format4.idDelta[i]) % 65536;
                        } else {
                            codes[start] = 0;
                        }
                    }
                }
            }
        }
    }
    return codes;
}
module.exports = readWindowsAllCodes;