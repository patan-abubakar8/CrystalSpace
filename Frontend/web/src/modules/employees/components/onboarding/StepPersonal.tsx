import React from 'react';
import type { OnboardingStepProps } from './stepProps';
import { FieldGrid, FormField, GroupLabel, StepHeading } from './FormField';

export const StepPersonal: React.FC<OnboardingStepProps> = ({ payload, errors, patch }) => {
  const p = payload.personal;
  const sameAsCurrent =
    p.permanent_address.trim() !== '' && p.permanent_address.trim() === p.current_address.trim();

  const copyAddress = () => {
    if (sameAsCurrent) {
      patch('personal', { permanent_address: '' });
    } else {
      patch('personal', { permanent_address: p.current_address });
    }
  };

  return (
    <div>
      <StepHeading
        title="Personal Details"
        description="Collect only the personal information required for employment records."
      />

      <GroupLabel>Identity</GroupLabel>
      <FieldGrid columns={3}>
        <FormField label="First name" htmlFor="first_name" required error={errors.first_name}>
          <input
            id="first_name"
            className="form-control"
            value={p.first_name}
            onChange={(e) => patch('personal', { first_name: e.target.value })}
            autoComplete="given-name"
          />
        </FormField>
        <FormField label="Middle name" htmlFor="middle_name">
          <input
            id="middle_name"
            className="form-control"
            value={p.middle_name ?? ''}
            onChange={(e) => patch('personal', { middle_name: e.target.value })}
          />
        </FormField>
        <FormField label="Last name" htmlFor="last_name" required error={errors.last_name}>
          <input
            id="last_name"
            className="form-control"
            value={p.last_name}
            onChange={(e) => patch('personal', { last_name: e.target.value })}
            autoComplete="family-name"
          />
        </FormField>
      </FieldGrid>

      <FieldGrid columns={3}>
        <FormField label="Date of birth" htmlFor="date_of_birth" error={errors.date_of_birth}>
          <input
            id="date_of_birth"
            type="date"
            className="form-control"
            value={p.date_of_birth ?? ''}
            onChange={(e) => patch('personal', { date_of_birth: e.target.value })}
          />
        </FormField>
        <FormField
          label="Profile photo URL"
          htmlFor="profile_photo_url"
          hint="Optional link to an approved directory photo."
        >
          <input
            id="profile_photo_url"
            className="form-control"
            value={p.profile_photo_url ?? ''}
            onChange={(e) => patch('personal', { profile_photo_url: e.target.value })}
            placeholder="https://"
          />
        </FormField>
      </FieldGrid>

      <GroupLabel>Contact</GroupLabel>
      <FieldGrid columns={2}>
        <FormField label="Personal email" htmlFor="personal_email" required error={errors.personal_email}>
          <input
            id="personal_email"
            type="email"
            className="form-control"
            value={p.personal_email}
            onChange={(e) => patch('personal', { personal_email: e.target.value })}
            autoComplete="email"
          />
        </FormField>
        <FormField label="Phone number" htmlFor="phone_number" required error={errors.phone_number}>
          <input
            id="phone_number"
            className="form-control"
            value={p.phone_number}
            onChange={(e) => patch('personal', { phone_number: e.target.value })}
            autoComplete="tel"
          />
        </FormField>
        <FormField label="Alternate phone" htmlFor="alternate_phone" error={errors.alternate_phone}>
          <input
            id="alternate_phone"
            className="form-control"
            value={p.alternate_phone ?? ''}
            onChange={(e) => patch('personal', { alternate_phone: e.target.value })}
          />
        </FormField>
      </FieldGrid>

      <FieldGrid columns={2}>
        <FormField
          label="Current address"
          htmlFor="current_address"
          required
          error={errors.current_address}
          span={2}
        >
          <textarea
            id="current_address"
            className="form-control"
            rows={3}
            value={p.current_address}
            onChange={(e) => patch('personal', { current_address: e.target.value })}
          />
        </FormField>
      </FieldGrid>

      <FieldGrid columns={1}>
        <FormField label="Permanent address" htmlFor="permanent_address" required error={errors.permanent_address}>
          <textarea
            id="permanent_address"
            className="form-control"
            rows={3}
            value={p.permanent_address}
            onChange={(e) => patch('personal', { permanent_address: e.target.value })}
          />
        </FormField>
      </FieldGrid>

      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8125rem',
          marginBottom: '1.25rem',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={sameAsCurrent}
          onChange={copyAddress}
          style={{ accentColor: 'var(--color-accent-magenta)' }}
        />
        Permanent address is the same as the current address
      </label>

      <GroupLabel>Emergency contact</GroupLabel>
      <FieldGrid columns={3}>
        <FormField
          label="Contact name"
          htmlFor="emergency_contact_name"
          required
          error={errors.emergency_contact_name}
        >
          <input
            id="emergency_contact_name"
            className="form-control"
            value={p.emergency_contact_name}
            onChange={(e) => patch('personal', { emergency_contact_name: e.target.value })}
          />
        </FormField>
        <FormField
          label="Relationship"
          htmlFor="emergency_relationship"
          required
          error={errors.emergency_relationship}
        >
          <input
            id="emergency_relationship"
            className="form-control"
            value={p.emergency_relationship}
            onChange={(e) => patch('personal', { emergency_relationship: e.target.value })}
            placeholder="Spouse, parent, sibling…"
          />
        </FormField>
        <FormField
          label="Contact phone"
          htmlFor="emergency_phone"
          required
          error={errors.emergency_phone}
        >
          <input
            id="emergency_phone"
            className="form-control"
            value={p.emergency_phone}
            onChange={(e) => patch('personal', { emergency_phone: e.target.value })}
          />
        </FormField>
      </FieldGrid>
    </div>
  );
};
