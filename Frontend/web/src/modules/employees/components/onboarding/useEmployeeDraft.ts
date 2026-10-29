import { useCallback, useEffect, useRef, useState } from 'react';
import { employeeDraftApi } from '../../api/employeeDraftApi';
import { ApiError } from '../../../../core/api/client';
import type {
  DraftSection,
  DraftValidation,
  EmployeeDraft,
  EmployeeDraftPayload,
  EmployeeDraftPermissions,
} from '../../../../types';
import { normalisePayload } from './wizardConfig';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

const SECTIONS: DraftSection[] = [
  'personal',
  'employment',
  'compensation',
  'schedule',
  'documents',
  'devices',
];

/**
 * Owns the draft state, debounced auto-save queue and optimistic-concurrency
 * version. Nothing is reported as saved until the server confirms persistence.
 */
export const useEmployeeDraft = (draftId: number) => {
  const [draft, setDraft] = useState<EmployeeDraft | null>(null);
  const [permissions, setPermissions] = useState<EmployeeDraftPermissions | null>(null);
  const [validation, setValidation] = useState<DraftValidation | null>(null);
  const [payload, setPayload] = useState<EmployeeDraftPayload>(normalisePayload(null));
  const [currentStep, setCurrentStepState] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const payloadRef = useRef(payload);
  const versionRef = useRef(0);
  const stepRef = useRef(1);
  const dirtyRef = useRef<Set<DraftSection>>(new Set());
  const flushingRef = useRef(false);
  const mountedRef = useRef(true);
  const conflictRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const applyServerResponse = useCallback(
    (res: Awaited<ReturnType<typeof employeeDraftApi.get>>) => {
      versionRef.current = res.draft.version;
      setDraft(res.draft);
      setPermissions(res.permissions);
      if (res.validation) setValidation(res.validation);
    },
    []
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await employeeDraftApi.get(draftId);
      const next = normalisePayload(res.draft.payload);
      payloadRef.current = next;
      dirtyRef.current.clear();
      stepRef.current = res.draft.current_step || 1;
      setPayload(next);
      setCurrentStepState(stepRef.current);
      applyServerResponse(res);
      setSaveStatus('idle');
    } catch (err) {
      setLoadError((err as Error).message || 'Unable to load this draft');
    } finally {
      setLoading(false);
    }
  }, [draftId, applyServerResponse]);

  useEffect(() => {
    void load();
  }, [load]);

  const markDirty = (section: DraftSection) => {
    dirtyRef.current.add(section);
    setSaveStatus('dirty');
  };

  const setSectionValue = useCallback(
    <K extends keyof EmployeeDraftPayload>(section: K, value: EmployeeDraftPayload[K]) => {
      if (!SECTIONS.includes(section as DraftSection)) return;
      const next = { ...payloadRef.current, [section]: value };
      payloadRef.current = next;
      setPayload(next);
      markDirty(section as DraftSection);
    },
    []
  );

  const patchSection = useCallback(
    (section: 'personal' | 'employment' | 'schedule' | 'devices', patch: Record<string, unknown>) => {
      const current = payloadRef.current[section] as unknown as Record<string, unknown>;
      const next = {
        ...payloadRef.current,
        [section]: { ...current, ...patch },
      } as EmployeeDraftPayload;
      payloadRef.current = next;
      setPayload(next);
      markDirty(section);
    },
    []
  );

  /** Persist every dirty section, one request at a time to keep versions ordered. */
  const flush = useCallback(async (): Promise<boolean> => {
    if (flushingRef.current || conflictRef.current) return !conflictRef.current;
    if (dirtyRef.current.size === 0) return true;

    flushingRef.current = true;
    setSaveStatus('saving');
    setSaveError(null);

    while (dirtyRef.current.size > 0) {
      const section = dirtyRef.current.values().next().value as DraftSection;
      dirtyRef.current.delete(section);
      try {
        const res = await employeeDraftApi.saveSection(
          draftId,
          section,
          payloadRef.current[section],
          versionRef.current,
          stepRef.current
        );
        applyServerResponse(res);
        if (mountedRef.current) {
          setLastSavedAt(new Date());
          setSaveStatus(dirtyRef.current.size > 0 ? 'saving' : 'saved');
        }
      } catch (err) {
        dirtyRef.current.add(section);
        if (!mountedRef.current) return false;
        if (err instanceof ApiError && err.statusCode === 409) {
          conflictRef.current = true;
          setConflict(true);
        }
        setSaveStatus('error');
        setSaveError((err as Error).message || 'Could not save your changes');
        flushingRef.current = false;
        return false;
      }
    }

    flushingRef.current = false;
    return true;
  }, [draftId, applyServerResponse]);

  // Debounced auto-save
  useEffect(() => {
    if (loading || !draft || saveStatus === 'error' || conflictRef.current) return;
    if (dirtyRef.current.size === 0) return;
    const timer = setTimeout(() => {
      void flush();
    }, 1200);
    return () => clearTimeout(timer);
  }, [payload, loading, draft, saveStatus, flush]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current.size > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const goToStep = useCallback(
    async (step: number): Promise<boolean> => {
      if (step === stepRef.current) return true;
      const saved = await flush();
      if (!saved) return false;
      stepRef.current = step;
      setCurrentStepState(step);
      try {
        const res = await employeeDraftApi.update(draftId, {
          version: versionRef.current,
          current_step: step,
        });
        applyServerResponse(res);
      } catch (err) {
        if (!(err instanceof ApiError) || err.statusCode !== 409) {
          setSaveError((err as Error).message);
        }
      }
      return true;
    },
    [draftId, flush, applyServerResponse]
  );

  /** Force a manual save (Save Draft button / Review step). */
  const saveNow = useCallback(async (): Promise<boolean> => {
    if (!draft) return false;
    return flush();
  }, [draft, flush]);

  const discardLocalChanges = useCallback(async () => {
    conflictRef.current = false;
    setConflict(false);
    dirtyRef.current.clear();
    await load();
  }, [load]);

  return {
    draft,
    permissions,
    validation,
    payload,
    loading,
    loadError,
    saveStatus,
    saveError,
    conflict,
    lastSavedAt,
    currentStep,
    setCurrentStep: goToStep,
    setSectionValue,
    patchSection,
    saveNow,
    getVersion: () => versionRef.current,
    reload: load,
    discardLocalChanges,
    setValidation,
  };
};
