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
  status: 'Active' | 'OnLeave' | 'Resigned' | 'Terminated';
  personal_detail?: PersonalDetail;
  professional_detail?: ProfessionalDetail;
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
