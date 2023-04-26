--
-- PostgreSQL database dump
--

-- Dumped from database version 14.7 (Debian 14.7-1.pgdg110+1)
-- Dumped by pg_dump version 15.2

-- Started on 2023-04-16 13:52:23 PDT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3403 (class 0 OID 16712)
-- Dependencies: 214
-- Data for Name: Activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Activities" (id, type, message, tags, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3407 (class 0 OID 16732)
-- Dependencies: 218
-- Data for Name: RequestGroups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RequestGroups" (id, name, description, "createdAt", "updatedAt") FROM stdin;
1	Quantifying Behavioral Health Issues	\N	2023-04-16 19:10:22.817+00	2023-04-16 19:10:22.817+00
2	Understanding COVID-19	\N	2023-04-16 19:10:22.817+00	2023-04-16 19:10:22.817+00
\.


--
-- TOC entry 3409 (class 0 OID 16743)
-- Dependencies: 220
-- Data for Name: DataRequests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DataRequests" (id, name, description, refresh, completed, "requestedData", metadata, data, "groupId", "dataURL", transmissions, "createdAt", "updatedAt") FROM stdin;
1	Demo Data Subscription	This data subscription has been created for demo purposes	manually	2022-08-22 18:43:09.245+00	{"fields": {"labs": [{"name": "COVID-19", "description": "COVID-19 PCR Test Results"}, {"name": "Flu", "description": ""}], "diagnoses": [{"name": "COVID-19", "description": "Have the patients been diagnosed with COVID"}], "phenotypes": [], "procedures": [], "medications": [], "demographics": [{"name": "gender", "description": "Short description of the Gender demographics"}, {"name": "age", "description": "Short description of the field"}, {"name": "cdcAgeGroup", "description": "Short description of the field"}, {"name": "race", "description": "Short description of the field"}, {"name": "ethnicity", "description": "Short description of the field"}, {"name": "deceased", "description": "Short description of the field"}], "immunizations": [{"name": "COVID-19 #1", "description": "COVID-19 Vaccine - dose 1"}, {"name": "COVID-19 #2", "description": "COVID-19 Vaccine - dose 2"}, {"name": "COVID-19 #3", "description": "COVID-19 Vaccine - booster"}]}, "dataSites": [{"name": "Boston Children''s Hospital", "description": "Short description of the Boston Children''s Hospital data site"}, {"name": "Massachusetts General Hospital", "description": "Short description of the Massachusetts General Hospital data site"}]}	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}, {"name": "age_at_visit", "label": "Age At Visit", "dataType": "string", "description": "Age at visit"}, {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"}, {"name": "race", "label": "Race", "dataType": "string", "description": "Race"}, {"name": "code", "label": "Code", "dataType": "string", "description": "Code"}], "total": 15797}	\N	\N	\N	\N	2022-06-06 21:01:57.197+00	2022-08-22 18:43:09.246+00
2	Demo - Large subscription payload	Data inserted from&nbsp;https://us-east-2.console.aws.amazon.com/s3/object/output-bintest2?region=us-east-2&amp;prefix=Unsaved/2022/06/06/8c3a5429-1b60-4a7d-92b4-641920889d43.csv	manually	2022-06-06 22:01:00.821+00	\N	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}, {"name": "admission", "label": "Admission", "dataType": "string", "description": "Admission"}, {"name": "pcr_result", "label": "Pcr Result", "dataType": "string", "description": "Pcr result"}, {"name": "nlp_result", "label": "Nlp Result", "dataType": "string", "description": "Nlp result"}, {"name": "covid_dx", "label": "Covid Dx", "dataType": "string", "description": "Covid dx"}, {"name": "flu_dx", "label": "Flu Dx", "dataType": "string", "description": "Flu dx"}, {"name": "common_dx", "label": "Common Dx", "dataType": "string", "description": "Common dx"}, {"name": "symptom_text", "label": "Symptom Text", "dataType": "string", "description": "Symptom text"}, {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"}, {"name": "race", "label": "Race", "dataType": "string", "description": "Race"}, {"name": "age_at_visit", "label": "Age At Visit", "dataType": "integer", "description": "Age at visit"}], "total": 165527}	\N	\N	\N	\N	2022-06-06 21:44:10.871+00	2022-11-15 16:35:43.316+00
3	Suicidality by Month	\N	manually	2022-06-30 18:48:32.462+00	\N	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}, {"name": "code", "label": "Code", "dataType": "string", "description": "Code"}], "total": 165527}	\N	1	\N	\N	2022-06-13 20:24:23.103+00	2022-11-15 16:51:53.942+00
4	gender identity over time	\N	manually	2022-08-22 20:31:04.55+00	\N	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "code_text", "label": "Code Text", "dataType": "string", "description": "Code text"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}, {"name": "Z75", "label": "Z75", "dataType": "string", "description": "Z75"}], "total": 15786}	\N	1	\N	\N	2022-06-23 23:04:02.137+00	2022-08-22 20:31:04.55+00
5	Suicidality by Month v2	\N	manually	2022-08-22 18:52:03.563+00	\N	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "display", "label": "Display", "dataType": "string", "description": "Display"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}, {"name": "age_at_visit", "label": "Age At Visit", "dataType": "string", "description": "Age at visit"}, {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"}, {"name": "race", "label": "Race", "dataType": "string", "description": "Race"}], "total": 15797}	\N	1	\N	\N	2022-06-28 20:54:55.723+00	2022-11-15 16:52:26.574+00
6	COVID PCR Test Positivity	<p dir="ltr" style="margin-top: 0pt; margin-bottom: 0pt; font-family: Nunito, "Helvetica Neue", sans-serif; line-height: 1.38; background-color: rgb(248, 248, 247);"><span style="font-size: 12pt; font-family: Nunito, sans-serif; color: rgb(0, 0, 0); background-color: transparent; font-variant-numeric: normal; font-variant-east-asian: normal; vertical-align: baseline; white-space: pre-wrap;"><span style="font-weight: 700;">This is a sample data subscription providing insights into COVID tests administered each week.</span></span></p><p dir="ltr" style="margin-top: 0pt; margin-bottom: 0pt; font-family: Nunito, "Helvetica Neue", sans-serif; line-height: 1.38; background-color: rgb(248, 248, 247);"><span style="font-size: 12pt; font-family: Nunito, sans-serif; color: rgb(0, 0, 0); background-color: transparent; font-variant-numeric: normal; font-variant-east-asian: normal; vertical-align: baseline; white-space: pre-wrap;">The patient counts in this request are from all ED visits and direct admissions to Boston Children's Hospital starting in January 2020.</span></p><p dir="ltr" style="margin-top: 0pt; margin-bottom: 0pt; font-family: Nunito, "Helvetica Neue", sans-serif; line-height: 1.38; background-color: rgb(248, 248, 247);"><span style="font-size: 12pt; font-family: Nunito, sans-serif; color: rgb(0, 0, 0); background-color: transparent; font-variant-numeric: normal; font-variant-east-asian: normal; vertical-align: baseline; white-space: pre-wrap;">Aggregate count data each week are broken down by common demographics and the status of any COVID19 PCR tests given that week.</span></p>	manually	2022-11-15 17:16:28.157+00	{"fields": {"labs": [{"name": "pcr_result", "description": "PCR result"}], "diagnoses": [], "phenotypes": [], "procedures": [], "medications": [], "demographics": [{"name": "age", "label": "Age", "description": "Short description of the field"}, {"name": "race", "label": "Race", "description": "Short description of the field"}, {"name": "gender", "label": "Gender", "description": "Short description of the field"}], "immunizations": []}, "dataSites": [{"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}]}	{"cols": [{"name": "cnt", "label": "Count", "dataType": "integer", "description": "Count"}, {"name": "pcr_result", "label": "COVID PCR", "dataType": "string", "description": "COVID PCR Result"}, {"name": "pcr_test_date", "label": "Test Date", "dataType": "date:YYYY-MM-DD", "description": "Test Date"}, {"name": "age_at_visit", "label": "Age At Visit", "dataType": "string", "description": "Age at visit"}, {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"}, {"name": "race", "label": "Race", "dataType": "string", "description": "Race"}], "total": 30256}	\N	2	\N	\N	2022-06-30 19:45:05.071+00	2022-11-15 17:24:27.18+00
7	COVID Symptoms by Variant of Concern	The patient counts in this subscription are from all ED visits and direct admissions starting in January 2020. Visits are aggregated by variant era:<div><div><br></div><div>Pre-Delta: March 1, 2020 to June 14, 2021,</div><div>Delta: June 15, 2021 to November 29, 2021,</div><div>Omicron November 30, 2021</div><div><br></div><div><span style="color: inherit; font-family: inherit; font-size: inherit; font-style: inherit; font-variant-ligatures: inherit; font-variant-caps: inherit;"><b>Last transmitted dates:</b></span></div><div><span style="color: inherit; font-family: inherit; font-size: inherit; font-style: inherit; font-variant-ligatures: inherit; font-variant-caps: inherit; font-weight: inherit;">BCH: February 2021</span><br></div></div>	manually	2022-06-30 21:51:36.648+00	{"fields": {"labs": [{"name": "COVID PCR", "description": ""}], "diagnoses": [{"name": "COVID Dx", "description": ""}, {"name": "Flu Dx", "description": ""}, {"name": "Common Dx", "description": ""}], "phenotypes": [{"name": "Covid Symptoms", "description": ""}, {"name": "Admission", "description": "Whether patient was admitted to the hospital or not"}], "procedures": [], "medications": [], "demographics": [{"name": "age", "label": "Age", "description": "Short description of the field"}, {"name": "race", "label": "Race", "description": "Short description of the field"}, {"name": "gender", "label": "Gender", "description": "Short description of the field"}], "immunizations": []}, "dataSites": [{"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}]}	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "admission", "label": "Admission", "dataType": "string", "description": "Admission"}, {"name": "pcr_result", "label": "Pcr Result", "dataType": "string", "description": "PCR result"}, {"name": "nlp_result", "label": "Nlp Result", "dataType": "string", "description": "NLP result"}, {"name": "covid_dx", "label": "Covid Dx", "dataType": "string", "description": "ICD10 COVID"}, {"name": "flu_dx", "label": "Flu Dx", "dataType": "string", "description": "ICD10 Flu"}, {"name": "common_dx", "label": "Common Dx", "dataType": "string", "description": "ICD10 Common"}, {"name": "symptom_text", "label": "Symptom Text", "dataType": "string", "description": "Symptom"}, {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"}, {"name": "race", "label": "Race", "dataType": "string", "description": "Race"}, {"name": "age_group", "label": "Age Group", "dataType": "string", "description": "Age group"}, {"name": "variant", "label": "Variant", "dataType": "string", "description": "Variant COVID"}], "total": 165527}	\N	2	\N	\N	2022-06-30 21:48:21.114+00	2022-11-14 18:51:23.914+00
8	Z75.1-3 over time	Problems related to medical facilities and other health care (ICD code Z75.*) in patients with suicidality, without, and in total.	manually	2022-08-03 16:42:12.616+00	\N	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}, {"name": "cat", "label": "Cat", "dataType": "string", "description": "Cat"}], "total": 127}	\N	1	\N	\N	2022-07-05 17:59:04.425+00	2022-08-03 16:42:12.616+00
9	Number of Suicidal Patients By Month	\N	manually	2022-07-06 01:02:13.833+00	\N	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}], "total": 165527}	\N	1	\N	\N	2022-07-06 00:16:48.245+00	2022-07-06 01:02:13.835+00
10	Suicidality and Admissions	\N	manually	2022-07-07 04:16:25.087+00	{"fields": {"labs": [], "diagnoses": [{"name": "ideation", "description": "ICD10 suicidal ideation"}, {"name": "waiting", "description": "ICD10 waiting for admission"}, {"name": "", "description": ""}], "phenotypes": [{"name": "admission", "description": "Admission Documented"}], "procedures": [], "medications": [], "demographics": [{"name": "age", "label": "Age", "description": "Short description of the field"}, {"name": "race", "label": "Race", "description": "Short description of the field"}, {"name": "gender", "label": "Gender", "description": "Short description of the field"}], "immunizations": []}, "dataSites": [{"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}]}	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Count"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}, {"name": "admission", "label": "Admission", "dataType": "string", "description": "Admission"}, {"name": "ideation", "label": "Ideation", "dataType": "string", "description": "Ideation"}, {"name": "waiting", "label": "Waiting", "dataType": "string", "description": "Waiting"}, {"name": "age_at_visit", "label": "Age At Visit", "dataType": "integer", "description": "Age at visit"}, {"name": "race", "label": "Race", "dataType": "string", "description": "Race"}, {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"}], "total": 165527}	\N	1	\N	\N	2022-07-07 03:38:57.499+00	2022-07-07 04:16:25.089+00
11	Suicidality and Admissions	\N	manually	\N	{"fields": {"labs": [], "diagnoses": [{"name": "", "description": ""}], "phenotypes": [], "procedures": [], "medications": [], "demographics": [], "immunizations": []}, "dataSites": [{"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}]}	\N	\N	1	\N	\N	2022-07-07 03:40:26.369+00	2022-07-07 03:40:26.369+00
13	Comorbidities over time	\N	manually	2022-07-26 18:53:42.608+00	\N	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}, {"name": "code", "label": "Code", "dataType": "string", "description": "Code"}, {"name": "cat", "label": "Cat", "dataType": "string", "description": "Cat"}], "total": 3783}	\N	1	\N	\N	2022-07-26 18:53:21.694+00	2022-07-26 18:53:42.608+00
14	Prevalence of Comorbidities	\N	manually	2022-07-29 00:07:33.12+00	\N	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "code", "label": "Code", "dataType": "string", "description": "Code"}], "total": 164358}	\N	1	\N	\N	2022-07-29 00:07:02+00	2022-07-29 00:07:33.121+00
16	Suicidality and Z75 Aug 22	\N	manually	2022-08-22 21:16:25.791+00	\N	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}, {"name": "z_code", "label": "Z75 Waiting Admit", "dataType": "string", "description": "Z75 Waiting Admit"}, {"name": "si_code", "label": "Suicidality", "dataType": "string", "description": "Suicidality"}], "total": 166604}	\N	1	\N	\N	2022-08-22 21:15:43.732+00	2022-11-15 16:52:46.592+00
15	Suicidality by Month v3	Suicide attempt codes aggregated	manually	2022-08-02 20:27:40.988+00	{"fields": {"labs": [], "diagnoses": [], "phenotypes": [], "procedures": [], "medications": [], "demographics": [{"name": "age", "label": "Age", "description": "Short description of the field"}, {"name": "race", "label": "Race", "description": "Short description of the field"}, {"name": "gender", "label": "Gender", "description": "Short description of the field"}], "immunizations": []}, "dataSites": [{"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}]}	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Cnt"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Enct month"}, {"name": "admission", "label": "Admission", "dataType": "string", "description": "Admission"}, {"name": "ideation", "label": "Ideation", "dataType": "string", "description": "Ideation"}, {"name": "waiting", "label": "Waiting", "dataType": "string", "description": "Waiting"}, {"name": "age_at_visit", "label": "Age At Visit", "dataType": "integer", "description": "Age at visit"}, {"name": "race", "label": "Race", "dataType": "string", "description": "Race"}, {"name": "gender", "label": "Gender", "dataType": "string", "description": "Gender"}], "total": 165527}	\N	1	\N	\N	2022-08-02 20:08:00.112+00	2022-11-15 16:53:40.409+00
49	CDC NLP Symptoms	Aggregated by month	manually	2022-11-15 17:46:06.646+00	{"fields": {"labs": [{"name": "COVID PCR", "description": ""}], "diagnoses": [{"name": "COVID", "description": ""}, {"name": "Flu", "description": ""}, {"name": "Common Dx", "description": ""}], "phenotypes": [{"name": "Symptom Text", "description": ""}], "procedures": [], "medications": [], "demographics": [], "immunizations": []}, "dataSites": [{"id": 1, "lat": null, "long": null, "name": "Boston Children''s Hospital", "createdAt": "2022-06-06T20:59:06.214Z", "updatedAt": "2022-06-06T20:59:06.214Z", "description": "Short description of the Boston Children''s Hospital data site"}]}	{"cols": [{"name": "cnt", "label": "Cnt", "dataType": "integer", "description": "Count"}, {"name": "enct_month", "label": "Enct Month", "dataType": "date:YYYY-MM", "description": "Encounter month"}, {"name": "admission", "label": "Admission", "dataType": "string", "description": "Admission"}, {"name": "pcr_result", "label": "Pcr Result", "dataType": "string", "description": "COVID PCR result"}, {"name": "covid_dx", "label": "Covid Dx", "dataType": "string", "description": "Covid dx"}, {"name": "flu_dx", "label": "Flu Dx", "dataType": "string", "description": "Flu dx"}, {"name": "common_dx", "label": "Common Dx", "dataType": "string", "description": "Common dx"}, {"name": "symptom_text", "label": "Symptom Text", "dataType": "string", "description": "Symptom text"}], "total": 165527}	\N	2	\N	\N	2022-11-15 17:45:16.972+00	2022-11-15 17:46:06.647+00
\.


--
-- TOC entry 3399 (class 0 OID 16686)
-- Dependencies: 210
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, email, name, password, role, sid, "lastLogin", "activationCode", "invitedBy", "createdAt", "updatedAt") FROM stdin;
1	user@cumulus.dev	Normal user	$2a$10$.mu1KOyu.yViLCzBAYQ2yeI9jait4Dv.Ioih.S3KcCyi3ktD2/mcm	user	\N	\N	\N	\N	2023-04-16 19:10:22.58+00	2023-04-16 19:10:22.58+00
2	manager@cumulus.dev	Manager	$2a$10$CvD.r2QXn3RkOGkKBSHS5OvQrCuraGJIWToZTnCkB4yBZX//JSuIO	manager	\N	\N	\N	\N	2023-04-16 19:10:22.58+00	2023-04-16 19:10:22.58+00
3	admin@cumulus.dev	Admin	$2a$10$JCqZjkhhVh/nmRjsfvDh4.K7ynkhYiDB.Tde9SyimeY0DeV7fwD/y	admin	\N	\N	\N	\N	2023-04-16 19:10:22.58+00	2023-04-16 19:10:22.58+00
4	admin2@cumulus.dev	Admin2	$2a$10$JCqZjkhhVh/nmRjsfvDh4.K7ynkhYiDB.Tde9SyimeY0DeV7fwD/y	admin	\N	\N	\N	\N	2023-04-16 19:10:22.58+00	2023-04-16 19:10:22.58+00
\.


--
-- TOC entry 3401 (class 0 OID 16700)
-- Dependencies: 212
-- Data for Name: Tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tags" (id, name, description, "createdAt", "updatedAt", "creatorId") FROM stdin;
1	COVID-19	Some description for the COVID-19 tag	2023-04-16 19:10:22.827+00	2023-04-16 19:10:22.827+00	1
2	Influenza	Short description for the Influenza tag	2023-04-16 19:10:22.827+00	2023-04-16 19:10:22.827+00	1
3	Suicidal Study	Some description for the Suicidal Study tag	2023-04-16 19:10:22.827+00	2023-04-16 19:10:22.827+00	\N
4	Quality Measures	Some description for the Quality Measures tag	2023-04-16 19:10:22.827+00	2023-04-16 19:10:22.827+00	2
\.


--
-- TOC entry 3416 (class 0 OID 16810)
-- Dependencies: 227
-- Data for Name: DataRequestsTags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DataRequestsTags" ("DataRequestId", "TagId") FROM stdin;
1	1
2	1
2	3
4	3
5	3
5	2
3	3
\.


--
-- TOC entry 3405 (class 0 OID 16721)
-- Dependencies: 216
-- Data for Name: DataSites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DataSites" (id, name, description, lat, long, "createdAt", "updatedAt") FROM stdin;
1	Boston Children's Hospital	Short description of the Boston Children's Hospital data site	\N	\N	2023-04-16 19:10:22.812+00	2023-04-16 19:10:22.812+00
2	Beth Israel Deaconess Medical Center	MIMIC (Medical Information Mart for Intensive Care)	\N	\N	2023-04-16 19:10:22.812+00	2023-04-16 19:10:22.812+00
3	RUSH	Short description of the RUSH data site	\N	\N	2023-04-16 19:10:22.812+00	2023-04-16 19:10:22.812+00
\.


--
-- TOC entry 3411 (class 0 OID 16758)
-- Dependencies: 222
-- Data for Name: Projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Projects" (id, name, description, "creatorId", "createdAt", "updatedAt") FROM stdin;
1	Understanding COVID-19	This project focuses on COVID-19 and its impact. We analyze patterns of illness, including the number of patients with and without COVID-19, testing patterns and results, and associated signs and symptoms, before and during various phases of the COVID-19 pandemic.	1	2023-04-16 19:10:22.815+00	2023-04-16 19:10:22.815+00
2	Quantifying Behavioral Health Issues	This project explores how data from the SMART/HL7 Bulk FHIR API can be used to model and anticipate hospital volumes and capacity, in particular how we can quantify the impact of COVID-19 on behavioral health-related visits and length of stay.	1	2023-04-16 19:10:22.815+00	2023-04-16 19:10:22.815+00
3	Simplifying CMS Quality Measures	With respect to quality of care, we model CMS quality measures, including for diabetes care and management of hypertension.	1	2023-04-16 19:10:22.815+00	2023-04-16 19:10:22.815+00
\.


--
-- TOC entry 3414 (class 0 OID 16780)
-- Dependencies: 225
-- Data for Name: ProjectsSubscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectsSubscriptions" ("ProjectId", "DataRequestId") FROM stdin;
\.


--
-- TOC entry 3413 (class 0 OID 16767)
-- Dependencies: 224
-- Data for Name: Views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Views" (id, name, description, "screenShot", settings, "DataRequestId", "createdAt", "updatedAt") FROM stdin;
1	Demo - Timeline Graph		\N	{}	1	2022-06-06 21:06:06.518+00	2022-11-15 16:27:59.598+00
\.


--
-- TOC entry 3415 (class 0 OID 16795)
-- Dependencies: 226
-- Data for Name: ViewsTags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ViewsTags" ("ViewId", "TagId") FROM stdin;
1	1
1	3
1	2
\.


--
-- TOC entry 3422 (class 0 OID 0)
-- Dependencies: 213
-- Name: Activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Activities_id_seq"', 1, false);


--
-- TOC entry 3423 (class 0 OID 0)
-- Dependencies: 219
-- Name: DataRequests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."DataRequests_id_seq"', 49, true);


--
-- TOC entry 3424 (class 0 OID 0)
-- Dependencies: 215
-- Name: DataSites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."DataSites_id_seq"', 3, true);


--
-- TOC entry 3425 (class 0 OID 0)
-- Dependencies: 221
-- Name: Projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Projects_id_seq"', 3, true);


--
-- TOC entry 3426 (class 0 OID 0)
-- Dependencies: 217
-- Name: RequestGroups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."RequestGroups_id_seq"', 2, true);


--
-- TOC entry 3427 (class 0 OID 0)
-- Dependencies: 211
-- Name: Tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Tags_id_seq"', 4, true);


--
-- TOC entry 3428 (class 0 OID 0)
-- Dependencies: 209
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 3, true);


--
-- TOC entry 3429 (class 0 OID 0)
-- Dependencies: 223
-- Name: Views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Views_id_seq"', 1, true);


-- Completed on 2023-04-16 13:52:23 PDT

--
-- PostgreSQL database dump complete
--

