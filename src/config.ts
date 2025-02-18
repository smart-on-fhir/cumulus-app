// NOTE: This file must have ts extension and not tsx! It contains some
// configuration variables which are shared between and imported by both tsx
// files from the bundle and ts CLI scripts from the bin folder.


// These are computed at runtime and will not be saved on the server
export const ReadOnlyPaths = [
    "exporting",
    "tooltip",
    "chart.type",
    "series.[].data",
    "series.[].color",
    "series.[].dataSorting",
    "chart.options3d.depth",
    "yAxis.allowDecimals",
    "yAxis.labels.format",
    "plotOptions.series.events",
    "plotOptions.series.dataSorting",
    "plotOptions.series.states.hover.opacity",
    "plotOptions.pie.dataLabels.formatter",
    "plotOptions.pie.dataLabels.useHTML",
    "plotOptions.areasplinerange.linkedTo",
    "plotOptions.areasplinerange.marker.enabled",
    "plotOptions.areasplinerange.marker.states.hover.enabled",
    "plotOptions.areasplinerange.states.hover.enabled",
    "plotOptions.errorbar.linkedTo",
    "plotOptions.line.dataSorting",
    "tooltip",
    "xAxis.type",
    "xAxis.crosshair",
    "lang",
    "noData"
];

export const FhirResourceTypes = [
    "Account", "ActivityDefinition", "AdverseEvent", "AllergyIntolerance", "Appointment", "AppointmentResponse", 
    "AuditEvent", "Basic", "Binary", "BiologicallyDerivedProduct", "BodyStructure", "Bundle", "CapabilityStatement", 
    "CarePlan", "CareTeam", "ChargeItem", "ChargeItemDefinition", "Claim", "ClaimResponse", "ClinicalImpression", 
    "CodeSystem", "Communication", "CommunicationRequest", "CompartmentDefinition", "Composition", "ConceptMap", 
    "Condition", "Consent", "Contract", "Coverage", "CoverageEligibilityRequest", "CoverageEligibilityResponse", 
    "DetectedIssue", "Device", "DeviceDefinition", "DeviceMetric", "DeviceRequest", "DeviceUseStatement", 
    "DiagnosticReport", "DocumentManifest", "DocumentReference", "DomainResource", "EffectEvidenceSynthesis", 
    "Encounter", "Endpoint", "EnrollmentRequest", "EnrollmentResponse", "EpisodeOfCare", "EventDefinition", 
    "Evidence", "EvidenceVariable", "ExampleScenario", "ExplanationOfBenefit", "FamilyMemberHistory", "Flag", 
    "Goal", "GraphDefinition", "Group", "GuidanceResponse", "HealthcareService", "ImagingStudy", "Immunization", 
    "ImmunizationEvaluation", "ImmunizationRecommendation", "ImplementationGuide", "InsurancePlan", 
    "Invoice", "Library", "Linkage", "List", "Location", "Measure", "MeasureReport", "Media", "Medication", 
    "MedicationAdministration", "MedicationDispense", "MedicationKnowledge", "MedicationRequest", 
    "MedicationStatement", "MedicinalProduct", "MedicinalProductAuthorization", "MedicinalProductContraindication", 
    "MedicinalProductIndication", "MedicinalProductIngredient", "MedicinalProductInteraction", 
    "MedicinalProductManufactured", "MedicinalProductPackaged", "MedicinalProductPharmaceutical", 
    "MedicinalProductUndesirableEffect", "MessageDefinition", "MessageHeader", "MolecularSequence", 
    "NamingSystem", "NutritionOrder", "Observation", "ObservationDefinition", "OperationDefinition", 
    "OperationOutcome", "Organization", "OrganizationAffiliation", "Parameters", "Patient", "PaymentNotice", 
    "PaymentReconciliation", "Person", "PlanDefinition", "Practitioner", "PractitionerRole", "Procedure", 
    "Provenance", "Questionnaire", "QuestionnaireResponse", "RelatedPerson", "RequestGroup", "ResearchDefinition", 
    "ResearchElementDefinition", "ResearchStudy", "ResearchSubject", "Resource", "RiskAssessment", "Schedule", 
    "SearchParameter", "ServiceRequest", "Slot", "Specimen", "SpecimenDefinition", "StructureDefinition", 
    "StructureMap", "Subscription", "Substance", "SubstanceNucleicAcid", "SubstancePolymer", "SubstanceProtein", 
    "SubstanceReferenceInformation", "SubstanceSourceMaterial", "SubstanceSpecification", "SupplyDelivery", 
    "SupplyRequest", "Task", "TerminologyCapabilities", "TestReport", "TestScript", "ValueSet", "VerificationResult", 
    "VisionPrescription"
];
