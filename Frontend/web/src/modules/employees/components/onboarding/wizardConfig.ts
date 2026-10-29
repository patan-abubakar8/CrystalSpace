import type { DraftSection, EmployeeDraftPayload } from '../../../../types';

export interface WizardStepConfig {
  step: number;
  section: DraftSection | 'review';
  title: string;
  description: string;
  optional?: boolean;
}

export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    step: 1,
    section: 'personal',
    title: 'Personal Details',
    description: 'Identity, contact information and emergency contact.',
  },
  {
    step: 2,
    section: 'employment',
    title: 'Employment Details',
    description: 'Department, designation, reporting line and application roles.',
  },
  {
    step: 3,
    section: 'compensation',
    title: 'Compensation & Payroll',
    description: 'Salary structure, statutory components and payroll reference.',
  },
  {
    step: 4,
    section: 'schedule',
    title: 'Leave & Work Schedule',
    description: 'Leave policy, allocations, working days and shift.',
  },
  {
    step: 5,
    section: 'documents',
    title: 'Documents & Verification',
    description: 'Upload required and optional supporting documents.',
  },
  {
    step: 6,
    section: 'devices',
    title: 'Devices & Access',
    description: 'Asset assignment, acknowledgement and account provisioning.',
  },
  {
    step: 7,
    section: 'review',
    title: 'Review & Submit',
    description: 'Check every section, then create the employee record.',
  },
];

export const SECTION_LABELS: Record<string, string> = {
  personal: 'Personal Details',
  employment: 'Employment Details',
  compensation: 'Compensation & Payroll',
  schedule: 'Leave & Work Schedule',
  documents: 'Documents & Verification',
  devices: 'Devices & Access',
  review: 'Review & Submit',
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const emptyDraftPayload = (): EmployeeDraftPayload => ({
  personal: {
    first_name: '',
    middle_name: '',
    last_name: '',
    profile_photo_url: '',
    date_of_birth: '',
    personal_email: '',
    phone_number: '',
    alternate_phone: '',
    current_address: '',
    permanent_address: '',
    emergency_contact_name: '',
    emergency_relationship: '',
    emergency_phone: '',
  },
  employment: {
    employee_code: '',
    department_id: 0,
    designation: '',
    job_title: '',
    manager_id: null,
    secondary_approver_id: null,
    employment_type: 'FullTime',
    work_location: '',
    work_mode: 'Onsite',
    date_of_joining: todayISO(),
    probation_months: 3,
    probation_end_date: '',
    contract_end_date: '',
    employment_status: 'Probation',
    work_email: '',
    roles: [],
  },
  compensation: undefined,
  schedule: {
    leave_policy: '',
    allocations: [],
    work_schedule_id: 0,
    working_days: '',
    weekly_off_days: '',
    shift_start: '',
    shift_end: '',
    expected_hours: 8,
    attendance_policy: '',
    holiday_calendar: '',
  },
  documents: [],
  devices: {
    assets: [],
    account: { work_email: '', provisioning_status: 'Pending', roles: [], app_access: [], checklist: [] },
  },
});

/** Merge a server payload with local defaults so the wizard never reads undefined. */
export const normalisePayload = (raw?: Partial<EmployeeDraftPayload> | null): EmployeeDraftPayload => {
  const base = emptyDraftPayload();
  if (!raw) return base;
  return {
    personal: { ...base.personal, ...(raw.personal ?? {}) },
    employment: { ...base.employment, ...(raw.employment ?? {}) },
    compensation: raw.compensation ? { ...(raw.compensation as NonNullable<EmployeeDraftPayload['compensation']>) } : undefined,
    schedule: { ...base.schedule, ...(raw.schedule ?? {}), allocations: raw.schedule?.allocations ?? [] },
    documents: raw.documents ?? [],
    devices: {
      assets: raw.devices?.assets ?? [],
      account: { ...base.devices.account, ...(raw.devices?.account ?? {}) },
    },
  };
};
