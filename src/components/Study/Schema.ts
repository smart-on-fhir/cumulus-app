export interface Schema {
    templates: Template[]
    sections?: {
        [id: string]: {
            name: string
            description?: string
        }
    },
    parameters: {
        [parameter_id: string]: ParameterDescriptor
    }
}

export type ParameterDescriptor = (
    StringParameterDescriptor |
    NumberParameterDescriptor |
    BooleanParameterDescriptor |
    DateParameterDescriptor |
    EnumParameterDescriptor
);

export interface BaseParameterDescriptor {
    name: string
    description?: string
}

export interface StringParameterDescriptor extends BaseParameterDescriptor {
    type: "string"
}

export interface DateParameterDescriptor extends BaseParameterDescriptor {
    type: "date"
}

export interface NumberParameterDescriptor extends BaseParameterDescriptor {
    type: "number"
    min?: number
    max?: number
}

export interface BooleanParameterDescriptor extends BaseParameterDescriptor {
    type: "boolean"
}

export interface EnumParameterDescriptor extends BaseParameterDescriptor {
    type: "enum"
    values: (string|number)[]
}

export interface Template {
    id: string
    name: string
    variables?: {
        id      : string
        section?: string
        group  ?: string
        [key: string]: any
    }[]
}

export interface Node<Type=string> {
    label: string
    description?: string
    type: Type
    children?: Node[]
}

export interface Section extends Node<"section"> {
    parameters: {
        [parameter_id: string]: ParameterRuntimeArgs
    }
}

export interface ParameterRuntimeArgs {
    [key: string]: any
}

export interface Group<T> {
    label?: string
    description?: string
    items: T[]
}


export const schema: Schema = {
    templates: [
        {
            id: "template_1",
            name: "Template 1",
            variables: [
                {
                    id: "visitStartDate",
                    section: "StudyPeriod",
                    defaultValue: "",
                    required: false
                },
                {
                    id: "visitEndDate",
                    section: "StudyPeriod",
                    defaultValue: "",
                    required: false
                },
                {
                    id: "includePatientHistory",
                    section: "StudyPeriod",
                    defaultValue: false
                },
                {
                    id: "patientAgeMin",
                    section: "Demographics",
                    group: "AgeMin",
                },
                {
                    id: "patientAgeMinUnits",
                    section: "Demographics",
                    group: "AgeMin",
                },
                {
                    id: "patientAgeMax",
                    section: "Demographics",
                    group: "AgeMax",
                },
                {
                    id: "patientAgeMaxUnits",
                    section: "Demographics",
                    group: "AgeMax",
                },
                {
                    id: "clinicalSex",
                    section: "Demographics",
                    group: "clinicalSex",
                },
                {
                    id: "encounterClass",
                    section: "HealthcareSetting"
                },
                {
                    id: "encounterType",
                    section: "HealthcareSetting"
                },
                {
                    id: "noteType",
                    section: "HealthcareSetting"
                },
                {
                    id: "minCountVisits",
                    section: "HealthcareUtilization",
                    max: "$maxCountVisits",
                },
                {
                    id: "maxCountVisits",
                    section: "HealthcareUtilization",
                    min: "$minCountVisits",
                }
            ]
        },
        {
            id: "template_2",
            name: "Template 2 having a very long title",
            variables: [
                {
                    id: "visitStartDate",
                    section: "StudyPeriod",
                    group: "StartDate",
                    required: true,
                    max: "$visitEndDate",
                    defaultValue: "1990-07-20" // yyyy-MM-dd
                },
                {
                    id: "visitEndDate",
                    section: "StudyPeriod",
                    group: "StartDate",
                    defaultValue: "1990-07-24",
                    required: false,
                    min: "$visitStartDate",
                    disabled: "ifTrue(new Date(visitStartDate).getTime() > Date.now(), true, false)"
                }
            ]
        }
    ],
    sections: {
        StudyPeriod: {
            name: "Study period",
            description: "Please specify the study period. You have to at least provide the start date of the visits that should be included in this study."
        },
        Demographics: {
            name: "Demographics"
        },
        HealthcareSetting: {
            name: "Healthcare Setting"
        },
        HealthcareUtilization: {
            name: "Healthcare Utilization"
        }
    },
    parameters: {
        visitStartDate: {
            name: "Visit Start Date",
            description: "Select the earliest date of visit to be included in the study",
            type: "date"
        },
        visitEndDate: {
            name: "Visit End Date",
            description: "Select the latest date of visit to be included in the study",
            type: "date"
        },
        includePatientHistory: {
            name: "Include patient history",
            description: "Short description of what this option does and why are we using it...",
            type: "boolean"
        },
        patientAgeMin: {
            name: "Min Patient Age (at visit)",
            description: "The minimal patient age at the time of visit",
            type: "number",
            min: 0
        },
        patientAgeMinUnits: {
            name: "Min Age Units",
            type: "enum",
            values: ["years", "months", "weeks"]
        },
        patientAgeMax: {
            name: "Max Patient Age (at visit)",
            description: "The maximal patient age at the time of visit",
            type: "number",
            min: 0
        },
        patientAgeMaxUnits: {
            name: "Max Age Units",
            type: "enum",
            values: ["years", "months", "weeks"]
        },
        clinicalSex: {
            name: "Clinical sex",
            type: "enum",
            values: ["male", "female", "other"],
            description: "This parameter provides guidance on how a recipient should apply settings or reference ranges that are derived from observable information"
        },
        encounterClass: {
            name: "FHIR Encounter.class",
            type: "enum",
            values: [
                "",
                "IMP",
                "AMB",
                "OBSENC",
                "EMER",
                "VR",
                "HH",
            ],
            description: "Select what class of encounters should be used in your study"
        },
        encounterType: {
            name: "FHIR Encounter.type",
            type: "enum",
            values: [
                "",
                "ADMS",
                "BD/BM-clin",
                "CCS60",
                "OKI",
            ],
            description: "Select what type of encounters should be used in your study"
        },
        noteType: {
            name: "FHIR Note Type",
            type: "enum",
            values: [
                "",
                "type1",
                "type2"
            ],
            description: "Select what kind of notes should be used in your study"
        },
        minCountVisits: {
            name: "Min count visits",
            type: "number",
            description: "Short description of what this option is..."
        },
        maxCountVisits: {
            name: "Max count visits",
            type: "number",
            description: "Short description of what this option is..."
        }
    }
}
