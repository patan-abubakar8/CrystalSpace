import React, { useMemo, useState } from 'react';
import type { DraftDocument } from '../../../../types';
import type { OnboardingStepProps } from './stepProps';
import { FieldGrid, FormField, GroupLabel, StepHeading } from './FormField';

const mb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(0)} MB`;

export const StepDocuments: React.FC<OnboardingStepProps> = ({
  payload,
  errors,
  reference,
  permissions,
  setSection,
}) => {
  const docs = payload.documents;
  const [typeCode, setTypeCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [mimeType, setMimeType] = useState('');
  const [expiry, setExpiry] = useState('');
  const [notes, setNotes] = useState('');
  const [fileError, setFileError] = useState('');

  const selectedType = useMemo(
    () => reference.document_types.find((t) => t.code === typeCode),
    [reference.document_types, typeCode]
  );

  const missingRequired = reference.document_types.filter(
    (t) => t.is_required && !docs.some((d) => d.document_type_code === t.code && d.file_name)
  );

  const handleFile = (file: File | null) => {
    setFileError('');
    if (!file) {
      setFileName('');
      setFileSize(0);
      setMimeType('');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (selectedType) {
      const allowed = selectedType.allowed_extensions
        .split(',')
        .map((e) => e.trim().toLowerCase());
      if (!allowed.includes(ext)) {
        setFileError(`${selectedType.name} must be one of: ${selectedType.allowed_extensions}`);
        return;
      }
      if (file.size > selectedType.max_size_bytes) {
        setFileError(`File exceeds the ${mb(selectedType.max_size_bytes)} limit`);
        return;
      }
    }
    setFileName(file.name);
    setFileSize(file.size);
    setMimeType(file.type);
  };

  const addDocument = () => {
    setFileError('');
    if (!typeCode) {
      setFileError('Select a document type');
      return;
    }
    if (!fileName) {
      setFileError('Choose a file to attach');
      return;
    }
    const doc: DraftDocument = {
      document_type_code: typeCode,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      verification_status: 'Pending',
      expiry_date: expiry,
      notes,
    };
    setSection('documents', [...docs, doc]);
    setTypeCode('');
    setFileName('');
    setFileSize(0);
    setMimeType('');
    setExpiry('');
    setNotes('');
  };

  return (
    <div>
      <StepHeading
        title="Documents & Verification"
        description="Required types are configured centrally. Attachments stay pending until an authorised reviewer verifies them."
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {reference.document_types.map((t) => {
          const attached = docs.some((d) => d.document_type_code === t.code);
          return (
            <span
              key={t.code}
              className={`badge ${attached ? 'badge-success' : t.is_required ? 'badge-danger' : 'badge-info'}`}
              title={t.description}
            >
              {t.name}
              {t.is_required ? ' •' : ''}
            </span>
          );
        })}
      </div>

      {missingRequired.length > 0 && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: '1rem' }}>
          Missing required documents: {missingRequired.map((t) => t.name).join(', ')}
        </p>
      )}
      {errors.documents && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: '1rem' }}>
          {errors.documents}
        </p>
      )}

      {permissions.documents_upload && (
        <>
          <GroupLabel>Attach a document</GroupLabel>
          <FieldGrid columns={3}>
            <FormField label="Document type" htmlFor="doc_type">
              <select
                id="doc_type"
                className="form-control"
                value={typeCode}
                onChange={(e) => {
                  setTypeCode(e.target.value);
                  setFileName('');
                  setFileSize(0);
                }}
              >
                <option value="">Select type</option>
                {reference.document_types.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name}
                    {t.is_required ? ' (required)' : ''}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label="File"
              htmlFor="doc_file"
              error={fileError}
              hint={selectedType ? `Allowed: ${selectedType.allowed_extensions} · max ${mb(selectedType.max_size_bytes)}` : undefined}
            >
              <input
                id="doc_file"
                type="file"
                className="form-control"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </FormField>
            <FormField label="Expiry date (optional)" htmlFor="doc_expiry">
              <input
                id="doc_expiry"
                type="date"
                className="form-control"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </FormField>
          </FieldGrid>
          <FieldGrid columns={2}>
            <FormField label="Notes (optional)" htmlFor="doc_notes">
              <input
                id="doc_notes"
                className="form-control"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the reviewer should know"
              />
            </FormField>
          </FieldGrid>
          <button type="button" className="btn btn-secondary btn-sm" onClick={addDocument} style={{ marginBottom: '1.5rem' }}>
            + Attach document
          </button>
        </>
      )}

      <GroupLabel>Attached documents</GroupLabel>
      {docs.length === 0 ? (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>No documents attached yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>File</th>
                <th>Size</th>
                <th>Status</th>
                <th>Expiry</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, index) => (
                <tr key={`${doc.document_type_code}-${doc.file_name}-${index}`}>
                  <td>
                    {reference.document_types.find((t) => t.code === doc.document_type_code)?.name ??
                      doc.document_type_code}
                  </td>
                  <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.file_name}
                  </td>
                  <td>{doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : '—'}</td>
                  <td>
                    <span className="badge badge-warning">{doc.verification_status ?? 'Pending'}</span>
                  </td>
                  <td>{doc.expiry_date || '—'}</td>
                  <td>
                    {permissions.documents_upload && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSection('documents', docs.filter((_, i) => i !== index))}
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

      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>
        Only document metadata is stored with the draft. Verification is performed by authorised
        reviewers after the employee record exists, and file access will be scoped to those permissions.
      </p>
    </div>
  );
};
