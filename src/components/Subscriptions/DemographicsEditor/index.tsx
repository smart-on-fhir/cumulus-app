import CheckboxList from "../../generic/CheckboxList"
import Grid         from "../../generic/Grid"
import { app }      from "../../../types"

const AVAILABLE_DEMOGRAPHICS = [
    {
        name: "age",
        label: "Age",
        description: "Short description of the field"
    },
    {
        name: "cdcAgeGroup",
        label: "CDC Age Group",
        description: "Short description of the field"
    },
    {
        name: "race",
        label: "Race",
        description: "Short description of the field"
    },
    {
        name: "ethnicity",
        label: "Ethnicity",
        description: "Short description of the field"
    },
    {
        name: "deceased",
        label: "Deceased",
        description: "Short description of the field"
    },
    {
        name: "zip",
        label: "ZIP Code",
        description: "Short description of the field"
    },
    {
        name: "gender",
        label: "Gender",
        description: "Short description of the field"
    }
];


export default function DemographicsEditor({
    demographics,
    onChange
}: {
    demographics: app.DataListItem[]
    onChange: (demographics: app.DataListItem[]) => void
}) {
    return (
        <>
            <div className="row">
                <div className="col middle">
                    <label>Demographics</label>
                </div>
            </div>
            <hr/>
            <div className="row gap mt-1 wrap">
                <div className="col middle">
                    <Grid gap="0 1rex" cols="12em">
                        <CheckboxList
                            items={ AVAILABLE_DEMOGRAPHICS }
                            isSelected={ item => !!demographics.find(x => x.name === item.name) }
                            toggle={ item => {
                                const index = demographics.findIndex(x => x.name === item.name)
                                if (index > -1) {
                                    const newSelection = [ ...demographics ];
                                    newSelection.splice(index, 1)
                                    onChange(newSelection)
                                } else {
                                    onChange([
                                        ...demographics,
                                        {
                                            ...item,
                                            description: String(item.description)
                                        }
                                    ])
                                }
                            }}
                        />
                    </Grid>
                </div>
            </div>
        </>
    )
}