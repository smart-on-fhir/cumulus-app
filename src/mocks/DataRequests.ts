interface Subscription
{
    /**
     * Unique ID for this request
     */
    id: string

    /**
     * Human-friendly name
     */
    name: string

    /**
     * Short description
     */
    description?: string

    /**
     * Optional group (used by the UI to render requests in groups)
     */
    group?: string

    /**
     * Date when the request has been initially created
     */
    created: string

    /**
     * Subscriptions are like normal requests but are refreshed automatically
     * based on pre-defined schedule
     */
    type: "SUBSCRIPTION" | "REQUEST"

    /**
     * Timestamp showing when the data has been generated (or last refreshed in
     * case of subscriptions)
     */
    completed: string | null
}


const Subscriptions: Subscription[] = [
    {
        id         : "request-1",
        name       : "Positive test + loss of taste or smell by demographics",
        description: "This request leverages two hypothetical computable phenotypes " +
                     "for labeling patients with loss of taste or loss of smell, on " +
                     "any patients with a recorded PCR test for COVID-19 or has one " +
                     "mentioned in a clinical note, as detected by natural language " +
                     "processing.",
        group      : "COVID-19",
        type       : "SUBSCRIPTION",
        created    : "02/01/2022",
        completed  : "02/01/2022",
    },
    {
        id       : "request-2",
        name     : "Positive test + loss of taste or smell by admission status",
        group    : "COVID-19",
        type     : "SUBSCRIPTION",
        created  : "02/01/2022",
        completed: null,
    },
    {
        id       : "request-3",
        name     : "Positive test + ICU admissions",
        group    : "COVID-19",
        type     : "REQUEST",
        created  : "02/01/2022",
        completed: "02/01/2022"
    },
    {
        id       : "request-4",
        name     : "Positive test by phenotype by demographics",
        group    : "INFLUENZA",
        type     : "SUBSCRIPTION",
        created  : "02/01/2022",
        completed: "02/01/2022",
    },
    {
        id       : "request-5",
        name     : "Positive test by phenotype by clinical characteristics",
        group    : "INFLUENZA",
        type     : "SUBSCRIPTION",
        created  : "02/01/2022",
        completed: null,
    },
    {
        id       : "request-6",
        name     : "Positive case by demographics",
        group    : "HIV",
        type     : "SUBSCRIPTION",
        created  : "02/01/2022",
        completed: "02/01/2022",
    }
];

export default Subscriptions;
