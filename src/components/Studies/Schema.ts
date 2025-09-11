import { RichSelectOption } from "../generic/RichSelect"

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
    EnumParameterDescriptor |
    CheckListParameterDescriptor |
    ListParameterDescriptor
);

export interface BaseParameterDescriptor {
    name: string
    description?: string
}

export interface StringParameterDescriptor extends BaseParameterDescriptor, Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
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
    values: { value: string|number, label?: string, title?: string }[]
}

export interface CheckListParameterDescriptor extends BaseParameterDescriptor {
    type: "checklist"
    items: {
        value: any,
        label?: string
        description?: string
    }[]
}

export interface ListParameterDescriptor extends BaseParameterDescriptor {
    type: "list"
    endpoint: string
    defaultValue?: RichSelectOption | RichSelectOption[]
    placeholder?: string
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
                    set: "FHIR Patient Gender"
                },
                {
                    id: "gender_male",
                    section: "Demographics",
                    group: "clinicalSex",
                    defaultValue: false,
                    set: "FHIR Patient Gender"
                },
                {
                    id: "gender_other",
                    section: "Demographics",
                    group: "clinicalSex",
                    defaultValue: false,
                    set: "FHIR Patient Gender"
                },
                {
                    id: "gender_unknown",
                    section: "Demographics",
                    group: "clinicalSex",
                    defaultValue: false,
                    set: "FHIR Patient Gender"
                },
                {
                    id: "enc_class_list",
                    section: "HealthcareSetting",
                    list: "encounter-classes",
                    defaultValue: []
                },
                {
                    id: "encounter_type",
                    section: "HealthcareSetting"
                },
                {
                    id: "note_type",
                    section: "HealthcareSetting",
                    list: "note-types",
                    defaultValue: []
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
                },
                {
                    id: "dx_variables",
                    section: "StudyVariables",
                    defaultValue: [
                        { name: "skin", value: "2.16.840.1.113883.3.526.3.1010" },
                        { name: "melanoma", value: "2.16.840.1.113883.3.526.3.1010" },
                        { name: "melanoma_malignant", value: "2.16.840.1.113883.3.1434.1038" },
                        { name: "melanoma_malignant", value: "2.16.840.1.113883.3.464.1003.108.11.1018" },
                        { name: "sarcoma", value: "2.16.840.1.113883.3.526.3.1010" },
                        { name: "squamous", value: "2.16.840.1.113883.3.526.3.1010" },
                        { name: "condition", value: "2.16.840.1.113883.17.4077.3.2028" },
                        { name: "renal_disease", value: "2.16.840.1.113762.1.4.1029.335" },
                        { name: "esrd", value: "2.16.840.1.113762.1.4.1235.172" },
                        { name: "ckd", value: "2.16.840.1.113762.1.4.1078.114" },
                        { name: "dialysis", value: "2.16.840.1.113762.1.4.1078.342" },
                        { name: "nephrotic_syndrome", value: "2.16.840.1.113883.3.464.1003.109.12.1018" },
                        { name: "inflammatory", value: "2.16.840.1.113883.3.3157.1834" },
                        { name: "ibd", value: "2.16.840.1.113762.1.4.1078.879" },
                        { name: "crohns", value: "2.16.840.1.113762.1.4.1034.576" },
                        { name: "arthritis_ra", value: "2.16.840.1.113762.1.4.1222.651" },
                        { name: "arthritis_ra", value: "2.16.840.1.113762.1.4.1222.81" },
                        { name: "lupus", value: "2.16.840.1.113883.3.464.1003.117.12.1010" },
                        { name: "any", value: "2.16.840.1.113883.3.666.5.1940" },
                        { name: "any", value: "2.16.840.1.113762.1.4.1235.212" },
                        { name: "bacterial", value: "2.16.840.1.113762.1.4.1200.288" },
                        { name: "pna", value: "2.16.840.1.113762.1.4.1078.738" },
                        { name: "cmv", value: "2.16.840.1.113762.1.4.1146.2234" },
                        { name: "cmv", value: "2.16.840.1.113762.1.4.1146.2233" },
                        { name: "rsv", value: "2.16.840.1.113762.1.4.1078.754" },
                        { name: "influenza", value: "2.16.840.1.113762.1.4.1078.747" },
                        { name: "shingles", value: "2.16.840.1.113762.1.4.1222.1478" },
                        { name: "hepatitis_b", value: "2.16.840.1.113883.3.464.1003.110.12.1025" },
                        { name: "hepatitis_c", value: "2.16.840.1.113762.1.4.1222.30" },
                        { name: "cardiomyopathy", value: "2.16.840.1.113762.1.4.1222.579" },
                        { name: "attack", value: "2.16.840.1.113883.3.666.5.3011" },
                        { name: "failure", value: "2.16.840.1.113762.1.4.1222.1543" },
                        { name: "cohort", value: "2.16.840.1.113762.1.4.1182.308" },
                        { name: "essential", value: "2.16.840.1.113883.3.464.1003.104.12.1011" },
                        { name: "any", value: "2.16.840.1.113762.1.4.1251.12" },
                        { name: "hypertensive_ckd", value: "2.16.840.1.113883.3.464.1003.109.12.1017" },
                        { name: "disorder", value: "2.16.840.1.113762.1.4.1219.35" },
                        { name: "preexisting", value: "2.16.840.1.113883.3.464.1003.198.12.1075" },
                        { name: "complications", value: "2.16.840.1.113762.1.4.1222.1537" },
                        { name: "t2d_related_dx", value: "2.16.840.1.113762.1.4.1078.440" },
                        { name: "diabetic_nephropathy", value: "2.16.840.1.113883.3.464.1003.109.12.1004" },
                        { name: "diabetic_ckd", value: "2.16.840.1.113762.1.4.1078.124" },
                    ]
                },
                {
                    id: "rx_variables",
                    section: "StudyVariables",
                    defaultValue: [
                        { name: "everolimus", value: "2.16.840.1.113762.1.4.1260.499" },
                        { name: "drugs", value: "2.16.840.1.113762.1.4.1219.192" },
                        { name: "systemic_therapy", value: "2.16.840.1.113883.3.666.5.803" },
                        { name: "immune_modulators", value: "2.16.840.1.113762.1.4.1248.124" },
                        { name: "coricosteroids_systemic", value: "2.16.840.1.113883.3.3616.200.110.102.2061" },
                        { name: "chemo_advanced", value: "2.16.840.1.113883.3.7643.2.1046" },
                        { name: "checkpoint", value: "2.16.840.1.113762.1.4.1133.6" },
                        { name: "keytruda", value: "2.16.840.1.113762.1.4.1260.496" },
                        { name: "ade_neutropenia", value: "2.16.840.1.113883.3.526.3.1538" },
                        { name: "any", value: "2.16.840.1.113762.1.4.1078.849" },
                        { name: "systemic", value: "2.16.840.1.113762.1.4.1133.6" },
                        { name: "therapies", value: "2.16.840.1.113762.1.4.1235.212" },
                        { name: "drugs", value: "2.16.840.1.113762.1.4.1190.58" },
                        { name: "drugs", value: "2.16.840.1.113883.3.600.1476" },
                        { name: "loop", value: "2.16.840.1.113762.1.4.1078.898" },
                        { name: "potassium", value: "2.16.840.1.113762.1.4.1213.41" },
                        { name: "thiazide", value: "2.16.840.1.113762.1.4.1078.8" },
                    ]
                },
                {
                    id: "lab_variables",
                    section: "StudyVariables",
                    defaultValue: [
                        { name: "with_diff", value: "1.3.6.1.4.1.6997.4.1.2.271.13.38167.1.1.999.594" },
                        { name: "comprehensive", value: "2.16.840.1.113762.1.4.1078.867" },
                        { name: "egfr", value: "2.16.840.1.113762.1.4.1078.397" },
                        { name: "function", value: "2.16.840.1.113762.1.4.1078.867" },
                        { name: "ggt", value: "2.16.840.1.113762.1.4.1222.806" },
                        { name: "pt", value: "2.16.840.1.113883.3.3616.200.110.102.5037" },
                        { name: "inr", value: "2.16.840.1.113883.3.117.1.7.1.213" },
                        { name: "serum_cr", value: "2.16.840.1.113762.1.4.1146.2206" },
                        { name: "urine_cr", value: "2.16.840.1.113762.1.4.1178.87" },
                        { name: "urine_alb_cr_ratio", value: "2.16.840.1.113883.3.6929.3.1007" },
                        { name: "urine_protein_cr_ratio", value: "2.16.840.1.113762.1.4.1222.790" },
                        { name: "blood_cr", value: "2.16.840.1.113762.1.4.1222.111" },
                        { name: "serum_rf", value: "2.16.840.1.113762.1.4.1222.812" },
                        { name: "blood_esr", value: "2.16.840.1.113762.1.4.1222.1609" },
                        { name: "crp", value: "2.16.840.1.113762.1.4.1146.1933" },
                        { name: "tsh", value: "2.16.840.1.113762.1.4.1146.2156" },
                        { name: "t3", value: "2.16.840.1.113762.1.4.1078.864" },
                        { name: "t4", value: "2.16.840.1.113762.1.4.1078.865" },
                        { name: "screening", value: "2.16.840.1.113762.1.4.1221.122" },
                        { name: "glucose_test", value: "2.16.840.1.113762.1.4.1045.134" },
                    ]
                },
                // {
                //     id: "doc_variables",
                //     section: "StudyVariables",
                //     defaultValue: [
                //         { name: "kidney", value: "2.16.840.1.113762.1.4.1222.864" },
                //         { name: "skin", value: "2.16.840.1.113762.1.4.1222.867" },
                //         { name: "lung", value: "2.16.840.1.113883.3.1434.1011" },
                //         { name: "bone", value: "2.16.840.1.113762.1.4.1222.870" },
                //         { name: "muscle", value: "2.16.840.1.113762.1.4.1222.868" },
                //     ]
                // },
                {
                    id: "proc_variables",
                    section: "StudyVariables",
                    defaultValue: [
                        { name: "services"   , value: "2.16.840.1.113883.3.464.1003.109.12.1013" },
                        { name: "other_major", value: "2.16.840.1.113883.3.464.1003.198.12.1075" }
                    ]
                }
            ]
        }
    ],
    sections: {
        StudyPeriod: {
            name: "Study period",
            description: "The study period defines the first and last date of patient encounters. All studies retrospective observational studies using FHIR data from the electronic health record system."
        },
        Demographics: {
            name: "Demographics"
        },
        HealthcareSetting: {
            name: "Healthcare Setting"
        },
        HealthcareUtilization: {
            name: "Healthcare Utilization"
        },
        StudyVariables: {
            name: "STUDY VARIABLES"
        }
    },
    parameters: {
        period_start: {
            name: "Start Date",
            description: "[FHIR Encounter Period](https://hl7.org/fhir/us/core/STU4/StructureDefinition-us-core-encounter-definitions.html#Encounter.period) start date",
            type: "date"
        },
        period_end: {
            name: "End Date",
            description: "[FHIR Encounter Period](https://hl7.org/fhir/us/core/STU4/StructureDefinition-us-core-encounter-definitions.html#Encounter.period) end date",
            type: "date"
        },
        include_history: {
            name: "Include patient history",
            description: "If true, select patient historical data before the study period for patients who match all other inclusion criteria.",
            type: "boolean"
        },
        age_min: {
            name: "Min Patient Age",
            description: "Minimum FHIR Patient age at the time of visit",
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
            name: "Max Patient Age",
            description: "Maximum FHIR Patient age at the time of visit",
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
            type: "list",
            endpoint: "/api/static/encounter-classes",
            description: "Select what class of encounters should be used in your study.<br />[ValueSet](https://terminology.hl7.org/1.0.0/ValueSet-v3-ActEncounterCode.html) 🔗"
        },
        encounter_type: {
            name: "FHIR Encounter.serviceType",
            type: "list",
            endpoint: "/api/static/encounter-service-types",
            placeholder: "Not specified (include all)",
            description: "Select encounter service type.<br />[ValueSet](http://hl7.org/fhir/R4/valueset-service-type.html) 🔗"
        },
        note_type: {
            name: "FHIR Document Type",
            type: "list",
            endpoint: "/api/static/note-types",
            description: "Require patients to have specific clinical notes of type [ValueSet](https://build.fhir.org/valueset-doc-typecodes.html)",
        },
        enc_min: {
            name: "Min FHIR Encounters",
            type: "number",
            description: "Min number of [FHIR Encounters](https://hl7.org/fhir/us/core/STU4/StructureDefinition-us-core-encounter.html) during study period"
        },
        enc_max: {
            name: "Max FHIR Encounters",
            type: "number",
            description: "Max number of [FHIR Encounters](https://hl7.org/fhir/us/core/STU4/StructureDefinition-us-core-encounter.html) during study period"
        },
        enc_days_min: {
            name: "Min Duration",
            type: "number",
            description: "Min number of days between first and last encounter"
        },
        doc_variables: {
            name: "Doc Variables",
            type: "checklist",
            items: [
                { label: "biopsy / kidney", value: { name: "kidney", value: "2.16.840.1.113762.1.4.1222.864" }},
                { label: "biopsy / skin", value: { name: "skin", value: "2.16.840.1.113762.1.4.1222.867" }},
                { label: "biopsy / lung", value: { name: "lung", value: "2.16.840.1.113883.3.1434.1011" }},
                { label: "biopsy / bone", value: { name: "bone", value: "2.16.840.1.113762.1.4.1222.870" }},
                { label: "biopsy / muscle", value: { name: "muscle", value: "2.16.840.1.113762.1.4.1222.868" }},
            ]
        },
        proc_variables: {
            name: "FHIR Procedure",
            type: "checklist",
            items: [
                { label: "dialysis / services", value: { name: "services", value: "2.16.840.1.113883.3.464.1003.109.12.1013" }},
                { label: "surgery / other_major", value: { name: "other_major", value: "2.16.840.1.113883.3.464.1003.198.12.1075" }}
            ]
        },
        lab_variables: {
            name: "FHIR Observation Laboratory",
            type: "checklist",
            items: [
                { label:"cbc / with_diff", value: { name: "with_diff", value: "1.3.6.1.4.1.6997.4.1.2.271.13.38167.1.1.999.594" }},
                { label:"cmp / comprehensive", value: { name: "comprehensive", value: "2.16.840.1.113762.1.4.1078.867" }},
                { label:"gfr / egfr", value: { name: "egfr", value: "2.16.840.1.113762.1.4.1078.397" }},
                { label:"lft / function", value: { name: "function", value: "2.16.840.1.113762.1.4.1078.867" }},
                { label:"lft / ggt", value: { name: "ggt", value: "2.16.840.1.113762.1.4.1222.806" }},
                { label:"lft / pt", value: { name: "pt", value: "2.16.840.1.113883.3.3616.200.110.102.5037" }},
                { label:"lft / inr", value: { name: "inr", value: "2.16.840.1.113883.3.117.1.7.1.213" }},
                { label:"creatinine / serum_cr", value: { name: "serum_cr", value: "2.16.840.1.113762.1.4.1146.2206" }},
                { label:"creatinine / urine_cr", value: { name: "urine_cr", value: "2.16.840.1.113762.1.4.1178.87" }},
                { label:"creatinine / urine_alb_cr_ratio", value: { name: "urine_alb_cr_ratio", value: "2.16.840.1.113883.3.6929.3.1007" }},
                { label:"creatinine / urine_protein_cr_ratio", value: { name: "urine_protein_cr_ratio", value: "2.16.840.1.113762.1.4.1222.790" }},
                { label:"creatinine / blood_cr", value: { name: "blood_cr", value: "2.16.840.1.113762.1.4.1222.111" }},
                { label:"autoimmune / serum_rf", value: { name: "serum_rf", value: "2.16.840.1.113762.1.4.1222.812" }},
                { label:"autoimmune / blood_esr", value: { name: "blood_esr", value: "2.16.840.1.113762.1.4.1222.1609" }},
                { label:"autoimmune / crp", value: { name: "crp", value: "2.16.840.1.113762.1.4.1146.1933" }},
                { label:"autoimmune / tsh", value: { name: "tsh", value: "2.16.840.1.113762.1.4.1146.2156" }},
                { label:"autoimmune / t3", value: { name: "t3", value: "2.16.840.1.113762.1.4.1078.864" }},
                { label:"autoimmune / t4", value: { name: "t4", value: "2.16.840.1.113762.1.4.1078.865" }},
                { label:"diabetes / screening", value: { name: "screening", value: "2.16.840.1.113762.1.4.1221.122" }},
                { label:"diabetes / glucose_test", value: { name: "glucose_test", value: "2.16.840.1.113762.1.4.1045.134" }},
            ]
        },
        rx_variables: {
            name: "FHIR MedicationRequest",
            type: "checklist",
            items: [
                { label: "immunosuppressive / everolimus", value: { name: "everolimus", value: "2.16.840.1.113762.1.4.1260.499" }},
                { label: "immunosuppressive / drugs", value: { name: "drugs", value: "2.16.840.1.113762.1.4.1219.192" }},
                { label: "immunosuppressive / systemic_therapy", value: { name: "systemic_therapy", value: "2.16.840.1.113883.3.666.5.803" }},
                { label: "immunosuppressive / immune_modulators", value: { name: "immune_modulators", value: "2.16.840.1.113762.1.4.1248.124" }},
                { label: "immunosuppressive / coricosteroids_systemic", value: { name: "coricosteroids_systemic", value: "2.16.840.1.113883.3.3616.200.110.102.2061" }},
                { label: "cancer / chemo_advanced", value: { name: "chemo_advanced", value: "2.16.840.1.113883.3.7643.2.1046" }},
                { label: "cancer / checkpoint", value: { name: "checkpoint", value: "2.16.840.1.113762.1.4.1133.6" }},
                { label: "cancer / keytruda", value: { name: "keytruda", value: "2.16.840.1.113762.1.4.1260.496" }},
                { label: "cancer / ade_neutropenia", value: { name: "ade_neutropenia", value: "2.16.840.1.113883.3.526.3.1538" }},
                { label: "antibiotics / any", value: { name: "any", value: "2.16.840.1.113762.1.4.1078.849" }},
                { label: "antibiotics / systemic", value: { name: "systemic", value: "2.16.840.1.113762.1.4.1133.6" }},
                { label: "immunocompromised / therapies", value: { name: "therapies", value: "2.16.840.1.113762.1.4.1235.212" }},
                { label: "diabetes / drugs", value: { name: "drugs", value: "2.16.840.1.113762.1.4.1190.58" }},
                { label: "htn / drugs", value: { name: "drugs", value: "2.16.840.1.113883.3.600.1476" }},
                { label: "diuretics / loop", value: { name: "loop", value: "2.16.840.1.113762.1.4.1078.898" }},
                { label: "diuretics / potassium", value: { name: "potassium", value: "2.16.840.1.113762.1.4.1213.41" }},
                { label: "diuretics / thiazide", value: { name: "thiazide", value: "2.16.840.1.113762.1.4.1078.8" }},
            ]
        },
        dx_variables: {
            name: "FHIR Condition",
            type: "checklist",
            items: [
                { label: "cancer / skin", value: { name: "skin", value: "2.16.840.1.113883.3.526.3.1010" }},
                { label: "cancer / melanoma", value: { name: "melanoma", value: "2.16.840.1.113883.3.526.3.1010" }},
                { label: "cancer / melanoma_malignant", value: { name: "melanoma_malignant", value: "2.16.840.1.113883.3.1434.1038" }, description: "2.16.840.1.113883.3.1434.1038"},
                { label: "cancer / melanoma_malignant", value: { name: "melanoma_malignant", value: "2.16.840.1.113883.3.464.1003.108.11.1018" }, description: "2.16.840.1.113883.3.464.1003.108.11.1018"},
                { label: "cancer / sarcoma", value: { name: "sarcoma", value: "2.16.840.1.113883.3.526.3.1010" }},
                { label: "cancer / squamous", value: { name: "squamous", value: "2.16.840.1.113883.3.526.3.1010" }},
                { label: "kidney / condition", value: { name: "condition", value: "2.16.840.1.113883.17.4077.3.2028" }},
                { label: "kidney / renal_disease", value: { name: "renal_disease", value: "2.16.840.1.113762.1.4.1029.335" }},
                { label: "kidney / esrd", value: { name: "esrd", value: "2.16.840.1.113762.1.4.1235.172" }},
                { label: "kidney / ckd", value: { name: "ckd", value: "2.16.840.1.113762.1.4.1078.114" }},
                { label: "kidney / dialysis", value: { name: "dialysis", value: "2.16.840.1.113762.1.4.1078.342" }},
                { label: "kidney / nephrotic_syndrome", value: { name: "nephrotic_syndrome", value: "2.16.840.1.113883.3.464.1003.109.12.1018" }},
                { label: "autoimmune / inflammatory", value: { name: "inflammatory", value: "2.16.840.1.113883.3.3157.1834" }},
                { label: "autoimmune / ibd", value: { name: "ibd", value: "2.16.840.1.113762.1.4.1078.879" }},
                { label: "autoimmune / crohns", value: { name: "crohns", value: "2.16.840.1.113762.1.4.1034.576" }},
                { label: "autoimmune / arthritis_ra", value: { name: "arthritis_ra", value: "2.16.840.1.113762.1.4.1222.651" }, description: "2.16.840.1.113762.1.4.1222.651"},
                { label: "autoimmune / arthritis_ra", value: { name: "arthritis_ra", value: "2.16.840.1.113762.1.4.1222.81" }, description: "2.16.840.1.113762.1.4.1222.81" },
                { label: "autoimmune / lupus", value: { name: "lupus", value: "2.16.840.1.113883.3.464.1003.117.12.1010" }},
                { label: "immunocompromised / any", value: { name: "any", value: "2.16.840.1.113883.3.666.5.1940" }, description: "2.16.840.1.113883.3.666.5.1940" },
                { label: "immunocompromised / any", value: { name: "any", value: "2.16.840.1.113762.1.4.1235.212" }, description: "2.16.840.1.113762.1.4.1235.212" },
                { label: "infection / bacterial", value: { name: "bacterial", value: "2.16.840.1.113762.1.4.1200.288" }},
                { label: "infection / pna", value: { name: "pna", value: "2.16.840.1.113762.1.4.1078.738" }},
                { label: "infection / cmv", value: { name: "cmv", value: "2.16.840.1.113762.1.4.1146.2234" }, description: "2.16.840.1.113762.1.4.1146.2234" },
                { label: "infection / cmv", value: { name: "cmv", value: "2.16.840.1.113762.1.4.1146.2233" }, description: "2.16.840.1.113762.1.4.1146.2233" },
                { label: "infection / rsv", value: { name: "rsv", value: "2.16.840.1.113762.1.4.1078.754" }},
                { label: "infection / influenza", value: { name: "influenza", value: "2.16.840.1.113762.1.4.1078.747" }},
                { label: "infection / shingles", value: { name: "shingles", value: "2.16.840.1.113762.1.4.1222.1478" }},
                { label: "infection / hepatitis_b", value: { name: "hepatitis_b", value: "2.16.840.1.113883.3.464.1003.110.12.1025" }},
                { label: "infection / hepatitis_c", value: { name: "hepatitis_c", value: "2.16.840.1.113762.1.4.1222.30" }},
                { label: "heart / cardiomyopathy", value: { name: "cardiomyopathy", value: "2.16.840.1.113762.1.4.1222.579" }},
                { label: "heart / attack", value: { name: "attack", value: "2.16.840.1.113883.3.666.5.3011" }},
                { label: "heart / failure", value: { name: "failure", value: "2.16.840.1.113762.1.4.1222.1543" }},
                { label: "heart / cohort", value: { name: "cohort", value: "2.16.840.1.113762.1.4.1182.308" }},
                { label: "htn / essential", value: { name: "essential", value: "2.16.840.1.113883.3.464.1003.104.12.1011" }},
                { label: "htn / any", value: { name: "any", value: "2.16.840.1.113762.1.4.1251.12" }},
                { label: "htn / hypertensive_ckd", value: { name: "hypertensive_ckd", value: "2.16.840.1.113883.3.464.1003.109.12.1017" }},
                { label: "diabetes / disorder", value: { name: "disorder", value: "2.16.840.1.113762.1.4.1219.35" }},
                { label: "diabetes / preexisting", value: { name: "preexisting", value: "2.16.840.1.113883.3.464.1003.198.12.1075" }},
                { label: "diabetes / complications", value: { name: "complications", value: "2.16.840.1.113762.1.4.1222.1537" }},
                { label: "diabetes / t2d_related_dx", value: { name: "t2d_related_dx", value: "2.16.840.1.113762.1.4.1078.440" }},
                { label: "diabetes / diabetic_nephropathy", value: { name: "diabetic_nephropathy", value: "2.16.840.1.113883.3.464.1003.109.12.1004" }},
                { label: "diabetes / diabetic_ckd", value: { name: "diabetic_ckd", value: "2.16.840.1.113762.1.4.1078.124" }},
            ]
        }
    }
}
