import type {
  DraftSection,
  EmployeeDraftPayload,
  EmployeeDraftPermissions,
  OnboardingReferenceData,
} from '../../../../types';
import type { FieldErrors } from './stepProps';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const digits = (v: string) => v.replace(/\D/g, '');
const phoneOk = (v: string) => digits(v).length >= 7 && digits(v).length <= 15;
const dateOk = (v: string) => v !== '' && !Number.isNaN(new Date(`${v}T00:00:00`).getTime());

export const validateStep = (
  section: DraftSection,
  payload: EmployeeDraftPayload,
  permissions: EmployeeDraftPermissions,
  reference: OnboardingReferenceData
): FieldErrors => {
  const errors: FieldErrors = {};

  if (section === 'personal') {
    const p = payload.personal;
    if (!p.first_name.trim()) errors.first_name = 'First name is required';
    if (!p.last_name.trim()) errors.last_name = 'Last name is required';
    if (!EMAIL.test(p.personal_email.trim())) errors.personal_email = 'Enter a valid personal email';
    if (!phoneOk(p.phone_number)) errors.phone_number = 'Enter a valid phone number';
    if (p.alternate_phone && !phoneOk(p.alternate_phone))
      errors.alternate_phone = 'Enter a valid alternate phone';
    if (!p.current_address.trim()) errors.current_address = 'Current address is required';
    if (!p.permanent_address.trim()) errors.permanent_address = 'Permanent address is required';
    if (!p.emergency_contact_name.trim())
      errors.emergency_contact_name = 'Emergency contact name is required';
    if (!p.emergency_relationship.trim())
      errors.emergency_relationship = 'Relationship is required';
    if (!phoneOk(p.emergency_phone)) errors.emergency_phone = 'Enter a valid contact phone';
    if (p.date_of_birth && !dateOk(p.date_of_birth)) errors.date_of_birth = 'Enter a valid date';
    if (p.date_of_birth && new Date(p.date_of_birth) > new Date(Date.now() - 16 * 365.25 * 864e5))
      errors.date_of_birth = 'Employee must be at least 16 years old';
  }

  if (section === 'employment') {
    const e = payload.employment;
    if (!e.department_id) errors.department_id = 'Select a department';
    if (!e.designation.trim()) errors.designation = 'Designation is required';
    if (!dateOk(e.date_of_joining)) errors.date_of_joining = 'Joining date is required';
    if (!e.employment_type) errors.employment_type = 'Select an employment type';
    if (!e.work_mode) errors.work_mode = 'Select a work mode';
    if (!e.employment_status) errors.employment_status = 'Select an employment status';
    if (e.work_email && !EMAIL.test(e.work_email)) errors.work_email = 'Enter a valid work email';
    if (
      e.manager_id &&
      e.secondary_approver_id &&
      e.manager_id === e.secondary_approver_id
    )
      errors.secondary_approver_id = 'Manager and secondary approver must differ';
    if (
      (e.employment_type === 'Contract' || e.employment_type === 'Intern') &&
      e.contract_end_date &&
      dateOk(e.contract_end_date) &&
      dateOk(e.date_of_joining) &&
      new Date(e.contract_end_date) < new Date(e.date_of_joining)
    )
      errors.contract_end_date = 'Contract end cannot be before the joining date';
  }

  if (section === 'compensation' && permissions.compensation_view && permissions.compensation_edit) {
    const c = payload.compensation;
    if (c) {
      if (c.basic_salary <= 0) errors.basic_salary = 'Basic salary is required';
      const gross =
        c.basic_salary + c.hra + c.conveyance + c.medical_allowance + c.special_allowance;
      if (c.annual_ctc > 0 && gross > c.annual_ctc)
        errors.annual_ctc = 'Component total exceeds the annual CTC';
      if (c.employee_pf > gross) errors.employee_pf = 'Employee PF cannot exceed gross salary';
      if (c.effective_date && !dateOk(c.effective_date))
        errors.effective_date = 'Enter a valid effective date';
    }
  }

  if (section === 'schedule') {
    const s = payload.schedule;
    if (!s.work_schedule_id && !s.working_days?.trim())
      errors.work_schedule_id = 'Select a work schedule';
    if (s.expected_hours <= 0 || s.expected_hours > 24)
      errors.expected_hours = 'Expected hours must be between 0 and 24';
    if (s.allocations.some((a) => a.leave_type_id <= 0))
      errors.allocations = 'Every allocation needs a leave type';
  }

  if (section === 'documents') {
    const missing = reference.document_types.filter(
      (t) => t.is_required && !payload.documents.some((d) => d.document_type_code === t.code && d.file_name)
    );
    if (missing.length > 0)
      errors.documents = `Missing required documents: ${missing.map((t) => t.name).join(', ')}`;
  }

  if (section === 'devices') {
    const tags = payload.devices.assets.map((a) => a.asset_tag);
    if (new Set(tags).size !== tags.length) errors.asset_tag = 'Duplicate asset tags';
    const email = payload.devices.account.work_email;
    if (email && !EMAIL.test(email)) errors.work_email = 'Enter a valid account email';
  }

  return errors;
};

export const errorForField = (errors: FieldErrors, field: string): string | undefined =>
  errors[field];
