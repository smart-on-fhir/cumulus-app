import { DATA_TYPES }        from "./dataTypes"
import cumulusLibraryColumns from "../cumulus_library_columns.json"
import {
    ColumnMetadata,
    detectDateType,
    humanizeColumnName,
    keywordToType
} from "./lib"


export default class CSVColumn
{
    /**
     * The name as it appears in the first CSV row
     */
    readonly name: string

    /**
     * Human-readable name
     */
    readonly label: string

    /**
     * Short description
     */
    readonly description: string

    /**
     * The type of data this column is supposed to contain. Used for
     * formatting in the UI
     */
    readonly dataType: keyof typeof DATA_TYPES

    constructor(name: string, metaData?: ColumnMetadata)
    {
        this.name        = name
        this.dataType    = keywordToType(name) || "string"
        this.label       = humanizeColumnName(name)
        this.description = ""

        // @ts-ignore
        const meta = cumulusLibraryColumns[name]
        if (meta) {
            if (meta.display) {
                this.description = meta.display
            }

            switch (meta.datatype.toLowerCase()) {
                case "boolean":
                    this.dataType = "boolean";
                break;
                case "int":
                case "integer":
                case "integer64":
                case "positiveInt":
                case "unsignedInt":
                    this.dataType = "integer";
                break;
                case "date":
                case "datetime":
                case "instant":
                    this.dataType = Array.isArray(meta.values) ?
                        detectDateType(meta.values) :
                        keywordToType(this.description || this.name) || "date:YYYY-MM-DD"
                break;
                case "decimal":
                    this.dataType = "float";
                break;
            }
        }

        if (metaData?.dataType) {
            this.dataType = metaData.dataType
        }
        if (metaData?.label) {
            this.label = metaData.label
        }
        if (metaData?.description) {
            this.description = metaData.description
        }
    }

    toJSON()
    {
        return {
            name       : this.name,
            label      : this.label,
            description: this.description,
            dataType   : this.dataType
        }
    }
}
