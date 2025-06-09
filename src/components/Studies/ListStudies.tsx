import { useCallback, useEffect, useState } from "react"
import { Link, useSearchParams }            from "react-router-dom"
import { Options }                          from "highcharts"
import { Data, getStudyData }               from "./lib"
import Breadcrumbs                          from "../generic/Breadcrumbs"
import PageHeader                           from "../generic/PageHeader"
import Loader                               from "../generic/Loader"
import { AlertError }                       from "../generic/Alert"
import Toggle                               from "../generic/Toggle"
import Chart                                from "../generic/Chart"
import MetaDataList                         from "../generic/MetaDataList"
import { COLOR_THEMES }                     from "../Dashboard/config"
import Terminology                          from "../../Terminology"
import aggregator, { DataPackage }          from "../../Aggregator"
import { humanizeColumnName }               from "../../utils"


async function loadData() {
    return Promise.all([
        aggregator.getAllStudyPeriods(),
        aggregator.getPackages()
    ])
}


export default function ListStudies() {
    const [packages, setPackages] = useState<DataPackage[]>([])
    const [data    , setData    ] = useState<Data[]>([])
    const [loading , setLoading ] = useState(true)
    const [error   , setError   ] = useState<Error | string | null>(null)
    const [URLSearchParams, SetURLSearchParams] = useSearchParams()

    const showAll = URLSearchParams.get("showAll") === "true"

    const load = useCallback(() => {
        setLoading(true)
        setError(null)

        loadData()
            .then(([periods, packages]) => {
                setPackages(packages)
                return getStudyData(periods, packages)
            })
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => load(), [load])

    const studies       = data.filter(d => d.type === "study")
    const totalPackages = studies.reduce((prev, cur) => prev + cur.packages, 0)
    const totalStudies  = studies.length
    const totalRows     = studies.reduce((prev, cur) => prev + cur.total, 0)
    const lastUpdate    = data.reduce((prev, cur) => !prev || +cur.updated > +prev ? cur.updated : prev, new Date(0))

    return (
        <div className="container">
            <title>List {Terminology.study.namePlural}</title>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.study.namePlural, href: "/studies" }
            ]} />
            <div className="row">
                <div className="col">
                    <PageHeader
                        title={Terminology.study.namePlural}
                        icon={Terminology.study.icon}
                        description={`List all available ${Terminology.study.namePlural}`}
                    />
                </div>
                <div className="col col-0 middle">
                    <Link to="./new" className="btn btn-virtual">
                        <b className="color-green">
                            <i className="fa-solid fa-circle-plus" /> Create Study
                        </b>
                    </Link>
                </div>
            </div>
            <div className="mb-1 right middle" style={{ marginTop: "-1rem" }}>
                <label className="pointer fw-400 pr-05" onClick={() => SetURLSearchParams({ showAll: showAll ? "false" : "true" })}>Show all versions</label>
                <Toggle checked={showAll} onChange={ () => SetURLSearchParams({ showAll: showAll + "" }) } className="bg-brand-2" />
            </div>
            <hr className="mb-0"/>
            { loading ?
                <div><br /><Loader /></div> :
                error ?
                    <AlertError>{ error + "" }</AlertError> :
                    <div className="row wrap gap-2">
                        <div className="col" style={{ flex: "3 1 70%" }}>
                            <table className="table table-border-x table-hover mb-2" style={{ marginTop: "0.3rem"}}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "15%" }}>Study</th>
                                        <th className="center">{ showAll ? "Version" : "Current Version" }</th>
                                        <th className="right">Sites</th>
                                        <th className="right">Last Data Update</th>
                                        <th className="right">Packages</th>
                                        <th className="right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { data.length > 0 ?
                                    data
                                    .filter(row => showAll || row.type === "study")
                                    .map((row, i) => {
                                        const latestVersion = row.versions?.sort((a, b) => b.localeCompare(a))[0];
                                        return (
                                            <tr key={i}>
                                                <td className="nowrap">
                                                    { !!row.study && <b>
                                                        <i className="material-symbols-outlined icon color-brand-2">
                                                            { Terminology.study.icon }
                                                        </i> <Link to={`./${row.study}${ showAll ? "" : "/" + latestVersion }`} className="link">{ humanizeColumnName(row.study) }</Link>
                                                    </b> }
                                                </td>
                                                <td className="center">{ showAll ? row.version : latestVersion }</td>
                                                <td className="right">{row.site}</td>
                                                <td className="right">
                                                    <span data-tooltip="The last time data was inserted into this study version by any of the site participants">{row.updated.toDateString()}</span>
                                                </td>
                                                <td className="right">{row.packages}</td>
                                                <td className="right">{ Number(row.total).toLocaleString() }</td>
                                            </tr>
                                        )
                                    }) :
                                    <tr>
                                        <td colSpan={6} className="center">No Data</td>
                                    </tr>
                                }
                                </tbody>
                            </table>
                        </div>
                        <div className="col" style={{ wordBreak: "break-all", flex: "1 0 20rem" }}>
                            <div style={{ position: "sticky", top: "4em" }}>
                                { totalStudies > 1 && <>
                                    <h5 className="">Packages per Study</h5>
                                    <hr className="mb-1" />
                                    <StudiesChart packages={packages} />
                                </> }
                                <h5 className="">Metadata</h5>
                                <hr className="mb-1" />
                                <MetaDataList items={[
                                    {
                                        icon : Terminology.study.icon,
                                        label: `Total ${ Terminology.study.namePlural }`,
                                        value: Number(totalStudies).toLocaleString()
                                    },
                                    {
                                        icon : Terminology.dataPackage.icon,
                                        label: `Total ${ Terminology.dataPackage.namePlural }`,
                                        value: Number(totalPackages).toLocaleString()
                                    },
                                    {
                                        icon : "calculate",
                                        label: "Total Data Rows",
                                        value: Number(totalRows).toLocaleString()
                                    },
                                    {
                                        icon : "event_available",
                                        label: "Last Data Update",
                                        value: lastUpdate.toLocaleString()
                                    }
                                ]} />
                            </div>
                        </div>
                    </div>
            }
        </div>
    )
}

function StudiesChart({ packages }: { packages: DataPackage[] }) {

    const data = []

    packages.forEach(d => {
        let bucket = data.find(s => s.id === d.study);
        if (!bucket) {
            bucket = {
                name: humanizeColumnName(d.study),
                id: d.study,
                y: 1
            }
            data.push(bucket)
        } else {
            bucket.y++
        }
    })

    const chartOptions: Options = {
        chart: {
            backgroundColor: "transparent",
            height: 220,
            style: {
                fontFamily: "inherit"
            }
        },
        colors: COLOR_THEMES.find(t => t.id === "cumulus_light").colors,
        title: {
            text: "",
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            pie: {
                innerSize: "50%",
                borderWidth: 0.5,
                borderColor: "#0008",
                crisp: false,
                dataLabels: {
                    overflow: "allow",
                    crop: true,
                    style: {
                        fontSize: "0.86rem",
                        fontWeight: "400",
                        color: "#0006",
                        textOutline: "0"
                    }
                }
            }
        },
        series: [{
            type: "pie",
            name: 'Packages',
            animation: {
                duration: 0
            },
            data
        }]
    }
    return (
        <Chart options={chartOptions} containerProps={{ style: { margin: "0.25rem 0 1rem" }}} />
    )
}
