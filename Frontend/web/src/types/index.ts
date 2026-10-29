export type UserRole = 'SuperAdmin' | 'Admin' | 'HR' | 'Manager' | 'Employee';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  total_employees: number;
  active_leaves: number;
  total_departments: number;
  total_projects: number;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  code: string;
  manager_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalDetail {
  id?: number;
  employee_id?: number;
  date_of_birth?: string;
  gender: string;
  marital_status: string;
  blood_group: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ProfessionalDetail {
  id?: number;
  employee_id?: number;
  employment_type: 'FullTime' | 'PartTime' | 'Contractor' | 'Intern';
  work_mode: 'Remote' | 'Hybrid' | 'Onsite';
  total_experience_years: number;
  previous_employer?: string;
  skills?: string;
}

export interface EmergencyContact {
  id?: number;
  employee_id?: number;
  contact_name: string;
  relationship: string;
  phone: string;
  alternate_phone?: string;
}

export interface Employee {
  id: number;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  designation: string;
  department_id: number;
  department_name?: string;
  manager_id?: number | null;
  employee_code: string;
  office_location: string;
  date_of_joining: string;
  status: 'Active' | 'Probation' | 'OnLeave' | 'Suspended' | 'Resigned' | 'Terminated';
  personal_detail?: PersonalDetail;
  emergency_contact?: EmergencyContact;
  professional_detail?: ProfessionalDetail;
  middle_name?: string;
  personal_email?: string;
  alternate_phone?: string;
  job_title?: string;
  work_location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmployeePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  designation: string;
  department_id: number;
  manager_id?: number | null;
  employee_code: string;
  office_location: string;
  date_of_joining: string;
  status: string;
  create_user_account: boolean;
  initial_password?: string;
  role?: UserRole;
  gender?: string;
  marital_status?: string;
  blood_group?: string;
  city?: string;
  country?: string;
  employment_type?: string;
  work_mode?: string;
  total_experience_years?: number;
  skills?: string;
}

export interface LeaveType {
  id: number;
  name: string;
  default_days: number;
  description?: string;
}

export interface LeaveBalance {
  leave_type_id: number;
  type_name: string;
  total_days: number;
  used_days: number;
  balance_days: number;
}

export interface Leave {
  id: number;
  employee_id: number;
  employee_name?: string;
  leave_type_id: number;
  leave_type_name?: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  applied_at: string;
  reviewed_at?: string;
  reviewed_by_id?: string;
  rejection_reason?: string;
}

export interface ApplyLeavePayload {
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
}

export interface PagePermission {
  page: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export type PermissionsMap = Record<string, PagePermission>;

export interface RoleRecord {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermissionsMatrix {
  role: RoleRecord;
  permissions: Record<string, PagePermission>;
}

export type AttendanceStatus = 'Present' | 'Late' | 'HalfDay' | 'Absent' | 'OnLeave' | 'Weekend';
export type WorkMode = 'Office' | 'Remote' | 'Field';

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  date: string;
  clock_in: string;
  clock_out?: string | null;
  total_minutes: number;
  status: AttendanceStatus;
  work_mode: WorkMode;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceToday {
  attendance?: AttendanceRecord;
  is_clocked_in: boolean;
  active_seconds: number;
  today_date: string;
  can_punch: boolean;
}

export interface HeatmapCell {
  date: string;
  total_hours: number;
  level: number; // 0 to 4
  status: AttendanceStatus | string;
  clock_in?: string;
  clock_out?: string;
  work_mode?: string;
}

export interface AttendanceSummary {
  attendance_rate: number;
  avg_daily_hours: number;
  on_time_arrival_rate: number;
  total_work_days: number;
  total_present_days: number;
  total_late_days: number;
  total_leave_days: number;
  total_hours: number;
  total_overtime_hours: number;
  daily_trends: HeatmapCell[];
}

export interface OrgAttendanceOverview {
  total_employees: number;
  present_count: number;
  late_count: number;
  on_leave_count: number;
  absent_count: number;
}


// ---------------------------------------------------------------------------
// Employee onboarding (drafts & multi-step wizard)
// ---------------------------------------------------------------------------

export type DraftSection =
  | 'personal'
  | 'employment'
  | 'compensation'
  | 'schedule'
  | 'documents'
  | 'devices';

export type DraftStatus = 'Draft' | 'ReadyForReview' | 'PendingApproval' | 'Converted' | 'Discarded';

export interface DraftPersonalSection {
  first_name: string;
  middle_name?: string;
  last_name: string;
  profile_photo_url?: string;
  date_of_birth?: string;
  personal_email: string;
  phone_number: string;
  alternate_phone?: string;
  current_address: string;
  permanent_address: string;
  emergency_contact_name: string;
  emergency_relationship: string;
  emergency_phone: string;
}

export interface DraftEmploymentSection {
  employee_code?: string;
  department_id: number;
  designation: string;
  job_title?: string;
  manager_id?: number | null;
  secondary_approver_id?: number | null;
  employment_type: string;
  work_location?: string;
  work_mode: string;
  date_of_joining: string;
  probation_months: number;
  probation_end_date?: string;
  contract_end_date?: string;
  employment_status: string;
  work_email?: string;
  roles: string[];
}

export interface DraftCompensationSection {
  annual_ctc: number;
  currency: string;
  salary_structure: string;
  basic_salary: number;
  hra: number;
  conveyance: number;
  medical_allowance: number;
  special_allowance: number;
  variable_pay: number;
  employer_pf: number;
  employee_pf: number;
  professional_tax: number;
  tds: number;
  hourly_rate: number;
  pay_frequency: string;
  effective_date: string;
  payroll_id?: string;
  statutory_info?: string;
}

export interface DraftLeaveAllocation {
  leave_type_id: number;
  days: number;
  effective_from?: string;
}

export interface DraftScheduleSection {
  leave_policy?: string;
  allocations: DraftLeaveAllocation[];
  work_schedule_id?: number;
  working_days?: string;
  weekly_off_days?: string;
  shift_start?: string;
  shift_end?: string;
  expected_hours: number;
  attendance_policy?: string;
  holiday_calendar?: string;
}

export interface DraftDocument {
  document_type_code: string;
  file_name: string;
  file_size: number;
  mime_type?: string;
  storage_key?: string;
  verification_status?: string;
  uploaded_at?: string;
  uploaded_by?: string;
  expiry_date?: string;
  notes?: string;
  rejection_reason?: string;
}

export interface DraftAssetAssignment {
  asset_tag: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  issue_date?: string;
  condition?: string;
  accessories?: string;
  software_licenses?: string;
  acknowledgement: boolean;
  notes?: string;
}

export interface DraftAccountAccess {
  work_email?: string;
  provisioning_status?: string;
  roles: string[];
  app_access: string[];
  checklist: string[];
}

export interface DraftDevicesSection {
  assets: DraftAssetAssignment[];
  account: DraftAccountAccess;
}

export interface EmployeeDraftPayload {
  personal: DraftPersonalSection;
  employment: DraftEmploymentSection;
  compensation?: DraftCompensationSection;
  schedule: DraftScheduleSection;
  documents: DraftDocument[];
  devices: DraftDevicesSection;
}

export interface EmployeeDraft {
  id: number;
  draft_ref: string;
  owner_user_id: string;
  owner_email: string;
  owner_name: string;
  status: DraftStatus;
  current_step: number;
  version: number;
  display_name: string;
  employee_code?: string;
  payload: EmployeeDraftPayload;
  completed_sections: string[];
  submitted_employee_id?: number;
  last_saved_at: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeDraftSummary {
  id: number;
  draft_ref: string;
  display_name: string;
  employee_code?: string;
  status: DraftStatus;
  current_step: number;
  completed_sections: string[];
  owner_email: string;
  owner_name: string;
  owner_user_id: string;
  last_saved_at: string;
  created_at: string;
}

export interface EmployeeDraftPermissions {
  can_update: boolean;
  can_delete: boolean;
  can_submit: boolean;
  compensation_view: boolean;
  compensation_edit: boolean;
  documents_view: boolean;
  documents_upload: boolean;
  documents_verify: boolean;
  assets_view: boolean;
  assets_assign: boolean;
  access_view: boolean;
  access_manage: boolean;
  history_view: boolean;
  is_owner: boolean;
}

export interface DraftValidationIssue {
  section: string;
  field: string;
  message: string;
}

export interface DraftValidation {
  can_submit: boolean;
  issues: DraftValidationIssue[];
  warnings: string[];
  completed_sections: string[];
  missing_sections: string[];
}

export interface EmployeeDraftResponse {
  draft: EmployeeDraft;
  permissions: EmployeeDraftPermissions;
  validation?: DraftValidation;
}

export interface DraftListResult {
  items: EmployeeDraftSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface OnboardingDocumentType {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_required: boolean;
  allowed_extensions: string;
  max_size_bytes: number;
  sort_order: number;
}

export interface WorkScheduleOption {
  id: number;
  name: string;
  work_days: string;
  weekly_off_days: string;
  expected_hours: number;
  shift_start?: string;
  shift_end?: string;
  attendance_policy?: string;
}

export interface OnboardingReferenceData {
  document_types: OnboardingDocumentType[];
  work_schedules: WorkScheduleOption[];
  leave_policies: { id: number; name: string; description?: string }[];
  leave_types: LeaveType[];
  roles: string[];
  assets: {
    id: number;
    asset_tag: string;
    category: string;
    manufacturer?: string;
    model?: string;
    serial_number?: string;
    condition: string;
    status: string;
    assigned_to_name?: string;
  }[];
  employment_types: string[];
  work_modes: string[];
  employment_statuses: string[];
}

export interface DraftSubmitResult {
  employee_id: number;
  employee_code: string;
  draft_id: number;
  account_provisioned: boolean;
  temporary_password?: string;
}

export interface EmployeeAuditLog {
  id: number;
  employee_id?: number;
  draft_id?: number;
  actor_email: string;
  actor_role: string;
  action: string;
  section?: string;
  summary: string;
  created_at: string;
}

export interface EmployeeDocumentRecord {
  id: number;
  document_type: string;
  document_type_name?: string;
  file_name: string;
  file_size: number;
  verification_status: string;
  verified_by?: string;
  verified_at?: string;
  expiry_date?: string;
  notes?: string;
  rejection_reason?: string;
  uploaded_at: string;
}

export interface EmployeeAssetAssignmentRecord {
  id: number;
  asset_tag: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  assigned_at: string;
  returned_at?: string;
  acknowledgement: boolean;
  notes?: string;
}

export interface EmployeeLeaveAllocationRecord {
  id: number;
  leave_type_id: number;
  leave_type_name: string;
  policy_name?: string;
  allocated_days: number;
  used_days: number;
  effective_from: string;
}

export interface EmployeeAccessInfo {
  work_email: string;
  role: string;
  is_active: boolean;
  provisioning_status: string;
  account_created_at?: string;
}

export interface EmployeeExtras {
  documents?: EmployeeDocumentRecord[];
  assets?: EmployeeAssetAssignmentRecord[];
  leave_allocations?: EmployeeLeaveAllocationRecord[];
  access?: EmployeeAccessInfo;
  history?: EmployeeAuditLog[];
}

export interface SalaryRecord {
  id: number;
  employee_id: number;
  basic_salary: number;
  hra: number;
  conveyance: number;
  medical_allowance: number;
  special_allowance: number;
  provident_fund: number;
  professional_tax: number;
  tds: number;
  gross_salary: number;
  net_salary: number;
  effective_date: string;
}
