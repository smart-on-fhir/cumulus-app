const { Transform }          = require("stream");
const { parseDelimitedLine } = require("../lib");


class Line2CSV extends Transform
{    
    constructor()
    {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });
    }

    _transform(line, _encoding, next)
    {
        try {
            let data = parseDelimitedLine(line);
            next(null, data);
        } catch (ex) {
            next(ex);
        }
    }
}

module.exports = Line2CSV
