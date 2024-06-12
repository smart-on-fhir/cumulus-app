import moment                            from "moment"
import { Component }                     from "react"
import { useNavigate, useParams }        from "react-router"
import { HelmetProvider, Helmet }        from "react-helmet-async"
import Breadcrumbs                       from "../generic/Breadcrumbs"
import Alert, { AlertError }             from "../generic/Alert"
import Loader                            from "../generic/Loader"
import { request }                       from "../../backend"
import { classList, defer, humanizeColumnName } from "../../utils"
import { app }                           from "../../types"
import "./DataUploader.scss"


interface Payload
{
    cols: Col[]
    rows: string[][]
}

interface Col
{
    name: string
    label: string
    description: string
    dataType: string
}

function detectDataTypeAt(i: number, name: string, rows: string[][]) {
    
    if (name === "cnt") return "integer";

    const map = [
        [ "range"  , "string"          ],
        [ "age"    , "integer"         ],
        [ "count"  , "integer"         ],
        [ "int"    , "integer"         ],
        [ "integer", "integer"         ],
        [ "float"  , "float"           ],
        [ "bool"   , "boolean"         ],
        [ "boolean", "boolean"         ],
        [ "year"   , "date:YYYY"       ],
        [ "month"  , "date:YYYY-MM"    ],
        [ "week"   , "date:YYYY-MM-DD" ],
        [ "day"    , "date:YYYY-MM-DD" ],
        [ "date"   , "date:YYYY-MM-DD" ]
    ];
    const tokens = name.toLowerCase().split("_").filter(Boolean)
    for (const [token, type] of map) {
        if (tokens.includes(token)) {
            return type;
        }
    }
    
    let type = "";

    function getType(x: string) {
        if (!x) {
            return ""
        }
        if ((/^\d{4}-01-01$/).test(x)) {
            return "year"
        }
        if ((/^\d{4}-\d{2}-01$/).test(x)) {
            return "month"
        }
        if ((/^\d{4}-\d{2}-\d{2}$/).test(x)) {
            return "day"
        }
        return "string"
    }

    for (let row of rows) {
        let col = String(row[i] || "").trim()
        let t = getType(col);

        if (t === "") {
            continue
        }

        if (type === "") {
            type = t
        }
        else {
            if (type && type !== t) {
                return "string"
            }
        }
    }

    return type || "hidden"
}

/**
 * Splits the line into cells using the provided delimiter (or by comma by
 * default) and returns the cells array. supports quoted strings and escape
 * sequences.
 * @param line The line to parse
 * @param delimiter The delimiter to use (defaults to ",")
 * @returns The cells as array of strings
 */
export function parseDelimitedLine(
    line: string,
    delimiters: string[] = [","],
    stringDelimiter: string = '"'
): string[]
{   
    const out: string[] = [];
    const len: number   = line.length;

    let idx    = 0,
        char   = "",
        expect = null,
        buffer = "";

    while (idx < len) {
        char = line[idx++];
        
        // String
        if (char === stringDelimiter) {

            // begin string
            if (!expect) {
                expect = char;
            }

            // Escaped quote - continue string
            else if (line[idx] === char) {
                buffer += char;
                idx++;
            }

            // Close string
            else {
                expect = null;
                out.push(buffer);
                buffer = "";
                idx++;
            }
        }

        // delimiter
        else if (delimiters.includes(char)) {
            if (!expect) {
                out.push(buffer);
                buffer = "";
            }
            else {
                buffer += char;
            }
        }

        // default
        else {
            buffer += char;
        }
    }

    if (buffer) {
        out.push(buffer);
        buffer = "";
    }

    if (expect) {
        throw new SyntaxError(`Syntax error - unterminated string. Expecting '"'`);
    }

    return out//.map(s => s.trim());
}

function ColumnEditor({
    cols,
    selectedIndex = 0,
    onChange,
    onSelectionChange
}: {
    cols: Col[]
    selectedIndex?: number
    onChange: (cols: Col[]) => void
    onSelectionChange: (index: number) => void
})
{
return (
    <table>
        <thead>
            <tr>
                <th>Column</th>
                <th>Label</th>
                <th>Data Type</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            { cols.map((col, i) => (
                <tr key={i} onClick={() => onSelectionChange(i)} className={ selectedIndex === i ? "selected" : undefined}>
                    <td>{col.name}</td>
                    <td className="small">
                        <input type="text" value={col.label} onChange={e => {
                            col.label = e.target.value
                            onChange(cols)
                        }} />    
                    </td>
                    <td className="small">
                        <select value={col.dataType} onChange={e => {
                            col.dataType = e.target.value
                            onChange(cols)
                        }}>
                            <option value="integer">Integer</option>
                            <option value="float">Float</option>
                            <option value="string">Text</option>
                            <option value="date:YYYY-MM-DD">Day</option>
                            <option value="date:YYYY wk W">Week</option>
                            <option value="date:YYYY-MM">Month</option>
                            <option value="date:YYYY">Year</option>
                            <option value="boolean">Boolean</option>
                            <option value="hidden">Hidden</option> 
                        </select>
                    </td>
                    <td className="small">
                        <input type="text" value={col.description} onChange={e => {
                            col.description = e.target.value
                            onChange(cols)
                        }} />    
                    </td>
                </tr>
            )) }
        </tbody>
    </table>
    )
}

function format(data: string, type: string, trim = false): any {
    switch (type) {
        case "integer": {
            data = data.trim()
            let n = parseInt(data, 10)
            if (isNaN(n) || !isFinite(n)/* || n + "" !== data*/) return null
            return n
        }
        case "float": {
            data = data.trim()
            let n = parseFloat(data)
            if (isNaN(n) || !isFinite(n)/* || n + "" !== data*/) return null
            return n
        }
        case "boolean": {
            data = data.trim().toLowerCase();
            return ["1", "true", "y", "yes", "on"].includes(data) ? true :
                ["0", "false", "n", "no", "off"].includes(data) ? false : null;
        }
        case "date:YYYY-MM-DD": {
            let m = moment(data.trim())
            if (!m.isValid()) return null
            return m.format("YYYY-MM-DD")
        }
        case "date:YYYY-MM": {
            let m = moment(data.trim())
            if (!m.isValid()) return null
            return m.format("YYYY-MM-01")
        }
        case "date:YYYY": {
            let m = moment(data.trim())
            if (!m.isValid()) return null
            return m.format("YYYY-01-01")
        }
        default:
            return (trim ? data.trim() : data) || null;
    }
}

function Preview({
    payload,
    selectedColIndex = 0,
    onSelectionChange,
    trimSpaces = true
}: {
    payload: Payload
    selectedColIndex: number
    trimSpaces: boolean
    onSelectionChange: (index: number) => void
})
{
    if (!payload.cols.filter(c => c.dataType !== "hidden").length) {
        return <div className="mb-1 color-muted">NO DATA TO PREVIEW</div>
    }
    return (
        <div className="import-preview-wrap">
            <table className="import-preview">
                <thead>
                    <tr>
                        { payload.cols.map((col, i) => {
                            if (col.dataType === "hidden") return null;
                            return (
                                <th key={i} title={ col.description || undefined } onClick={() => onSelectionChange(i)}>
                                    { col.label }
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    { payload.rows.slice(0, 10).map((row, i) => (
                        <tr key={i} tabIndex={0}>
                            {row.map((r, y) => {
                                let value: any = r, type = payload.cols[y]?.dataType || ""
                                if (type === "hidden") {
                                    return null
                                }
                                value = format(value, type, trimSpaces)

                                if (value === null) {
                                    value = <div className="center color-muted"><b>&lt;null&gt;</b></div>
                                }

                                else if (type === "string") {
                                    value = <span style={{ color: "#373" }}>{value}</span>
                                }
                                else if (type === "integer") {
                                    value = <span style={{ color: "#A00" }}>{value}</span>
                                }
                                else if (type === "float") {
                                    value = <span style={{ color: "#D00" }}>{value}</span>
                                }
                                else if (type === "boolean") {
                                    value = value ?
                                        <span style={{ color: "#0C0" }}>{value + ""}</span> :
                                        <span style={{ color: "#C00" }}>{value + ""}</span>
                                }
                                else if (type === "year" || type === "month" || type === "day" || type === "week" || type.startsWith("date")) {
                                    value = <span style={{ color: "#606" }}>{value}</span>
                                }
                                return (
                                    <td
                                        key={y}
                                        className={ selectedColIndex === y ? "selected" : undefined}
                                        onClick={() => onSelectionChange(y)}
                                    >{value}</td>)
                            })}
                        </tr>
                    )) }
                </tbody>
            </table>
        </div>
    )
}

///////////////////////////////////////////////////////////////////////////////

interface DataUploader2Props {
    requestID: number | string
    navigate: (location: string) => void
}

interface DataUploader2State {
    cols               : Col[]
    rows               : string[][]
    file               : File | null
    selectedColIndex   : number
    loading            : boolean
    errorMessage       : string | null
    uploadedBytes      : number
    totalBytes         : number
    requestLoading     : boolean
    requestError       : Error | null
    requestResult      : app.DataRequest | null
    importCompleted    : boolean
    uploading          : boolean
    estimate           : number
    dataType           : "cube" | "flat"
}

class DataUploader2 extends Component<DataUploader2Props, DataUploader2State>
{
    abortController: AbortController;

    constructor(props: DataUploader2Props) {
        super(props);

        this.state = {
            cols            : [],
            rows            : [],
            selectedColIndex: 0,
            loading         : false,
            errorMessage    : null,
            file            : null,
            uploadedBytes   : 0,
            totalBytes      : 0,
            requestLoading  : true,
            requestError    : null,
            requestResult   : null,
            importCompleted : false,
            uploading       : false,
            estimate        : 1000,
            dataType        : "cube"
        };

        this.upload = this.upload.bind(this)
        this.onFileSelected = this.onFileSelected.bind(this)
        this.abort = this.abort.bind(this)

        this.abortController = new AbortController()
    }

    parse(input: string) {

        let rows: any[] = input.split("\n").map(s => s.trim()).filter(Boolean)
        let cols: Col[] = []

        const separators: string[] = [","]

        const header = rows.shift() as string;

        if (rows.length >= 0) {
            rows = rows.map(row => parseDelimitedLine(row, separators))

            cols = parseDelimitedLine(header, separators).map((col, i) => {
                const title = humanizeColumnName(col)
                return {
                    name : col,
                    label: title,
                    description: title.charAt(0) + title.substring(1).toLowerCase(),
                    dataType: detectDataTypeAt(i, col, rows)
                }
            })
        }

        return { rows, cols };
    }

    abort(reason = "Aborted") {
        // @ts-ignore
        this.abortController.abort(reason);
        this.abortController = new AbortController()
        this.setState({
            importCompleted: false,
            uploading      : false,
            uploadedBytes: 0
        })
    }

    async onFileSelected(e: React.ChangeEvent<HTMLInputElement>)
    {
        const file = (e.target.files as FileList)[0];
        
        // @ts-ignore
        const readableStream = file.stream() as ReadableStream;

        const transformStream = new TransformStream({
            transform(chunk, controller) {
                controller.enqueue(new TextDecoder().decode(chunk as Uint8Array));
            },
            flush(controller) {
                controller.terminate();
            },
        });

        const stream = readableStream.pipeThrough(transformStream);
        const { value } = await stream.getReader().read()

        this.setState({
            totalBytes: +file.size,
            file,
            ...this.parse(value.substring(0, value.lastIndexOf("\n")))
        });
        
    }

    async upload() {
        const { file, cols, dataType } = this.state;

        if (!file) {
            return Promise.reject(new Error("No file"));
        }
        
        this.setState({ uploading: true })

        let _cols = cols.filter(col => col.dataType !== "hidden");
        
        let params = new URLSearchParams();
        params.set("types", _cols.map(c => encodeURIComponent(c.dataType)).join(","))
        params.set("labels", _cols.map(c => encodeURIComponent(c.label)).join(","))
        params.set("descriptions", _cols.map(c => encodeURIComponent(c.description)).join(","))
        params.set("data_type", dataType)
        
        let url = "/api/requests/" + this.props.requestID + "/data?" + params.toString();
        
        // @ts-ignore
        const readableStream = file.stream() as ReadableStream;

        let start = Date.now()
        let estimate = 1000

        const transformStream = new TransformStream({
            transform: (chunk, controller) => {
                this.setState({
                    uploadedBytes: this.state.uploadedBytes + chunk.byteLength,
                    estimate: 
                    this.state.uploadedBytes ?
                        (((Date.now() - start) || 1)  / (this.state.uploadedBytes || 1)) * chunk.byteLength :
                        Math.round(chunk.byteLength * 0.02)
                }, () => {
                    controller.enqueue(new TextDecoder().decode(chunk as Uint8Array));
                })
            },
            flush(controller) {
                controller.terminate();
            },
        });

        const reader = readableStream.pipeThrough(transformStream).getReader();

        let extra = ""
        let jobId = ""

        function setJobId(id: string) {
            jobId = id
        }

        while (true) {

            const { done, value } = await reader.read();

            if (done) {
                const res = await fetch((process.env.REACT_APP_BACKEND_HOST || "") + url, {
                    method: "PUT",
                    body: extra,
                    signal: this.abortController.signal,
                    credentials: "include",
                    headers: {
                        "content-type": "text/plain;charset=UTF-8",
                        "x-continue"  : "false",
                        "x-job-id"    : jobId
                    }
                });

                if (!res.ok) {
                    const errorMessage = await res.text()
                    this.setState({ errorMessage, uploadedBytes: 0, loading: false, uploading: false })
                    throw new Error(errorMessage)
                }

                return defer(() => {
                    this.setState({
                        importCompleted: true,
                        uploading: false
                    })
                    defer(() => this.props.navigate(`/requests/${this.props.requestID}`), 1400)
                }, estimate);
            }

            let body = extra + (value || "")
            let idx = body.lastIndexOf("\n")

            if (idx === -1 || idx === body.length - 1) {
                extra = ""
            } else {
                extra = body.slice(idx + 1)
                body  = body.slice(0, idx)
            }

            await fetch((process.env.REACT_APP_BACKEND_HOST || "") + url, {
                method: "PUT",
                body,
                signal: this.abortController.signal,
                credentials: "include",
                headers: {
                    "content-type": "text/plain;charset=UTF-8",
                    "x-continue"  : "true",
                    "x-job-id"    : jobId
                }
            }).then(res => res.text().then(txt => {
                if (!res.ok) {
                    this.setState({ errorMessage: txt, uploadedBytes: 0, loading: false, uploading: false })
                    throw new Error(txt)
                } else {
                    if (res.status === 202) {
                        setJobId(txt);
                    }
                }
            }))
        }
    }

    componentDidMount() {
        request("/api/requests/" + this.props.requestID).then(
            rq => this.setState({
                requestLoading: false,
                requestError  : null,
                requestResult : rq
            }),
            er => this.setState({
                requestLoading: false,
                requestError  : er,
                requestResult : null
            })
        )
    }

    render() {
        const {
            loading,
            selectedColIndex,
            cols,
            rows,
            file,
            uploadedBytes,
            totalBytes,
            requestLoading,
            requestError,
            requestResult,
            importCompleted,
            uploading,
            estimate,
            errorMessage,
            dataType
        } = this.state;

        if (requestLoading) {
            return <Loader/>
        }

        if (requestError) {
            return (
                <AlertError>
                    <b>Error Loading Subscription</b> - { requestError + "" }
                </AlertError>
            )
        }
    
        if (!requestResult) {
            return (
                <AlertError>
                    <b>Error Loading Subscription</b> - Failed to fetch data
                </AlertError>
            )
        }
    
        if (importCompleted) {
            return (
                <Alert color="green">
                    <div className="center">
                        <b>Data imported successfully!</b><br/>Redirecting...
                    </div>
                </Alert>
            )
        }

        return (
            <div className={ classList({
                "grey-out": loading,
                "data-uploader": true
            })}>
                <HelmetProvider>
                    <Helmet>
                        <title>Import Data</title>
                    </Helmet>
                </HelmetProvider>
                <Breadcrumbs links={[
                    { name: "Home", href: "/" },
                    { name: "Subscriptions", href: "/requests" },
                    { name: requestResult.name, href: `/requests/${requestResult.id}` },
                    { name: "Edit Subscription", href: `/requests/${requestResult.id}/edit` },
                    { name: "Import Data" }
                ]}/>
    
                <h3>Import Data</h3>
                <hr />
                <fieldset disabled={uploading}>
                { errorMessage && <AlertError><b>Error importing data</b> - {errorMessage}</AlertError> }
                <div className="row gap mt-1 mb-1">
                    <div className="col">
                        <label>Select CSV File</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="file"
                                value=""
                                accept=".csv,application/csv,application/x-csv,text/csv,text/comma-separated-values,text/x-comma-separated-values"
                                onChange={ this.onFileSelected } />
                            <div className="file-input-value" style={{
                                position: "absolute",
                                background: "#FFF",
                                top: "0.45em",
                                left: "7em",
                                right: "0.45em",
                                pointerEvents: "none"
                            }}>{file ? file.name : ""}</div>
                        </div>
                    </div>
                    <div className="col col-0">
                        <label>CSV Data Type</label>
                        <div className="toolbar flex">
                            <button
                                className={"btn" + (dataType === "cube" ? " active" : "")}
                                onClick={() => this.setState({ dataType: "cube" })}
                                data-tooltip="PowerSet Cube Data"
                                style={{ minWidth: "6em" }}
                                >
                                <i className="fa-solid fa-cube" /> Cube
                            </button>
                            <button
                                className={"btn" + (dataType === "flat" ? " active" : "")}
                                onClick={() => this.setState({ dataType: "flat" })}
                                data-tooltip="Normal Table Data"
                                style={{ minWidth: "6em" }}
                                ><i className="fas fa-th" /> Flat
                            </button>
                        </div>
                    </div>
                </div>
                
                { !!file && <>
                    <label>Preview (up to 10 rows)</label>
                    <Preview
                        payload={{ cols, rows }}
                        selectedColIndex={ selectedColIndex }
                        onSelectionChange={ selectedColIndex => this.setState({ selectedColIndex })}
                        trimSpaces={ true }
                    />
                    <br />
                
                    <ColumnEditor
                        cols={ cols }
                        onChange={ cols => this.setState({ cols }) }
                        selectedIndex={ selectedColIndex }
                        onSelectionChange={ selectedColIndex => this.setState({ selectedColIndex }) }
                    />
                    <hr className="mt-1"/>
                </> }
                </fieldset>
                { !!file && <div className="col center mt-1 mb-2">
                    { uploading && <div className="progress">
                        <div className="row gap small">
                            <div className="col">Importing data...</div>
                        </div>
                        <div className="progress-bar-wrap">
                            <div className="progress-bar" style={{
                                width: (uploadedBytes/(totalBytes || 1) * 100) + "%",
                                transitionDuration: estimate + "ms"
                            }}/>
                        </div>
                    </div> }
                    { !uploading && <button className="btn btn-blue big" onClick={this.upload}> <b> IMPORT </b> </button> }
                    { uploading && <button className="btn btn-brand-2 big" onClick={() => this.abort("Canceled by user")}> <b> Cancel </b> </button> }
                </div> }
            </div>
        )
    }
}

export default function DataUploader()
{
    const { id: requestID } = useParams();
    const navigate = useNavigate();

    if (!requestID) {
        return <p>No request ID</p>
    }

    return <DataUploader2 requestID={requestID} navigate={navigate} />
}
