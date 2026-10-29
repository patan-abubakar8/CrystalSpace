import React, { useState } from 'react';
import type { DraftAssetAssignment } from '../../../../types';
import type { OnboardingStepProps } from './stepProps';
import { FieldGrid, FormField, GroupLabel, StepHeading } from './FormField';

const APP_ACCESS_OPTIONS = [
  'Email',
  'Chats',
  'Documents',
  'Attendance',
  'Payroll',
  'Projects',
  'Analytics',
];

const CHECKLIST_OPTIONS = [
  'Work email created',
  'Laptop imaged and enrolled',
  'VPN and repository access',
  'Building access card issued',
  'Welcome pack shared',
];

export const StepDevices: React.FC<OnboardingStepProps> = ({
  payload,
  errors,
  reference,
  permissions,
  patch,
}) => {
  const devices = payload.devices;
  const [draft, setDraft] = useState<DraftAssetAssignment>({
    asset_tag: '',
    category: 'Laptop',
    manufacturer: '',
    model: '',
    serial_number: '',
    issue_date: '',
    condition: 'Good',
    accessories: '',
    software_licenses: '',
    acknowledgement: false,
    notes: '',
  });
  const [assetError, setAssetError] = useState('');

  const availableAssets = reference.assets.filter((a) => a.status === 'Available');
  const unavailable = reference.assets.filter((a) => a.status !== 'Available');

  const addAsset = () => {
    setAssetError('');
    if (!draft.asset_tag.trim()) {
      setAssetError('Asset tag is required');
      return;
    }
    if (devices.assets.some((a) => a.asset_tag === draft.asset_tag.trim())) {
      setAssetError('This asset is already listed');
      return;
    }
    if (unavailable.some((a) => a.asset_tag === draft.asset_tag.trim())) {
      setAssetError('That asset is currently assigned to another employee');
      return;
    }
    patch('devices', {
      assets: [...devices.assets, { ...draft, asset_tag: draft.asset_tag.trim() }],
    });
    setDraft({
      asset_tag: '',
      category: 'Laptop',
      manufacturer: '',
      model: '',
      serial_number: '',
      issue_date: '',
      condition: 'Good',
      accessories: '',
      software_licenses: '',
      acknowledgement: false,
      notes: '',
    });
  };

  const pickExisting = (tag: string) => {
    const asset = reference.assets.find((a) => a.asset_tag === tag);
    if (!asset) {
      setDraft((d) => ({ ...d, asset_tag: tag }));
      return;
    }
    setDraft((d) => ({
      ...d,
      asset_tag: asset.asset_tag,
      category: asset.category,
      manufacturer: asset.manufacturer ?? '',
      model: asset.model ?? '',
      serial_number: asset.serial_number ?? '',
      condition: asset.condition || 'Good',
    }));
  };

  const setAccount = (patchAccount: Record<string, unknown>) =>
    patch('devices', { account: { ...devices.account, ...patchAccount } });

  const toggleArray = (key: 'roles' | 'app_access' | 'checklist', value: string) => {
    const list = devices.account[key];
    setAccount({
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    });
  };

  return (
    <div>
      <StepHeading
        title="Devices & Access"
        description="Assets are inventoried separately and can only be assigned to one employee at a time."
      />

      <GroupLabel>Asset assignment</GroupLabel>
      {!permissions.assets_assign && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          You can review device assignments but not change them.
        </p>
      )}

      {errors.asset_tag && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: '0.5rem' }}>
          {errors.asset_tag}
        </p>
      )}

      <FieldGrid columns={4}>
        <FormField label="Asset tag" htmlFor="asset_tag" error={assetError} hint="Choose an available asset or type a new tag.">
          <input
            id="asset_tag"
            className="form-control"
            list="available-assets"
            disabled={!permissions.assets_assign}
            value={draft.asset_tag}
            onChange={(e) => pickExisting(e.target.value)}
          />
          <datalist id="available-assets">
            {availableAssets.map((a) => (
              <option key={a.id} value={a.asset_tag}>
                {a.category} · {a.manufacturer} {a.model}
              </option>
            ))}
          </datalist>
        </FormField>
        <FormField label="Category" htmlFor="asset_category">
          <select
            id="asset_category"
            className="form-control"
            disabled={!permissions.assets_assign}
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          >
            {['Laptop', 'Desktop', 'Monitor', 'Phone', 'Tablet', 'Accessory', 'Other'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Manufacturer" htmlFor="asset_manufacturer">
          <input
            id="asset_manufacturer"
            className="form-control"
            disabled={!permissions.assets_assign}
            value={draft.manufacturer}
            onChange={(e) => setDraft({ ...draft, manufacturer: e.target.value })}
          />
        </FormField>
        <FormField label="Model" htmlFor="asset_model">
          <input
            id="asset_model"
            className="form-control"
            disabled={!permissions.assets_assign}
            value={draft.model}
            onChange={(e) => setDraft({ ...draft, model: e.target.value })}
          />
        </FormField>
      </FieldGrid>

      <FieldGrid columns={4}>
        <FormField label="Serial number" htmlFor="asset_serial">
          <input
            id="asset_serial"
            className="form-control"
            disabled={!permissions.assets_assign}
            value={draft.serial_number}
            onChange={(e) => setDraft({ ...draft, serial_number: e.target.value })}
          />
        </FormField>
        <FormField label="Issue date" htmlFor="asset_issue_date">
          <input
            id="asset_issue_date"
            type="date"
            className="form-control"
            disabled={!permissions.assets_assign}
            value={draft.issue_date}
            onChange={(e) => setDraft({ ...draft, issue_date: e.target.value })}
          />
        </FormField>
        <FormField label="Condition" htmlFor="asset_condition">
          <select
            id="asset_condition"
            className="form-control"
            disabled={!permissions.assets_assign}
            value={draft.condition}
            onChange={(e) => setDraft({ ...draft, condition: e.target.value })}
          >
            {['New', 'Good', 'Fair', 'Needs repair'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Accessories" htmlFor="asset_accessories">
          <input
            id="asset_accessories"
            className="form-control"
            disabled={!permissions.assets_assign}
            value={draft.accessories}
            onChange={(e) => setDraft({ ...draft, accessories: e.target.value })}
            placeholder="Charger, bag, dongle…"
          />
        </FormField>
      </FieldGrid>

      <FieldGrid columns={2}>
        <FormField label="Software / licences" htmlFor="asset_software">
          <input
            id="asset_software"
            className="form-control"
            disabled={!permissions.assets_assign}
            value={draft.software_licenses}
            onChange={(e) => setDraft({ ...draft, software_licenses: e.target.value })}
          />
        </FormField>
        <FormField label="Assignment notes" htmlFor="asset_notes">
          <input
            id="asset_notes"
            className="form-control"
            disabled={!permissions.assets_assign}
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
        </FormField>
      </FieldGrid>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
        <input
          type="checkbox"
          disabled={!permissions.assets_assign}
          checked={draft.acknowledgement}
          onChange={(e) => setDraft({ ...draft, acknowledgement: e.target.checked })}
          style={{ accentColor: 'var(--color-accent-magenta)' }}
        />
        Employee acknowledged receipt of this asset
      </label>

      {permissions.assets_assign && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={addAsset} style={{ marginBottom: '1rem' }}>
          + Add asset
        </button>
      )}

      {devices.assets.length > 0 && (
        <div className="table-container" style={{ marginBottom: '1.5rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Category</th>
                <th>Model</th>
                <th>Acknowledged</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {devices.assets.map((asset, index) => (
                <tr key={asset.asset_tag}>
                  <td style={{ fontFamily: 'monospace' }}>{asset.asset_tag}</td>
                  <td>{asset.category}</td>
                  <td>{[asset.manufacturer, asset.model].filter(Boolean).join(' ') || '—'}</td>
                  <td>
                    <span className={`badge ${asset.acknowledgement ? 'badge-success' : 'badge-warning'}`}>
                      {asset.acknowledgement ? 'Yes' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    {permissions.assets_assign && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          patch('devices', {
                            assets: devices.assets.filter((_, i) => i !== index),
                          })
                        }
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GroupLabel>Account & application access</GroupLabel>
      <FieldGrid columns={2}>
        <FormField
          label="Work email"
          htmlFor="account_work_email"
          error={errors.work_email}
          hint="Account creation happens only on submission, never from the draft."
        >
          <input
            id="account_work_email"
            className="form-control"
            disabled={!permissions.access_manage}
            value={devices.account.work_email ?? payload.employment.work_email ?? ''}
            onChange={(e) => setAccount({ work_email: e.target.value })}
            placeholder="name@organize.com"
          />
        </FormField>
        <FormField label="Provisioning status" htmlFor="account_status">
          <input
            id="account_status"
            className="form-control"
            disabled
            value={devices.account.provisioning_status || 'Pending account provisioning'}
          />
        </FormField>
      </FieldGrid>

      {permissions.access_manage ? (
        <>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Application access
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
            {APP_ACCESS_OPTIONS.map((app) => {
              const checked = devices.account.app_access.includes(app);
              return (
                <label
                  key={app}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${checked ? 'var(--sidebar-active-border)' : 'var(--border-default)'}`,
                    background: checked ? 'var(--sidebar-active-bg)' : 'var(--bg-input)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArray('app_access', app)}
                    style={{ accentColor: 'var(--color-accent-magenta)' }}
                  />
                  {app}
                </label>
              );
            })}
          </div>
        </>
      ) : (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Account provisioning is handled by an administrator.
        </p>
      )}

      <GroupLabel>Onboarding access checklist</GroupLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
        {CHECKLIST_OPTIONS.map((item) => (
          <label
            key={item}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}
          >
            <input
              type="checkbox"
              disabled={!permissions.access_manage}
              checked={devices.account.checklist.includes(item)}
              onChange={() => toggleArray('checklist', item)}
              style={{ accentColor: 'var(--color-accent-magenta)' }}
            />
            {item}
          </label>
        ))}
      </div>

      {devices.account.roles.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          Requested roles: {devices.account.roles.join(', ')}
        </p>
      )}
    </div>
  );
};
