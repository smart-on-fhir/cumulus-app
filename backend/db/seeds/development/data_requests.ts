export default [
    {
        id: 1,
        name: 'Demo Data Subscription',
        description: 'This data subscription has been created for demo purposes',
        refresh: 'manually',
        completed: '2022-08-22 18:43:09.245+00',
        requestedData: {
            "fields": {
                "labs": [{"name": "COVID-19", "description": "COVID-19 PCR Test Results"}, {"name": "Flu", "description": ""}],
                "diagnoses": [{"name": "COVID-19", "description": "Have the patients been diagnosed with COVID"}],
                "phenotypes": [],
                "procedures": [],
                "medications": [],
                "demographics": [
                    {"name": "gender", "description": "Short description of the Gender demographics"},
                    {"name": "age", "description": "Short description of the field"},
                    {"name": "cdcAgeGroup", "description": "Short description of the field"},
                    {"name": "race", "description": "Short description of the field"},
                    {"name": "ethnicity", "description": "Short description of the field"},
                    {"name": "deceased", "description": "Short description of the field"}
                ],
                "immunizations": [
                    {"name": "COVID-19 #1", "description": "COVID-19 Vaccine - dose 1"},
                    {"name": "COVID-19 #2", "description": "COVID-19 Vaccine - dose 2"},
                    {"name": "COVID-19 #3", "description": "COVID-19 Vaccine - booster"}
                ]
            },
            "dataSites": [
                {"name": "Boston Children''s Hospital", "description": "Short description of the Boston Children''s Hospital data site"},
                {"name": "Massachusetts General Hospital", "description": "Short description of the Massachusetts General Hospital data site"}
            ]
        },
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"},
                {"name": "age_at_visit", "label": "Age At Visit", "dataType": "string", "description": "Age at visit"},
                {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"},
                {"name": "race", "label": "Race", "dataType": "string", "description": "Race"},
                {"name": "code", "label": "Code", "dataType": "string", "description": "Code"}
            ],
            "total": 15797
        },   
        createdAt: '2022-06-06 21:01:57.197+00',
        updatedAt: '2022-08-22 18:43:09.246+00'
    },
    {
        id: 2,
        name: 'Demo - Large subscription payload',
        description: 'Data inserted from&nbsp;https://us-east-2.console.aws.amazon.com/s3/object/output-bintest2?region=us-east-2&amp;prefix=Unsaved/2022/06/06/8c3a5429-1b60-4a7d-92b4-641920889d43.csv',
        refresh: 'manually',
        completed: '2022-06-06 22:01:00.821+00',
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"},
                {"name": "admission", "label": "Admission", "dataType": "string", "description": "Admission"},
                {"name": "pcr_result", "label": "Pcr Result", "dataType": "string", "description": "Pcr result"},
                {"name": "nlp_result", "label": "Nlp Result", "dataType": "string", "description": "Nlp result"},
                {"name": "covid_dx", "label": "Covid Dx", "dataType": "string", "description": "Covid dx"},
                {"name": "flu_dx", "label": "Flu Dx", "dataType": "string", "description": "Flu dx"},
                {"name": "common_dx", "label": "Common Dx", "dataType": "string", "description": "Common dx"},
                {"name": "symptom_text", "label": "Symptom Text", "dataType": "string", "description": "Symptom text"},
                {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"},
                {"name": "race", "label": "Race", "dataType": "string", "description": "Race"},
                {"name": "age_at_visit", "label": "Age At Visit", "dataType": "integer", "description": "Age at visit"}
            ],
            "total": 165527
        },
        createdAt: '2022-06-06 21:44:10.871+00',
        updatedAt: '2022-11-15 16:35:43.316+00'
    },
    {
        id: 3,
        name: 'Suicidality by Month',
        refresh: 'manually',
        completed: '2022-06-30 18:48:32.462+00',
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"},
                {"name": "code", "label": "Code", "dataType": "string", "description": "Code"}
            ],
            "total": 165527
        }, 
        groupId: 1, 
        createdAt: '2022-06-13 20:24:23.103+00',
        updatedAt: '2022-11-15 16:51:53.942+00'
    },
    {
        id: 4,
        name: 'gender identity over time',
        refresh: 'manually',
        completed: '2022-08-22 20:31:04.55+00', 
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "code_text", "label": "Code Text", "dataType": "string", "description": "Code text"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"},
                {"name": "Z75", "label": "Z75", "dataType": "string", "description": "Z75"}
            ],
            "total": 15786
        },
        groupId: 1,
        createdAt: '2022-06-23 23:04:02.137+00',
        updatedAt: '2022-08-22 20:31:04.55+00'
    },
    {
        id: 5,
        name: 'Suicidality by Month v2',
        refresh: 'manually',
        completed: '2022-08-22 18:52:03.563+00',
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "display", "label": "Display", "dataType": "string", "description": "Display"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"},
                {"name": "age_at_visit", "label": "Age At Visit", "dataType": "string", "description": "Age at visit"},
                {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"},
                {"name": "race", "label": "Race", "dataType": "string", "description": "Race"}
            ],
            "total": 15797
        }, 
        groupId:1,
        createdAt: '2022-06-28 20:54:55.723+00',
        updatedAt: '2022-11-15 16:52:26.574+00'
    },
    {
        id: 6,
        name: 'COVID PCR Test Positivity',
        description: '<p dir="ltr" style="margin-top: 0pt; margin-bottom: 0pt; font-family: Nunito, "Helvetica Neue", sans-serif; line-height: 1.38; background-color: rgb(248, 248, 247);"><span style="font-size: 12pt; font-family: Nunito, sans-serif; color: rgb(0, 0, 0); background-color: transparent; font-variant-numeric: normal; font-variant-east-asian: normal; vertical-align: baseline; white-space: pre-wrap;"><span style="font-weight: 700;">This is a sample data subscription providing insights into COVID tests administered each week.</span></span></p><p dir="ltr" style="margin-top: 0pt; margin-bottom: 0pt; font-family: Nunito, "Helvetica Neue", sans-serif; line-height: 1.38; background-color: rgb(248, 248, 247);"><span style="font-size: 12pt; font-family: Nunito, sans-serif; color: rgb(0, 0, 0); background-color: transparent; font-variant-numeric: normal; font-variant-east-asian: normal; vertical-align: baseline; white-space: pre-wrap;">The patient counts in this request are from all ED visits and direct admissions to Boston Children\'s Hospital starting in January 2020.</span></p><p dir="ltr" style="margin-top: 0pt; margin-bottom: 0pt; font-family: Nunito, "Helvetica Neue", sans-serif; line-height: 1.38; background-color: rgb(248, 248, 247);"><span style="font-size: 12pt; font-family: Nunito, sans-serif; color: rgb(0, 0, 0); background-color: transparent; font-variant-numeric: normal; font-variant-east-asian: normal; vertical-align: baseline; white-space: pre-wrap;">Aggregate count data each week are broken down by common demographics and the status of any COVID19 PCR tests given that week.</span></p>',
        refresh: 'manually',
        completed: '2022-11-15 17:16:28.157+00',
        requestedData: {
            "fields": {
                "labs": [{"name": "pcr_result", "description": "PCR result"}],
                "diagnoses": [],
                "phenotypes": [],
                "procedures": [],
                "medications": [],
                "demographics": [
                    {"name": "age", "label": "Age", "description": "Short description of the field"},
                    {"name": "race", "label": "Race", "description": "Short description of the field"},
                    {"name": "gender", "label": "Gender", "description": "Short description of the field"}
                ],
                "immunizations": []
            },
            "dataSites": [
                {"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}
            ]
        },
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Count", "dataType": "integer", "description": "Count"},
                {"name": "pcr_result", "label": "COVID PCR", "dataType": "string", "description": "COVID PCR Result"},
                {"name": "pcr_test_date", "label": "Test Date", "dataType": "date:YYYY-MM-DD", "description": "Test Date"},
                {"name": "age_at_visit", "label": "Age At Visit", "dataType": "string", "description": "Age at visit"},
                {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"},
                {"name": "race", "label": "Race", "dataType": "string", "description": "Race"}
            ],
            "total": 30256
        },
        groupId: 2,
        createdAt: '2022-06-30 19:45:05.071+00',
        updatedAt: '2022-11-15 17:24:27.18+00'
    },
    {
        id: 7,
        name: 'COVID Symptoms by Variant of Concern',
        description: 'The patient counts in this subscription are from all ED visits and direct admissions starting in January 2020. Visits are aggregated by variant era:<div><div><br></div><div>Pre-Delta: March 1, 2020 to June 14, 2021,</div><div>Delta: June 15, 2021 to November 29, 2021,</div><div>Omicron November 30, 2021</div><div><br></div><div><span style="color: inherit; font-family: inherit; font-size: inherit; font-style: inherit; font-variant-ligatures: inherit; font-variant-caps: inherit;"><b>Last transmitted dates:</b></span></div><div><span style="color: inherit; font-family: inherit; font-size: inherit; font-style: inherit; font-variant-ligatures: inherit; font-variant-caps: inherit; font-weight: inherit;">BCH: February 2021</span><br></div></div>',
        refresh: 'manually',
        completed: '2022-06-30 21:51:36.648+00',
        requestedData: {
            "fields": {
                "labs": [{"name": "COVID PCR", "description": ""}],
                "diagnoses": [{"name": "COVID Dx", "description": ""}, {"name": "Flu Dx", "description": ""}, {"name": "Common Dx", "description": ""}],
                "phenotypes": [{"name": "Covid Symptoms", "description": ""}, {"name": "Admission", "description": "Whether patient was admitted to the hospital or not"}],
                "procedures": [],
                "medications": [],
                "demographics": [
                    {"name": "age", "label": "Age", "description": "Short description of the field"},
                    {"name": "race", "label": "Race", "description": "Short description of the field"},
                    {"name": "gender", "label": "Gender", "description": "Short description of the field"}
                ],
                "immunizations": []
            },
            "dataSites": [
                {"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}
            ]
        },
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "admission", "label": "Admission", "dataType": "string", "description": "Admission"},
                {"name": "pcr_result", "label": "Pcr Result", "dataType": "string", "description": "PCR result"},
                {"name": "nlp_result", "label": "Nlp Result", "dataType": "string", "description": "NLP result"},
                {"name": "covid_dx", "label": "Covid Dx", "dataType": "string", "description": "ICD10 COVID"},
                {"name": "flu_dx", "label": "Flu Dx", "dataType": "string", "description": "ICD10 Flu"},
                {"name": "common_dx", "label": "Common Dx", "dataType": "string", "description": "ICD10 Common"},
                {"name": "symptom_text", "label": "Symptom Text", "dataType": "string", "description": "Symptom"},
                {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"},
                {"name": "race", "label": "Race", "dataType": "string", "description": "Race"},
                {"name": "age_group", "label": "Age Group", "dataType": "string", "description": "Age group"},
                {"name": "variant", "label": "Variant", "dataType": "string", "description": "Variant COVID"}
            ],
            "total": 165527
        }, 
        groupId: 2,
        createdAt: '2022-06-30 21:48:21.114+00',
        updatedAt: '2022-11-14 18:51:23.914+00'
    },
    {
        id: 8,
        name: 'Z75.1-3 over time',
        description: 'Problems related to medical facilities and other health care (ICD code Z75.*) in patients with suicidality, without, and in total.',
        refresh: 'manually',
        completed: '2022-08-03 16:42:12.616+00', 
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"},
                {"name": "cat", "label": "Cat", "dataType": "string", "description": "Cat"}
            ],
            "total": 127
        },
        groupId: 1, 
        createdAt: '2022-07-05 17:59:04.425+00',
        updatedAt: '2022-08-03 16:42:12.616+00'
    },
    {
        id: 9,
        name: 'Number of Suicidal Patients By Month', 
        refresh: 'manually',
        completed: '2022-07-06 01:02:13.833+00', 
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}
            ],
            "total": 165527
        },
        groupId: 1, 
        createdAt: '2022-07-06 00:16:48.245+00',
        updatedAt: '2022-07-06 01:02:13.835+00'
    },
    {
        id: 10,
        name: 'Suicidality and Admissions', 
        refresh: 'manually',
        completed: '2022-07-07 04:16:25.087+00',
        requestedData: {
            "fields": {
                "labs": [],
                "diagnoses": [
                    {"name": "ideation", "description": "ICD10 suicidal ideation"},
                    {"name": "waiting", "description": "ICD10 waiting for admission"},
                    {"name": "", "description": ""}
                ],
                "phenotypes": [
                    {"name": "admission", "description": "Admission Documented"}
                ],
                "procedures": [],
                "medications": [],
                "demographics": [
                    {"name": "age", "label": "Age", "description": "Short description of the field"},
                    {"name": "race", "label": "Race", "description": "Short description of the field"},
                    {"name": "gender", "label": "Gender", "description": "Short description of the field"}
                ],
                "immunizations": []
            },
            "dataSites": [
                {"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}
            ]
        }, 
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Count"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"},
                {"name": "admission", "label": "Admission", "dataType": "string", "description": "Admission"},
                {"name": "ideation", "label": "Ideation", "dataType": "string", "description": "Ideation"},
                {"name": "waiting", "label": "Waiting", "dataType": "string", "description": "Waiting"},
                {"name": "age_at_visit", "label": "Age At Visit", "dataType": "integer", "description": "Age at visit"},
                {"name": "race", "label": "Race", "dataType": "string", "description": "Race"},
                {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"}
            ],
            "total": 165527
        }, 
        groupId: 1, 
        createdAt: '2022-07-07 03:38:57.499+00',
        updatedAt: '2022-07-07 04:16:25.089+00'
    },
    {
        id: 11,
        name: 'Suicidality and Admissions', 
        refresh: 'manually', 
        requestedData: {
            "fields": {
                "labs": [],
                "diagnoses": [{"name": "", "description": ""}],
                "phenotypes": [],
                "procedures": [],
                "medications": [],
                "demographics": [],
                "immunizations": []
            },
            "dataSites": [
                {"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}
            ]
        }, 
        groupId: 1, 
        createdAt: '2022-07-07 03:40:26.369+00',
        updatedAt: '2022-07-07 03:40:26.369+00'
    },
    {
        id: 13,
        name: 'Comorbidities over time',
        refresh: 'manually',
        completed: '2022-07-26 18:53:42.608+00', 
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"},
                {"name": "code", "label": "Code", "dataType": "string", "description": "Code"},
                {"name": "cat", "label": "Cat", "dataType": "string", "description": "Cat"}
            ],
            "total": 3783
        }, 
        groupId: 1, 
        createdAt: '2022-07-26 18:53:21.694+00',
        updatedAt: '2022-07-26 18:53:42.608+00'
    },
    {
        id: 14,
        name: 'Prevalence of Comorbidities',
        refresh: 'manually',
        completed: '2022-07-29 00:07:33.12+00',
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "code", "label": "Code", "dataType": "string", "description": "Code"}
            ],
            "total": 164358
        }, 
        groupId: 1, 
        createdAt: '2022-07-29 00:07:02+00',
        updatedAt: '2022-07-29 00:07:33.121+00'
    },
    {
        id: 16,
        name: 'Suicidality and Z75 Aug 22',
        refresh: 'manually',
        completed: '2022-08-22 21:16:25.791+00',
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"},
                {"name": "z_code", "label": "Z75 Waiting Admit", "dataType": "string", "description": "Z75 Waiting Admit"},
                {"name": "si_code", "label": "Suicidality", "dataType": "string", "description": "Suicidality"}
            ],
            "total": 166604
        },
        groupId: 1,
        createdAt: '2022-08-22 21:15:43.732+00',
        updatedAt: '2022-11-15 16:52:46.592+00'
    },
    {
        id: 15,
        name: 'Suicidality by Month v3',
        description: 'Suicide attempt codes aggregated',
        refresh: 'manually',
        completed: '2022-08-02 20:27:40.988+00',
        requestedData: {
            "fields": {
                "labs": [],
                "diagnoses": [],
                "phenotypes": [],
                "procedures": [],
                "medications": [],
                "demographics": [
                    {"name": "age", "label": "Age", "description": "Short description of the field"},
                    {"name": "race", "label": "Race", "description": "Short description of the field"},
                    {"name": "gender", "label": "Gender", "description": "Short description of the field"}
                ],
                "immunizations": []
            },
            "dataSites": [
                {"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}
            ]
        },
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"},
                {"name": "admission", "label": "Admission", "dataType": "string", "description": "Admission"},
                {"name": "ideation", "label": "Ideation", "dataType": "string", "description": "Ideation"},
                {"name": "waiting", "label": "Waiting", "dataType": "string", "description": "Waiting"},
                {"name": "age_at_visit", "label": "Age At Visit", "dataType": "integer", "description": "Age at visit"},
                {"name": "race", "label": "Race", "dataType": "string", "description": "Race"},
                {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"}
            ],
            "total": 165527
        },
        groupId: 1, 
        createdAt: '2022-08-02 20:08:00.112+00',
        updatedAt: '2022-11-15 16:53:40.409+00'
    },
    {
        id: 49,
        name: 'CDC NLP Symptoms',
        description: 'Aggregated by month',
        refresh: 'manually',
        completed: '2022-11-15 17:46:06.646+00',
        requestedData: {
            "fields": {
                "labs": [{"name": "COVID PCR", "description": ""}],
                "diagnoses": [{"name": "COVID", "description": ""}, {"name": "Flu", "description": ""}, {"name": "Common Dx", "description": ""}],
                "phenotypes": [{"name": "Symptom Text", "description": ""}],
                "procedures": [],
                "medications": [],
                "demographics": [],
                "immunizations": []
            },
            "dataSites": [
                {"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}
            ]
        },
        metadata: {
            "cols": [
                {"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Count"},
                {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Encounter month"},
                {"name": "admission", "label": "Admission", "dataType": "string", "description": "Admission"},
                {"name": "pcr_result", "label": "Pcr Result", "dataType": "string", "description": "COVID PCR result"},
                {"name": "covid_dx", "label": "Covid Dx", "dataType": "string", "description": "Covid dx"},
                {"name": "flu_dx", "label": "Flu Dx", "dataType": "string", "description": "Flu dx"},
                {"name": "common_dx", "label": "Common Dx", "dataType": "string", "description": "Common dx"},
                {"name": "symptom_text", "label": "Symptom Text", "dataType": "string", "description": "Symptom text"}
            ],
            "total": 165527
        }, 
        groupId: 2, 
        createdAt: '2022-11-15 17:45:16.972+00',
        updatedAt: '2022-11-15 17:46:06.647+00'
    }
]
