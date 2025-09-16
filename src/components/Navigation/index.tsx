import { ReactNode, useEffect, useRef, useState } from "react"
import { NavLink, useLocation, useNavigate }      from "react-router-dom"
import Loader                                     from "../generic/Loader"
import { useAuth }                                from "../../auth"
import { request }                                from "../../backend"
import { classList, humanizeColumnName, sortBy }  from "../../utils"
import { app }                                    from "../../types"
import Terminology                                from "../../Terminology"
import aggregator                                 from "../../Aggregator"
import LocalStorageNS                             from "../../LocalStorageNS"
import "./Navigation.scss"


async function loadTags() {
    const items = await request<app.Tag[]>("/api/tags")
    return sortBy(items, "name").map(g => ({
        icon  : "sell",
        path  : `/tags/${g.id}`,
        render: () => <NavLink to={`/tags/${g.id}`}>{g.name}</NavLink>,
    } as unknown as DataRow))
}

async function loadStudies() {
    await aggregator.initialize()
    const studies = await aggregator.getStudies()
    return studies.map(s => ({
        icon  : "experiment",
        path  : `/studies/${s.id}`,
        render: () => <NavLink to={`/studies/${s.id}`}>{s.label}</NavLink>,
        loader: async () => {
            const versions = await aggregator.getStudyVersions(s.id)
            const v = versions.pop()
            const packages = await aggregator.filterPackages({ study: s.id, version: v })
            return sortBy(packages.filter(p => p.type !== "flat"), "name").map(p => {
                const [, name] = p.id.trim().split("__")
                return {
                    icon  : "deployed_code",
                    path  : `/studies/${s.id}/packages/${p.id}`,
                    render: () => <NavLink to={`/studies/${s.id}/packages/${p.id}`}>{humanizeColumnName(name)}</NavLink>,
                }
            })
        }
    }) as unknown as DataRow)
}

async function loadSites() {
    await aggregator.initialize()
    const items = await aggregator.getSites()
    return sortBy(items, "name").filter(x => !!x.id).map(x => ({
        render: () => <NavLink to={`/sites/${x.id}`}>{ x.name }</NavLink>,
        icon  : Terminology.site.icon,
        path  : `/sites/${x.id}`
    } as unknown as DataRow))
}

async function loadQualityMetrics() {
    await aggregator.initialize()
    const packages = await aggregator.filterPackages({ type: "flat" })
    const sites = packages.reduce((prev, cur) => {
        if (cur.site && !prev.includes(cur.site)) {
            prev.push(cur.site)
        }
        return prev
    }, [])

    return sites.sort().map(s => ({
        icon  : Terminology.site.icon,
        path  : `/metrics/${s}`,
        render: () => <span>{humanizeColumnName(s)}</span>,
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
                        path  : `/metrics/${s}/${pkg.id}`,
                        render: () => <NavLink to={`/metrics/${s}/${pkg.id}`}>{humanizeColumnName(name)}</NavLink>,
                    }
                }

                const sorted = byName[name].sort((a, b) => +b.version - +a.version)

                return {
                    icon  : "table",
                    path  : `/metrics/${s}/${sorted[0].id}`,
                    render: () => {
                        const newest = sorted[0];
                        return <NavLink to={`/metrics/${newest.id}`}>{humanizeColumnName(name)}</NavLink>
                    },
                    loader: async () => {
                        return sorted.map(pkg => {
                            return {
                                icon  : "history",
                                path  : `/metrics/${s}/${pkg.id}`,
                                render: () => <NavLink to={`/metrics/${s}/${pkg.id}`}>Version {pkg.version}</NavLink>
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
    path     ?: string
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
    const currentPath             = useLocation().pathname
    const rowRef                  = useRef<HTMLElement|null>(null);
    const [loading , setLoading ] = useState(false)
    const [children, setChildren] = useState<DataRow[]>([])
    const [error   , setError   ] = useState<Error | string>("")
    const [isOpen  , setIsOpen  ] = useState<boolean|undefined>(
        node.open ?? (
            node.path &&
            !!node.loader &&
            currentPath.startsWith(node.path) ? true : undefined
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

    useEffect(() => {
        if (node.path && currentPath === node.path) {
            const handle = setTimeout(() => {
                const el = rowRef.current;
                if (!el) return;

                // Find the nearest scrollable parent
                let parent = el.parentElement;
                while (parent && parent !== document.body) {
                    const overflowY = window.getComputedStyle(parent).overflowY;
                    if (overflowY === "auto" || overflowY === "scroll") break;
                    parent = parent.parentElement;
                }
                const container = parent as HTMLElement | null;

                const rect = el.getBoundingClientRect();
                const cRect = container ? container.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };

                // Only scroll if not fully in container's viewport
                if (rect.top < cRect.top || rect.bottom > cRect.bottom) {
                    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
                }
            }, 50); // Delay to ensure DOM/layout is ready

            return () => clearTimeout(handle);
        }
    }, [currentPath, node.path, isOpen]);

    return (
        <div className={ classList({
            details: true,
            "has-children": !!node.loader || children.length > 0
        }) } data-path={node.path}>
            <summary ref={rowRef}>
                { !!node.loader ? <b className={"toggle" + (isOpen ? " open" : " closed")} onClick={e => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }} >{ isOpen ? "▾" : "▸" }</b> : node.inset ? <b className="toggle"/> : null }
                <label
                    data-tooltip={ error ? error + "" : node.title }
                    className={ node.path && node.path === currentPath ? "selected" : undefined }>
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
    let { loading, user, logout }   = useAuth();
    let navigate                    = useNavigate();
    const currentPath               = useLocation().pathname
    const ref                       = useRef<HTMLDivElement|null>(null);
    const [collapsed, setCollapsed] = useState(!!JSON.parse(LocalStorageNS.getItem("sidebarCollapsed") ?? "false"))

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        const handle = requestAnimationFrame(() => {
            const segments = currentPath.split("/");
            let path = "/"
            document.querySelectorAll<HTMLElement>(`[data-path="${path}"] > summary > .toggle.closed`).forEach(el => {
                el.click();
            });
            segments.forEach(segment => {
                path += (path.endsWith("/") ? "" : "/") + segment;
                document.querySelector<HTMLElement>(`[data-path="${path}"] > summary > .toggle.closed`)?.click();
            });
        });
        return () => cancelAnimationFrame(handle)
    }, [currentPath])

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
                LocalStorageNS.setItem("sidebarWidth", e.clientX + diff + "px");
            }, { once: true })
        }
    }

    function toggle() {
        LocalStorageNS.setItem("sidebarCollapsed", !collapsed);
        setCollapsed(!collapsed);
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
            icon  : "house",
            inset : true,
            path  : "/"
        },
        {
            render: () => <b>Local</b>,
            icon  : "folder_open",
            open  : true,
            path  : "/",
            loader: async () => {
                const out = []

                if (canReadStudyAreas) {
                    out.push({
                        icon  : Terminology.studyArea.icon,
                        path  : `/study-areas`,
                        render: () => <NavLink to="/study-areas">{Terminology.studyArea.namePlural}</NavLink>,
                        loader: async function loadStudyAreas() {
                            const items = await request<app.StudyArea[]>("/api/study-areas")
                            return sortBy(items, "name").map(x => ({
                                icon  : Terminology.studyArea.icon,
                                path  : `/study-areas/${x.id}`,
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
                        path: `/groups`,
                        render: () => <NavLink to="/groups">{Terminology.subscriptionGroup.namePlural}</NavLink>,
                        loader: async function loadGroups() {
                            const groups = await request<app.SubscriptionGroup[]>("/api/request-groups")
                            return sortBy(groups, "name").filter(g => !!g.id).map(g => ({
                                render: () => <NavLink to={`/groups/${g.id}`}>{g.name}</NavLink>,
                                icon  : Terminology.subscriptionGroup.icon,
                                path  : `/groups/${g.id}`,
                            } as unknown as DataRow));
                        }
                    })
                }

                if (canReadTags) {
                    out.push({
                        icon: Terminology.tag.icon,
                        path: `/tags`,
                        render: () => <NavLink to="/tags">{Terminology.tag.namePlural}</NavLink>,
                        loader: loadTags
                    })
                }

                return out;
            }
        },
        {
            render: () => <b>Remote</b>,
            icon  : "cloud",
            open  : true,
            path  : "/",
            loader: async () => {
                const out = []

                out.push({
                    icon  : Terminology.study.icon,
                    render: () => <NavLink to="/studies">{Terminology.study.namePlural}</NavLink>,
                    loader: loadStudies,
                    path  : "/studies"
                })

                out.push({
                    icon  : Terminology.site.icon,
                    render: () => <NavLink to="/sites">{Terminology.site.namePlural}</NavLink>,
                    loader: loadSites,
                    path  : "/sites"
                })

                out.push({
                    icon  : Terminology.dataPackage.icon,
                    render: () => <NavLink to="/packages">All {Terminology.dataPackage.namePlural}</NavLink>,
                    path  : "/packages"
                })

                out.push({
                    icon  : "verified",
                    path  : "/metrics",
                    render: () => <span>Quality Metrics</span>,
                    loader: loadQualityMetrics
                })

                out.push({
                    icon  : "inventory_2",
                    path  : "/catalog",
                    render: () => <span>Catalog</span>,
                    loader: async () => [
                        {
                            render: () => <NavLink to="/catalog/icd10">ICD10 Diagnoses</NavLink>,
                            icon: "list_alt",
                            path  : "/catalog/icd10"

                        },
                        {
                            render: () => <NavLink to="/catalog/loinc">LOINC Laboratories</NavLink>,
                            icon: "list_alt",
                            path  : "/catalog/loinc"
                        }
                    ]
                })

                return out;
            }
        },
        {
            icon     : "person",
            path     : "/my",
            render   : () => <b>Personal</b>,
            loader   : async () => [
                {
                    path  : "/my/drafts",
                    icon  : "edit_square",
                    render: () => <NavLink to="/my/drafts">Draft {Terminology.graph.namePlural}</NavLink>,
                },

                {
                    path  : "/my/account",
                    icon: "manage_accounts",
                    render: () => <NavLink to="/my/account">My Account</NavLink>
                },

                {
                    icon: "power_settings_new",
                    render: () => <label style={{ cursor: "pointer" }} onClick={() => {
                        logout().then(() => navigate("/"));
                    }}><span>Sign Out { loading && <i className="fas fa-circle-notch fa-spin color-muted" /> }</span>
                    </label>,
                }
            ]
        }
    ]

    if (canAdminister) {
        TREE_DATA.push({
            icon  : "build_circle",
            path  : "/admin",
            render: () => <b>Administration</b>,
            loader: async () => {
                const items = []

                if (canReadUsers) {
                    items.push({
                        icon  : "person",
                        path  : "/admin/users",
                        render: () => <NavLink to="/admin/users">Manage Users</NavLink>
                    })
                }

                if (canReadUserGroups) {
                    items.push({
                        icon  : "group",
                        path  : "/admin/user-groups",
                        render: () => <NavLink to="/admin/user-groups">Manage User Groups</NavLink>
                    })
                }

                if (canManagePermissions) {
                    items.push({
                        icon  : "shield_lock",
                        path  : "/admin/permissions",
                        render: () => <NavLink to="/admin/permissions">Manage Permissions</NavLink>
                    })
                }

                items.push({
                    icon  : "stethoscope",
                    path  : "/admin/health-check",
                    render: () => <NavLink to="/admin/health-check">Health Check</NavLink>
                })

                return items
            }
        })
    }

    return (
        <div className={"navigation" + (collapsed ? " collapsed" : "")} ref={ref} style={{ width: LocalStorageNS.getItem("sidebarWidth") || "16rem" }}>
            <div className="navigation-wrap">
                <Tree data={TREE_DATA} />
            </div>
            <div className="resizer" onMouseDown={onResizeStart} tabIndex={0} />
            <div className="sidebar-toggle" onClick={toggle} title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"} />
        </div>
    )
}
