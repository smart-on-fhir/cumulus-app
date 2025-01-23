
export interface DataMapping {
    /** The name of the id property */
    id: string

    /** The name of the pid property */
    pid: string

    /** The name of the count property. If provided render counts in a badge */
    count: string

    /** The name of the label/name property */
    label: string

    /** The name of the description property */
    description: string

    stratifier?: string
}

const MAPPING: DataMapping = {
    id: "id",
    pid: "pid",
    label: "display",
    count: "cnt",
    description: "metadata_description",
    // stratifier: "gender"
}

export default MAPPING