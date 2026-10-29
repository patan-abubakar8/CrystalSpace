import type {
  Department,
  Employee,
  EmployeeDraftPayload,
  EmployeeDraftPermissions,
  OnboardingReferenceData,
} from '../../../../types';

export interface OnboardingStepProps {
  payload: EmployeeDraftPayload;
  errors: Record<string, string>;
  reference: OnboardingReferenceData;
  permissions: EmployeeDraftPermissions;
  departments: Department[];
  employees: Employee[];
  patch: (section: 'personal' | 'employment' | 'schedule' | 'devices', patch: Record<string, unknown>) => void;
  setSection: <K extends keyof EmployeeDraftPayload>(
    section: K,
    value: EmployeeDraftPayload[K]
  ) => void;
}

export type FieldErrors = Record<string, string>;
