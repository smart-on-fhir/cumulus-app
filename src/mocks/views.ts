export default [
    {
        name: "view_patient",
        columns: [
            { name: "gender"     },
            { name: "dob"        },
            { name: "age"        },
            { name: "race"       },
            { name: "ethnicity"  },
            { name: "postalcode" },
            { name: "subject_id" }
        ]
    },

    {
        name: "view_patient_age_cdc",
        columns: [
            { name: "age_group" },
            { name: "gender" },
            { name: "race" },
            { name: "ethnicity" },
            { name: "subject_id" }
        ]
    },

    {
        name: "view_patient_age_decade",
        columns: [
            { name: "age_group" },
            { name: "subject_id" }
        ]
    },

    {
        name: "view_observation",
        columns: [
            { name: "category" },
            { name: "obs_code" },
            { name: "obs_code_display" },
            { name: "value_code" },
            { name: "value_display" },
            { name: "value_system" },
            { name: "effective_date_day" },
            { name: "effective_date_week" },
            { name: "effective_date_year" },
            { name: "obs_id" },
            { name: "subject_id" }
        ]
    },

    {
        name: "view_encounter",
        columns: [
            { name: "status" },
            { name: "class_code" },
            { name: "enc_code" },
            { name: "enc_code_display" },
            { name: "reason_code" },
            { name: "reason_display" },
            { name: "reason_system" },
            { name: "coding" },
            { name: "subject_id" },
            { name: "period_start_date" },
            { name: "period_start_week" },
            { name: "period_start_year" }
        ]
    },

    {
        name: "view_medication",
        columns: [
            { name: "status" },
            { name: "code" },
            { name: "display" },
            { name: "system" },
            { name: "med_id" },
            { name: "form" },
            { name: "amount" },
            { name: "ingredient" }
        ]
    },

    {
        name: "view_medicationadministration",
        columns: [
            { name: "status" },
            { name: "statusreason" },
            { name: "effectiveDateTime" },
            { name: "dose_unit" },
            { name: "dose_value" },
            { name: "code" },
            { name: "display" },
            { name: "system" },
            { name: "med_admin_id" },
            { name: "subject_id" }
        ]
    },

    {
        name: "view_medicationrequest",
        columns: [
            { name: "status" },
            { name: "statusreason" },
            { name: "intent" },
            { name: "authoredOn" },
            { name: "category" },
            { name: "code" },
            { name: "display" },
            { name: "system" },
            { name: "med_admin_id" },
            { name: "subject_id" }
        ]
    },

    {
        name: "view_medicationstatement",
        columns: [
            { name: "status" },
            { name: "statusreason" },
            { name: "code" },
            { name: "display" },
            { name: "system" },
            { name: "med_statement_id" },
            { name: "subject_id" }
        ]
    },

    {
        name: "view_condition",
        columns: [
            { name: "category" },
            { name: "code" },
            { name: "display" },
            { name: "system" },
            { name: "recordedDate" },
            { name: "cond_id" },
            { name: "subject_id" },
            { name: "severity" },
            { name: "bodysite" }
        ]
    },

    {
        name: "view_condition_modifier",
        columns: [
            { name: "id" },
            { name: "url" }
        ]
    },

    {
        name: "view_procedure_modifier",
        columns: [
            { name: "id" },
            { name: "url" }
        ]
    },

    {
        name: "view_procedure",
        columns: [
            { name: "status" },
            { name: "statusReason" },
            { name: "category" },
            { name: "reasonCode" },
            { name: "performedPeriod" },
            { name: "code" },
            { name: "display" },
            { name: "system" },
            { name: "procedure_id" },
            { name: "subject_id" },
            { name: "bodysite" },
            { name: "complication" },
            { name: "usedCode" }
        ]
    },

    {
        name: "view_diagnosticreport",
        columns: [
            { name: "status" },
            { name: "category" },
            { name: "code" },
            { name: "display" },
            { name: "system" },
            { name: "conclusion" },
            { name: "conclusionCode" },
            { name: "diagnosticreport_id" },
            { name: "subject_id" },
            { name: "encounter" },
            { name: "effectiveDateTime" }
        ]
    },

    {
        name: "valueset_viral_lab",
        columns: [
            { name: "80382-5" },
            { name: "80383-3" },
            { name: "91242-9" },
            { name: "92141-1" },
            { name: "92131-2" },
            { name: "92140-3" },
            { name: "92139-5" },
            { name: "92138-7" },
            { name: "92143-6" },
            { name: "94040-3" },
            { name: "94558-4" },
            { name: "46083-2" },
            { name: "46082-4" },
            { name: "94500-6" },
            { name: "94762-2" },
            { name: "68966-1" },
            { name: "34487-9" },
            { name: "94500-6" },
            { name: "41010-0" },
            { name: "29909-9" },
            { name: "40988-8" },
            { name: "40982-1" },
            { name: "34487-9" },
            { name: "29910-7" },
            { name: "94508-9" },
            { name: "94563-4" },
            { name: "68966-1" }
        ]
    }
]
