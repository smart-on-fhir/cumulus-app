interface TermOptions {
    nameSingular: string
    namePlural: string
    icon?: string
}

const Terminology = {

    studyArea: {
        nameSingular: "Study Area",
        namePlural  : "Study Areas",
        icon        : "menu_book"
    } as TermOptions,

    graph: {
        nameSingular: "Graph",
        namePlural  : "Graphs",
        icon        : "finance"
    } as TermOptions,

    site: {
        namePlural: "Healthcare Sites",
        nameSingular: "Healthcare Site",
        icon: "apartment"
    } as TermOptions,

    subscription: {
        nameSingular: "Data Slice",
        namePlural  : "Data Slices",
        icon        : "database"
    } as TermOptions,

    subscriptionGroup: {
        nameSingular: "Slice Group",
        namePlural  : "Slice Groups",
        icon        : "package_2"
    } as TermOptions,

    tag: {
        nameSingular: "Tag",
        namePlural  : "Tags",
        icon        : "sell"
    } as TermOptions,

    study: {
        namePlural  : "Studies",
        nameSingular: "Study",
        icon        : "experiment"
    } as TermOptions,

    dataPackage: {
        namePlural  : "Data Packages",
        nameSingular: "Data Package",
        icon        : "deployed_code"
    } as TermOptions,

    catalog: {
        namePlural  : "Catalog",
        nameSingular: "Catalog",
        icon        : "inventory_2"
    } as TermOptions,
};

export default Terminology
