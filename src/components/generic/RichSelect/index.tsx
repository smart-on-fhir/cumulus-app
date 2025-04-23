import { ReactNode, useEffect, useState } from "react"
import Dialog                             from "../Dialog"
import Checkbox                           from "../Checkbox"
import { request }                        from "../../../backend"
import { modalRoot }                      from "../../../roots"
import { highlight }                      from "../../../utils"
import "./RichSelect.scss"



export interface ApiResponse {
    total  : number
    offset : number
    limit  : number
    search?: string
    hasMore: boolean
    data   : RichSelectOption[]
}

export interface RichSelectOption {
    value: string
    label: string
}

export type SelectionType = "single" | "multiple"

export interface RichSelectProps {
    search?: string
    value ?: RichSelectOption | RichSelectOption[]
    onChange: (selection?: RichSelectOption | RichSelectOption[]) => void
    placeholder?: string
    endpoint: string
    title?: string
}



function RichSelectDialog({
    search,
    value,
    onChange,
    endpoint,
    title,
    onComplete
}: {
    search?: string
    value?: RichSelectProps["value"]
    onChange: RichSelectProps["onChange"]
    endpoint: string
    title?: string
    onComplete?: () => void
}) {

    const [selection, setSelection] = useState(Array.isArray(value) ? [...value] : value);

    return <Dialog
        modal
        header={ title || "Please Select" }
        style={{
            width: 800,
            height: 600
        }}
        body={({ center }) => {
            return <RichSelectMenu
                search={search}
                center={center}
                value={value}
                onChange={setSelection}
                endpoint={endpoint}
            />
        }}
        footer={({ close }) => {
            return <div className="row middle" style={{ width: "100%" }}>
                { Array.isArray(selection) && <div className="col pl-05">{ selection.length } items selected</div> }
                <div className="col right">
                    <div>
                        <button className="btn color-red m-05"   style={{ minWidth: "8em" }} onClick={() => close()}>Cancel</button>
                        <button className="btn color-green m-05" style={{ minWidth: "8em" }} onClick={() => { onChange(selection); close(); }}>Apply</button>
                    </div>
                </div>
            </div>
        }}
        onComplete={onComplete}
    />
}

export default function RichSelect({ value, search, onChange, placeholder, endpoint, title }: RichSelectProps) {

    const [dialogOpen, setDialogOpen] = useState(false)

    let label: ReactNode = placeholder ? <span className="placeholder">{placeholder}</span> : ""
    if (Array.isArray(value)) {
        label = value.length == 1 ? value[0].label : `${value.length} items selected`
    } else if (value) {
        label = <span title={value.label}>{value.label}</span>
    }

    useEffect(() => {
        if (dialogOpen) {
            modalRoot.render(
                <RichSelectDialog
                    value={value}
                    search={search}
                    title={title}
                    endpoint={endpoint}
                    onChange={(sel) => {
                        onChange(sel)
                    }}
                    onComplete={() => {
                        setDialogOpen(false)
                    }}
                />
            )
        }
    }, [dialogOpen])

    return (
        <div className="rich-select form-control" onClick={() => setDialogOpen(true)}>
            <div className="rich-select-value">{label}</div>
            <span className="rich-select-button material-symbols-outlined">open_in_new</span>
        </div>
    )
}

function RichSelectMenu({
    search = "",
    center,
    value,
    onChange,
    endpoint
}: {
    value ?: RichSelectProps["value"]
    search?: string
    center : () => void
    onChange: (selection: typeof value) => void
    endpoint: string
}) {
    const selectionType: SelectionType = Array.isArray(value) ? "multiple" : "single";

    const [_search  , setSearch   ] = useState(search)
    const [data     , setData     ] = useState<ApiResponse | null>(null)
    const [selection, setSelection] = useState<typeof value>(value)
    const [selOnly  , setSelOnly  ] = useState(false)

    const whitelist = (selOnly ? (selection as RichSelectOption[]).map(x => x.value) : []).join(",")
    const allSelected = selectionType === "multiple" && data?.data.every(x => (selection as RichSelectOption[]).findIndex(s => s.value === x.value) > -1);

    useEffect(() => {
        const params = new URLSearchParams()
        if (whitelist) {
            params.set("whitelist", whitelist)
        } else if (_search) {
            params.set("search", _search)
        }
        request(endpoint, {
            method: "POST",
            body  : params
        })
        .then(setData)
    }, [_search, whitelist])

    useEffect(() => {
        if (data) {
            center()
        }
    }, [data])

    useEffect(() => {
        if (data) {
            onChange(selection)
        }
    }, [data, selection])

    function loadMore() {
        const params = new URLSearchParams()
        params.set("offset", data.data.length + "")
        if (whitelist) {
            params.set("whitelist", whitelist)
        } else if (_search) {
            params.set("search", _search)
        }
        request(endpoint, {
            method: "POST",
            body  : params
        })
        .then(d => setData({
            ...data,
            hasMore: d.hasMore,
            data: [...data.data, ...d.data]
        }))
    }


    return (
        <div className="rich-select-menu">
            <div className="search-header row middle">
                <div className="col col-0 left nowrap pr-1">
                    { selectionType === "multiple" && <>
                        <div className="row middle">
                            <Checkbox
                                checked={allSelected}
                                onChange={checked => {
                                    if (checked) {
                                        setSelection(data?.data)
                                    } else {
                                        setSelection([])
                                    }
                                }}
                                name="select-all"
                                label={ "Select All" }
                                type="checkbox"
                            />
                            <span className="color-muted pl-1 pr-1"> | </span>
                            <Checkbox
                                checked={selOnly}
                                onChange={setSelOnly}
                                name="selected-only"
                                label={ selOnly ? "Show All" : "Show Selected Only" }
                                type="checkbox"
                            />
                        </div>
                    </> }
                    { selectionType === "single" && <span className="link" onClick={() => setSelection(undefined)} aria-disabled={!selection}>Clear Selection</span> }
                </div>
                <div className="col">
                    <input type="search" autoFocus value={_search} onChange={e => setSearch(e.target.value)} placeholder="Search" disabled={!!whitelist} />
                </div>
            </div>
            <div className="rich-select-menu-options">
                { data?.data.map((opt, i) => {
                    if (selectionType === "single") {
                        return <Checkbox
                            checked={selection && opt.value === (selection as RichSelectOption).value}
                            onChange={() => setSelection(opt)}
                            name="selection"
                            label={ highlight(opt.label, data.search) }
                            type="radio"
                            key={i}
                        />
                    }

                    return <Checkbox
                        checked={(selection as RichSelectOption[]).findIndex(s => s.value === opt.value) > -1}
                        onChange={checked => {
                            if (checked) {
                                setSelection([...(selection as RichSelectOption[]), opt])
                            } else {
                                setSelection([...(selection as RichSelectOption[])].filter(x => x.value !== opt.value))
                            }
                        }}
                        name="selection"
                        label={ highlight(opt.label, data.search) }
                        type="checkbox"
                        key={i}
                    />
                })}
                { data?.hasMore === true && <>
                    <hr className="mt-1" />
                    <div className="link p-1" onClick={() => { loadMore() }}>Load more...</div>
                </>}
            </div>
        </div>
    )
}