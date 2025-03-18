import React, { useCallback } from "react"
import Link                   from "../Link"
import DataPackageViewer      from "./DataPackageViewer"
import PackageVersionCheck    from "./PackageVersionCheck"
import { ColumnEditor }       from "./ColumnEditor"
import { Format }             from "../Format"
import Select                 from "../generic/Select"
import TagSelector            from "../Tags/TagSelector"
import MarkdownEditor         from "../generic/MarkdownEditor"
import Loader                 from "../generic/Loader"
import { AlertError }         from "../generic/Alert"
import { useAuth }            from "../../auth"
import { app }                from "../../types"
import { humanizeColumnName } from "../../utils"
import { useBackend }         from "../../hooks"
import aggregator             from "../../Aggregator"
import { DataPackage, Study } from "../../Aggregator"
import Terminology            from "../../Terminology"
import "./form.scss"


export default function SubscriptionForm({
    saveRequest,
    deleteRequest,
    record = {},
    onChange,
    subscriptionGroups,
    working
}: {
    saveRequest: () => void
    deleteRequest?: () => void
    record?: Partial<app.SubscriptionWithPackage>
    onChange: (state: Partial<app.SubscriptionWithPackage>) => void
    subscriptionGroups: app.SubscriptionGroup[]
    working?: "deleting" | "saving"
})
{
    const { user } = useAuth();

    const canUpdate = user?.permissions.includes("Subscriptions.update")
    const canDelete = user?.permissions.includes("Subscriptions.delete")

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        saveRequest()
    }

    const {
        id,
        createdAt,
        updatedAt,
        completed,
        name = "",
        description = "",
        groupId,
        dataURL = ""
    } = record

    const dataSourceType = record.dataSourceType || (dataURL ? "aggregator" : "file");

    return (
        <form onSubmit={ onSubmit }>
            { id && <div className="row gap color-muted small mt-1">
                <div className="col mb-1">
                    <b className="nowrap">Created</b> <Format value={ createdAt } format="date-time" />
                </div>
                <div className="col mb-1 center">
                    <b className="nowrap">Updated</b> <Format value={ updatedAt } format="date-time" />
                </div>
                <div className="col mb-1 right">
                    <b className="nowrap">Data Inserted</b> <Format value={ completed } format="date-time" />
                </div>
            </div> }
            <div className="row gap-2 wrap">
                
                <div className="col col-5 mt-1 responsive">
                    <div className="row gap middle">
                        <label className="col">Name</label>
                        <span className="col right color-muted small">Up to 100 characters&nbsp;</span>
                    </div>
                    <input
                        type="text"
                        value={ name || "" }
                        onChange={e => onChange({ ...record, name: e.target.value })}
                        name="SubscriptionName"
                        placeholder={`${Terminology.subscription.nameSingular} Name`}
                        required
                    />
                    <div className="row gap mt-1">
                        <div className="col middle">
                            <label>{Terminology.subscriptionGroup.nameSingular}</label>
                        </div>
                        <div className="col col-0 right middle color-blue small">
                            <Link to="/groups">
                                Manage {Terminology.subscriptionGroup.namePlural} <i className="fa-solid fa-up-right-from-square" />
                            </Link>
                        </div>
                    </div>
                    <select value={groupId || undefined} onChange={e => onChange({ ...record, groupId: +e.target.value })}>
                        <option>None (GENERAL)</option>
                        {subscriptionGroups.map((g, i) => (
                            <option key={i} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                    <div className="mt-1">
                        <div className="row gap middle">
                            <div className="col middle">
                                <label className="col">{Terminology.tag.namePlural}</label>
                            </div>
                            <div className="col col-0 right middle color-blue small">
                                <Link to="/tags">
                                    Manage {Terminology.tag.namePlural} <i className="fa-solid fa-up-right-from-square" />
                                </Link>
                            </div>
                        </div>
                        <div>
                            <TagSelector selected={record.Tags} onChange={tags => onChange({ ...record, Tags: tags })} />
                        </div>
                    </div>
                </div>
                
                <div className="col col-5 mt-1 mb-0 responsive">
                    <div className="row row-10 stretch">
                        <MarkdownEditor textarea={{
                            value: description || "",
                            onChange: e => onChange({ ...record, description: e.target.value }),
                            className: "form-control description-editor"
                        }}
                        height="10em" />
                    </div>
                </div>
            </div>

            { !id && <div className="mt-2 mb-1">
                <div className="row gap wrap">
                    <div className="col col-3 responsive middle mb-1">
                        <label className="nowrap pt-0">Data Source</label>
                        <Select
                            options={[
                                {
                                    value: "file",
                                    icon: "fa-regular fa-file color-blue",
                                    label: (
                                        <div>
                                            <div>File</div>
                                            <div className="color-muted small">Data is inserted by manually uploading a CSV or TSV file</div>
                                        </div>
                                    )
                                },
                                {
                                    value: "aggregator",
                                    icon: "fa-solid fa-network-wired color-blue",
                                    label: (
                                        <div>
                                            <div>Aggregator</div>
                                            <div className="color-muted small">The application pulls the data from the Cumulus Aggregator</div>
                                        </div>
                                    )
                                }
                            ]}

                            disabled={ !!record.id }
                            value={dataSourceType}
                            onChange={dataSourceType => onChange({
                                ...record,
                                dataSourceType,
                                dataURL: dataSourceType === "file" ? undefined : record.dataSourceType,
                                dataPackage: dataSourceType === "file" ? undefined : record.dataPackage
                            })}
                        />
                    </div>
                    { dataSourceType === "file" && <div className="col col-7 responsive middle mb-1">
                        <label className="nowrap pt-0">&nbsp;</label>
                        <div>
                            { id ?
                                <Link to="../import" className="link">Import Data</Link> :
                                <><i className="fas fa-info-circle" />&nbsp;You can upload a CSV or TSV file once this {Terminology.subscription.nameSingular.toLowerCase()} is saved</>
                            }
                        </div>
                    </div> }
                    { dataSourceType === "aggregator" && <DataSourceSelector onChange={onChange} subscription={record} /> }
                </div>
            </div> }

            { id && dataURL && <div className="mb-1 mt-2">
                <div className="row gap wrap">
                    <DataSourceSelector onChange={onChange} subscription={record} />
                </div>
            </div> }

            { dataURL?.match(/.+?__.+?__.+?/) && <>
                <div><PackageVersionCheck pkgId={dataURL} /></div>
                <div className="row center">
                    <DataPackageViewer packageId={dataURL} />
                </div>
            </> }

            { id && Array.isArray(record.metadata?.cols) && <div className="mb-1 mt-2">
                <label className="nowrap pt-0">Available Columns</label>
                <hr/>
                <ColumnEditor
                    cols={ record.metadata.cols }
                    onChange={ cols => {
                        const metadata = { ...record.metadata, cols }
                        
                        // @ts-ignore
                        metadata.cols.forEach(col => { delete col.meta; })

                        // @ts-ignore
                        onChange({ ...record, metadata })
                    }}
                />
            </div> }

            <hr className="mt-1"/>

            <div className="center">
                { id && canDelete && deleteRequest &&
                    <button className="btn color-red pl-1 pr-1 m-1" style={{ minWidth: "11em" }} type="button" onClick={deleteRequest}>
                        { working === "deleting" && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                        Delete {Terminology.subscription.nameSingular}
                    </button>
                }
                { canUpdate && 
                    <button className="btn btn-green pl-1 pr-1 m-1" style={{ minWidth: "11em" }} type="submit">
                        { working === "saving" && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                        { id ? "Save Changes" : "Create " + Terminology.subscription.nameSingular }
                    </button>
                }
            </div>
            
        </form>
    )
}

function DataSourceSelector({
    subscription,
    onChange
}: {
    onChange: (data: Partial<app.Subscription>) => void
    subscription: Partial<app.Subscription>
}) {
    const dataUrl = subscription.dataURL || ""
    const [_study, _pkg, _version] = dataUrl.split("__")

    const { loading, error, result } = useBackend<{ dataPackages: DataPackage[], studies: Study[] }>(
        useCallback(async () => {
            await aggregator.initialize()
            return aggregator.getStudies()
                .then(studies => ({ dataPackages: aggregator.packages, studies }))
        }, []),
        true
    );

    if (loading) {
        return <div className="col col-7 responsive middle mb-1">
            <label className="nowrap pt-0">&nbsp;</label>
            <Loader msg="Loading aggregator data..." />
        </div>
    }

    if (error) {
        return <div className="col col-7 responsive middle mb-1 color-red">
            <label className="nowrap pt-0">&nbsp;</label>
            <div><i className="fa-regular fa-circle-xmark" />&nbsp;{ error + "" }</div>
        </div>
    }

    if (!result) {
        return <AlertError className="form-control pl-2" style={{ margin: 0 }}>Failed getting aggregator data</AlertError>
    }

    const packages = result.dataPackages.filter(p => p.study === _study)

    const uniquePackages = packages.reduce((prev, cur) => {
        if (!prev.find(p => p.name === cur.name)) {
            prev.push(cur)
        }
        return prev
    }, [] as DataPackage[])

    const versions = packages.filter(p => p.name === _pkg).map(p => p.version).sort((a, b) => b.localeCompare(a))

    function getLatestVersion(pkgName: string) {
        return packages.filter(p => p.name === pkgName).map(p => p.version).sort((a, b) => b.localeCompare(a)).shift()
    }

    function update({
        study,
        pkg,
        version
    }: {
        study  ?: string
        pkg    ?: string
        version?: string
    }) {
        study   = study ?? _study
        pkg     = pkg   ?? _pkg

        const payload: Partial<app.SubscriptionWithPackage> = {
            ...subscription,
            dataURL: `${study}__${pkg}__${version ?? ""}`
        }

        // const selectedPackage = result?.dataPackages.find(p => p.id === payload.dataURL)
        const selectedPackage = result?.dataPackages.find(p => p.study === study && p.name === pkg && p.version === version)
        if (selectedPackage) {
            payload.metadata = {
                total: +selectedPackage.total,
                type : selectedPackage.type || "cube",
                cols : Object.keys(selectedPackage.columns).map(name => {
                    let type = String(selectedPackage.columns[name])
                        .replace("year" , "date:YYYY")
                        .replace("month", "date:YYYY-MM")
                        .replace("week" , "date:YYYY-MM-DD")
                        .replace("day"  , "date:YYYY-MM-DD") as app.supportedDataType;
    
                    return {
                        name,
                        label      : humanizeColumnName(name),
                        description: humanizeColumnName(name),
                        dataType   : type
                    }
                })
            }
            payload.dataPackage = selectedPackage
            payload.completed = selectedPackage.last_data_update
        } else {
            payload.metadata = null
            payload.dataPackage = null
            payload.completed = null
        }
        onChange(payload)
    }


    return (
        <>
            <div className="col col-2 responsive middle mb-1">
                <label className="nowrap pt-0">Study</label>
                <select value={_study} onChange={e => {
                    update({ study: e.target.value, pkg: "", version: "" })
                }}>
                    <option value="">Please Select</option>
                    { result.studies.map((s, i) => (
                        <option key={i} value={s.id}>📦 {s.label}</option>
                    )) }
                </select>
            </div>
            <div className="col col-3 responsive middle mb-1">
                <label className="nowrap pt-0">Data Package</label>
                <select disabled={!_study} value={_pkg} onChange={e => {
                    update({ pkg: e.target.value, version: getLatestVersion(e.target.value) })
                }}>
                    <option value="">Please Select</option>
                    { uniquePackages.map((p, i) => (
                        <option key={i} value={p.name}>📔 {humanizeColumnName(p.name)}</option>
                    )) }
                </select>
            </div>
            <div className="col col-2 responsive middle mb-1">
                <label className="nowrap pt-0">Version</label>
                <select disabled={!_pkg} value={_version} onChange={e => update({ version: e.target.value })} placeholder="test">
                    { _pkg ? versions.map((v, i) => (
                        <option key={i} value={v}>📑 {v}</option>
                    )) : <option value="">Please Select</option> }
                </select>
            </div>
        </>
    )
}
