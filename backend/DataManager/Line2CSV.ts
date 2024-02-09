import { Transform } from "stream"
import { parseDelimitedLine } from "../lib"


export default class Line2CSV extends Transform
{
    delimiters: string[];

    quotes: string;

    constructor(delimiters = [","], quotes = '"')
    {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });
        this.delimiters = delimiters
        this.quotes = quotes
    }

    _transform(line: string, _encoding: any, next: any)
    {
        try {
            let data = parseDelimitedLine(line, this.delimiters, this.quotes);
            next(null, data);
        } catch (ex) {
            next(ex);
        }
    }
}
