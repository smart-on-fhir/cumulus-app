import { Transform } from "stream"
import { parseDelimitedLine } from "../lib"


export default class Line2CSV extends Transform
{    
    constructor()
    {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });
    }

    _transform(line: string, _encoding: any, next: any)
    {
        try {
            let data = parseDelimitedLine(line);
            next(null, data);
        } catch (ex) {
            next(ex);
        }
    }
}
