import { ReactNode, useEffect, useRef, useState } from "react"
import { NavLink, useNavigate, useParams }        from "react-router-dom"
import Loader                                     from "../generic/Loader"
import { useAuth }                                from "../../auth"
import { request }                                from "../../backend"
import { classList, humanizeColumnName, sortBy }  from "../../utils"
import { app }                                    from "../../types"
import Terminology                                from "../../Terminology"
import aggregator                                 from "../../Aggregator"
import "./Navigation.scss"


async function loadTags() {
    const items = await request<app.Tag[]>("/api/tags")
    return sortBy(items, "name").map(g => ({
        icon  : "sell",
        render: () => <NavLink to={`/tags/${g.id}`}>{g.name}</NavLink>,
    } as unknown as DataRow))
}

async function loadStudies() {
    await aggregator.initialize()
    const studies = await aggregator.getStudies()
    return studies.map(s => ({
        icon  : "experiment",
        render: () => <NavLink to={`/studies/${s.id}`}>{s.label}</NavLink>,
        loader: async () => {
            const versions = await aggregator.getStudyVersions(s.id)
            const v = versions.pop()
            const packages = await aggregator.filterPackages({ study: s.id, version: v })
            return sortBy(packages.filter(p => p.type !== "flat"), "name").map(p => {
                const [, name] = p.id.trim().split("__")
                return {
                    icon  : "deployed_code",
                    render: () => <NavLink to={`/packages/${p.id}`}>{humanizeColumnName(name)}</NavLink>,
                }
            })
        }
    }) as unknown as DataRow)
}

async function loadSites() {
    const items = await aggregator.getSites()
    return sortBy(items, "name").filter(x => !!x.id).map(x => ({
        render: () => <NavLink to={`/sites/${x.id}`}>{ x.name }</NavLink>,
        icon  : Terminology.site.icon,
    } as unknown as DataRow))
}

async function loadQualityMetrics() {
    const packages = await aggregator.filterPackages({ type: "flat" })
    const sites = packages.reduce((prev, cur) => {
        if (cur.site && !prev.includes(cur.site)) {
            prev.push(cur.site)
        }
        return prev
    }, [])

    return sites.sort().map(s => ({
        icon: Terminology.site.icon,
        render: () => humanizeColumnName(s),
        loader: async () => {

            const byName = {}

            const sitePackages = packages.filter(p => p.site === s);

            sitePackages.forEach(p => {
                if (!byName[p.name]) {
                    byName[p.name] = []
                }
                byName[p.name].push(p)
            })

            return Object.keys(byName).sort().map(name => {

                if (byName[name].length === 1) {
                    const pkg = byName[name][0];
                    return {
                        icon  : "table",
                        render: () => <NavLink to={`/packages/${pkg.id}`}>{humanizeColumnName(name)}</NavLink>,
                    }
                }

                const sorted = byName[name].sort((a, b) => +b.version - +a.version)

                return {
                    icon  : "table",
                    render: () => {
                        const newest = sorted[0];
                        return <NavLink to={`/packages/${newest.id}`}>{humanizeColumnName(name)}</NavLink>
                    },
                    loader: async () => {
                        return sorted.map(pkg => {
                            return {
                                icon  : "history",
                                render: () => <NavLink to={`/packages/${pkg.id}`}>Version {pkg.version}</NavLink>
                            }
                        })
                    }
                }
            })
        }
    }));
}

export interface DataRow {
    icon     ?: string
    iconColor?: string
    loader   ?: () => Promise<DataRow[]>
    render    : (node: DataRow) => ReactNode
    href     ?: string
    [key: string]: any
}

export function Tree({ data }: { data: DataRow[] }) {
    return (
        <div className="tree">
            <div>
                { data.map((row, i) => <Row node={row} key={i} />) }
            </div>
        </div>
    )
}

function Row({ node }: { node: DataRow }) {
    const currentPath             = String(useParams()["*"] || "")
    const [loading , setLoading ] = useState(false)
    const [children, setChildren] = useState<DataRow[]>([])
    const [error   , setError   ] = useState<Error | string>("")
    const [isOpen  , setIsOpen  ] = useState<boolean|undefined>(
        node.open || (
            currentPath !== node.id &&
            !!node.loader &&
            currentPath.startsWith(node.id)
        )
    )
    
    const length = children.length

    useEffect(() => {
        if (isOpen && !!node.loader && length === 0) {
            setLoading(true)
            node.loader()
                .then(setChildren)
                .catch(setError)
                .finally(() => setLoading(false))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, length])

    return (
        <div className={ classList({
            details: true,
            "has-children": !!node.loader || children.length > 0
        }) }>
            <summary>
                { !!node.loader ? <b className="toggle" onClick={e => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }} >{ isOpen ? "▾" : "▸" }</b> : node.inset ? <b className="toggle"/> : null }
                <label
                    data-tooltip={ error ? error + "" : node.title }
                    className={ node.id && node.id === currentPath ? "selected" : undefined }>
                    { loading ?
                        <Loader msg="" /> :
                        <span className={"icon icon-2 material-symbols-outlined" + (!!node.loader ? isOpen ? " open" : "" : "")}>
                            { node.icon || (!!node.loader || children.length ? "folder_open" : "draft") }
                        </span>
                    }
                    { error ? error + "" : node.render(node) }
                </label>
            </summary>
            { isOpen ?
                children.length > 0 ?
                    children.map((child, i) => <Row key={i} node={{ iconColor: node.iconColor, ...child }} />) :
                    loading ?
                        null :
                        <div className="details">
                            <summary>
                                <label className="color-muted">&nbsp; No Items</label>
                            </summary>
                        </div> :
                null
            }
        </div>
    )
}

export default function Navigation()
{
    let { loading, user, logout } = useAuth();
    let navigate = useNavigate();
    const ref = useRef<HTMLDivElement|null>(null);

    function onResizeStart(event: React.MouseEvent) {

        event.preventDefault()

        let diff = 0
        
        function onResizerMouseMove(e: MouseEvent) {
            event.preventDefault()
            if (ref.current) {
                ref.current.style.width = e.clientX + diff + "px"
            }
        }

        if (ref.current) {
            diff = ref.current.offsetWidth - event.clientX    
            
            document.addEventListener("mousemove", onResizerMouseMove)
            document.addEventListener("mouseup", (e) => {
                document.removeEventListener("mousemove", onResizerMouseMove)
                document.dispatchEvent(new Event("resize", { bubbles: true }))
                localStorage.sidebarWidth = e.clientX + diff + "px"
            }, { once: true })
        }
    }

    if (!user || user.status !== "Logged in" || !Array.isArray(user.permissions)) {
        // return null
        if (user && (user.status !== "Logged in" || !Array.isArray(user.permissions))) {
            logout().then(() => navigate("/"));
        }
        return null
    }

    const canReadSubscriptions = user.permissions.includes("Subscriptions.read")
    const canListGroups        = user.permissions.includes("SubscriptionGroups.read")
    const canReadTags          = user.permissions.includes("Tags.read")
    const canReadStudyAreas    = user.permissions.includes("StudyAreas.read")
    const canReadUsers         = user.permissions.includes("Users.read")
    const canManagePermissions = user.permissions.includes("Permissions.read")
    const canReadUserGroups    = user.permissions.includes("UserGroups.read")
    const canAdminister        = canReadUsers || canReadUserGroups || canManagePermissions;

    const TREE_DATA: DataRow[] = [
        {
            render: () => <NavLink to="/"><b>Home</b></NavLink>,
            icon: "house",
            inset: true
        },
        {
            render: () => <b>Local</b>,
            icon: "folder_open",
            open: true,
            loader: async () => {
                const out = []

                if (canReadStudyAreas) {
                    out.push({
                        icon: Terminology.studyArea.icon,
                        render: () => <NavLink to="/study-areas">{Terminology.studyArea.namePlural}</NavLink>,
                        loader: async function loadStudyAreas() {
                            const items = await request<app.StudyArea[]>("/api/study-areas")
                            return sortBy(items, "name").map(x => ({
                                icon: Terminology.studyArea.icon,
                                render: () => <NavLink to={`/study-areas/${x.id}`}>{x.name}</NavLink>,
                            } as unknown as DataRow))
                        }
                    })
                }

                out.push({
                    icon: Terminology.graph.icon,
                    render: () => <NavLink to="/views">{Terminology.graph.namePlural}</NavLink>,
                })

                if (canReadSubscriptions) {
                    out.push({
                        icon: Terminology.subscription.icon,
                        render: () => <NavLink to="/requests">{Terminology.subscription.namePlural}</NavLink>,
                    })
                }

                if (canListGroups) {
                    out.push({
                        icon: Terminology.subscriptionGroup.icon,
                        render: () => <NavLink to="/groups">{Terminology.subscriptionGroup.namePlural}</NavLink>,
                        loader: async function loadGroups() {
                            const groups = await request<app.SubscriptionGroup[]>("/api/request-groups")
                            return sortBy(groups, "name").filter(g => !!g.id).map(g => ({
                                render: () => <NavLink to={ `/groups/${g.id}` }>{ g.name }</NavLink>,
                                icon  : Terminology.subscriptionGroup.icon,
                            } as unknown as DataRow));
                        }
                    })
                }

                if (canReadTags) {
                    out.push({
                        icon: Terminology.tag.icon,
                        render: () => <NavLink to="/tags">{Terminology.tag.namePlural}</NavLink>,
                        loader: loadTags
                    })
                }

                return out;
            }
        },
        {
            render: () => <b>Remote</b>,
            icon: "cloud",
            open: true,
            loader: async () => {
                const out = []

                out.push({
                    icon: Terminology.study.icon,
                    render: () => <NavLink to="/studies">{Terminology.study.namePlural}</NavLink>,
                    loader: loadStudies
                })

                out.push({
                    icon: Terminology.site.icon,
                    render: () => <NavLink to="/sites">{Terminology.site.namePlural}</NavLink>,
                    loader: loadSites
                })

                out.push({
                    icon: Terminology.dataPackage.icon,
                    render: () => <NavLink to="/packages">{Terminology.dataPackage.namePlural}</NavLink>
                })

                out.push({
                    icon: "verified",
                    render: () => "Quality Metrics",
                    loader: loadQualityMetrics
                })

                out.push({
                    icon: "inventory_2",
                    render: () => "Catalog",
                    loader: async () => [
                        {
                            render: () => <NavLink to="/catalog/icd10">ICD10 Diagnoses</NavLink>,
                            icon: "list_alt"
                        },
                        {
                            render: () => <NavLink to="/catalog/loinc">LOINC Laboratories</NavLink>,
                            icon: "list_alt"
                        }
                    ]
                })

                return out;
            }
        },

        {
            icon     : "person",
            render   : () => <b>Personal</b>,
            loader   : async () => [
                {
                    render: () => <NavLink to="/drafts">Draft {Terminology.graph.namePlural}</NavLink>,
                    icon: "edit_square",
                },

                {
                    icon: "manage_accounts",
                    render: () => <NavLink to="/user">My Account</NavLink>
                },

                {
                    icon: "power_settings_new",
                    render: () => <div style={{ cursor: "pointer" }} onClick={() => {
                        logout().then(() => navigate("/"));
                    }}>Sign Out { loading && <i className="fas fa-circle-notch fa-spin color-muted" /> }
                    </div>,
                }
            ]
        }
    ]

    if (canAdminister) {
        TREE_DATA.push({
            icon: "build_circle",
            // open: true,
            render: () => <b>Administration</b>,
            loader: async () => {
                const items = []

                if (canReadUsers) {
                    items.push({
                        icon: "person",
                        render: () => <NavLink to="/users" end>Manage Users</NavLink>
                    })
                }

                if (canReadUserGroups) {
                    items.push({
                        icon: "group",
                        render: () => <NavLink to="/user-groups" end>Manage User Groups</NavLink>
                    })
                }

                if (canManagePermissions) {
                    items.push({
                        icon: "shield_lock",
                        render: () => <NavLink to="/permissions" end>Manage Permissions</NavLink>
                    })
                }

                items.push({
                    icon: "stethoscope",
                    render: () => <NavLink to="/health-check" end>Health Check</NavLink>
                })

                return items
            }
        })
    }

    return (
        <div className="navigation" ref={ref} style={{ width: localStorage.sidebarWidth || "16rem" }}>
            <div className="navigation-wrap">
                <Tree data={TREE_DATA} />
            </div>
            <div className="resizer" onMouseDown={onResizeStart} tabIndex={0} />
        </div>
    )
}
