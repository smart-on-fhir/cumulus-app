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
    type : "number"
    min ?: number
    max ?: number
    step?: number
}

export interface BooleanParameterDescriptor extends BaseParameterDescriptor {
    type: "boolean"
}

export interface EnumParameterDescriptor extends BaseParameterDescriptor {
    type: "enum"
    values: { value: string|number, label?: string }[]
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
            name: "Adverse Drug Events (ADE)",
            variables: [
                {
                    id: "period_start",
                    section: "StudyPeriod",
                    defaultValue: "",
                    required: false
                },
                {
                    id: "period_end",
                    section: "StudyPeriod",
                    defaultValue: "",
                    required: false
                },
                {
                    id: "include_history",
                    section: "StudyPeriod",
                    defaultValue: false
                },
                {
                    id: "age_min",
                    section: "Demographics",
                    group: "AgeMin",
                },
                // {
                //     id: "patientAgeMinUnits",
                //     section: "Demographics",
                //     group: "AgeMin",
                // },
                {
                    id: "age_max",
                    section: "Demographics",
                    group: "AgeMax",
                },
                // {
                //     id: "patientAgeMaxUnits",
                //     section: "Demographics",
                //     group: "AgeMax",
                // },
                {
                    id: "gender_female",
                    section: "Demographics",
                    group: "clinicalSex",
                    defaultValue: false,
                    set: "Patient Administrative Gender"
                },
                {
                    id: "gender_male",
                    section: "Demographics",
                    group: "clinicalSex",
                    defaultValue: false,
                    set: "Patient Administrative Gender"
                },
                {
                    id: "gender_other",
                    section: "Demographics",
                    group: "clinicalSex",
                    defaultValue: false,
                    set: "Patient Administrative Gender"
                },
                {
                    id: "gender_unknown",
                    section: "Demographics",
                    group: "clinicalSex",
                    defaultValue: false,
                    set: "Patient Administrative Gender"
                },
                {
                    id: "enc_class_list",
                    section: "HealthcareSetting",
                    defaultValue: ""
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
                    id: "enc_min",
                    section: "HealthcareUtilization",
                    max: "$maxCountVisits",
                },
                {
                    id: "enc_max",
                    section: "HealthcareUtilization",
                    min: "$minCountVisits",
                },
                {
                    id: "enc_days_min",
                    section: "HealthcareUtilization",
                    min: 0,
                    step: 1
                }
            ]
        },
        // {
        //     id: "template_2",
        //     name: "Template 2 having a very long title",
        //     variables: [
        //         {
        //             id: "period_start",
        //             section: "StudyPeriod",
        //             group: "StartDate",
        //             required: true,
        //             max: "$visitEndDate",
        //             defaultValue: "1990-07-20" // yyyy-MM-dd
        //         },
        //         {
        //             id: "period_end",
        //             section: "StudyPeriod",
        //             group: "StartDate",
        //             defaultValue: "1990-07-24",
        //             required: false,
        //             min: "$visitStartDate",
        //             disabled: "ifTrue(new Date(period_start).getTime() > Date.now(), true, false)"
        //         }
        //     ]
        // }
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
        period_start: {
            name: "Start Date",
            description: "Study Period Encounter Start Date",
            type: "date"
        },
        period_end: {
            name: "End Date",
            description: "Study Period Encounter End Date",
            type: "date"
        },
        include_history: {
            name: "Include patient history",
            description: "Short description of what this option does and why are we using it...",
            type: "boolean"
        },
        age_min: {
            name: "Min Patient Age (at visit)",
            description: "The minimum patient age at the time of visit",
            type: "number",
            min : 0,
            max : 130,
            step: 1
        },
        patientAgeMinUnits: {
            name: "Min Age Units",
            type: "enum",
            values: [
                { value: "years" },
                { value: "months" },
                { value: "weeks" }
            ]
        },
        age_max: {
            name: "Max Patient Age (at visit)",
            description: "The maximum patient age at the time of visit",
            type: "number",
            min: 0,
            max: 130,
            step: 1
        },
        patientAgeMaxUnits: {
            name: "Max Age Units",
            type: "enum",
            values: [
                { value: "years" },
                { value: "months" },
                { value: "weeks" }
            ]
        },
        gender_female: {
            name: "Female",
            type: "boolean",
        },
        gender_male: {
            name: "Male",
            type: "boolean",
        },
        gender_other: {
            name: "Other",
            type: "boolean",
        },
        gender_unknown: {
            name: "Unknown",
            type: "boolean",
        },
        enc_class_list: {
            name: "FHIR Encounter.class",
            type: "enum",
            values: [
                { value: "" },
                { value: "AMB"   , label: "Ambulatory" },
                { value: "EMER"  , label: "Emergency" },
                { value: "FLD"   , label: "Field" },
                { value: "HH"    , label: "Home health" },
                { value: "IMP"   , label: "Inpatient encounter" },
                { value: "ACUTE" , label: "Inpatient acute" },
                { value: "NONAC" , label: "Inpatient non-acute" },
                { value: "OBSENC", label: "Observation encounter" },
                { value: "PRENC" , label: "Pre-admission" },
                { value: "SS"    , label: "Short stay" },
                { value: "VR"    , label: "Virtual" },
            ],
            description: "Select what class of encounters should be used in your study. [ValueSet](https://terminology.hl7.org/1.0.0/ValueSet-v3-ActEncounterCode.html) 🔗"
        },
        encounterType: {
            name: "FHIR Encounter.type",
            type: "enum",
            values: [
                { value: "" },
                { value: "ADMS" },
                { value: "BD/BM-clin" },
                { value: "CCS60" },
                { value: "OKI" },
            ],
            description: "Select what type of encounters should be used in your study"
        },
        noteType: {
            name: "FHIR Note Type",
            type: "enum",
            values: [
                { value: "" },
                { value: "type1" },
                { value: "type2" }
            ],
            description: "Select what kind of notes should be used in your study"
        },
        enc_min: {
            name: "Min Encounters",
            type: "number",
            description: "Min number of encounters during study period"
        },
        enc_max: {
            name: "Max Encounters",
            type: "number",
            description: "Max number of encounters during study period"
        },
        enc_days_min: {
            name: "Min Duration",
            type: "number",
            description: "Min number of days between first and last encounter"
        }
    }
}
