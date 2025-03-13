import { ReactNode }                from "react"
import { DataPackage, StudyPeriod } from "../../Aggregator"
import { groupBy, humanizeColumnName, sortBy } from "../../utils"
import { Link } from "react-router-dom"


export interface Data {
    study   : string
    total   : number
    site    : ReactNode
    version : ReactNode
    packages: number
    updated : Date
    type    : "study" | "version"
}

export function getStudyData(periods: StudyPeriod[], packages: DataPackage[]): Data[] {
    const data: Data[] = []

    const periodsByStudy = groupBy(periods, "study")

    for (const study in periodsByStudy) {
        const studyPackages = packages.filter(p => p.study === study);
        
        const sites = (periodsByStudy[study] as StudyPeriod[]).reduce((prev, cur) => {
            if (!prev.includes(cur.site)) {
                prev.push(cur.site)
            }
            return prev
        }, [] as string[]);

        const versions = (periodsByStudy[study] as StudyPeriod[]).reduce((prev, cur) => {
            if (!prev.includes(cur.version)) {
                prev.push(cur.version)
            }
            return prev
        }, [] as string[]);

        const updated = new Date(
            (periodsByStudy[study] as StudyPeriod[]).map(p => +new Date(p.last_data_update)).sort().pop()!
        )

        // The study row
        data.push({
            study,
            total   : studyPackages.reduce((prev, cur) => prev + cur.total, 0),
            site    : sites.length,
            version : <span className="color-muted nowrap">{versions.length + " version" + (versions.length === 1 ? "" : "s")}</span>,
            packages: studyPackages.length,
            updated,
            type: "study"
        });

        data.push(...getStudyVersionsData(study, periods, packages))
    }

    return data
}

export function getStudyVersionsData(study: string, periods: StudyPeriod[], packages: DataPackage[]): Data[] {

    const dataByVersion = groupBy(sortBy(periods.filter(p => p.study === study), "version"), "version");

    const data: Data[] = []

    for (const version in dataByVersion) {

        // Study periods data entries for the given version
        const versionData  = dataByVersion[version];

        // Packages for this study and version
        const versionPackages = packages.filter(p => p.version === version && p.study === study);

        // Total for this study & version
        const total = versionPackages.reduce((prev, cur) => prev + cur.total, 0)
    
        // Last time data was inserted into this study & version
        const updated = new Date(versionData.map(p => +new Date(p.last_data_update)).sort().pop()!)

        // Sites contributed to this study & version
        const sites = versionData.reduce((prev, cur) => {
            if (!prev.includes(cur.site)) {
                prev.push(cur.site)
            }
            return prev
        }, [] as string[]);

        data.push({
            study   : "",
            total,
            site    : <span data-tooltip={"<li>" + sites.map(humanizeColumnName).join('</li><li>') + "</li>"}>{sites.length}</span>,
            version : <Link to={`/studies/${study}/${version}`} className="link"><i className="material-symbols-outlined icon mr-05">history</i>{ version }</Link>,
            packages: versionPackages.length,
            updated,
            type    : "version"
        });
    }

    return data
}
