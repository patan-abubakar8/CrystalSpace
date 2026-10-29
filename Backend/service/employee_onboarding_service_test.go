package service

import (
	"context"
	"encoding/json"
	"strings"
	"testing"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
)

// ---------------------------------------------------------------------------
// Test doubles: embed the interface so only the used methods need implementing.
// ---------------------------------------------------------------------------

type stubDocTypesRepo struct {
	interfaces.EmployeeOnboardingRepository
	docTypes []*models.DocumentType
}

func (s *stubDocTypesRepo) ListDocumentTypes(context.Context) ([]*models.DocumentType, error) {
	return s.docTypes, nil
}

func (s *stubDocTypesRepo) EmployeeEmailTaken(context.Context, string, int) (bool, error) {
	return false, nil
}

func (s *stubDocTypesRepo) EmployeeCodeTaken(context.Context, string) (bool, error) {
	return false, nil
}

type stubPermRepo struct {
	interfaces.PermissionRepository
	grants map[string]bool
}

func (s *stubPermRepo) HasPermission(_ context.Context, _ string, page, action string) (bool, error) {
	return s.grants[page+"."+action], nil
}

func testDocTypes() []*models.DocumentType {
	return []*models.DocumentType{
		{Code: "resume", Name: "Resume", IsRequired: true, AllowedExtensions: "pdf,docx", MaxSizeBytes: 10 << 20},
		{Code: "id-proof", Name: "Identity Proof", IsRequired: true, AllowedExtensions: "pdf,jpg", MaxSizeBytes: 5 << 20},
		{Code: "offer-letter", Name: "Signed Offer Letter", IsRequired: true, AllowedExtensions: "pdf", MaxSizeBytes: 10 << 20},
		{Code: "form-16", Name: "Form 16", IsRequired: false, AllowedExtensions: "pdf", MaxSizeBytes: 10 << 20},
	}
}

func hrGrants() map[string]bool {
	return map[string]bool{
		"employees.view":                true,
		"employees.create":              true,
		"employees-drafts.create":       true,
		"employees-drafts.view":         true,
		"employees-drafts.update":       true,
		"employees-drafts.delete":       true,
		"employees-compensation.view":   true,
		"employees-compensation.update": true,
		"employees-documents.view":      true,
		"employees-documents.create":    true,
		"employees-documents.update":    true,
		"employees-assets.view":         true,
		"employees-assets.create":       true,
		"employees-access.view":         true,
		"employees-history.view":        true,
		"leaves.view":                   true,
	}
}

func newTestService(grants map[string]bool) interfaces.EmployeeOnboardingService {
	return NewEmployeeOnboardingService(
		&stubDocTypesRepo{docTypes: testDocTypes()},
		nil,
		&stubPermRepo{grants: grants},
		nil,
	)
}

func completePayload() *models.EmployeeDraftPayload {
	return &models.EmployeeDraftPayload{
		Personal: models.PersonalSection{
			FirstName:             "Asha",
			LastName:              "Menon",
			PersonalEmail:         "asha.menon@example.com",
			PhoneNumber:           "+91 98765 43210",
			CurrentAddress:        "12 Rose Street, Kochi",
			PermanentAddress:      "12 Rose Street, Kochi",
			EmergencyContactName:  "Ravi Menon",
			EmergencyRelationship: "Father",
			EmergencyPhone:        "+91 98765 00001",
			DateOfBirth:           "1994-04-12",
		},
		Employment: models.EmploymentSection{
			DepartmentID:     3,
			Designation:      "Backend Engineer",
			EmploymentType:   "FullTime",
			WorkMode:         "Hybrid",
			DateOfJoining:    "2026-03-02",
			EmploymentStatus: "Probation",
			WorkEmail:        "asha.menon@organize.com",
			Roles:            []string{"Employee"},
		},
		Compensation: &models.CompensationSection{
			AnnualCTC:     900000,
			Currency:      "INR",
			BasicSalary:   50000,
			HRA:           20000,
			EffectiveDate: "2026-03-02",
			PayFrequency:  "Monthly",
		},
		Schedule: models.ScheduleSection{
			WorkScheduleID: 1,
			ExpectedHours:  8,
			Allocations:    []models.LeaveAllocationInput{{LeaveTypeID: 1, Days: 12}},
		},
		Documents: []models.DraftDocument{
			{DocumentTypeCode: "resume", FileName: "asha-resume.pdf", FileSize: 1024},
			{DocumentTypeCode: "id-proof", FileName: "passport.jpg", FileSize: 2048},
			{DocumentTypeCode: "offer-letter", FileName: "offer.pdf", FileSize: 2048},
		},
	}
}

func validationFor(t *testing.T, svc interfaces.EmployeeOnboardingService, payload *models.EmployeeDraftPayload) *models.DraftValidation {
	t.Helper()
	// Common path: exercise the same validate() the API uses through a white-box call.
	s := svc.(*onboardingService)
	draft := &models.EmployeeDraft{ID: 1, OwnerUserID: "user-1", Version: 1}
	return s.validate(context.Background(), models.Actor{UserID: "user-1", Email: "hr@organize.com", Role: "HR"}, draft, payload, testDocTypes())
}

func TestValidateCompleteDraftCanBeSubmitted(t *testing.T) {
	svc := newTestService(hrGrants())
	result := validationFor(t, svc, completePayload())

	if !result.CanSubmit {
		t.Fatalf("expected draft to be submittable, issues: %+v missing: %v", result.Issues, result.MissingSections)
	}
	for _, section := range []string{"personal", "employment", "compensation", "schedule", "documents"} {
		found := false
		for _, c := range result.CompletedSections {
			if c == section {
				found = true
			}
		}
		if !found {
			t.Errorf("expected section %q to be marked complete, got %v", section, result.CompletedSections)
		}
	}
}

func TestValidateEmptyDraftIsRejected(t *testing.T) {
	svc := newTestService(hrGrants())
	result := validationFor(t, svc, &models.EmployeeDraftPayload{})

	if result.CanSubmit {
		t.Fatal("an empty draft must not be submittable")
	}
	fields := map[string]bool{}
	for _, issue := range result.Issues {
		fields[issue.Field] = true
	}
	for _, required := range []string{"first_name", "last_name", "personal_email", "phone_number", "department_id", "designation", "date_of_joining", "work_schedule_id", "resume"} {
		if !fields[required] {
			t.Errorf("expected a validation issue for %q", required)
		}
	}
	if len(result.MissingSections) == 0 {
		t.Error("expected missing sections to be reported")
	}
}

func TestRequiredDocumentEnforcement(t *testing.T) {
	svc := newTestService(hrGrants())
	payload := completePayload()
	payload.Documents = payload.Documents[:1] // keep only the resume

	result := validationFor(t, svc, payload)
	if result.CanSubmit {
		t.Fatal("draft without the required identity and offer letter documents must not submit")
	}
	joined := ""
	for _, issue := range result.Issues {
		joined += issue.Field + ":" + issue.Message + "\n"
	}
	for _, code := range []string{"id-proof", "offer-letter"} {
		if !strings.Contains(joined, code) {
			t.Errorf("expected a missing-document issue for %s, got:\n%s", code, joined)
		}
	}
}

func TestDocumentExtensionAndSizeRulesAreEnforced(t *testing.T) {
	svc := newTestService(hrGrants())
	payload := completePayload()
	payload.Documents = append(payload.Documents, models.DraftDocument{
		DocumentTypeCode: "offer-letter",
		FileName:         "offer.exe",
		FileSize:         20 << 20,
	})

	result := validationFor(t, svc, payload)
	if result.CanSubmit {
		t.Fatal("invalid extension/size must block submission")
	}
	messages := ""
	for _, issue := range result.Issues {
		messages += issue.Message + "\n"
	}
	if !strings.Contains(messages, "must be one of") {
		t.Errorf("expected an extension error, got:\n%s", messages)
	}
}

func TestInvalidEmailAndPhoneFormats(t *testing.T) {
	svc := newTestService(hrGrants())
	payload := completePayload()
	payload.Personal.PersonalEmail = "not-an-email"
	payload.Personal.PhoneNumber = "12"

	result := validationFor(t, svc, payload)
	if result.CanSubmit {
		t.Fatal("invalid contact details must block submission")
	}
	fields := map[string]bool{}
	for _, issue := range result.Issues {
		fields[issue.Field] = true
	}
	if !fields["personal_email"] || !fields["phone_number"] {
		t.Errorf("expected email and phone issues, got %+v", result.Issues)
	}
}

func TestCompensationIsOptionalForActorsWithoutAccess(t *testing.T) {
	grants := hrGrants()
	delete(grants, "employees-compensation.view")
	delete(grants, "employees-compensation.update")
	svc := newTestService(grants)

	payload := completePayload()
	payload.Compensation = nil
	result := validationFor(t, svc, payload)

	if !result.CanSubmit {
		t.Fatalf("compensation must not block submission for non-payroll roles, issues: %+v", result.Issues)
	}
	for _, section := range validationFor(t, svc, completePayload()).CompletedSections {
		if section == "compensation" {
			t.Error("compensation should not be reported as a completed section without access")
		}
	}
}

func TestMaskDraftHidesCompensationWithoutPermission(t *testing.T) {
	payload, _ := json.Marshal(completePayload())
	draft := &models.EmployeeDraft{Payload: payload}

	masked := maskDraft(draft, dto.EmployeeDraftPermissions{CompensationView: false})
	var body map[string]json.RawMessage
	if err := json.Unmarshal(masked.Payload, &body); err != nil {
		t.Fatalf("masked payload is not valid JSON: %v", err)
	}
	if _, ok := body["compensation"]; ok {
		t.Error("compensation must be stripped when the viewer lacks permission")
	}
	if _, ok := body["personal"]; !ok {
		t.Error("non-sensitive sections must be preserved")
	}

	visible := maskDraft(&models.EmployeeDraft{Payload: payload}, dto.EmployeeDraftPermissions{CompensationView: true})
	var body2 map[string]json.RawMessage
	_ = json.Unmarshal(visible.Payload, &body2)
	if _, ok := body2["compensation"]; !ok {
		t.Error("compensation must be returned to authorised viewers")
	}
}

func TestHelpers(t *testing.T) {
	if !isEmail("a.b@example.com") || isEmail("nope") || isEmail("") {
		t.Error("isEmail behaves incorrectly")
	}
	if !isPhone("+91 98765 43210") || isPhone("123") {
		t.Error("isPhone behaves incorrectly")
	}
	if fileExtension("Contract.PDF") != "pdf" {
		t.Error("fileExtension should be lowercase")
	}
	if !extensionAllowed(&models.DocumentType{AllowedExtensions: "pdf, jpg"}, "jpg") {
		t.Error("extensionAllowed should match comma-separated values")
	}
}
