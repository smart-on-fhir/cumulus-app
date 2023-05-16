const { Transform } = require("stream");


/**
 * Convert a byte stream into stream of string lines using "\n"
 * al EOL separator.
 * Features:
 * - Protection against very long lines
 * - Track line numbers and use them in error messages
 * - Skip empty lines
 */
class Text2Lines extends Transform
{
    /**
     * Append string contents here until there is one or more
     * lines to be processed.
     */
    _stringBuffer = "";

    /**
     * The line that is currently being processed
     */
    _line = 0;

    /**
     * The current buffer char size (length)
     */
    _bufferSize = 0;

    constructor()
    {
        super({
            writableObjectMode: false,
            readableObjectMode: true,
        });

        this._stringBuffer = "";
        this._line         = 0;
        this.bufferSize    = 0;
    }

    validateLineLength()
    {
        const max = 500000; // TODO: put this in config
        if (this.bufferSize > max) {
            this._stringBuffer = "";
            this.bufferSize    = 0;
            throw new Error(`Buffer overflow. No EOL found in ${max} subsequent characters.`);
        }
    }

    /**
     * @param { Buffer } chunk 
     * @param { BufferEncoding } encoding 
     * @param { (e?:Error|null) => void } next 
     */
    _transform(chunk, encoding, next)
    {
        // Convert the chunk buffer to string
        this._stringBuffer += chunk.toString("utf8");   

        // Get the char length of the buffer
        this.bufferSize = this._stringBuffer.length;

        // Protect against very long lines (possibly bad files without EOLs).
        try {
            this.validateLineLength()
        } catch (ex) {
            return next(ex);
        }

        let pos = this._stringBuffer.search(/\n/);
        while (pos > -1) {
            const str = this._stringBuffer.substring(0, pos);
            this._stringBuffer = this._stringBuffer.substring(pos + 1);
            this._line += 1;
            pos = this._stringBuffer.search(/\n/);

            // If this is not an empty line!
            if (str.length) {
                this.push(str);
            }
        }

        this.bufferSize = this._stringBuffer.length;

        next();
    }

    /**
     * After we have consumed and transformed the entire input, the buffer may
     * still contain the last line so make sure we handle that as well
     * @param {function} next 
     */
    _flush(next)
    {
        if (this._stringBuffer) {
            try {
                this.validateLineLength()
            } catch (ex) {
                return next(ex);
            }
            this.push(this._stringBuffer);
            this._stringBuffer = "";
            next();
        } else {
            next();
        }
    }
}

module.exports = Text2Lines
