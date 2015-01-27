var table = require('./table');
var hmtx = table.create('hmtx', [], {
    read: function (reader, ttf) {
        var offset = this.offset;
        reader.seek(offset);
        var numOfLongHorMetrics = ttf.hhea.numOfLongHorMetrics;
        var hMetrics = [];
        var i;
        var hMetric;
        for (i = 0; i < numOfLongHorMetrics; ++i) {
            hMetric = {};
            hMetric.advanceWidth = reader.readUint16();
            hMetric.leftSideBearing = reader.readInt16();
            hMetrics.push(hMetric);
        }
        var advanceWidth = hMetrics[numOfLongHorMetrics - 1].advanceWidth;
        var numOfLast = ttf.maxp.numGlyphs - numOfLongHorMetrics;
        for (i = 0; i < numOfLast; ++i) {
            hMetric = {};
            hMetric.advanceWidth = advanceWidth;
            hMetric.leftSideBearing = reader.readInt16();
            hMetrics.push(hMetric);
        }
        return hMetrics;
    },
    write: function (writer, ttf) {
        var i;
        var numOfLongHorMetrics = ttf.hhea.numOfLongHorMetrics;
        for (i = 0; i < numOfLongHorMetrics; ++i) {
            writer.writeUint16(ttf.glyf[i].advanceWidth);
            writer.writeInt16(ttf.glyf[i].leftSideBearing);
        }
        var numOfLast = ttf.glyf.length - numOfLongHorMetrics;
        for (i = 0; i < numOfLast; ++i) {
            writer.writeInt16(ttf.glyf[numOfLongHorMetrics + i].leftSideBearing);
        }
        return writer;
    },
    size: function (ttf) {
        var numOfLast = 0;
        var advanceWidth = ttf.glyf[ttf.glyf.length - 1].advanceWidth;
        for (var i = ttf.glyf.length - 2; i >= 0; i--) {
            if (advanceWidth === ttf.glyf[i].advanceWidth) {
                numOfLast++;
            } else {
                break;
            }
        }
        ttf.hhea.numOfLongHorMetrics = ttf.glyf.length - numOfLast;
        return 4 * ttf.hhea.numOfLongHorMetrics + 2 * numOfLast;
    }
});
module.exports = hmtx;