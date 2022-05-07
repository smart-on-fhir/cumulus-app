import moment                      from "moment"
import { useCallback, useReducer } from "react"
import { useNavigate, useParams }  from "react-router"
import { HelmetProvider, Helmet }  from "react-helmet-async"
import Breadcrumbs                 from "../Breadcrumbs"
import Alert, { AlertError }       from "../Alert"
import Loader                      from "../Loader"
import { useBackend }              from "../../hooks"
import { request, updateOne }      from "../../backend"
import { toTitleCase }             from "../../utils"
import "./DataUploader.scss"


const CSV_MIME_TYPES = [
    "application/csv",
    "application/x-csv",
    "text/csv",
    "text/comma-separated-values",
    "text/x-comma-separated-values"
];

const TSV_MIME_TYPES = [
    "application/tsv",
    "application/x-tsv",
    "text/tsv",
    "text/tab-separated-values",
    "text/x-tab-separated-values"
];

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

function detectDataTypeAt(i: number, rows: string[][]) {
    let type = "";

    function getType(x: string) {
        if (!x) {
            return ""
        }
        if ((/^-?[0-9]+$/).test(x)) {
            return "integer"
        }
        if ((/^-?[0-9]*\.[0-9]+$/).test(x)) {
            return "float"
        }
        if ((/^\d{4}-\d{2}-\d{2}/).test(x)) {
            return "date:YYYY-MM-DD"
        }
        return "string"
    }

    for (let row of rows) {
        let col = String(row[i] || "").trim()
        let t = getType(col)

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
    const selectedColumn = cols[selectedIndex] || {
        name: "",
        label: "",
        description: "",
        dataType: "string"
    }

    return (
        <>
            <label>Columns</label>
            <hr/>
            <div className="row gap mb-1 mt-1">
                <div className="col col-4">
                    <select size={5} value={ selectedIndex } onChange={e => onSelectionChange(e.target.selectedIndex)}>
                        { cols.map((col, i) => (
                            <option key={i} value={i}>{col.name}</option>
                        )) }
                    </select>
                </div>
                <div className="col col-6">
                    <div className="row half-gap">
                        <div className="col" title="The name of the column as it appears in the source file. Change only if you need to rename it!">
                            <label>Name</label>
                            <input type="text" value={selectedColumn.name} onChange={e => {
                                selectedColumn.name = e.target.value
                                onChange(cols)
                            }} />
                        </div>
                        <div className="col" title="Used by apps as human-readable name in charts and table headers.">
                            <label>Label</label>
                            <input type="text" value={selectedColumn.label} onChange={e => {
                                selectedColumn.label = e.target.value
                                onChange(cols)
                            }} />
                        </div>
                    </div>
                    <div className="row half-gap">
                        <div className="col" title="Please select the appropriate data type!">
                            <label>Data Type</label>
                            <select value={selectedColumn.dataType} onChange={e => {
                                selectedColumn.dataType = e.target.value
                                onChange(cols)
                            }}>
                                <option value="integer">Integer</option>
                                <option value="float">Float</option>
                                <option value="string">Text</option>
                                <option value="hidden">Hide</option>
                                <option value="date:YYYY-MM-DD">Date YYYY-MM-DD</option>
                                <option value="date:YYYY-MM">Date YYYY-MM</option>
                                <option value="date:YYYY">Date YYYY</option>
                                <option value="boolean">Boolean</option>
                            </select>
                        </div>
                        <div className="col" title="May be used by apps to show short description of the column.">
                            <label>Description</label>
                            <input type="text" value={selectedColumn.description} onChange={e => {
                                selectedColumn.description = e.target.value
                                onChange(cols)
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </>
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
    trimSpaces = false
}: {
    payload: Payload
    selectedColIndex: number
    trimSpaces: boolean
    onSelectionChange: (index: number) => void
})
{
    if (!payload.cols.filter(c => c.dataType !== "hidden").length) {
        return <div className="mt-1 mb-1 color-muted center">NO DATA TO PREVIEW</div>
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
                    { payload.rows.slice(0, 20).map((row, i) => (
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
                                    value = value ? <span style={{ color: "#0C0" }}>{value + ""}</span> : <span style={{ color: "#C00" }}>{value + ""}</span>
                                }
                                else if (type.startsWith("date")) {
                                    value = <span style={{ color: "#606" }}>{value}</span>
                                }
                                return (
                                    <td
                                        key={y}
                                        className={ selectedColIndex === y ? "selected" : ""}
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

interface State {
    input              : string
    separateByComma    : boolean
    separateByTab      : boolean
    separateBySemicolon: boolean
    separateBySpace    : boolean
    customSeparator    : string | null
    stringDelimiter    : string
    cols               : Col[]
    rows               : string[][]
    src                : string // the file name
    selectedColIndex   : number
    trimSpaces         : boolean
    startRow           : number
    endRow             : number | null
    loading            : boolean
    errorMessage       : string | null 
}

interface Action {
    type: string
    payload?: any
}

const INITIAL_STATE: State = {
    input              : "",
    separateByComma    : true,
    separateByTab      : false,
    separateBySemicolon: false,
    separateBySpace    : false,
    customSeparator    : null,
    stringDelimiter    : '"',
    cols               : [],
    rows               : [],
    src                : "",
    selectedColIndex   : 0,
    trimSpaces         : false,
    startRow           : 1,
    endRow             : null,
    loading            : false,
    errorMessage       : null
}

function reducer(state: State, action: Action): State
{
    const requireParse = [
        "input",
        "separateByComma",
        "separateByTab",
        "separateBySemicolon",
        "separateBySpace",
        "customSeparator",
        "stringDelimiter"
    ];

    function parse(newState: Partial<State> = {}) {

        newState = { ...state, ...newState }

        const input = newState.input || "\n" as string;

        let rows: any[] = input.split("\n").map(s => s.trim()).filter(Boolean)
        let cols: Col[] = []

        const separators: string[] = []
        if (newState.separateByComma    ) separators.push(",")
        if (newState.separateByTab      ) separators.push("\t")
        if (newState.separateBySemicolon) separators.push(";")
        if (newState.separateBySpace    ) separators.push(" ")
        if (newState.customSeparator    ) separators.push(newState.customSeparator)

        const header = rows.shift() as string;

        // console.assert(
        //     rows.length >= newState.startRow!,
        //     "Start row set to %s but the total rows are %s",
        //     newState.startRow,
        //     rows.length
        // )
        
        if (rows.length >= newState.startRow! - 1) {
            rows = rows.slice(newState.startRow! - 1, newState.endRow || undefined).map(row => {
                if (separators.length) {
                    return parseDelimitedLine(row, separators, newState.stringDelimiter)
                }
                return [row]
            })

            if (separators.length) {
                cols = parseDelimitedLine(header, separators, newState.stringDelimiter).map(
                    (col, i) => {
                        const title = toTitleCase(col)
                        return {
                            name : col,
                            label: title,
                            description: title.charAt(0) + title.substring(1).toLowerCase(),
                            dataType: detectDataTypeAt(i, rows)
                        }
                    }
                )
            } else {
                const title = toTitleCase(header)
                cols = [{
                    name: header,
                    label: title,
                    description: title.charAt(0) + title.substring(1).toLowerCase(),
                    dataType: "string"
                }]
            }
        }

        return {
            rows,
            cols
        }
    }

    function validate(newState: State) {
        if (!newState.rows || !newState.rows.length) {
            newState.errorMessage = "No data rows included"
        }
        else if (!newState.cols || !newState.cols.length) {
            newState.errorMessage = "No data columns included"
        }
        else if (!newState.cols.find(c => c.dataType !== "hidden")) {
            newState.errorMessage = "All columns are excluded"
        }
        else if (!newState.cols.find(c => c.name === "cnt")) {
            newState.errorMessage = "Input files must have a 'cnt' column for aggregate counts"
        }
        else {
            newState.errorMessage = null
        }
        return newState
    }

    if (action.type === "MERGE") {
        const needsParsing = Object.keys(action.payload).some(key => requireParse.includes(key));
        if (needsParsing) {
            return validate({
                ...state,
                ...action.payload,
                ...parse(action.payload)
            })
        } else {
            return validate({
                ...state,
                ...action.payload
            })
        }
    }

    if (action.type === "SET_INPUT") {
        return {
            ...state,
            ...parse({ input: action.payload }),
            input: action.payload
        }
    }

    if (action.type === "SET_COLS") {
        return validate({
            ...state,
            cols: action.payload
        })
    }

    if (action.type === "SET_SEPARATE_BY_COMMA") {
        return {
            ...state,
            separateByComma: !!action.payload,
            ...parse({separateByComma: !!action.payload})
        }
    }

    if (action.type === "SET_SEPARATE_BY_TAB") {
        return {
            ...state,
            separateByTab: !!action.payload,
            ...parse({separateByTab: !!action.payload})
        }
    }

    if (action.type === "SET_SEPARATE_BY_SEMICOLON") {
        return {
            ...state,
            separateBySemicolon: !!action.payload,
            ...parse({separateBySemicolon: !!action.payload})
        }
    }

    if (action.type === "SET_SEPARATE_BY_SPACE") {
        return {
            ...state,
            separateBySpace: !!action.payload,
            ...parse({separateBySpace: !!action.payload})
        }
    }

    if (action.type === "SET_CUSTOM_SEPARATOR") {
        return {
            ...state,
            customSeparator: action.payload,
            ...parse({customSeparator: action.payload})
        }
    }

    if (action.type === "SET_STRING_DELIMITER") {
        return {
            ...state,
            stringDelimiter: action.payload,
            ...parse({stringDelimiter: action.payload})
        }
    }

    if (action.type === "SET_SELECTED_COL_INDEX") {
        return {
            ...state,
            selectedColIndex: action.payload
        }
    }

    if (action.type === "SET_TRIM_SPACES") {
        return {
            ...state,
            trimSpaces: !!action.payload
        }
    }

    if (action.type === "SET_START_ROW") {
        const endRow = state.endRow ? Math.max(state.endRow, action.payload + 1) : null;
        return validate({
            ...state,
            startRow: action.payload,
            endRow,
            ...parse({startRow: action.payload, endRow})
        })
    }

    if (action.type === "SET_END_ROW") {
        // const startRow = Math.max(Math.min(action.payload - 1, state.startRow), 1);
        return validate({
            ...state,
            endRow: action.payload,
            // startRow,
            ...parse({endRow: action.payload/*, startRow*/})
        })
    }

    if (action.type === "SET_LOADING") {
        return {
            ...state,
            loading: !!action.payload
        }
    }

    return state
}

export default function DataUploader()
{
    const { id: requestID } = useParams();
    const navigate = useNavigate()


    const {
        loading: requestLoading,
        error  : requestError,
        result : requestResult
    } = useBackend(
        useCallback(
            () => request("/api/requests/" + requestID),
            [requestID]
        ),
        true
    );

    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

    const {
        // input,
        separateByComma,
        separateByTab,
        separateBySemicolon,
        separateBySpace,
        customSeparator,
        stringDelimiter,
        cols,
        rows,
        selectedColIndex,
        trimSpaces,
        startRow,
        endRow,
        loading,
        errorMessage,
        src
    } = state;

    

    const {
        execute: doImport,
        loading: importing,
        error  : importingError,
        result : importingResult
    } = useBackend(useCallback(() => {
        let _cols = cols.filter(col => col.dataType !== "hidden")
        let _rows = rows.map(row => row.filter((_, i) => cols[i].dataType !== "hidden").map((r, y) => {
            return format(r, _cols[y].dataType, trimSpaces)
        }));
        return updateOne("requests", requestID + "", {
            data: {
                cols: _cols as app.DataRequestDataColumn[],
                rows: _rows,
                src
            }
        })
    }, [requestID, cols, rows, trimSpaces, src]));

    function onFileSelected(e: React.ChangeEvent<HTMLInputElement>)
    {
        dispatch({ type: "SET_LOADING", payload: true })
        const file   = (e.target.files as FileList)[0]; // console.log(file);
        const reader = new FileReader();
        
        reader.addEventListener("load", () => {
            // data:text/csv;base64, data
            const re = /^\s*data:.*?;base64,\s*(77u\/)?/
            const data = String(reader.result).replace(re, "")
            // console.log(String(reader.result))
            // console.log("data: '%s'", data, reader.result)
            
            if (data !== "data:") {
                if (file.name.toLocaleLowerCase().endsWith(".tsv") || TSV_MIME_TYPES.includes(file.type)) {
                    dispatch({ type: "MERGE", payload: {
                        separateByTab: true,
                        separateByComma: false,
                        separateBySpace: false,
                        separateBySemicolon: false,
                        customSeparator: null,
                        input: window.atob(data),
                        src: file.name
                    }})
                } else {
                    dispatch({ type: "MERGE", payload: {
                        separateByTab: false,
                        separateByComma: true,
                        separateBySpace: false,
                        separateBySemicolon: false,
                        customSeparator: null,
                        input: window.atob(data),
                        src: file.name
                    }})
                }
            } else {
                dispatch({ type: "MERGE", payload: {
                    input: ""
                }})
            }
            
            dispatch({ type: "SET_LOADING", payload: false })
        }, false);
        
        reader.readAsDataURL(file);
    }

    const accept = [
        ".csv",
        ".tsv",
        "text/plain",
        ...CSV_MIME_TYPES,
        ...TSV_MIME_TYPES
    ];

    if (requestLoading) {
        return <Loader/>
    }

    if (requestError) {
        return (
            <AlertError>
                <b>Error Loading Data Subscription</b> - { requestError + "" }
            </AlertError>
        )
    }

    if (!requestResult) {
        return (
            <AlertError>
                <b>Error Loading Data Subscription</b> - Failed to fetch data
            </AlertError>
        )
    }

    if (importingResult) {
        setTimeout(() => navigate(`/requests/${requestID}`), 1000)
        return (
            <Alert color="green">
                <div className="center">
                    <b>Data imported successfully!</b><br/>Redirecting...
                </div>
            </Alert>
        )
    }


    return (
        <div className={ loading ? "grey-out" : undefined }>
            <HelmetProvider>
                <Helmet>
                    <title>Import Data</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Data Subscriptions", href: "/requests" },
                { name: requestResult.name, href: `/requests/${requestID}` },
                { name: "Edit Subscription", href: `/requests/${requestID}/edit` },
                { name: "Import Data" }
            ]}/>

            <h3>Import Data</h3>
            <hr />
            { importing && <Loader msg="Importing Data..." /> }
            { errorMessage && <AlertError><b>Input data error</b> - {errorMessage}</AlertError> }
            { importingError && <AlertError><b>Error importing data</b> - {importingError + ""}</AlertError> }
            <div className="row gap mt-1 mb-1">
                <div className="col">
                    <label>Select File</label>
                    <input
                        type="file"
                        value=""
                        accept={accept.join(",")}
                        onChange={ onFileSelected } />
                    <div className="color-muted" style={{ marginTop: "3px" }}>
                        Select a text file in delimited format like CSV or TSV
                    </div>
                </div>
            </div>
            
            <div className="row gap mt-1 mb-1">
                <div className="col nowrap">
                    <label>From row</label>
                    <input type="number" min={1} step={1} value={startRow} onChange={e => dispatch({ type: "SET_START_ROW", payload: e.target.valueAsNumber })} />
                </div>
                <div className="col nowrap" title="Use empty value to include all rows until the end of the input file">
                    <label>To row</label>
                    <input type="number" min={startRow + 1} step={1} value={endRow || undefined} onChange={e => dispatch({ type: "SET_END_ROW", payload: e.target.valueAsNumber })} />
                </div>
                <div className="col nowrap">
                    <label>String delimiter</label>
                    <select value={stringDelimiter} onChange={e => dispatch({ type: "SET_STRING_DELIMITER", payload: e.target.value })}>
                        <option value='"'>"</option>
                        <option value="'">'</option>
                    </select>
                </div>
                <div className="col nowrap bottom">
                    <label>
                        <input type="checkbox" checked={ trimSpaces } onChange={e => dispatch({ type: "SET_TRIM_SPACES", payload: e.target.checked })} /> Trim spaces
                    </label>
                </div>
            </div>
            
            <div className="row gap mt-1 mb-1">
                <div className="col">
                    <label>Separator</label>
                    <hr/>
                    <div className="row half-gap middle">
                        <div className="col col-0 nowrap mr-1">
                            <label className="inline">
                                <input type="checkbox" checked={separateByComma} onChange={e => dispatch({ type: "SET_SEPARATE_BY_COMMA", payload: e.target.checked })} /> Comma
                            </label>
                        </div>
                        <div className="col col-0 nowrap mr-1">
                            <label className="inline">
                                <input type="checkbox" checked={separateByTab} onChange={e => dispatch({ type: "SET_SEPARATE_BY_TAB", payload: e.target.checked })} /> Tab
                            </label>
                        </div>
                        <div className="col col-0 nowrap mr-1">
                            <label className="inline">
                                <input type="checkbox" checked={separateBySemicolon} onChange={e => dispatch({ type: "SET_SEPARATE_BY_SEMICOLON", payload: e.target.checked })} /> Semicolon
                            </label>
                        </div>
                        <div className="col col-0 nowrap mr-1">
                            <label className="inline">
                                <input type="checkbox" checked={separateBySpace} onChange={e => dispatch({ type: "SET_SEPARATE_BY_SPACE", payload: e.target.checked })} /> Space
                            </label>
                        </div>
                        <div className="col col-0 nowrap">
                            <div className="row middle">
                                <div className="col pr-1">
                                    <label className="inline">
                                        <input
                                            type="checkbox"
                                            checked={customSeparator !== null}
                                            onChange={e => dispatch({ type: "SET_CUSTOM_SEPARATOR", payload: e.target.checked ? "" : null })}
                                        /> Other:
                                    </label>
                                </div>
                                <div className="col">
                                    <input
                                        type="text"
                                        disabled={customSeparator === null}
                                        value={customSeparator || ""}
                                        onChange={e => dispatch({ type: "SET_CUSTOM_SEPARATOR", payload: e.target.value })}
                                        size={2}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ColumnEditor
                cols={ cols }
                onChange={ cols => dispatch({ type: "SET_COLS", payload: cols }) }
                selectedIndex={ selectedColIndex }
                onSelectionChange={ index => dispatch({ type: "SET_SELECTED_COL_INDEX", payload: index })}
            />
            
            <label>Preview (first 20 rows)</label>
            <hr className="mb-1"/>
            <Preview
                payload={{ cols, rows }}
                selectedColIndex={ selectedColIndex }
                onSelectionChange={ index => dispatch({ type: "SET_SELECTED_COL_INDEX", payload: index })}
                trimSpaces={ trimSpaces }
            />
            <hr className="mt-1"/>
            <div className="col center mt-1 mb-2">
                <button className="btn btn-blue big" onClick={doImport}> <b> IMPORT </b> </button>
            </div>
        </div>
    )
}